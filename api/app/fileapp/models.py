from django.db import models
from django.core.files.storage import default_storage

class Document(models.Model):
    file = models.FileField(upload_to="uploads/%Y/%m/%d/")
    filename = models.CharField(max_length=255, editable=False)
    url = models.URLField(max_length=500, editable=False)
    size = models.BigIntegerField(editable=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file:
            # 先填 metadata，再存檔，就不會違反 NOT NULL 約束
            self.filename = self.file.name.split("/")[-1]
            self.size = getattr(self.file, "size", 0)
        super().save(*args, **kwargs)
        
        # 檔案存好後再補 url
        if self.file and not self.url:
            self.url = getattr(self.file, "url", "")
            super().save(update_fields=["url"])