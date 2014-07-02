from rest_framework import permissions


class IsSelf(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return obj == request.user
