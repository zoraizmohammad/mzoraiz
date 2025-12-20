// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Setup scroll wheel with seamless looping
    const scrollWheel = document.getElementById('scrollWheel');
    if (scrollWheel) {
        // Get all children (items and dots)
        const allChildren = Array.from(scrollWheel.children);
        
        // Clone all children (items + dots) for seamless infinite scroll
        // We need to clone the entire set multiple times for smooth continuous scrolling
        allChildren.forEach(child => {
            const clone = child.cloneNode(true);
            scrollWheel.appendChild(clone);
        });
        
        // Clone again to ensure seamless loop
        allChildren.forEach(child => {
            const clone = child.cloneNode(true);
            scrollWheel.appendChild(clone);
        });
    }
    
    // Match banner width to MOHAMMAD name-line width
    const nameLines = document.querySelectorAll('.name-line');
    const banner = document.querySelector('.banner');
    
    if (nameLines.length > 0 && banner) {
        // Use the first name-line (MOHAMMAD) to match width
        const mohammadLine = nameLines[0];
        const mohammadWidth = mohammadLine.offsetWidth;
        
        // Set banner width to match
        banner.style.width = mohammadWidth + 'px';
        
        // Update on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newWidth = mohammadLine.offsetWidth;
                banner.style.width = newWidth + 'px';
            }, 100);
        });
    }
    
    // Synchronous eye movement - both eyes look around together
    const eyes = document.querySelectorAll('.eye-toggle');
    if (eyes.length === 2) {
        // Calculate the range of movement (from left edge to right edge)
        // The eye bar is 6vw wide, circle is 3vw, so it can move from 0.5vw to (6vw - 3vw - 0.5vw) = 2.5vw
        const eyeBarWidth = 6; // 6vw
        const circleWidth = 3; // 3vw
        const padding = 0.5; // 0.5vw padding
        const maxLeft = padding;
        const maxRight = eyeBarWidth - circleWidth - padding; // 2.5vw
        
        function moveEyesTogether() {
            // Avoid the middle - split into left and right zones
            const middleStart = 1.2; // Start of middle zone to avoid
            const middleEnd = 1.8;   // End of middle zone to avoid
            const totalRange = maxRight - maxLeft; // 2.0vw total range
            
            // Randomly choose left or right side
            const chooseLeft = Math.random() < 0.5;
            
            let leftPosition;
            if (chooseLeft) {
                // Left side: from maxLeft (0.5vw) to middleStart (1.2vw)
                leftPosition = maxLeft + Math.random() * (middleStart - maxLeft);
            } else {
                // Right side: from middleEnd (1.8vw) to maxRight (2.5vw)
                leftPosition = middleEnd + Math.random() * (maxRight - middleEnd);
            }
            
            // Move both eyes to the same position simultaneously using CSS custom property
            eyes.forEach(eye => {
                eye.style.setProperty('--eye-position', `${leftPosition}vw`);
            });
            
            // Schedule next movement with random delay (0.8s to 3s) for spontaneous movement
            const nextDelay = 800 + Math.random() * 2200;
            setTimeout(moveEyesTogether, nextDelay);
        }
        
        // Start the eye movement after a short delay
        setTimeout(moveEyesTogether, 1000 + Math.random() * 1000);
    }
});

