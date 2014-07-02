
from django.conf import settings
import hashlib
import hmac
import uuid

def rename(filename):
    ext = filename.split('.')[-1]
    unique = uuid.uuid4()
    return hmac.new(unique.bytes, digestmod=hashlib.sha1).hexdigest() + '.' + ext

def fullpath(filepath):
    if filepath:  # check null file. "filepath is not None" doesn't work
        return settings.MEDIA_SITE_URL + filepath.url
