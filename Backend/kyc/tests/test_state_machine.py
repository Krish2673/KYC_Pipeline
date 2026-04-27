from django.test import TestCase
from kyc.models import User, KYCSubmission
from kyc.services.state_machine import transition_state

class StateMachineTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(username="test", role="merchant")

        self.submission = KYCSubmission.objects.create(
            merchant=self.user,
            state="approved",
            name="Test",
            email="test@test.com",
            phone="1234567890",
            business_name="Biz",
            business_type="Agency",
            expected_volume=1000
        )

    def test_invalid_transition(self):
        with self.assertRaises(ValueError):
            transition_state(self.submission, "draft")