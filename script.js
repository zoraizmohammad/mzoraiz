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
    
    // Synchronous eye movement - both eyes look around together (left/right and up/down)
    const eyes = document.querySelectorAll('.eye-toggle');
    if (eyes.length === 2) {
        // Calculate the range of horizontal movement
        // The eye bar is 6vw wide, circle is 3vw wide
        // With transform translate(-50%, -50%), left represents the CENTER position
        // Center can be from 1.5vw (left edge at 0) to 4.5vw (right edge at 6vw)
        // With padding of 0.5vw, center can be from 2vw to 4vw
        const eyeBarWidth = 6; // 6vw
        const circleWidth = 3; // 3vw
        const padding = 0.5; // 0.5vw padding from edges
        const maxLeft = circleWidth / 2 + padding; // 2vw (center position for left edge at 0.5vw)
        const maxRight = eyeBarWidth - circleWidth / 2 - padding; // 4vw (center position for right edge at 5.5vw)
        
        // Calculate the range of vertical movement
        // The eye bar is 8vw tall, circle is 3vw tall
        // With transform translate(-50%, -50%), top represents the CENTER position
        // Center can be from 1.5vw (top edge at 0) to 6.5vw (bottom edge at 8vw)
        // With padding of 0.5vw, center can be from 2vw to 6vw
        const eyeBarHeight = 8; // 8vw
        const circleHeight = 3; // 3vw
        const maxTop = circleHeight / 2 + padding; // 2vw (center position for top edge at 0.5vw)
        const maxBottom = eyeBarHeight - circleHeight / 2 - padding; // 6vw (center position for bottom edge at 7.5vw)
        
        function moveEyesTogether() {
            // Horizontal: Avoid the middle - split into left and right zones
            // Middle is around 3vw (center of 6vw bar)
            const middleStartH = 2.5; // Start of middle zone to avoid horizontally
            const middleEndH = 3.5;   // End of middle zone to avoid horizontally
            
            // Randomly choose left or right side
            const chooseLeft = Math.random() < 0.5;
            
            let leftPosition;
            if (chooseLeft) {
                // Left side: from maxLeft (2vw) to middleStart (2.5vw)
                leftPosition = maxLeft + Math.random() * (middleStartH - maxLeft);
            } else {
                // Right side: from middleEnd (3.5vw) to maxRight (4vw)
                leftPosition = middleEndH + Math.random() * (maxRight - middleEndH);
            }
            
            // Vertical: Avoid the middle - split into top and bottom zones
            // Middle is around 4vw (center of 8vw bar)
            const middleStartV = 3.5; // Start of middle zone to avoid vertically
            const middleEndV = 4.5;   // End of middle zone to avoid vertically
            
            // Randomly choose top or bottom
            const chooseTop = Math.random() < 0.5;
            
            let topPosition;
            if (chooseTop) {
                // Top side: from maxTop (2vw) to middleStart (3.5vw)
                topPosition = maxTop + Math.random() * (middleStartV - maxTop);
            } else {
                // Bottom side: from middleEnd (4.5vw) to maxBottom (6vw)
                topPosition = middleEndV + Math.random() * (maxBottom - middleEndV);
            }
            
            // Move both eyes to the same position simultaneously using CSS custom properties
            eyes.forEach(eye => {
                eye.style.setProperty('--eye-position', `${leftPosition}vw`);
                eye.style.setProperty('--eye-position-vertical', `${topPosition}vw`);
            });
            
            // Schedule next movement with random delay (0.8s to 3s) for spontaneous movement
            const nextDelay = 800 + Math.random() * 2200;
            setTimeout(moveEyesTogether, nextDelay);
        }
        
        // Start the eye movement after a short delay
        setTimeout(moveEyesTogether, 1000 + Math.random() * 1000);
    }
});

