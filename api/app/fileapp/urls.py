from django.urls import path
from .views import DocumentListCreateAPIView, DocumentDetailAPIView, DocumentDownloadAPIView

urlpatterns = [
    path("documents/", DocumentListCreateAPIView.as_view(), name="document-list-create"),
    path("documents/<int:pk>/", DocumentDetailAPIView.as_view(), name="document-detail"),
    path("documents/<int:pk>/download/", DocumentDownloadAPIView.as_view(), name="document-download"),
    
    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),  # 可選
]