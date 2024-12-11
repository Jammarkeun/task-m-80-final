class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <div class="notification-progress"></div>
        `;

        document.getElementById('notificationContainer').appendChild(notification);

        const progress = notification.querySelector('.notification-progress');
        progress.style.transition = `width ${duration}ms linear`;
        
        requestAnimationFrame(() => {
            progress.style.width = '0%';
        });

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    static async showConfirmDialog(message, options = {}) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
            dialog.innerHTML = `
                <div class="confirm-dialog-content">
                    <p>${message}</p>
                    <div class="confirm-dialog-actions">
                        <button class="btn-cancel">${options.cancelText || 'Cancel'}</button>
                        <button class="btn-confirm">${options.confirmText || 'Confirm'}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            const handleConfirm = () => {
                dialog.remove();
                resolve(true);
            };

            const handleCancel = () => {
                dialog.remove();
                resolve(false);
            };

            dialog.querySelector('.btn-confirm').addEventListener('click', handleConfirm);
            dialog.querySelector('.btn-cancel').addEventListener('click', handleCancel);
        });
    }

    static formatDate(date, format = 'default') {
        const d = new Date(date);
        const formats = {
            default: { dateStyle: 'medium' },
            short: { dateStyle: 'short' },
            long: { dateStyle: 'long' },
            time: { timeStyle: 'short' },
            full: { dateStyle: 'full', timeStyle: 'short' }
        };

        return new Intl.DateTimeFormat(
            navigator.language, 
            formats[format] || formats.default
        ).format(d);
    }

    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*]/.test(password)
        };

        return {
            isValid: Object.values(requirements).every(Boolean),
            requirements
        };
    }

    static sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    static getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text)
            .then(() => this.showNotification('Copied to clipboard', 'success'))
            .catch(() => this.showNotification('Failed to copy', 'error'));
    }

    static generateUUID() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }
}

export default Utils;
