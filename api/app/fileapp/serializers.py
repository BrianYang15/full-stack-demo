from rest_framework import serializers
from .models import Document

def validate_file_size(file_obj):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    if file_obj.size > MAX_FILE_SIZE:
        raise serializers.ValidationError("檔案過大，請小於或等於 5MB。")

class DocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=True, validators=[validate_file_size])
    
    class Meta:
        model = Document
        fields = ["id", "file", "filename", "url", "size", "uploaded_at"]
        read_only_fields = ["id", "filename", "url", "size", "uploaded_at"]

class UploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)