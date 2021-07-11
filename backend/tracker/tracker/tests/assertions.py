from typing import Dict, Iterable, Union

from django.db.models import Model
from django.forms import Form
from django.urls import resolve, reverse
from rest_framework.serializers import Serializer


def assert_correct_url(url_name: str, url_path: str, kwargs: Dict = {}) -> None:
    url_path = url_path.format(**kwargs)
    assert reverse(url_name, kwargs=kwargs) == url_path
    assert resolve(url_path).view_name == url_name


def assert_field_error(checker: Union[Form, Serializer], field: str) -> None:
    assert not checker.is_valid()
    assert field in checker.errors
    assert checker.errors[field][0].code == "required"


def assert_iterable_equal(l1: Iterable, l2: Iterable) -> None:
    assert set(l1) == set(l2)


def assert_json_contains_model_instance_data(json: dict, instance: Model) -> None:
    for field, value in json.items():
        t = type(value)
        assert t(getattr(instance, field)) == value
