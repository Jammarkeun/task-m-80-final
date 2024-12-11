// Form validation class
class FormValidator {
    static validateTask(taskData) {
        const errors = {};
        
        if (!taskData.title?.trim()) {
            errors.title = 'Title is required';
        }
        
        if (taskData.due_date && new Date(taskData.due_date) < new Date()) {
            errors.due_date = 'Due date cannot be in the past';
        }
        
        if (!['low', 'medium', 'high'].includes(taskData.priority)) {
            errors.priority = 'Invalid priority level';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateUser(userData) {
        const errors = {};
        
        if (!userData.fullname?.trim()) {
            errors.fullname = 'Full name is required';
        }
        
        if (!Utils.validateEmail(userData.email)) {
            errors.email = 'Invalid email format';
        }
        
        if (userData.password?.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}
