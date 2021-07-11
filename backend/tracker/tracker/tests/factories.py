from functools import partial
from typing import Any, Dict, Sequence

from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model
from factory import Factory, Faker, post_generation
from factory.base import StubObject
from factory.django import DjangoModelFactory


def generate_dict_factory(factory: Factory):
    """https://github.com/FactoryBoy/factory_boy/issues/68"""

    def convert_dict_from_stub(stub: StubObject) -> Dict[str, Any]:
        stub_dict = stub.__dict__
        for key, value in stub_dict.items():
            if isinstance(value, StubObject):
                stub_dict[key] = convert_dict_from_stub(value)
        return stub_dict

    def dict_factory(factory, **kwargs):
        stub = factory.stub(**kwargs)
        stub_dict = convert_dict_from_stub(stub)
        return stub_dict

    return partial(dict_factory, factory)


class JsonFactoryMixin:
    @classmethod
    def json(cls, **kwargs):
        return generate_dict_factory(cls)(**kwargs)

    @classmethod
    def json_batch(cls, num, **kwargs):
        factory = generate_dict_factory(cls)
        return [factory(**kwargs) for _ in range(num)]


class UserFactory(DjangoModelFactory, JsonFactoryMixin):

    uuid = Faker("uuid4")
    email = Faker("email")
    name = Faker("name")

    @post_generation
    def password(self, create: bool, extracted: Sequence[Any], **kwargs):
        password = (
            extracted
            if extracted
            else Faker(
                "password",
                length=42,
                special_chars=True,
                digits=True,
                upper_case=True,
                lower_case=True,
            ).evaluate(None, None, extra={"locale": None})
        )
        try:
            self.set_password(password)
        except AttributeError:
            self.password = password

    @post_generation
    def status(self, create: bool, extracted: dict, **kwargs):
        if not create:
            return

        if extracted is not None:
            EmailAddress.objects.create(
                user=self,
                email=self.email,
                verified=extracted.get("verified", True),
                primary=extracted.get("primary", True),
            )

    class Meta:
        model = get_user_model()
        django_get_or_create = ["email"]
