class PreferencesManager {
    constructor() {
        this.preferences = new Map();
        this.defaultPreferences = {
            theme: 'light',
            fontSize: 'medium',
            language: 'en',
            notifications: {
                email: true,
                push: true,
                sound: true
            },
            sidebar: {
                expanded: true,
                position: 'left'
            },
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        this.initialize();
    }

    async initialize() {
        await this.loadPreferences();
        this.setupEventListeners();
        this.applyPreferences();
        this.setupAutoSync();
    }

    async loadPreferences() {
        try {
            const savedPreferences = localStorage.getItem('userPreferences');
            const serverPreferences = await this.fetchServerPreferences();
            
            this.preferences = new Map(Object.entries({
                ...this.defaultPreferences,
                ...JSON.parse(savedPreferences || '{}'),
                ...serverPreferences
            }));
        } catch (error) {
            console.error('Error loading preferences:', error);
            this.preferences = new Map(Object.entries(this.defaultPreferences));
        }
    }

    async fetchServerPreferences() {
        if (!Auth.isAuthenticated()) return {};
        
        try {
            const response = await Api.request('/preferences');
            return response.preferences;
        } catch (error) {
            console.error('Error fetching server preferences:', error);
            return {};
        }
    }

    setupEventListeners() {
        document.querySelectorAll('[data-preference]').forEach(element => {
            element.addEventListener('change', (e) => {
                const preference = e.target.dataset.preference;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.set(preference, value);
            });
        });

        window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
            this.updateSystemTheme();
        });
    }

    applyPreferences() {
        this.preferences.forEach((value, key) => {
            this.applyPreference(key, value);
        });
    }

    applyPreference(key, value) {
        switch (key) {
            case 'theme':
                document.documentElement.setAttribute('data-theme', value);
                break;
            case 'fontSize':
                document.documentElement.style.setProperty('--base-font-size', this.getFontSize(value));
                break;
            case 'sidebar.expanded':
                document.body.classList.toggle('sidebar-expanded', value);
                break;
            case 'sidebar.position':
                document.body.setAttribute('data-sidebar-position', value);
                break;
            default:
                this.applyCustomPreference(key, value);
        }

        eventBus.emit('preferenceChanged', { key, value });
    }

    applyCustomPreference(key, value) {
        const element = document.querySelector(`[data-preference="${key}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    }

    getFontSize(size) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px'
        };
        return sizes[size] || sizes.medium;
    }

    get(key, defaultValue = null) {
        return this.preferences.has(key) ? this.preferences.get(key) : defaultValue;
    }

    async set(key, value) {
        this.preferences.set(key, value);
        this.applyPreference(key, value);
        await this.savePreferences();
    }

    async setMultiple(preferences) {
        Object.entries(preferences).forEach(([key, value]) => {
            this.preferences.set(key, value);
            this.applyPreference(key, value);
        });
        await this.savePreferences();
    }

    async savePreferences() {
        localStorage.setItem('userPreferences', 
            JSON.stringify(Object.fromEntries(this.preferences)));

        if (Auth.isAuthenticated()) {
            try {
                await Api.request('/preferences', {
                    method: 'PUT',
                    body: JSON.stringify(Object.fromEntries(this.preferences))
                });
            } catch (error) {
                console.error('Error saving preferences to server:', error);
            }
        }
    }

    reset(key) {
        if (key) {
            this.set(key, this.defaultPreferences[key]);
        } else {
            this.preferences = new Map(Object.entries(this.defaultPreferences));
            this.applyPreferences();
            this.savePreferences();
        }
    }

    updateSystemTheme() {
        if (this.get('theme') === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
    }

    setupAutoSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'userPreferences') {
                this.loadPreferences();
            }
        });

        setInterval(() => {
            if (Auth.isAuthenticated()) {
                this.fetchServerPreferences();
            }
        }, 5 * 60 * 1000); // Sync every 5 minutes
    }

    export() {
        return JSON.stringify(Object.fromEntries(this.preferences), null, 2);
    }

    async import(preferencesString) {
        try {
            const newPreferences = JSON.parse(preferencesString);
            await this.setMultiple(newPreferences);
            return true;
        } catch (error) {
            console.error('Error importing preferences:', error);
            return false;
        }
    }
}

// Initialize PreferencesManager
const preferences = new PreferencesManager();
export default preferences;
