from flask import Flask, render_template, jsonify
import feedparser
import logging
import random
from datetime import datetime
from config import Config

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

def get_news():
    try:
        feed = feedparser.parse(app.config['NEWS_FEED_URL'])

        if feed.entries:
            # Obtener todas las entradas disponibles
            all_articles = []
            for entry in feed.entries:
                description = entry.get('description', '')

                # Obtener y formatear la fecha de publicación
                published = entry.get('published_parsed', None)
                if published:
                    date = datetime(*published[:6]).strftime('%d/%m/%Y %H:%M')
                    timestamp = datetime(*published[:6]).timestamp()
                else:
                    date = datetime.now().strftime('%d/%m/%Y %H:%M')
                    timestamp = datetime.now().timestamp()

                all_articles.append({
                    'title': entry.title,
                    'description': description,
                    'date': date,
                    'timestamp': timestamp,
                    'link': entry.get('link', ''),
                    'source': {'name': 'El País'}
                })

            # Ordenar artículos por fecha, del más reciente al más antiguo
            all_articles.sort(key=lambda x: x['timestamp'], reverse=True)

            # Seleccionar todos los artículos disponibles
            selected_articles = all_articles

            return {'articles': selected_articles}
        return None
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        return None

@app.route('/')
def index():
    news_data = get_news()
    if news_data and news_data.get('articles'):
        articles = news_data.get('articles', [])
        return render_template('index.html', articles=articles)
    return render_template('error.html')

@app.route('/refresh')
def refresh_news():
    logger.info("Refreshing news - Endpoint called")
    news_data = get_news()
    if news_data and news_data.get('articles'):
        articles = news_data.get('articles', [])
        logger.info(f"Successfully refreshed news - Found {len(articles)} articles")
        return jsonify({'success': True, 'articles': articles})
    logger.error("Error refreshing news - No articles found")
    return jsonify({'success': False, 'message': 'Error al cargar las noticias'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)