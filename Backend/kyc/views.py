from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import KYCSubmission
from .serializers import (
    KYCSubmissionSerializer,
    KYCSubmissionDetailSerializer,
    DocumentSerializer,
)
from kyc.services.state_machine import transition_state
from rest_framework.permissions import IsAuthenticated
from .permissions import IsMerchant
from .permissions import IsReviewer

class KYCSubmissionCreateView(APIView):
    permission_classes = [IsAuthenticated, IsMerchant]

    def post(self, request):
        serializer = KYCSubmissionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(merchant=request.user)
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
class SubmitKYCView(APIView):
    permission_classes = [IsAuthenticated, IsMerchant]

    def post(self, request, pk):
        try:
            submission = KYCSubmission.objects.get(id=pk, merchant=request.user)

            transition_state(submission, "submitted")

            return Response({"message": "Submitted successfully"})

        except KYCSubmission.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        

class ReviewerQueueView(APIView):
    permission_classes = [IsAuthenticated, IsReviewer]

    def get(self, request):
        submissions = KYCSubmission.objects.filter(
            state__in=["submitted", "under_review"]
        ).order_by("created_at")

        serializer = KYCSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)    
    
class ReviewActionView(APIView):
    permission_classes = [IsAuthenticated, IsReviewer]

    def post(self, request, pk):
        action = request.data.get("action")
        reason = request.data.get("reason") 

        try:
            submission = KYCSubmission.objects.get(id=pk)

            # 🔹 Prevent re-approval
            if submission.state == "approved":
                return Response({"error": "Already approved"}, status=400)

            # 🔹 Require reason for rejection
            if action == "rejected" and not reason:
                return Response({"error": "Rejection reason required"}, status=400)

            # 🔹 Move to under_review first (important flow)
            if submission.state == "submitted":
                transition_state(submission, "under_review")

            # 🔹 Final transition
            transition_state(submission, action)

            return Response({"message": f"{action} successful"})

        except KYCSubmission.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        except ValueError as e:
            return Response({"error": str(e)}, status=400) 
        
class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated, IsMerchant]

    def post(self, request):
        try:
            submission_id = request.data.get("submission")

            submission = KYCSubmission.objects.get(
                id=submission_id,
                merchant=request.user
            )

        except KYCSubmission.DoesNotExist:
            return Response({"error": "Invalid submission"}, status=400)

        serializer = DocumentSerializer(
            data=request.data,
            context={'request': request},
        )

        if serializer.is_valid():
            serializer.save(submission=submission)
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
class ReviewerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsReviewer]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        submissions = KYCSubmission.objects.all()

        total_in_queue = submissions.filter(state="submitted").count()

        # Avg time in queue
        queue_items = submissions.filter(state="submitted")

        avg_time_hours = 0
        if queue_items.exists():
            total_time = sum(
                [(timezone.now() - s.created_at).total_seconds() for s in queue_items]
            )
            avg_time = total_time / queue_items.count()
            avg_time_hours = avg_time / 3600

        # Approval rate (last 7 days)
        last_7_days = timezone.now() - timedelta(days=7)

        approved = submissions.filter(
            state="approved",
            updated_at__gte=last_7_days
        ).count()

        total_recent = submissions.filter(
            updated_at__gte=last_7_days
        ).count()

        approval_rate = (approved / total_recent) if total_recent > 0 else 0

        return Response({
            "total_in_queue": total_in_queue,
            "avg_time_in_queue_hours": avg_time_hours,
            "approval_rate_last_7_days": approval_rate
        })
    
class SubmissionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsReviewer]

    def get(self, request, pk):
        try:
            submission = KYCSubmission.objects.prefetch_related('document_set').get(
                id=pk
            )
            serializer = KYCSubmissionDetailSerializer(
                submission,
                context={'request': request},
            )
            return Response(serializer.data)
        except KYCSubmission.DoesNotExist:
            return Response({"error": "Not found"}, status=404)