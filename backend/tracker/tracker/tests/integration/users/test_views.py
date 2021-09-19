import re

import pytest
from allauth.account.models import EmailAddress
from dj_rest_auth.serializers import PasswordResetSerializer
from django.test import RequestFactory
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken
from tracker.tests.assertions import assert_json_contains_model_instance_data
from tracker.tests.factories import UserFactory
from tracker.users.models import User
from tracker.users.views import UserViewSet

pytestmark = pytest.mark.django_db


@pytest.fixture
def verified_user(user_factory: UserFactory, test_password: str) -> User:
    return user_factory(password=test_password, status={"verified": True, "primary": True})


@pytest.fixture
def unverified_user(user_factory: UserFactory, test_password: str) -> User:
    return user_factory(password=test_password, status={"verified": False, "primary": True})


@pytest.fixture
def auth_token(verified_user: User) -> RefreshToken:
    token = RefreshToken.for_user(verified_user)
    return token


@pytest.fixture
def auth_user(auth_token: RefreshToken, verified_user: User) -> User:
    return verified_user


@pytest.fixture
def auth_client(api_client: APIClient, auth_token: RefreshToken) -> APIClient:
    api_client.credentials(HTTP_AUTHORIZATION="Bearer " + str(auth_token.access_token))
    return api_client


def parse_url(mailoutbox: list) -> str:
    url_search = re.search(r"http://(.+/)+", mailoutbox[0].body)
    return url_search.group(0)


class TestUserViewSet:
    def test_get_queryset(self, user: User, rf: RequestFactory):
        view = UserViewSet()
        request = rf.get("/fake-url/")
        request.user = user

        view.request = request

        assert user in view.get_queryset()


class TestUserView:
    @pytest.fixture(autouse=True)
    def setup(self, auth_client: APIClient) -> None:
        self.api_client = auth_client
        self.url = reverse("rest_user_details")

    def test_GET_returns_the_user_info_of_currently_logged_in_user(self, auth_user: User) -> None:
        response = self.api_client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        data = response.data
        data.pop("url")
        assert_json_contains_model_instance_data(data, auth_user)

    def test_PUT_updates_user_info_of_currently_logged_in_user(self, auth_user: User) -> None:
        data = {"name": auth_user.name + "stuff"}

        response = self.api_client.put(self.url, data=data)

        auth_user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert_json_contains_model_instance_data(data, auth_user)

    def test_PATCH_does_partial_update_of_currently_logged_in_user(self, auth_user: User) -> None:
        data = {"name": auth_user.name + "stuff"}

        response = self.api_client.patch(self.url, data=data)

        auth_user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert_json_contains_model_instance_data(data, auth_user)


class TestLoginView:
    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient) -> None:
        self.api_client = api_client
        self.url = reverse("rest_login")

    def test_successful_login_creates_token_for_user(self, verified_user: User, test_password: str) -> None:
        data = {"email": verified_user.email, "password": test_password}

        response = self.api_client.post(self.url, data=data)

        verified_user.refresh_from_db()
        assert OutstandingToken.objects.filter(user=verified_user).exists()
        assert response.status_code == status.HTTP_200_OK

    def test_unsuccessful_login_doesnt_create_token_for_user(self, verified_user: User, test_password: str) -> None:
        data = {"email": verified_user.email, "password": test_password + "incorrect"}

        response = self.api_client.post(self.url, data=data)

        verified_user.refresh_from_db()
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not OutstandingToken.objects.filter(user=verified_user).exists()

    def test_user_can_login_with_unverified_email(self, unverified_user: User, test_password: str) -> None:
        data = {"email": unverified_user.email, "password": test_password}

        response = self.api_client.post(self.url, data=data)

        unverified_user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert OutstandingToken.objects.filter(user=unverified_user).exists()

    def test_login_for_non_existing_user_fails(self, user_json: dict) -> None:
        num_before = OutstandingToken.objects.all().count()
        response = self.api_client.post(self.url, data=user_json)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert len(User.objects.all()) == 0
        assert num_before == OutstandingToken.objects.all().count()


class TestLogoutView:
    @pytest.fixture(autouse=True)
    def setup(self, auth_client: APIClient) -> None:
        self.api_client = auth_client
        self.url = reverse("rest_logout")

    def test_successful_logout_blacklists_token_for_user(self, auth_user: User, auth_token: RefreshToken) -> None:
        data = {"refresh": str(auth_token)}

        response = self.api_client.post(self.url, data=data)

        print(data)
        token = OutstandingToken.objects.get(user=auth_user)
        assert response.status_code == status.HTTP_200_OK
        assert BlacklistedToken.objects.filter(token=token).exists()

    def test_unsuccessful_logout_doesnt_delete_any_tokens_for_other_users(self) -> None:
        api_client = APIClient()
        prev_num_tokens = BlacklistedToken.objects.all().count()

        response = api_client.post(self.url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert prev_num_tokens == BlacklistedToken.objects.all().count()


class TestRegisterView:
    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient, valid_registration_info: dict) -> None:
        self.api_client = api_client
        self.url = reverse("rest_register")
        self.data = valid_registration_info

    def test_successful_registration_creates_unverified_user(self) -> None:
        response = self.api_client.post(self.url, data=self.data)

        assert response.status_code == status.HTTP_201_CREATED
        user = User.objects.get(email=self.data["email"])  # should not raise
        email = EmailAddress.objects.get(user=user, email=user.email)  # should not raise
        assert email.verified is False

    def test_unsuccessful_registration_doesnt_create_user(self) -> None:
        self.data["password1"] += "mismatching_chars"

        response = self.api_client.post(self.url, data=self.data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(email=self.data["email"]).exists()

    def test_successful_registration_sends_email_confirmation(self, mailoutbox: list) -> None:
        response = self.api_client.post(self.url, data=self.data)

        assert response.status_code == status.HTTP_201_CREATED
        assert len(mailoutbox) == 1


class TestVerifyEmailView:
    @pytest.fixture
    def verify_email(self, unverified_user: User) -> EmailAddress:
        email = unverified_user.emailaddress_set.first()
        email.send_confirmation()
        return email

    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient, verify_email: EmailAddress) -> None:
        self.api_client = api_client
        self.url = reverse("rest_verify_email")
        self.email = verify_email

    def _parse_key(self, mailoutbox: list) -> str:
        url = parse_url(mailoutbox)
        segments = url.split("/")
        return segments[-2]

    def test_GET_verifies_email(self, mailoutbox: list) -> None:
        data = {"key": self._parse_key(mailoutbox)}

        response = self.api_client.post(self.url, data=data)

        self.email.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert self.email.verified is True


class TestPasswordChangeView:
    @pytest.fixture(autouse=True)
    def setup(self, auth_client: APIClient):
        self.api_client = auth_client
        self.url = reverse("rest_password_change")

    def test_successful_password_change_changes_user_password(self, auth_user: User, test_password: str) -> None:
        old_password = test_password
        new_password = old_password + "new_password123"
        data = {"old_password": old_password, "new_password1": new_password, "new_password2": new_password}

        response = self.api_client.post(self.url, data=data)

        auth_user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert auth_user.check_password(new_password)
        assert not auth_user.check_password(old_password)

    def test_unsuccessful_password_change_doesnt_change_user_password(
        self, auth_user: User, test_password: str
    ) -> None:
        old_password = test_password
        new_password1 = old_password + "mismatch"
        new_password2 = new_password1 + "mismatch123"
        data = {"old_password": old_password, "new_password1": new_password1, "new_password2": new_password2}

        response = self.api_client.post(self.url, data=data)

        auth_user.refresh_from_db()
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert auth_user.check_password(old_password)
        assert not auth_user.check_password(new_password1)
        assert not auth_user.check_password(new_password2)

    def test_non_authenticated_user_cant_change_a_password(self, test_password: str) -> None:
        old_password = test_password
        new_password = old_password + "new_password123"
        data = {"old_password": old_password, "new_password1": new_password, "new_password2": new_password}
        client = APIClient()

        response = client.post(self.url, data=data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestPasswordResetView:
    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient):
        self.api_client = api_client
        self.url = reverse("rest_password_reset")

    def test_successful_password_reset_request_sends_confirmation_email(
        self, verified_user: User, mailoutbox: list
    ) -> None:
        data = {"email": verified_user.email}

        response = self.api_client.post(self.url, data=data)

        assert response.status_code == status.HTTP_200_OK
        assert len(mailoutbox) == 1

    def test_unsuccessful_password_reset_request_doesnt_send_confirmation_email(self, mailoutbox: list) -> None:
        data = {"email": "non-existant-email@demo.com"}

        response = self.api_client.post(self.url, data=data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert len(mailoutbox) == 0


class TestPasswordResetConfirmView:
    @pytest.fixture
    def send_reset_email(self, verified_user: User) -> None:
        factory = APIRequestFactory()
        request = factory.post("/dne/")
        serializer = PasswordResetSerializer(data={"email": verified_user.email})
        serializer.context["request"] = request
        serializer.is_valid()
        serializer.save()

    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient, send_reset_email: None) -> None:
        self.api_client = api_client
        self.url = reverse("rest_password_reset_confirm")

    def _parse_uid_token(self, mailoutbox: list) -> str:
        url = parse_url(mailoutbox)
        segments = url.split("/")
        return segments[-3], segments[-2]

    def test_successful_password_reset_changes_user_password(
        self, verified_user: User, test_password: str, mailoutbox: list
    ) -> None:
        old_password = test_password
        new_password = old_password + "new_password_123"
        uid, token = self._parse_uid_token(mailoutbox)
        data = {"new_password1": new_password, "new_password2": new_password, "uid": uid, "token": token}

        response = self.api_client.post(self.url, data=data)

        verified_user.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert verified_user.check_password(new_password)
        assert not verified_user.check_password(old_password)
