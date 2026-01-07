/**
 * @fileoverview Modal Component
 * @description Reusable modal dialog system
 * @version 2.0.0
 */

'use strict';

/**
 * Show a modal by ID
 * @param {string} modalId - ID of the modal element
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus first input if exists
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

/**
 * Hide a modal by ID
 * @param {string} modalId - ID of the modal element
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

/**
 * Create and show a confirmation dialog
 * @param {Object} options - Dialog options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.confirmText - Confirm button text (default 'Confirm')
 * @param {string} options.cancelText - Cancel button text (default 'Cancel')
 * @param {boolean} options.danger - Show as danger dialog (default false)
 * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
 */
function confirm(options) {
    return new Promise((resolve) => {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            danger = false
        } = options;
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'confirmModal_' + Date.now();
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        
        const isDark = document.body.classList.contains('dark-mode');
        const bgColor = isDark ? '#2b2d42' : '#fff';
        const textColor = isDark ? '#e0e0e0' : '#333';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: ${bgColor}; color: ${textColor}; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <h3 style="margin: 0 0 16px 0; font-size: 18px;">${title}</h3>
                <p style="margin: 0 0 24px 0; opacity: 0.8;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="cancelBtn" style="padding: 10px 20px; border-radius: 8px; cursor: pointer;">${cancelText}</button>
                    <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirmBtn" style="padding: 10px 20px; border-radius: 8px; cursor: pointer; background: ${danger ? '#e63946' : '#4361ee'}; color: white; border: none;">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus confirm button
        modal.querySelector('#confirmBtn').focus();
        
        // Handle button clicks
        modal.querySelector('#confirmBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });
        
        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
        
        // Handle backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(false);
            }
        });
        
        // Handle Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEscape);
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

/**
 * Create and show a prompt dialog
 * @param {Object} options - Dialog options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.placeholder - Input placeholder
 * @param {string} options.defaultValue - Default input value
 * @param {string} options.confirmText - Confirm button text (default 'OK')
 * @param {string} options.cancelText - Cancel button text (default 'Cancel')
 * @returns {Promise<string|null>} Resolves with input value or null if cancelled
 */
function prompt(options) {
    return new Promise((resolve) => {
        const {
            title = 'Input',
            message = '',
            placeholder = '',
            defaultValue = '',
            confirmText = 'OK',
            cancelText = 'Cancel'
        } = options;
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'promptModal_' + Date.now();
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        
        const isDark = document.body.classList.contains('dark-mode');
        const bgColor = isDark ? '#2b2d42' : '#fff';
        const textColor = isDark ? '#e0e0e0' : '#333';
        const inputBg = isDark ? '#1a1a2e' : '#f5f5f5';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: ${bgColor}; color: ${textColor}; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <h3 style="margin: 0 0 8px 0; font-size: 18px;">${title}</h3>
                ${message ? `<p style="margin: 0 0 16px 0; opacity: 0.8;">${message}</p>` : ''}
                <input type="text" id="promptInput" value="${defaultValue}" placeholder="${placeholder}" 
                    style="width: 100%; padding: 12px; border: 1px solid ${isDark ? '#3a3a4e' : '#ddd'}; border-radius: 8px; margin-bottom: 20px; font-size: 14px; background: ${inputBg}; color: ${textColor};">
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="cancelBtn" style="padding: 10px 20px; border-radius: 8px; cursor: pointer;">${cancelText}</button>
                    <button class="btn btn-primary" id="confirmBtn" style="padding: 10px 20px; border-radius: 8px; cursor: pointer; background: #4361ee; color: white; border: none;">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#promptInput');
        input.focus();
        input.select();
        
        const submit = () => {
            const value = input.value;
            document.body.removeChild(modal);
            resolve(value);
        };
        
        const cancel = () => {
            document.body.removeChild(modal);
            resolve(null);
        };
        
        modal.querySelector('#confirmBtn').addEventListener('click', submit);
        modal.querySelector('#cancelBtn').addEventListener('click', cancel);
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') cancel();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cancel();
        });
    });
}

// Export Modal object
const Modal = {
    show: showModal,
    hide: hideModal,
    confirm,
    prompt
};

// Register globally
if (typeof window !== 'undefined') {
    window.Modal = Modal;
    window.showModal = showModal;
    window.hideModal = hideModal;
}
