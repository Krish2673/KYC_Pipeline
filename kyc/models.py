from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

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

class User(AbstractUser):
    ROLE_CHOICES = (
        ('merchant', 'merchant'),
        ('reviewer', 'reviewer'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

class KYCSubmission(models.Model):
    STATE_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('more_info_requested', 'More Info Requested'),
    ]

    merchant = models.ForeignKey(User, on_delete=models.CASCADE)
    state = models.CharField(max_length=30, choices=STATE_CHOICES, default='draft')

    # Personal
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    # Business
    business_name = models.CharField(max_length=100)
    business_type = models.CharField(max_length=50)
    expected_volume = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Document(models.Model):
    DOC_TYPES = [
        ('pan', 'PAN'),
        ('aadhaar', 'Aadhaar'),
        ('bank_statement', 'Bank Statement'),
    ]

    submission = models.ForeignKey(KYCSubmission, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/', validators=[validate_file])
    doc_type = models.CharField(max_length=20, choices=DOC_TYPES)

class Notification(models.Model):
    merchant = models.ForeignKey(User, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)