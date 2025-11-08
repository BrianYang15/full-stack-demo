python manage.py makemigrations
python manage.py migrate
python manage.py shell -c "import init_admin; init_admin.run()"
python manage.py runserver 0.0.0.0:8000