1\. State Machine
-----------------

I implemented the state machine as a **centralized service** inside kyc/services/state\_machine.py.

Instead of checking state transitions inside views, I defined a single source of truth:

```
ALLOWED_TRANSITIONS = {
    "draft": ["submitted"],
    "submitted": ["under_review"],
    "under_review": ["approved", "rejected", "more_info_requested"],
    "more_info_requested": ["submitted"],
    "approved": [],
    "rejected": [],
}
```

All state changes go through a single function:

```
def transition_state(submission, new_state):
    current_state = submission.state

    if new_state not in ALLOWED_TRANSITIONS.get(current_state, []):
        raise ValueError(f"Invalid transition: {current_state} → {new_state}")

    submission.state = new_state
    submission.save()
```

This ensures:

*   no illegal transitions (like approved → draft)
    
*   consistent behavior across the system
    
*   easier testing and debugging
    

I also added notification logging inside this function so every state change is recorded in one place.

2\. File Upload Validation
--------------------------

File validation is handled at the **model level** using a custom validator.

```
def validate_file(file):
    max_size = 5 * 1024 * 1024  # 5MB

    if file.size > max_size:
        raise ValidationError("File size exceeds 5MB")

    valid_types = [
        'application/pdf',
        'image/jpeg',
        'image/png'
    ]

    if file.content_type not in valid_types:
        raise ValidationError("Invalid file type")
```

This validator is attached to the FileField, so it runs automatically during upload.

If someone tries to upload:

*   a 50MB file → it is rejected before saving
    
*   an invalid type → it returns a clear error
    

I specifically avoided trusting frontend validation and enforced everything on the backend.

3\. Reviewer Queue + SLA
------------------------

The reviewer queue is powered by a simple query:

```
KYCSubmission.objects.filter(
    state__in=["submitted", "under_review"]
).order_by("created_at")
```

This ensures:

*   oldest submissions appear first
    
*   only relevant states are included
    

For SLA tracking, I **did not store any flag in the database**.

Instead, I compute it dynamically:

```
def get_at_risk(self, obj):
    return timezone.now() - obj.created_at > timedelta(hours=24)
```

This avoids stale data and ensures accuracy at all times.

4\. Authentication & Authorization
----------------------------------

I used **DRF Token Authentication** with a simple role-based system.

Each user has a role:

*   merchant
    
*   reviewer
    

Custom permission classes enforce access:

```
class IsMerchant(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "merchant"
```

```
class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "reviewer"
```

To prevent data leaks:

*   Merchants can only access their own submissions:
    

```
KYCSubmission.objects.get(id=pk, merchant=request.user)
```

*   Reviewers can access all submissions
    

This ensures merchant A cannot see merchant B’s data.

5\. Document Ownership (Important Edge Case)
--------------------------------------------

Initially, document upload trusted the submission ID from request data, which could allow a user to upload files to another user’s submission.

I fixed this by validating ownership explicitly:

```
submission = KYCSubmission.objects.get(
    id=submission_id,
    merchant=request.user
)
```

Then:

```
serializer.save(submission=submission)
```

This ensures users can only upload documents to their own submissions.

6\. AI Audit
------------

While building this, I used AI tools for initial scaffolding, but I caught a few issues:

### Example:

AI suggested directly saving the document like:

```
serializer.save()
```

This is insecure because it trusts client input for submission.

I replaced it with explicit ownership validation before saving.

Another issue was around state transitions — AI-generated code sometimes handled transitions directly inside views, which would have scattered the logic.

I refactored it into a centralized state machine service to make it consistent and safer.

Final Thoughts
--------------

I focused more on:

*   correctness of state transitions
    
*   backend validation and security
    
*   keeping logic centralized and maintainable
    

rather than overbuilding UI or adding unnecessary complexity.

If I had more time, I would:

*   improve reviewer dashboard UI
    
*   add reviewer assignment logic
    
*   implement async notifications (email/webhooks)