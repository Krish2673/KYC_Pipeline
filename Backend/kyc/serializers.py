from rest_framework import serializers
from .models import KYCSubmission
from .models import Document
from datetime import timedelta
from django.utils import timezone

class DocumentSerializer(serializers.ModelSerializer):
    """Upload / nested read: includes absolute file URL when request is in context."""
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id', 'submission', 'file', 'file_url', 'doc_type']

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        url = obj.file.url
        if request:
            return request.build_absolute_uri(url)
        return url


class KYCSubmissionSerializer(serializers.ModelSerializer):
    at_risk = serializers.SerializerMethodField()

    class Meta:
        model = KYCSubmission
        fields = '__all__'
        read_only_fields = ['merchant', 'state', 'created_at', 'updated_at']

    def get_at_risk(self, obj):
        return timezone.now() - obj.created_at > timedelta(hours=24)


class KYCSubmissionDetailSerializer(KYCSubmissionSerializer):
    documents = DocumentSerializer(many=True, read_only=True, source='document_set')

    class Meta(KYCSubmissionSerializer.Meta):
        fields = '__all__'