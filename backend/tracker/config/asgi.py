"""
ASGI config for workout project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os
import sys
from pathlib import Path

from django.core.asgi import get_asgi_application

ROOT_DIR = Path(__file__).resolve(strict=True).parent.parent
sys.path.append(str(ROOT_DIR / "tracker"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

application = get_asgi_application()
