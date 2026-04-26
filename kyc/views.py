from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import KYCSubmission
from .serializers import KYCSubmissionSerializer, DocumentSerializer
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
        submissions = KYCSubmission.objects.filter(state="submitted").order_by("created_at")

        serializer = KYCSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
class ReviewActionView(APIView):
    permission_classes = [IsAuthenticated, IsReviewer]

    def post(self, request, pk):
        action = request.data.get("action")

        try:
            submission = KYCSubmission.objects.get(id=pk)

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

        serializer = DocumentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(submission=submission)
            return Response(serializer.data)

        return Response(serializer.errors, status=400)