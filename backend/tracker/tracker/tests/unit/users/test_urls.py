from tracker.tests.assertions import assert_correct_url
from tracker.tests.factories import UserFactory


def test_user_detail(user_factory: UserFactory):
    kwargs = {"uuid": user_factory.build().uuid}
    assert_correct_url("users:user-detail", "/api/v1/users/{uuid}/", kwargs)


def test_user_list():
    assert_correct_url("users:user-list", "/api/v1/users/")


def test_login():
    assert_correct_url("rest_login", "/api/v1/login/")


def test_logout():
    assert_correct_url("rest_logout", "/api/v1/logout/")


def test_password_reset():
    assert_correct_url("rest_password_reset", "/api/v1/password/reset/")


def test_password_reset_confirm():
    assert_correct_url("rest_password_reset_confirm", "/api/v1/password/reset/confirm/")


def test_password_change():
    assert_correct_url("rest_password_change", "/api/v1/password/change/")


def test_dj_rest_auth_user_detail():
    assert_correct_url("rest_user_details", "/api/v1/user/")


def test_register():
    assert_correct_url("rest_register", "/api/v1/registration/")


def test_verify_email():
    assert_correct_url("rest_verify_email", "/api/v1/registration/verify-email/")
