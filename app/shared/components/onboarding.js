/**
 * @fileoverview Onboarding Component
 * @description First-time user onboarding flow
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Onboarding Steps
// ============================================================================

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Life Reset! 🌟',
        description: 'Your personal wellness companion for building better habits, tracking your mood, and achieving your goals.',
        icon: '👋'
    },
    {
        id: 'tasks',
        title: 'Manage Your Tasks 📋',
        description: 'Create and organize tasks with priorities. Complete them to earn XP and level up!',
        icon: '✅'
    },
    {
        id: 'habits',
        title: 'Build Better Habits 🔄',
        description: 'Track daily habits and build streaks. Consistency is key to lasting change.',
        icon: '🔥'
    },
    {
        id: 'mood',
        title: 'Track Your Mood 😊',
        description: 'Log how you feel each day. Understanding your patterns helps improve wellbeing.',
        icon: '📊'
    },
    {
        id: 'journal',
        title: 'Reflect with Journaling 📝',
        description: 'Write about your thoughts and experiences. Journaling helps process emotions.',
        icon: '📔'
    },
    {
        id: 'gamification',
        title: 'Level Up Your Life 🎮',
        description: 'Earn XP, unlock badges, and climb levels as you improve. Your progress matters!',
        icon: '🏆'
    },
    {
        id: 'ready',
        title: 'You\'re Ready! 🚀',
        description: 'Start your journey to a better you. Every small step counts!',
        icon: '🎉'
    }
];

// ============================================================================
// Onboarding State
// ============================================================================

let currentStep = 0;
let onboardingContainer = null;

// ============================================================================
// Check Onboarding Status
// ============================================================================

/**
 * Check if user has completed onboarding
 * @returns {boolean}
 */
function hasCompletedOnboarding() {
    return localStorage.getItem('lifeResetOnboardingComplete') === 'true';
}

/**
 * Mark onboarding as complete
 */
function completeOnboarding() {
    localStorage.setItem('lifeResetOnboardingComplete', 'true');
}

/**
 * Reset onboarding (for testing)
 */
function resetOnboarding() {
    localStorage.removeItem('lifeResetOnboardingComplete');
}

// ============================================================================
// Render Functions
// ============================================================================

/**
 * Start onboarding flow
 */
function startOnboarding() {
    if (hasCompletedOnboarding()) {
        console.log('[Onboarding] Already completed');
        return;
    }
    
    currentStep = 0;
    renderOnboardingOverlay();
}

/**
 * Render onboarding overlay
 */
function renderOnboardingOverlay() {
    // Remove existing if any
    const existing = document.getElementById('onboardingOverlay');
    if (existing) existing.remove();
    
    const isDark = document.body.classList.contains('dark-mode');
    
    onboardingContainer = document.createElement('div');
    onboardingContainer.id = 'onboardingOverlay';
    onboardingContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)'};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(onboardingContainer);
    renderCurrentStep();
}

/**
 * Render current step
 */
function renderCurrentStep() {
    const step = ONBOARDING_STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === ONBOARDING_STEPS.length - 1;
    const isDark = document.body.classList.contains('dark-mode');
    
    onboardingContainer.innerHTML = `
        <div class="onboarding-card" style="
            background: ${isDark ? '#2b2d42' : '#fff'};
            border-radius: 24px;
            padding: 48px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            animation: bounceIn 0.5s ease;
        ">
            <div class="onboarding-icon" style="font-size: 72px; margin-bottom: 24px;">
                ${step.icon}
            </div>
            
            <h2 style="
                font-size: 28px;
                margin-bottom: 16px;
                color: ${isDark ? '#fff' : '#1a1a2e'};
            ">${step.title}</h2>
            
            <p style="
                font-size: 16px;
                color: ${isDark ? '#a0a0a0' : '#666'};
                line-height: 1.6;
                margin-bottom: 32px;
            ">${step.description}</p>
            
            <div class="onboarding-progress" style="
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-bottom: 32px;
            ">
                ${ONBOARDING_STEPS.map((_, i) => `
                    <div style="
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: ${i === currentStep ? '#4361ee' : (isDark ? '#444' : '#ddd')};
                        transition: all 0.3s ease;
                    "></div>
                `).join('')}
            </div>
            
            <div class="onboarding-actions" style="
                display: flex;
                justify-content: center;
                gap: 16px;
            ">
                ${!isFirst ? `
                    <button id="onboardingBack" style="
                        padding: 12px 24px;
                        border-radius: 12px;
                        border: 2px solid ${isDark ? '#444' : '#ddd'};
                        background: transparent;
                        color: ${isDark ? '#fff' : '#333'};
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Back</button>
                ` : ''}
                
                <button id="onboardingNext" style="
                    padding: 12px 32px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #4361ee, #3a56d4);
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">${isLast ? 'Get Started!' : 'Next'}</button>
            </div>
            
            ${!isLast ? `
                <button id="onboardingSkip" style="
                    margin-top: 24px;
                    background: none;
                    border: none;
                    color: ${isDark ? '#666' : '#999'};
                    font-size: 14px;
                    cursor: pointer;
                ">Skip Introduction</button>
            ` : ''}
        </div>
    `;
    
    // Attach event listeners
    document.getElementById('onboardingNext')?.addEventListener('click', handleNext);
    document.getElementById('onboardingBack')?.addEventListener('click', handleBack);
    document.getElementById('onboardingSkip')?.addEventListener('click', handleSkip);
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle next button
 */
function handleNext() {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
        currentStep++;
        renderCurrentStep();
    } else {
        finishOnboarding();
    }
}

/**
 * Handle back button
 */
function handleBack() {
    if (currentStep > 0) {
        currentStep--;
        renderCurrentStep();
    }
}

/**
 * Handle skip button
 */
function handleSkip() {
    if (confirm('Skip the introduction?')) {
        finishOnboarding();
    }
}

/**
 * Finish onboarding
 */
function finishOnboarding() {
    completeOnboarding();
    
    // Fade out
    if (onboardingContainer) {
        onboardingContainer.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            onboardingContainer.remove();
            onboardingContainer = null;
        }, 300);
    }
    
    // Show welcome toast
    if (typeof showToast === 'function') {
        showToast('Welcome to Life Reset! 🎉', 'success');
    }
}

// ============================================================================
// CSS Animation Injection
// ============================================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes bounceIn {
        0% {
            transform: scale(0.5);
            opacity: 0;
        }
        60% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    #onboardingNext:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.4);
    }
    
    #onboardingBack:hover {
        background: rgba(67, 97, 238, 0.1);
    }
`;
document.head.appendChild(style);

// ============================================================================
// Auto-start on page load (for new users)
// ============================================================================

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for auth to initialize
        setTimeout(() => {
            if (!hasCompletedOnboarding()) {
                startOnboarding();
            }
        }, 500);
    });
}

// ============================================================================
// Exports
// ============================================================================

export const Onboarding = {
    startOnboarding,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding
};

if (typeof window !== 'undefined') {
    window.Onboarding = Onboarding;
    window.startOnboarding = startOnboarding;
    window.resetOnboarding = resetOnboarding;
}
