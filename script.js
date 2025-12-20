// Theme management
function initTheme() {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode if no preference exists
    const theme = savedTheme || (prefersDark ? 'dark' : 'dark');
    
    // Set data-theme attribute on html element
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load (before DOMContentLoaded to avoid flash)
initTheme();

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
    
    // Match banner width to MOHAMMAD name-line width (after scroll wheel is set up)
    function setBannerWidth() {
        const nameLines = document.querySelectorAll('.name-line');
        const banner = document.querySelector('.banner');
        
        if (nameLines.length > 0 && banner) {
            // Use the first name-line (MOHAMMAD) to match width
            const mohammadLine = nameLines[0];
            const mohammadWidth = mohammadLine.offsetWidth;
            
            // Set banner width to match
            banner.style.width = mohammadWidth + 'px';
        }
    }
    
    // Set banner width after a short delay to ensure DOM is ready
    setTimeout(setBannerWidth, 100);
    
    // Update on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setBannerWidth, 100);
    });
    
    // Synchronous eye movement - both eyes look around together (left/right and up/down)
    const eyesForMovement = document.querySelectorAll('.eye-toggle');
    if (eyesForMovement.length === 2) {
        // Calculate the range of horizontal movement
        // The eye bar is 6vw wide, circle is 3vw wide
        // With transform translate(-50%, -50%), left represents the CENTER position
        // To keep circle within bar: center must be between 1.5vw (left edge at 0) and 4.5vw (right edge at 6vw)
        // With padding of 0.75vw, center can be from 2.25vw to 3.75vw
        const eyeBarWidth = 6; // 6vw
        const circleWidth = 3; // 3vw
        const padding = 0.75; // 0.75vw padding from edges (increased to prevent overflow)
        const maxLeft = circleWidth / 2 + padding; // 2.25vw (center position for left edge at 0.75vw)
        const maxRight = eyeBarWidth - circleWidth / 2 - padding; // 3.75vw (center position for right edge at 5.25vw)
        
        // Calculate the range of vertical movement
        // The eye bar is 8vw tall, circle is 3vw tall
        // With transform translate(-50%, -50%), top represents the CENTER position
        // Center can be from 1.5vw (top edge at 0) to 6.5vw (bottom edge at 8vw)
        // With padding of 0.75vw, center can be from 2.25vw to 5.75vw
        const eyeBarHeight = 8; // 8vw
        const circleHeight = 3; // 3vw
        const verticalPadding = 0.75; // 0.75vw padding from edges
        const maxTop = circleHeight / 2 + verticalPadding; // 2.25vw (center position for top edge at 0.75vw)
        const maxBottom = eyeBarHeight - circleHeight / 2 - verticalPadding; // 5.75vw (center position for bottom edge at 7.25vw)
        
        function moveEyesTogether() {
            // Horizontal: Avoid the middle - split into left and right zones
            // Middle is around 3vw (center of 6vw bar)
            const middleStartH = 2.75; // Start of middle zone to avoid horizontally
            const middleEndH = 3.25;   // End of middle zone to avoid horizontally
            
            // Randomly choose left or right side
            const chooseLeft = Math.random() < 0.5;
            
            let leftPosition;
            if (chooseLeft) {
                // Left side: from maxLeft (2.25vw) to middleStart (2.75vw)
                leftPosition = maxLeft + Math.random() * (middleStartH - maxLeft);
            } else {
                // Right side: from middleEnd (3.25vw) to maxRight (3.75vw)
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
                // Top side: from maxTop (2.25vw) to middleStart (3.5vw)
                topPosition = maxTop + Math.random() * (middleStartV - maxTop);
            } else {
                // Bottom side: from middleEnd (4.5vw) to maxBottom (5.75vw)
                topPosition = middleEndV + Math.random() * (maxBottom - middleEndV);
            }
            
            // Move both eyes to the same position simultaneously using CSS custom properties
            eyesForMovement.forEach(eye => {
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
    
    // Click to toggle theme (dark/light) with squinting effect
    const eyesForClick = document.querySelectorAll('.eye-toggle');
    eyesForClick.forEach(eye => {
        eye.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Store current positions before squinting
            const storedPositions = new Map();
            eyesForClick.forEach(eyeEl => {
                const currentLeft = eyeEl.style.getPropertyValue('--eye-position') || '2.25vw';
                const currentTop = eyeEl.style.getPropertyValue('--eye-position-vertical') || '4vw';
                storedPositions.set(eyeEl, { left: currentLeft, top: currentTop });
            });
            
            // Toggle theme immediately on click
            toggleTheme();
            
            // Add squinting class to both eyes
            eyesForClick.forEach(e => {
                e.classList.add('squinting');
            });
            
            // Remove squinting class and restore positions after animation completes
            setTimeout(() => {
                eyesForClick.forEach(eyeEl => {
                    eyeEl.classList.remove('squinting');
                    // Restore the stored positions
                    const positions = storedPositions.get(eyeEl);
                    if (positions) {
                        eyeEl.style.setProperty('--eye-position', positions.left);
                        eyeEl.style.setProperty('--eye-position-vertical', positions.top);
                    }
                });
            }, 2500); // After animation completes (2.5 seconds)
        });
    });
});

