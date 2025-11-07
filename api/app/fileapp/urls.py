from django.urls import path
from .views import DocumentListCreateAPIView, DocumentDetailAPIView, DocumentDownloadAPIView

urlpatterns = [
    path("documents/", DocumentListCreateAPIView.as_view(), name="document-list-create"),
    path("documents/<int:pk>/", DocumentDetailAPIView.as_view(), name="document-detail"),
    path("documents/<int:pk>/download/", DocumentDownloadAPIView.as_view(), name="document-download"),
]