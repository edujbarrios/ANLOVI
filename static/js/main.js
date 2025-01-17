document.addEventListener('DOMContentLoaded', function() {
    let currentIndex = 0;
    let visitedArticles = new Set();
    let welcomeShown = true;
    const newsItems = document.querySelectorAll('.news-item');
    const totalArticles = newsItems.length;
    console.log("News application initialized - Auto-refresh enabled (5 minutes interval)");

    function updateProgress() {
        const progressIndicator = document.querySelector('.progress-indicator');
        const progress = (visitedArticles.size / totalArticles) * 100;
        progressIndicator.style.width = `${progress}%`;
    }

    function showNewsItem(index) {
        newsItems.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-hidden', 'true');
        });

        newsItems[index].classList.add('active');
        newsItems[index].setAttribute('aria-hidden', 'false');
        newsItems[index].focus();
        currentIndex = index;
        visitedArticles.add(index);
        updateProgress();

        if (visitedArticles.size === totalArticles) {
            showCompletionMessage();
        }
    }

    function showCompletionMessage() {
        const message = document.getElementById('completion-message');
        message.classList.remove('hidden');
        setTimeout(() => {
            message.classList.add('visible');
        }, 100);
    }

    function showWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcome-message');
        welcomeMessage.classList.remove('hidden');
        welcomeMessage.classList.add('visible');
        welcomeShown = true;

        // Hide current news item
        if (currentIndex >= 0 && currentIndex < totalArticles) {
            newsItems[currentIndex].classList.remove('active');
        }
    }

    function hideWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcome-message');
        welcomeMessage.classList.remove('visible');
        setTimeout(() => {
            welcomeMessage.classList.add('hidden');
            welcomeShown = false;
        }, 500);
    }

    function nextNews() {
        if (welcomeShown) {
            hideWelcomeMessage();
            showNewsItem(0);
            return;
        }
        const nextIndex = (currentIndex + 1) % totalArticles;
        showNewsItem(nextIndex);
    }

    function prevNews() {
        if (welcomeShown) {
            return;
        }

        // Si estamos en la primera noticia, volver a la pantalla de bienvenida
        if (currentIndex === 0) {
            showWelcomeMessage();
            return;
        }

        const prevIndex = ((currentIndex - 1) + totalArticles) % totalArticles;
        showNewsItem(prevIndex);
    }

    async function refreshNews() {
        console.log("Starting news refresh...");
        try {
            const response = await fetch('/refresh');
            const data = await response.json();
            if (data.success) {
                console.log("News refresh successful - Reloading page");
                window.location.reload();
            } else {
                console.error("News refresh failed:", data.message);
            }
        } catch (error) {
            console.error('Error refreshing news:', error);
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextNews();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevNews();
        }
    });

    // Auto refresh every 5 minutes
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
    console.log(`Setting up auto-refresh every ${REFRESH_INTERVAL/1000} seconds`);
    setInterval(refreshNews, REFRESH_INTERVAL);
});