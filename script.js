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
    // Create constellation of questions
    const constellation = document.getElementById('questionsConstellation');
    const questions = [];
    let availableQuestions = [...questionsData];
    let currentTopQuestion = null;
    let currentBottomQuestion = null;
    
    // Create all question elements (hidden by default)
    questionsData.forEach((qData, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'question-element';
        
        questionEl.innerHTML = `
            <div class="question-symbol">${qData.symbol}</div>
            <div class="question-reveal">
                <div class="reveal-section">
                    <div class="reveal-label">Question</div>
                    <div class="reveal-content">${qData.question}</div>
                </div>
                <div class="reveal-section">
                    <div class="reveal-label">Origin</div>
                    <div class="reveal-content">${qData.origin}</div>
                </div>
                <div class="reveal-section">
                    <div class="reveal-label">Work</div>
                    <ul class="reveal-list">
                        ${qData.work.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="reveal-section">
                    <div class="reveal-label">Next</div>
                    <div class="reveal-content">${qData.next}</div>
                </div>
            </div>
        `;
        
        constellation.appendChild(questionEl);
        questions.push({
            element: questionEl,
            symbol: questionEl.querySelector('.question-symbol'),
            data: qData,
            index: index
        });
        
        // Click handler for expand/collapse
        questionEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = questionEl.classList.contains('expanded');
            
            // Close all other questions
            questions.forEach(q => {
                q.element.classList.remove('expanded', 'active');
            });
            
            // Toggle this question
            if (!isExpanded) {
                questionEl.classList.add('expanded', 'active');
            }
        });
        
        // Hover handler
        questionEl.addEventListener('mouseenter', () => {
            questionEl.classList.add('active');
        });
        
        questionEl.addEventListener('mouseleave', () => {
            questionEl.classList.remove('active');
        });
    });
    
    // Function to get a random question that's not currently shown
    function getRandomQuestion(excludeIndices = []) {
        const available = questions.filter(q => !excludeIndices.includes(q.index));
        if (available.length === 0) {
            // If all questions are shown, reset
            return questions[Math.floor(Math.random() * questions.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }
    
    // Function to show a question sliding across
    function showQuestion(question, isTop) {
        // Remove any existing classes
        question.element.classList.remove('visible', 'top-row', 'bottom-row', 'expanded', 'active');
        
        // Add appropriate row class
        question.element.classList.add(isTop ? 'top-row' : 'bottom-row');
        
        // Reset animation
        question.element.style.animation = 'none';
        void question.element.offsetWidth; // Trigger reflow
        
        // Show and animate
        question.element.classList.add('visible');
        question.element.style.animation = isTop ? 'slideAcrossTop 8s ease-in-out' : 'slideAcrossBottom 8s ease-in-out';
        
        // Hide after animation
        setTimeout(() => {
            question.element.classList.remove('visible', 'top-row', 'bottom-row');
        }, 8000);
    }
    
    // Function to cycle through questions
    function cycleQuestions() {
        // Hide current questions
        if (currentTopQuestion) {
            currentTopQuestion.element.classList.remove('visible');
        }
        if (currentBottomQuestion) {
            currentBottomQuestion.element.classList.remove('visible');
        }
        
        // Get new random questions
        const excludeIndices = [];
        if (currentTopQuestion) excludeIndices.push(currentTopQuestion.index);
        if (currentBottomQuestion) excludeIndices.push(currentBottomQuestion.index);
        
        currentTopQuestion = getRandomQuestion(excludeIndices);
        currentBottomQuestion = getRandomQuestion([...excludeIndices, currentTopQuestion.index]);
        
        // Show top question immediately
        showQuestion(currentTopQuestion, true);
        
        // Show bottom question with stagger (2-4 seconds delay)
        const staggerDelay = 2000 + Math.random() * 2000;
        setTimeout(() => {
            showQuestion(currentBottomQuestion, false);
        }, staggerDelay);
        
        // Schedule next cycle (after both animations complete + gap)
        const nextCycleDelay = 10000 + Math.random() * 5000; // 10-15 seconds
        setTimeout(cycleQuestions, nextCycleDelay);
    }
    
    // Start cycling questions
    setTimeout(cycleQuestions, 1000); // Initial delay
    
    // Eye tracking logic
    let currentTarget = null;
    let eyeTrackingTimeout = null;
    
    function trackQuestion(questionEl) {
        if (currentTarget === questionEl) return;
        
        currentTarget = questionEl;
        const rect = questionEl.getBoundingClientRect();
        const symbolRect = questionEl.querySelector('.question-symbol').getBoundingClientRect();
        
        // Calculate position relative to viewport center
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        // Get symbol center position
        const symbolCenterX = symbolRect.left + symbolRect.width / 2;
        const symbolCenterY = symbolRect.top + symbolRect.height / 2;
        
        // Calculate offset from viewport center
        const offsetX = symbolCenterX - viewportCenterX;
        const offsetY = symbolCenterY - viewportCenterY;
        
        // Convert to vw/vh units for eye positioning
        // Eye bar is 6vw wide, so we need to map offset to eye position
        const eyeBarWidth = 6; // 6vw
        const eyeBarHeight = 8; // 8vw
        const circleWidth = 3; // 3vw
        const padding = 0.75; // 0.75vw
        
        // Map viewport offset to eye position (normalized to -1 to 1, then to eye range)
        const normalizedX = Math.max(-1, Math.min(1, offsetX / (window.innerWidth * 0.3)));
        const normalizedY = Math.max(-1, Math.min(1, offsetY / (window.innerHeight * 0.3)));
        
        // Convert to eye position (2.25vw to 3.75vw for X, 2.25vw to 5.75vw for Y)
        const maxLeft = circleWidth / 2 + padding; // 2.25vw
        const maxRight = eyeBarWidth - circleWidth / 2 - padding; // 3.75vw
        const maxTop = circleWidth / 2 + padding; // 2.25vw
        const maxBottom = eyeBarHeight - circleWidth / 2 - padding; // 5.75vw
        
        const leftPosition = maxLeft + (normalizedX + 1) / 2 * (maxRight - maxLeft);
        const topPosition = maxTop + (normalizedY + 1) / 2 * (maxBottom - maxTop);
        
        // Move eyes with slight delay (feels thoughtful)
        const eyes = document.querySelectorAll('.eye-toggle');
        eyes.forEach(eye => {
            eye.style.setProperty('--eye-position', `${leftPosition}vw`);
            eye.style.setProperty('--eye-position-vertical', `${topPosition}vw`);
        });
    }
    
    function resetEyes() {
        currentTarget = null;
        const eyes = document.querySelectorAll('.eye-toggle');
        // Return to center/neutral position
        eyes.forEach(eye => {
            eye.style.setProperty('--eye-position', '3vw');
            eye.style.setProperty('--eye-position-vertical', '4vw');
        });
    }
    
    // Track questions on hover (only if visible)
    questions.forEach(({ element }) => {
        element.addEventListener('mouseenter', () => {
            if (element.classList.contains('visible')) {
                clearTimeout(eyeTrackingTimeout);
                setTimeout(() => {
                    trackQuestion(element);
                }, 200); // Slight delay before tracking
            }
        });
        
        element.addEventListener('mouseleave', () => {
            clearTimeout(eyeTrackingTimeout);
            eyeTrackingTimeout = setTimeout(() => {
                resetEyes();
            }, 500); // Delay before resetting
        });
    });
    
    // Click outside to close expanded questions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.question-element')) {
            questions.forEach(q => {
                q.element.classList.remove('expanded', 'active');
            });
        }
    });
    
    // Initialize eyes to center/neutral position (rest position)
    const eyesForMovement = document.querySelectorAll('.eye-toggle');
    eyesForMovement.forEach(eye => {
        eye.style.setProperty('--eye-position', '3vw');
        eye.style.setProperty('--eye-position-vertical', '4vw');
    });
    
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

