from rest_framework import permissions


class IsSelf(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return obj == request.user


class IsOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user


class Answerable(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method != 'PUT' or not obj.complete
