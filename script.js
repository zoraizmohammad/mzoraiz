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
    
    // Floating question marks animation
    initFloatingQuestionMarks();
});

// Floating question marks system
function initFloatingQuestionMarks() {
    const container = document.getElementById('questionMarksContainer');
    if (!container) return;
    
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;
    
    const questionMarks = [];
    const numMarks = 50; // Number of question marks (increased)
    const minSize = 20; // Minimum font size in pixels
    const maxSize = 60; // Maximum font size in pixels
    const minSpeed = 0.5; // Minimum speed (increased)
    const maxSpeed = 1.2; // Maximum speed (increased)
    const padding = 100; // Padding around content to avoid
    
    // Get content bounds for even distribution
    const heroRect = heroContent.getBoundingClientRect();
    const contentLeft = heroRect.left - padding;
    const contentRight = heroRect.right + padding;
    const contentTop = heroRect.top - padding;
    const contentBottom = heroRect.bottom + padding;
    
    // Function to check if position is valid (not in content area and not overlapping other marks)
    function isValidPosition(x, y, size, existingMarks) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        
        // Check content area
        if (centerX > contentLeft && centerX < contentRight &&
            centerY > contentTop && centerY < contentBottom) {
            return false;
        }
        
        // Check overlap with existing marks
        for (const existing of existingMarks) {
            const existingCenterX = existing.x + existing.size / 2;
            const existingCenterY = existing.y + existing.size / 2;
            const distance = Math.sqrt(
                Math.pow(centerX - existingCenterX, 2) + 
                Math.pow(centerY - existingCenterY, 2)
            );
            const minDistance = (size + existing.size) / 2 + 10; // Minimum distance between marks
            if (distance < minDistance) {
                return false;
            }
        }
        
        return true;
    }
    
    // Function to get random position in a zone around content
    function getRandomPositionInZone(zone, size, existingMarks) {
        const edgePadding = 30;
        let minX, maxX, minY, maxY;
        
        // Define zones around content: top, bottom, left, right
        switch(zone) {
            case 0: // Top zone
                minX = edgePadding;
                maxX = window.innerWidth - edgePadding;
                minY = edgePadding;
                maxY = contentTop - 20;
                break;
            case 1: // Bottom zone
                minX = edgePadding;
                maxX = window.innerWidth - edgePadding;
                minY = contentBottom + 20;
                maxY = window.innerHeight - edgePadding;
                break;
            case 2: // Left zone
                minX = edgePadding;
                maxX = contentLeft - 20;
                minY = contentTop - 20;
                maxY = contentBottom + 20;
                break;
            case 3: // Right zone
                minX = contentRight + 20;
                maxX = window.innerWidth - edgePadding;
                minY = contentTop - 20;
                maxY = contentBottom + 20;
                break;
        }
        
        // Ensure valid bounds
        if (maxX <= minX || maxY <= minY) {
            // Fallback to random position anywhere
            return {
                x: edgePadding + Math.random() * (window.innerWidth - edgePadding * 2 - size),
                y: edgePadding + Math.random() * (window.innerHeight - edgePadding * 2 - size)
            };
        }
        
        // Try random positions in this zone until we find a valid one
        for (let attempt = 0; attempt < 100; attempt++) {
            const x = minX + Math.random() * (maxX - minX - size);
            const y = minY + Math.random() * (maxY - minY - size);
            
            if (isValidPosition(x, y, size, existingMarks)) {
                return { x, y };
            }
        }
        
        // Fallback: return a position at the edge
        return {
            x: Math.max(edgePadding, Math.min(window.innerWidth - size - edgePadding, minX + Math.random() * (maxX - minX - size))),
            y: Math.max(edgePadding, Math.min(window.innerHeight - size - edgePadding, minY + Math.random() * (maxY - minY - size)))
        };
    }
    
    // Distribute question marks with strong emphasis on left and right sides
    // Allocate: 30% left, 30% right, 20% top, 20% bottom
    const leftMarks = Math.floor(numMarks * 0.3);
    const rightMarks = Math.floor(numMarks * 0.3);
    const topMarks = Math.floor(numMarks * 0.2);
    const bottomMarks = numMarks - leftMarks - rightMarks - topMarks;
    
    // Create question marks
    let markIndex = 0;
    
    // Create left side marks
    for (let i = 0; i < leftMarks; i++) {
        const mark = document.createElement('div');
        mark.className = 'question-mark';
        mark.textContent = '?';
        
        const size = minSize + Math.random() * (maxSize - minSize);
        mark.style.fontSize = `${size}px`;
        
        const position = getRandomPositionInZone(2, size, questionMarks);
        mark.style.left = `${position.x}px`;
        mark.style.top = `${position.y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const directionChangeInterval = 1000 + Math.random() * 2000;
        
        questionMarks.push({
            element: mark,
            x: position.x,
            y: position.y,
            vx: vx,
            vy: vy,
            size: size,
            lastDirectionChange: Date.now(),
            directionChangeInterval: directionChangeInterval
        });
        
        container.appendChild(mark);
        markIndex++;
    }
    
    // Create right side marks
    for (let i = 0; i < rightMarks; i++) {
        const mark = document.createElement('div');
        mark.className = 'question-mark';
        mark.textContent = '?';
        
        const size = minSize + Math.random() * (maxSize - minSize);
        mark.style.fontSize = `${size}px`;
        
        const position = getRandomPositionInZone(3, size, questionMarks);
        mark.style.left = `${position.x}px`;
        mark.style.top = `${position.y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const directionChangeInterval = 1000 + Math.random() * 2000;
        
        questionMarks.push({
            element: mark,
            x: position.x,
            y: position.y,
            vx: vx,
            vy: vy,
            size: size,
            lastDirectionChange: Date.now(),
            directionChangeInterval: directionChangeInterval
        });
        
        container.appendChild(mark);
        markIndex++;
    }
    
    // Create top marks
    for (let i = 0; i < topMarks; i++) {
        const mark = document.createElement('div');
        mark.className = 'question-mark';
        mark.textContent = '?';
        
        const size = minSize + Math.random() * (maxSize - minSize);
        mark.style.fontSize = `${size}px`;
        
        const position = getRandomPositionInZone(0, size, questionMarks);
        mark.style.left = `${position.x}px`;
        mark.style.top = `${position.y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const directionChangeInterval = 1000 + Math.random() * 2000;
        
        questionMarks.push({
            element: mark,
            x: position.x,
            y: position.y,
            vx: vx,
            vy: vy,
            size: size,
            lastDirectionChange: Date.now(),
            directionChangeInterval: directionChangeInterval
        });
        
        container.appendChild(mark);
        markIndex++;
    }
    
    // Create bottom marks
    for (let i = 0; i < bottomMarks; i++) {
        const mark = document.createElement('div');
        mark.className = 'question-mark';
        mark.textContent = '?';
        
        const size = minSize + Math.random() * (maxSize - minSize);
        mark.style.fontSize = `${size}px`;
        
        const position = getRandomPositionInZone(1, size, questionMarks);
        mark.style.left = `${position.x}px`;
        mark.style.top = `${position.y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const directionChangeInterval = 1000 + Math.random() * 2000;
        
        questionMarks.push({
            element: mark,
            x: position.x,
            y: position.y,
            vx: vx,
            vy: vy,
            size: size,
            lastDirectionChange: Date.now(),
            directionChangeInterval: directionChangeInterval
        });
        
        container.appendChild(mark);
        markIndex++;
    }
    
    // Animation loop
    function animate() {
        const heroRect = heroContent.getBoundingClientRect();
        const currentContentLeft = heroRect.left - padding;
        const currentContentRight = heroRect.right + padding;
        const currentContentTop = heroRect.top - padding;
        const currentContentBottom = heroRect.bottom + padding;
        
        questionMarks.forEach(mark => {
            // Periodic random direction changes for more chaotic movement
            const now = Date.now();
            if (now - mark.lastDirectionChange > mark.directionChangeInterval) {
                // Randomly change direction with more randomness
                const angle = Math.random() * Math.PI * 2;
                const currentSpeed = Math.sqrt(mark.vx * mark.vx + mark.vy * mark.vy);
                const newSpeed = Math.max(minSpeed, Math.min(maxSpeed, currentSpeed + (Math.random() - 0.5) * 0.3));
                mark.vx = Math.cos(angle) * newSpeed;
                mark.vy = Math.sin(angle) * newSpeed;
                mark.lastDirectionChange = now;
                mark.directionChangeInterval = 800 + Math.random() * 1500; // 0.8-2.3 seconds (more frequent)
            }
            
            // Update position
            mark.x += mark.vx;
            mark.y += mark.vy;
            
            // Boundary collision (bounce off edges with more randomness)
            if (mark.x <= 0 || mark.x >= window.innerWidth - mark.size) {
                // Add random angle to bounce instead of just reversing
                const bounceAngle = (Math.random() - 0.5) * Math.PI * 0.5; // Random angle within 90 degrees
                const speed = Math.sqrt(mark.vx * mark.vx + mark.vy * mark.vy);
                mark.vx = Math.cos(bounceAngle) * speed * (mark.x <= 0 ? 1 : -1);
                mark.vy = Math.sin(bounceAngle) * speed + (Math.random() - 0.5) * 0.5;
                mark.x = Math.max(0, Math.min(window.innerWidth - mark.size, mark.x));
            }
            
            if (mark.y <= 0 || mark.y >= window.innerHeight - mark.size) {
                // Add random angle to bounce instead of just reversing
                const bounceAngle = (Math.random() - 0.5) * Math.PI * 0.5; // Random angle within 90 degrees
                const speed = Math.sqrt(mark.vx * mark.vx + mark.vy * mark.vy);
                mark.vx = Math.cos(bounceAngle) * speed + (Math.random() - 0.5) * 0.5;
                mark.vy = Math.sin(bounceAngle) * speed * (mark.y <= 0 ? 1 : -1);
                mark.y = Math.max(0, Math.min(window.innerHeight - mark.size, mark.y));
            }
            
            // Content area collision detection (bounce away from main content)
            const markCenterX = mark.x + mark.size / 2;
            const markCenterY = mark.y + mark.size / 2;
            
            // Check if mark is too close to content
            if (markCenterX > currentContentLeft && markCenterX < currentContentRight &&
                markCenterY > currentContentTop && markCenterY < currentContentBottom) {
                
                // Calculate direction away from content center
                const contentCenterX = (currentContentLeft + currentContentRight) / 2;
                const contentCenterY = (currentContentTop + currentContentBottom) / 2;
                
                const dx = markCenterX - contentCenterX;
                const dy = markCenterY - contentCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Normalize and apply repulsion
                    const repulsionStrength = 0.5;
                    mark.vx += (dx / distance) * repulsionStrength;
                    mark.vy += (dy / distance) * repulsionStrength;
                    
                    // Limit velocity (increased)
                    const maxVel = 1.5;
                    const vel = Math.sqrt(mark.vx * mark.vx + mark.vy * mark.vy);
                    if (vel > maxVel) {
                        mark.vx = (mark.vx / vel) * maxVel;
                        mark.vy = (mark.vy / vel) * maxVel;
                    }
                }
            }
            
            // Collision detection with other question marks
            questionMarks.forEach(otherMark => {
                if (mark === otherMark) return;
                
                const markCenterX = mark.x + mark.size / 2;
                const markCenterY = mark.y + mark.size / 2;
                const otherCenterX = otherMark.x + otherMark.size / 2;
                const otherCenterY = otherMark.y + otherMark.size / 2;
                
                const dx = markCenterX - otherCenterX;
                const dy = markCenterY - otherCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (mark.size + otherMark.size) / 2;
                
                // If marks are overlapping or too close
                if (distance < minDistance && distance > 0) {
                    // Calculate collision response (elastic collision)
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);
                    
                    // Rotate velocities
                    const vx1 = mark.vx * cos + mark.vy * sin;
                    const vy1 = mark.vy * cos - mark.vx * sin;
                    const vx2 = otherMark.vx * cos + otherMark.vy * sin;
                    const vy2 = otherMark.vy * cos - otherMark.vx * sin;
                    
                    // Swap velocities (elastic collision)
                    const tempVx = vx1;
                    const finalVx1 = vx2;
                    const finalVx2 = tempVx;
                    
                    // Rotate back
                    mark.vx = finalVx1 * cos - vy1 * sin;
                    mark.vy = vy1 * cos + finalVx1 * sin;
                    otherMark.vx = finalVx2 * cos - vy2 * sin;
                    otherMark.vy = vy2 * cos + finalVx2 * sin;
                    
                    // Separate marks to prevent overlap
                    const overlap = minDistance - distance;
                    const separationX = (dx / distance) * overlap * 0.5;
                    const separationY = (dy / distance) * overlap * 0.5;
                    
                    mark.x += separationX;
                    mark.y += separationY;
                    otherMark.x -= separationX;
                    otherMark.y -= separationY;
                }
            });
            
            // Apply more random drift for chaotic movement
            mark.vx += (Math.random() - 0.5) * 0.12;
            mark.vy += (Math.random() - 0.5) * 0.12;
            
            // Prevent marks from getting stuck by adding occasional strong random push
            if (Math.random() < 0.02) { // 2% chance per frame
                const pushAngle = Math.random() * Math.PI * 2;
                const pushStrength = 0.3;
                mark.vx += Math.cos(pushAngle) * pushStrength;
                mark.vy += Math.sin(pushAngle) * pushStrength;
            }
            
            // Less damping to keep them moving more
            mark.vx *= 0.998;
            mark.vy *= 0.998;
            
            // Prevent velocity from getting too low (keeps them moving)
            const currentSpeed = Math.sqrt(mark.vx * mark.vx + mark.vy * mark.vy);
            if (currentSpeed < minSpeed * 0.5) {
                const angle = Math.random() * Math.PI * 2;
                mark.vx = Math.cos(angle) * minSpeed;
                mark.vy = Math.sin(angle) * minSpeed;
            }
            
            // Update element position
            mark.element.style.left = `${mark.x}px`;
            mark.element.style.top = `${mark.y}px`;
        });
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            questionMarks.forEach(mark => {
                // Keep marks within bounds on resize
                mark.x = Math.max(0, Math.min(window.innerWidth - mark.size, mark.x));
                mark.y = Math.max(0, Math.min(window.innerHeight - mark.size, mark.y));
            });
        }, 100);
    });
}

// Expandable sections functionality
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.expandable-section');
    
    // Function to expand and scroll to a section
    function expandAndScrollToSection(targetSection) {
        // Close all sections
        sections.forEach(s => s.classList.remove('expanded'));
        
        // Expand target section
        targetSection.classList.add('expanded');
        
        // Smooth scroll to section
        setTimeout(() => {
            targetSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
    }
    
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        
        header.addEventListener('click', () => {
            const isExpanded = section.classList.contains('expanded');
            
            // Close all sections
            sections.forEach(s => s.classList.remove('expanded'));
            
            // Toggle current section (open if it wasn't expanded)
            if (!isExpanded) {
                section.classList.add('expanded');
                
                // Smooth scroll to section
                setTimeout(() => {
                    section.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
            }
        });
    });
    
    // Handle anchor links to sections (e.g., #questions)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#questions') {
                e.preventDefault();
                const questionsSection = document.getElementById('questions');
                if (questionsSection) {
                    expandAndScrollToSection(questionsSection);
                }
            }
        });
    });
});

