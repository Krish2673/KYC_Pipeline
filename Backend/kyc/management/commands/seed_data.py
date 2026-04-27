from django.core.management.base import BaseCommand
from kyc.models import User, KYCSubmission
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = "Seed initial data"

    def handle(self, *args, **kwargs):
        # Create users
        merchant1 = User.objects.create_user(
            username="merchant1",
            password="test123",
            role="merchant"
        )

        merchant2 = User.objects.create_user(
            username="merchant2",
            password="test123",
            role="merchant"
        )

        reviewer = User.objects.create_user(
            username="reviewer",
            password="test123",
            role="reviewer"
        )

        # Create submissions
        KYCSubmission.objects.create(
            merchant=merchant1,
            state="draft",
            name="Test 1",
            email="test1@test.com",
            phone="1234567890",
            business_name="Biz1",
            business_type="Agency",
            expected_volume=1000
        )

        KYCSubmission.objects.create(
            merchant=merchant2,
            state="under_review",
            name="Test 2",
            email="test2@test.com",
            phone="1234567890",
            business_name="Biz2",
            business_type="Agency",
            expected_volume=2000
        )
        
        # Generate tokens
        for user in [merchant1, merchant2, reviewer]:
            token, _ = Token.objects.get_or_create(user=user)
            print(f"{user.username} token: {token.key}")

        self.stdout.write(self.style.SUCCESS("Seed data created"))
