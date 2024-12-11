class Api {
    static baseURL = '/api/v1';
    static token = null;

    static async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            },
            credentials: 'include'
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type');
            const isJson = contentType?.includes('application/json');
            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                throw this.handleError(response.status, data);
            }

            return data;
        } catch (error) {
            this.handleNetworkError(error);
            throw error;
        }
    }

    static async upload(endpoint, files, options = {}) {
        const formData = new FormData();
        
        if (Array.isArray(files)) {
            files.forEach(file => formData.append('files[]', file));
        } else {
            formData.append('file', files);
        }

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {},
            ...options
        });
    }

    static async download(endpoint, filename) {
        const response = await fetch(this.baseURL + endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw this.handleError(response.status);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    static setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    static getToken() {
        if (!this.token) {
            this.token = localStorage.getItem('authToken');
        }
        return this.token;
    }

    static clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    static handleError(status, data) {
        const error = new Error();
        error.status = status;

        switch (status) {
            case 400:
                error.message = data?.message || 'Bad Request';
                break;
            case 401:
                this.clearToken();
                error.message = 'Unauthorized';
                window.location.href = '/login';
                break;
            case 403:
                error.message = 'Forbidden';
                break;
            case 404:
                error.message = 'Not Found';
                break;
            case 422:
                error.message = 'Validation Error';
                error.errors = data?.errors;
                break;
            case 429:
                error.message = 'Too Many Requests';
                break;
            case 500:
                error.message = 'Internal Server Error';
                break;
            default:
                error.message = 'Something went wrong';
        }

        return error;
    }

    static handleNetworkError(error) {
        if (!navigator.onLine) {
            Utils.showNotification('No internet connection', 'error');
        } else {
            console.error('Network Error:', error);
        }
    }

    static buildQueryString(params) {
        return Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }
}

export default Api;
