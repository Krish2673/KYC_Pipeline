from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import KYCSubmission
from .serializers import KYCSubmissionSerializer
from kyc.services.state_machine import transition_state

class KYCSubmissionCreateView(APIView):
    def post(self, request):
        serializer = KYCSubmissionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(merchant=request.user)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SubmitKYCView(APIView):
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
    def get(self, request):
        submissions = KYCSubmission.objects.filter(state="submitted").order_by("created_at")

        serializer = KYCSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
class ReviewActionView(APIView):
    def post(self, request, pk):
        action = request.data.get("action")  # approved / rejected / more_info_requested

        try:
            submission = KYCSubmission.objects.get(id=pk)

            transition_state(submission, action)

            return Response({"message": f"{action} successful"})

        except KYCSubmission.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)