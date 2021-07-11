from allauth.account.forms import ResetPasswordForm
from dj_rest_auth.registration.serializers import (
    RegisterSerializer as RestAuthRegisterSerializer,
)
from dj_rest_auth.serializers import LoginSerializer as RestAuthLoginSerializer
from dj_rest_auth.serializers import (
    PasswordResetSerializer as RestAuthPasswordResetSerializer,
)
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "uuid", "email", "name"]
        read_only_fields = ["uuid", "email"]
        extra_kwargs = {
            "url": {
                "view_name": "users:user-detail",
                "lookup_field": "uuid",
            }
        }


class PasswordResetSerializer(RestAuthPasswordResetSerializer):
    password_reset_form_class = ResetPasswordForm

    def validate_email(self, value):
        self.reset_form = self.password_reset_form_class(data=self.initial_data)
        if not self.reset_form.is_valid():
            raise serializers.ValidationError(self.reset_form.errors["email"])

        return value


class LoginSerializer(RestAuthLoginSerializer):
    username = None


class RegisterSerializer(RestAuthRegisterSerializer):
    username = None
    name = serializers.CharField(required=False)

    def get_cleaned_data(self):
        return {
            "name": self.validated_data.get("name", ""),
            "password1": self.validated_data.get("password1", ""),
            "email": self.validated_data.get("email", ""),
        }

    def custom_signup(self, request, user):
        cleaned_data = self.get_cleaned_data()
        user.name = cleaned_data["name"]
        user.save()
