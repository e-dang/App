import os

from allauth.account.models import EmailAddress
from dj_rest_auth.models import TokenModel
from django.core.management.base import BaseCommand, CommandParser
from tracker.users.models import User

if os.environ.get("DJANGO_SETTINGS_MODULE", "config.settings.dev") != "config.settings.production":

    class Command(BaseCommand):
        help = "Creates a user"

        def add_arguments(self, parser: CommandParser) -> None:
            parser.add_argument("email", type=str)
            parser.add_argument("password", type=str)
            parser.add_argument("name", type=str)
            parser.add_argument("--verified", action="store_true", help="Mark the user's email as verified")
            parser.add_argument("--logged-in", action="store_true", help="Log the user in and return their auth token")

        def handle(self, *args, **options):
            user = User.objects.create_user(email=options["email"], password=options["password"], name=options["name"])
            EmailAddress.objects.create(
                user=user, email=user.email, verified=options.get("verified", False), primary=True
            )
            if options.get("logged-in"):
                token = TokenModel.objects.create(user=user)
                self.stdout.write(self.style.SUCCESS(f"Token {token}"))
