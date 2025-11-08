from django.http import FileResponse, Http404
from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Document
from .serializers import DocumentSerializer, UploadSerializer, ListQuerySerializer
from .serializers import validate_file_size
import mimetypes
from .pagination import DefaultPagination   # ← 新增

class DocumentListCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = (MultiPartParser, FormParser)  # ← 必加

    @swagger_auto_schema(
        operation_summary="取得所有檔案列表",
        query_serializer=ListQuerySerializer, 
        responses={200: DocumentSerializer(many=True)},
    )
    def get(self, request):
        docs = Document.objects.order_by("-uploaded_at")
        paginator = DefaultPagination()
        page_docs = paginator.paginate_queryset(docs, request, view=self)  # ← 分頁切片
        serializer = DocumentSerializer(page_docs, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    
    @swagger_auto_schema(
        operation_summary="上傳單一檔案（≤5MB）",
        request_body=UploadSerializer,          # ← 用 Serializer
        consumes=["multipart/form-data"],       # ← 明確指定
        responses={201: DocumentSerializer, 400: "錯誤請求"},
    )
    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "請提供 file"}, status=status.HTTP_400_BAD_REQUEST)
        validate_file_size(file_obj)
        doc = Document(file=file_obj)
        doc.save()
        serializer = DocumentSerializer(doc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DocumentDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="刪除單一檔案",
        responses={204: "刪除成功", 404: "找不到檔案"},
    )
    def delete(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            raise Http404("檔案不存在")
        if doc.file and default_storage.exists(doc.file.name):
            default_storage.delete(doc.file.name)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DocumentDownloadAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="下載單一檔案",
        responses={200: "成功下載檔案", 404: "找不到檔案"},
    )
    def get(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            raise Http404("檔案不存在")

        if not default_storage.exists(doc.file.name):
            raise Http404("實體檔案不存在")

        content_type, _ = mimetypes.guess_type(doc.filename)
        content_type = content_type or "application/octet-stream"
        f = default_storage.open(doc.file.name, "rb")
        resp = FileResponse(f, content_type=content_type, as_attachment=True, filename=doc.filename)
        resp["Content-Length"] = str(doc.size)
        return resp