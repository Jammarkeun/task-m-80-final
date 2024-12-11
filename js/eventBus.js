class EventBus {
    constructor() {
        this.events = new Map();
        this.middlewares = [];
        this.debugMode = false;
    }

    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        
        const handler = {
            callback,
            once: options.once || false,
            priority: options.priority || 0
        };
        
        this.events.get(eventName).add(handler);
        this.sortHandlers(eventName);

        return () => this.off(eventName, callback);
    }

    once(eventName, callback, options = {}) {
        return this.on(eventName, callback, { ...options, once: true });
    }

    off(eventName, callback) {
        if (eventName === '*') {
            this.events.clear();
            return;
        }

        if (!callback) {
            this.events.delete(eventName);
            return;
        }

        const handlers = this.events.get(eventName);
        if (handlers) {
            handlers.forEach(handler => {
                if (handler.callback === callback) {
                    handlers.delete(handler);
                }
            });
        }
    }

    async emit(eventName, data = {}) {
        const timestamp = Date.now();
        const eventData = {
            name: eventName,
            data,
            timestamp,
            source: this.getEventSource()
        };

        try {
            // Run through middlewares
            for (const middleware of this.middlewares) {
                eventData.data = await middleware(eventData);
            }

            // Log event if debug mode is enabled
            if (this.debugMode) {
                this.logEvent(eventData);
            }

            // Execute handlers
            const handlers = this.events.get(eventName);
            if (handlers) {
                const promises = [];
                handlers.forEach(handler => {
                    promises.push(this.executeHandler(handler, eventData));
                    if (handler.once) {
                        handlers.delete(handler);
                    }
                });
                await Promise.all(promises);
            }

            // Execute wildcard handlers
            const wildcardHandlers = this.events.get('*');
            if (wildcardHandlers) {
                const promises = [];
                wildcardHandlers.forEach(handler => {
                    promises.push(this.executeHandler(handler, eventData));
                });
                await Promise.all(promises);
            }

        } catch (error) {
            console.error(`Error in event ${eventName}:`, error);
            throw error;
        }
    }

    async executeHandler(handler, eventData) {
        try {
            await handler.callback(eventData.data, eventData);
        } catch (error) {
            console.error(`Error in event handler:`, error);
            throw error;
        }
    }

    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }

    removeMiddleware(middleware) {
        const index = this.middlewares.indexOf(middleware);
        if (index > -1) {
            this.middlewares.splice(index, 1);
        }
    }

    sortHandlers(eventName) {
        const handlers = this.events.get(eventName);
        if (handlers) {
            const sorted = new Set([...handlers].sort((a, b) => b.priority - a.priority));
            this.events.set(eventName, sorted);
        }
    }

    getEventSource() {
        try {
            throw new Error();
        } catch (error) {
            return error.stack
                .split('\n')[3]
                .trim()
                .replace(/^at\s+/g, '');
        }
    }

    logEvent(eventData) {
        const formattedTime = new Date(eventData.timestamp).toISOString();
        console.group(`Event: ${eventData.name}`);
        console.log(`Time: ${formattedTime}`);
        console.log(`Source: ${eventData.source}`);
        console.log('Data:', eventData.data);
        console.groupEnd();
    }

    enableDebug() {
        this.debugMode = true;
    }

    disableDebug() {
        this.debugMode = false;
    }

    getHandlerCount(eventName) {
        const handlers = this.events.get(eventName);
        return handlers ? handlers.size : 0;
    }

    getAllEvents() {
        return Array.from(this.events.keys());
    }
}

const eventBus = new EventBus();
export default eventBus;
