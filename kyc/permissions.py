from rest_framework.permissions import BasePermission

class IsMerchant(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "merchant"
    
class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "reviewer"