// assets/js/auth.js

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
    }

    // Check authentication state and redirect if needed
    checkAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = localStorage.getItem('currentUser');
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('auth/');

        // If user is not logged in and trying to access protected pages
        if (!isLoggedIn && !isAuthPage && !this.isPublicPage(currentPath)) {
            window.location.href = 'auth/login.html';
            return;
        }

        // If user is logged in and trying to access auth pages
        if (isLoggedIn && isAuthPage) {
            window.location.href = '../index.html';
            return;
        }

        // Update UI based on auth state
        this.updateUI();
    }

    // Check if page is publicly accessible
    isPublicPage(path) {
        const publicPages = ['/index.html', '/about.html', '/contact.html'];
        return publicPages.some(publicPage => path.endsWith(publicPage));
    }

    // Setup all event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Header navigation
        this.setupHeaderNavigation();
    }

    // Handle login form submission
    handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        this.clearErrors();
        
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        const user = this.authenticateUser(email, password);
        
        if (user) {
            this.loginSuccess(user);
        } else {
            this.showError('passwordError', 'Invalid email or password');
        }
    }

    // Handle signup form submission
    handleSignup(event) {
        event.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            terms: document.getElementById('terms').checked
        };
        
        this.clearErrors();
        
        if (!this.validateSignupForm(formData)) {
            return;
        }

        if (this.userExists(formData.email)) {
            this.showError('emailError', 'Email already registered');
            return;
        }

        const newUser = this.createUser(formData);
        this.registerUser(newUser);
        this.loginSuccess(newUser);
    }

    // Handle logout
    handleLogout(event) {
        if (event) event.preventDefault();
        
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'auth/login.html';
    }

    // Validate login form
    validateLoginForm(email, password) {
        let isValid = true;

        if (!email) {
            this.showError('emailError', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            this.showError('passwordError', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    // Validate signup form
    validateSignupForm(formData) {
        let isValid = true;

        if (!formData.firstName) {
            this.showError('firstNameError', 'First name is required');
            isValid = false;
        }

        if (!formData.lastName) {
            this.showError('lastNameError', 'Last name is required');
            isValid = false;
        }

        if (!formData.email) {
            this.showError('emailError', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(formData.email)) {
            this.showError('emailError', 'Please enter a valid email');
            isValid = false;
        }

        if (!formData.password) {
            this.showError('passwordError', 'Password is required');
            isValid = false;
        } else if (formData.password.length < 6) {
            this.showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!formData.confirmPassword) {
            this.showError('confirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            this.showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        if (!formData.terms) {
            this.showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    // Authenticate user
    authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.email === email && u.password === password);
    }

    // Check if user exists
    userExists(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.email === email);
    }

    // Create new user object
    createUser(formData) {
        return {
            id: Date.now().toString(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            createdAt: new Date().toISOString()
        };
    }

    // Register new user
    registerUser(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Handle successful login
    loginSuccess(user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        this.showSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }

    // Update UI based on authentication state
    updateUI() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const logoutBtn = document.getElementById('logout-btn');

        if (logoutBtn && isLoggedIn && currentUser) {
            // Update logout button to show user info
            logoutBtn.innerHTML = `
                <i class="bi bi-person-circle me-1"></i>
                ${currentUser.firstName} 
                <i class="bi bi-box-arrow-right ms-2"></i>
            `;
            
            // Update logout button behavior
            logoutBtn.href = '#';
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    // Setup header navigation
    setupHeaderNavigation() {
        // Prevent navigation to protected pages if not logged in
        const navLinks = document.querySelectorAll('a[href]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.isProtectedPage(link.getAttribute('href')) && !localStorage.getItem('isLoggedIn')) {
                    e.preventDefault();
                    window.location.href = 'auth/login.html';
                }
            });
        });
    }

    // Check if page is protected
    isProtectedPage(href) {
        const protectedPages = ['Market.html', 'Market-single.html', 'service-details.html', 'services.html', 'agent.html'];
        return protectedPages.some(page => href.includes(page));
    }

    // Utility methods
    showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});

// Also initialize when page is fully loaded
window.addEventListener('load', () => {
    // Additional initialization if needed
});