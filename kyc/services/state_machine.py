from kyc.models import Notification

ALLOWED_TRANSITIONS = {
    "draft": ["submitted"],
    "submitted": ["under_review"],
    "under_review": ["approved", "rejected", "more_info_requested"],
    "more_info_requested": ["submitted"],
    "approved": [],
    "rejected": [],
}

def transition_state(submission, new_state):
    current_state = submission.state

    if new_state not in ALLOWED_TRANSITIONS.get(current_state, []):
        raise ValueError(f"Invalid transition: {current_state} → {new_state}")

    submission.state = new_state
    submission.save()

    # log notification
    Notification.objects.create(
        merchant=submission.merchant,
        event_type=f"state_changed_to_{new_state}",
        payload={"submission_id": submission.id}
    )

    return submission