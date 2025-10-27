// Common authentication functions
class AuthManager {
    static registerUser(userData) {
      // Store user data in sessionStorage
      sessionStorage.setItem('registeredUser', JSON.stringify(userData));
      return true;
    }
  
    static getRegisteredUser() {
      const userData = sessionStorage.getItem('registeredUser');
      return userData ? JSON.parse(userData) : null;
    }
  
    static loginUser(usernameOrEmail, password) {
      const registeredUser = this.getRegisteredUser();
      
      if (!registeredUser) {
        return { success: false, message: 'No account found. Please sign up first.' };
      }
  
      const isUsernameMatch = usernameOrEmail === registeredUser.username;
      const isEmailMatch = usernameOrEmail === registeredUser.email;
      const isPasswordMatch = password === registeredUser.password;
  
      if ((isUsernameMatch || isEmailMatch) && isPasswordMatch) {
        // Store logged in user info
        sessionStorage.setItem('loggedInUser', JSON.stringify({
          username: registeredUser.username,
          email: registeredUser.email
        }));
        return { success: true };
      } else {
        return { success: false, message: 'Invalid username/email or password' };
      }
    }
  
    static isLoggedIn() {
      return sessionStorage.getItem('loggedInUser') !== null;
    }
  
    static getCurrentUser() {
      const userData = sessionStorage.getItem('loggedInUser');
      return userData ? JSON.parse(userData) : null;
    }
  
    static logout() {
      sessionStorage.removeItem('loggedInUser');
    }
  
    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    static validatePassword(password) {
      return password.length >= 6;
    }
  
    static validateUsername(username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return usernameRegex.test(username);
    }
  }
  
  // Form validation utilities
  class FormValidator {
    static showError(element, message) {
      element.textContent = message;
      element.classList.add('show');
    }
  
    static hideError(element) {
      element.classList.remove('show');
    }
  
    static validateFormFields(fields) {
      let isValid = true;
      
      for (const field of fields) {
        if (!field.value.trim()) {
          this.showError(field.errorElement, `${field.name} is required`);
          isValid = false;
        } else {
          this.hideError(field.errorElement);
        }
      }
      
      return isValid;
    }
  }