document.addEventListener('DOMContentLoaded', () => {
    const SWIPE_THRESHOLD = 50;
    const slider = document.querySelector('.slides-container');
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.dot');
    
    let touchStartX = 0;
    let currentIndex = 0;

    // Touch Events
    slider.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    });

    slider.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        handleSwipe(touchStartX - touchEndX);
    });

    // Mouse Events
    slider.addEventListener('mousedown', e => {
        touchStartX = e.clientX;
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseUp(e) {
        handleSwipe(touchStartX - e.clientX);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function handleSwipe(deltaX) {
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        
        if (deltaX > 0 && currentIndex < slides.length - 1) {
            currentIndex++;
        } else if (deltaX < 0 && currentIndex > 0) {
            currentIndex--;
        }
        
        updateSlider();
        updateIndicators();
    }

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        slider.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    function updateIndicators() {
        indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
});