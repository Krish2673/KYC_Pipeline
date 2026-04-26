from django.urls import path
from .views import *

urlpatterns = [
    path('kyc/create/', KYCSubmissionCreateView.as_view()),
    path('kyc/<int:pk>/submit/', SubmitKYCView.as_view()),
    path('review/queue/', ReviewerQueueView.as_view()),
    path('review/<int:pk>/action/', ReviewActionView.as_view()),
    path('kyc/upload-doc/', DocumentUploadView.as_view()),
    path('review/dashboard/', ReviewerDashboardView.as_view()),
]