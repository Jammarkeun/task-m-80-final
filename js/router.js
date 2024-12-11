class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.guards = [];
        this.transitions = new Map();
        this.history = [];
        this.initialize();
    }

    initialize() {
        this.setupRoutes();
        this.setupEventListeners();
        this.handleInitialRoute();
    }

    setupRoutes() {
        this.addRoute('/', 'DashboardController');
        this.addRoute('/tasks', 'TasksController');
        this.addRoute('/create-task', 'CreateTaskController');
        this.addRoute('/statistics', 'StatisticsController');
        this.addRoute('/profile', 'ProfileController');
        
        // Nested routes
        this.addRoute('/tasks/:id', 'TaskDetailController');
        this.addRoute('/tasks/:id/edit', 'TaskEditController');
    }

    addRoute(path, controller, guards = []) {
        this.routes.set(path, {
            controller,
            guards,
            params: this.extractRouteParams(path)
        });
    }

    addGuard(guard) {
        this.guards.push(guard);
    }

    addTransition(fromRoute, toRoute, transition) {
        const key = `${fromRoute}-${toRoute}`;
        this.transitions.set(key, transition);
    }

    async navigate(path, data = {}) {
        const route = this.matchRoute(path);
        if (!route) {
            this.handleNotFound();
            return;
        }

        if (!await this.checkGuards(route)) {
            return;
        }

        const transition = this.getTransition(this.currentRoute?.path, path);
        if (transition) {
            await transition.execute();
        }

        try {
            await this.loadController(route.controller);
            this.updateHistory(path, data);
            this.updateURL(path);
            this.currentRoute = route;
            
            eventBus.emit('routeChanged', { 
                from: this.currentRoute?.path, 
                to: path, 
                data 
            });
        } catch (error) {
            console.error('Navigation failed:', error);
            this.handleError(error);
        }
    }

    async checkGuards(route) {
        // Check global guards
        for (const guard of this.guards) {
            if (!await guard.canActivate(route)) {
                return false;
            }
        }

        // Check route-specific guards
        for (const guard of route.guards) {
            if (!await guard.canActivate(route)) {
                return false;
            }
        }

        return true;
    }

    matchRoute(path) {
        for (const [routePath, routeData] of this.routes) {
            const match = this.matchRoutePath(path, routePath);
            if (match) {
                return {
                    ...routeData,
                    path: routePath,
                    params: match.params
                };
            }
        }
        return null;
    }

    matchRoutePath(path, routePath) {
        const pathParts = path.split('/');
        const routeParts = routePath.split('/');

        if (pathParts.length !== routeParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return { params };
    }

    async loadController(controllerName) {
        const controller = await import(`./controllers/${controllerName}.js`);
        return new controller.default();
    }

    updateHistory(path, data) {
        this.history.push({ path, data });
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    updateURL(path) {
        window.history.pushState(null, '', path);
    }

    getTransition(fromPath, toPath) {
        const key = `${fromPath}-${toPath}`;
        return this.transitions.get(key);
    }

    handleNotFound() {
        eventBus.emit('routeNotFound');
        this.navigate('/404');
    }

    handleError(error) {
        eventBus.emit('routeError', error);
        this.navigate('/error');
    }

    setupEventListeners() {
        window.addEventListener('popstate', (event) => {
            this.navigate(window.location.pathname, event.state);
        });

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-router-link]');
            if (link) {
                event.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    handleInitialRoute() {
        const path = window.location.pathname;
        this.navigate(path);
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    getHistory() {
        return [...this.history];
    }
}

// Initialize router
const router = new Router();
export default router;
