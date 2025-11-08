# files/pagination.py
from rest_framework.pagination import PageNumberPagination

class DefaultPagination(PageNumberPagination):
    page_size = 10                         # 預設每頁 10 筆
    page_size_query_param = "page_size"    # 允許前端帶 ?page_size=
    max_page_size = 100
