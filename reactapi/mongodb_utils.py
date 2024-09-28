from pymongo import MongoClient
from django.conf import settings

def get_database():
    client = MongoClient(settings.DATABASES['default']['CLIENT']['host'])
    return client[settings.DATABASES['default']['NAME']]

def get_collection():
    db = get_database()
    return db['user_schemas']
