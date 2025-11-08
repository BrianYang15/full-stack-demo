from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.shortcuts import redirect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

schema_view = get_schema_view(
    openapi.Info(
        title="File API (Simple APIView)",
        default_version="v1",
        description="簡潔版 4 API：上傳 / 列表 / 刪除 / 下載，限制 5MB。",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('', lambda request: redirect('/docs/', permanent=False)),  # 👈 加這行
    path("admin/", admin.site.urls),
    path("api/", include("fileapp.urls")),
    
    # Swagger
    re_path(r"^swagger(?P<format>\.json|\.yaml)$", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path("docs/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),  # 可選
]