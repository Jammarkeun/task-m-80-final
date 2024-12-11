class Validator {
    constructor() {
        this.rules = new Map();
        this.customRules = new Map();
        this.initializeDefaultRules();
    }

    initializeDefaultRules() {
        this.addRule('required', (value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object') return Object.keys(value).length > 0;
            return value !== null && value !== undefined && value.toString().trim() !== '';
        }, 'This field is required');

        this.addRule('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !value || emailRegex.test(value);
        }, 'Please enter a valid email address');

        this.addRule('minLength', (value, params) => {
            return !value || value.length >= params[0];
        }, (params) => `Minimum length is ${params[0]} characters`);

        this.addRule('maxLength', (value, params) => {
            return !value || value.length <= params[0];
        }, (params) => `Maximum length is ${params[0]} characters`);

        this.addRule('numeric', (value) => {
            return !value || /^[0-9]+$/.test(value);
        }, 'Please enter numbers only');

        this.addRule('alpha', (value) => {
            return !value || /^[a-zA-Z]+$/.test(value);
        }, 'Please enter letters only');

        this.addRule('alphanumeric', (value) => {
            return !value || /^[a-zA-Z0-9]+$/.test(value);
        }, 'Please enter letters and numbers only');

        this.addRule('url', (value) => {
            try {
                if (!value) return true;
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }, 'Please enter a valid URL');

        this.addRule('date', (value) => {
            if (!value) return true;
            const date = new Date(value);
            return date instanceof Date && !isNaN(date);
        }, 'Please enter a valid date');

        this.addRule('min', (value, params) => {
            return !value || parseFloat(value) >= params[0];
        }, (params) => `Minimum value is ${params[0]}`);

        this.addRule('max', (value, params) => {
            return !value || parseFloat(value) <= params[0];
        }, (params) => `Maximum value is ${params[0]}`);
    }

    addRule(name, validator, message) {
        this.rules.set(name, {
            validator,
            message: typeof message === 'function' ? message : () => message
        });
    }

    addCustomRule(name, validator, message) {
        this.customRules.set(name, {
            validator,
            message: typeof message === 'function' ? message : () => message
        });
    }

    async validate(data, rules) {
        const errors = new Map();
        const validations = [];

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const fieldValidations = this.validateField(field, value, fieldRules);
            validations.push(fieldValidations);
        }

        const results = await Promise.all(validations);
        results.forEach(result => {
            if (result.errors.length > 0) {
                errors.set(result.field, result.errors);
            }
        });

        return {
            isValid: errors.size === 0,
            errors: Object.fromEntries(errors)
        };
    }

    async validateField(field, value, fieldRules) {
        const errors = [];
        const rulePromises = [];

        for (const ruleString of fieldRules) {
            const { ruleName, params } = this.parseRule(ruleString);
            const rule = this.rules.get(ruleName) || this.customRules.get(ruleName);

            if (!rule) {
                console.warn(`Validation rule '${ruleName}' not found`);
                continue;
            }

            const validation = Promise.resolve().then(async () => {
                const isValid = await rule.validator(value, params);
                if (!isValid) {
                    errors.push(rule.message(params));
                }
            });

            rulePromises.push(validation);
        }

        await Promise.all(rulePromises);
        return { field, errors };
    }

    parseRule(ruleString) {
        const [ruleName, ...params] = ruleString.split(':');
        return {
            ruleName,
            params: params.length ? params[0].split(',') : []
        };
    }

    validateForm(formElement, rules) {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        
        return this.validate(data, rules);
    }

    attachToForm(formElement, rules, options = {}) {
        const validateField = async (input) => {
            const field = input.name;
            const fieldRules = rules[field];
            
            if (!fieldRules) return;

            const result = await this.validate({ [field]: input.value }, { [field]: fieldRules });
            this.showFieldError(input, result.errors[field]);
        };

        const debouncedValidateField = Utils.debounce(validateField, options.debounce || 300);

        formElement.addEventListener('input', (e) => {
            if (options.validateOnInput) {
                debouncedValidateField(e.target);
            }
        });

        formElement.addEventListener('blur', (e) => {
            if (options.validateOnBlur) {
                validateField(e.target);
            }
        });

        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const result = await this.validateForm(formElement, rules);
            
            if (result.isValid) {
                options.onSuccess?.(formElement);
            } else {
                this.showFormErrors(formElement, result.errors);
                options.onError?.(result.errors);
            }
        });
    }

    showFieldError(input, errors) {
        const errorElement = input.nextElementSibling?.classList.contains('error-message')
            ? input.nextElementSibling
            : document.createElement('div');

        errorElement.className = 'error-message';
        
        if (errors?.length) {
            errorElement.textContent = errors[0];
            input.classList.add('is-invalid');
            if (!input.nextElementSibling?.classList.contains('error-message')) {
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
        } else {
            errorElement.remove();
            input.classList.remove('is-invalid');
        }
    }

    showFormErrors(formElement, errors) {
        Object.entries(errors).forEach(([field, fieldErrors]) => {
            const input = formElement.querySelector(`[name="${field}"]`);
            if (input) {
                this.showFieldError(input, fieldErrors);
            }
        });
    }
}

export default new Validator();
