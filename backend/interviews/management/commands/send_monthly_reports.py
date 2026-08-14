from django.core.management.base import BaseCommand

from accounts.models import User
from interviews.monthly_email import (
    send_monthly_progress_email,
    send_monthly_progress_to_all_users,
)


class Command(BaseCommand):
    help = "Send monthly interview progress reports to all active users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Send the monthly report only to one user email.",
        )

    def handle(self, *args, **options):
        email = options.get("email")

        self.stdout.write("Sending monthly progress reports...")

        try:
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.ERROR(f"No user found with email: {email}")
                    )
                    return

                send_monthly_progress_email(user)

            else:
                send_monthly_progress_to_all_users()

            self.stdout.write(
                self.style.SUCCESS("Monthly progress reports sent successfully.")
            )

        except Exception as error:
            self.stdout.write(
                self.style.ERROR(f"Failed to send monthly reports: {error}")
            )

            raise
