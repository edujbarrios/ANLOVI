import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change'
    NEWS_FEED_URL = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'
    DEBUG = True