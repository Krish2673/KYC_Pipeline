from rest_framework import serializers
from .models import KYCSubmission
from .models import Document
from datetime import timedelta
from django.utils import timezone

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class KYCSubmissionSerializer(serializers.ModelSerializer):
    at_risk = serializers.SerializerMethodField()

    class Meta:
        model = KYCSubmission
        fields = '__all__'

    def get_at_risk(self, obj):
        return timezone.now() - obj.created_at > timedelta(hours=24)