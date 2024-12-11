class NotificationComponent {
    constructor() {
        this.notificationService = new NotificationService();
        this.unreadCount = 0;
        this.notifications = [];
        this.pageSize = 10;
        this.currentPage = 1;
        this.initializeNotifications();
        this.setupWebSocket();
    }

    async initializeNotifications() {
        try {
            const response = await Api.request('/notifications/list', {
                params: {
                    page: this.currentPage,
                    pageSize: this.pageSize
                }
            });

            this.notifications = response.notifications;
            this.unreadCount = response.unreadCount;
            this.renderNotifications(this.notifications);
            this.setupEventListeners();
            this.updateBadgeCount();
        } catch (error) {
            Utils.showNotification('Failed to load notifications', 'error');
        }
    }

    renderNotifications(notifications) {
        const container = document.getElementById('notificationList');
        if (!container) return;

        container.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4>${notification.title}</h4>
                        <small>${Utils.formatDate(notification.created_at, 'relative')}</small>
                    </div>
                    <p>${notification.message}</p>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `
                        <button class="btn btn-sm btn-outline-primary mark-read" title="Mark as Read">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger delete-notification" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('') || '<div class="no-notifications">No notifications</div>';

        this.setupInfiniteScroll(container);
    }

    setupEventListeners() {
        document.querySelectorAll('.mark-read').forEach(button => {
            button.addEventListener('click', async (e) => {
                const notificationId = e.target.closest('.notification-item').dataset.id;
                await this.markAsRead(notificationId);
            });
        });

        document.querySelectorAll('.delete-notification').forEach(button => {
            button.addEventListener('click', async (e) => {
                const notificationId = e.target.closest('.notification-item').dataset.id;
                await this.deleteNotification(notificationId);
            });
        });

        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-actions')) {
                    const notificationId = item.dataset.id;
                    this.handleNotificationClick(notificationId);
                }
            });
        });
    }

    async markAsRead(notificationId) {
        try {
            await Api.request(`/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                notification.read = true;
                this.unreadCount--;
                this.updateBadgeCount();
                this.renderNotifications(this.notifications);
            }
        } catch (error) {
            Utils.showNotification('Failed to mark notification as read', 'error');
        }
    }

    async deleteNotification(notificationId) {
        const confirmed = await Utils.showConfirmDialog(
            'Are you sure you want to delete this notification?'
        );

        if (!confirmed) return;

        try {
            await Api.request(`/notifications/${notificationId}`, {
                method: 'DELETE'
            });
            
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                if (!this.notifications[index].read) {
                    this.unreadCount--;
                }
                this.notifications.splice(index, 1);
                this.updateBadgeCount();
                this.renderNotifications(this.notifications);
            }
        } catch (error) {
            Utils.showNotification('Failed to delete notification', 'error');
        }
    }

    setupWebSocket() {
        eventBus.on('notification:received', (notification) => {
            this.notifications.unshift(notification);
            this.unreadCount++;
            this.updateBadgeCount();
            this.renderNotifications(this.notifications);
            this.showNotificationPopup(notification);
        });
    }

    showNotificationPopup(notification) {
        if (!document.hidden && preferences.get('notifications.popup')) {
            const popup = new NotificationPopup(notification);
            popup.show();
        }
    }

    updateBadgeCount() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.classList.toggle('hidden', this.unreadCount === 0);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle',
            message: 'fas fa-envelope',
            task: 'fas fa-tasks'
        };
        return icons[type] || icons.info;
    }

    setupInfiniteScroll(container) {
        const observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                this.currentPage++;
                const response = await Api.request('/notifications/list', {
                    params: {
                        page: this.currentPage,
                        pageSize: this.pageSize
                    }
                });
                
                if (response.notifications.length > 0) {
                    this.notifications.push(...response.notifications);
                    this.renderNotifications(this.notifications);
                } else {
                    observer.disconnect();
                }
            }
        });

        const sentinel = document.createElement('div');
        sentinel.className = 'scroll-sentinel';
        container.appendChild(sentinel);
        observer.observe(sentinel);
    }

    destroy() {
        eventBus.off('notification:received');
    }
}

// Initialize NotificationComponent
document.addEventListener('DOMContentLoaded', () => {
    new NotificationComponent();
});

