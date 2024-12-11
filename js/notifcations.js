// notifications.js
class NotificationHandler {
    constructor() {
        this.checkPermission();
    }

    checkPermission() {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            console.log("Notification permission granted");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    console.log("Notification permission granted");
                }
            });
        }
    }

    sendNotification(title, options = {}) {
        if (Notification.permission === "granted") {
            const notification = new Notification(title, options);
            notification.onclick = function() {
                window.focus();
                this.close();
            };
            this.vibrate(); // Call vibrate on notification
        }
    }

    vibrate() {
        if ("vibrate" in navigator) {
            navigator.vibrate(200); // Vibrate for 200 milliseconds
        }
    }

    scheduleNotification(title, options = {}, delay) {
        setTimeout(() => {
            this.sendNotification(title, options);
        }, delay);
    }
}
