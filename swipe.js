// swipe.js - Enhanced Swipe Detection
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slides-container');
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.dot');
    
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    // Touch Events
    slider.addEventListener('touchstart', touchStart);
    slider.addEventListener('touchend', touchEnd);
    slider.addEventListener('touchmove', touchMove);

    // Mouse Events
    slider.addEventListener('mousedown', touchStart);
    slider.addEventListener('mouseup', touchEnd);
    slider.addEventListener('mouseleave', touchEnd);
    slider.addEventListener('mousemove', touchMove);

    function touchStart(e) {
        isDragging = true;
        startPos = getPositionX(e);
        slider.style.transition = 'none';
    }

    function touchEnd() {
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;
        
        if(movedBy < -100 && currentIndex < slides.length - 1) currentIndex++;
        if(movedBy > 100 && currentIndex > 0) currentIndex--;

        setSliderPosition();
        updateIndicators();
    }

    function touchMove(e) {
        if(isDragging) {
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function setSliderPosition() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        slider.style.transition = 'transform 0.3s ease-out';
        prevTranslate = currentIndex * -window.innerWidth;
    }

    function updateIndicators() {
        indicators.forEach((dot, index) => 
            dot.classList.toggle('active', index === currentIndex)
        );
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
});
