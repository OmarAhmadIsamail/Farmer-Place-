// ================================
// AUTH.JS (FRONTEND-ONLY VERSION)
// ================================

// --- Helper functions ---
function saveUser(email, password) {
    localStorage.setItem('user', JSON.stringify({ email, password }));
  }
  
  function getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
  
  function saveSession(email) {
    localStorage.setItem('loggedInUser', email);
  }
  
  function getSession() {
    return localStorage.getItem('loggedInUser');
  }
  
  function clearSession() {
    localStorage.removeItem('loggedInUser');
  }
  
  // ========================
  // SIGNUP HANDLER
  // ========================
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();
  
      if (!email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
  
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
  
      const existingUser = getUser();
      if (existingUser && existingUser.email === email) {
        alert('User already exists. Please log in.');
        window.location.href = 'login.html';
        return;
      }
  
      saveUser(email, password);
      alert('Account created successfully! Please log in.');
      window.location.href = 'login.html'; // Redirect to login page after signup
    });
  }
  
  // ========================
  // LOGIN HANDLER
  // ========================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
  
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
  
      const savedUser = getUser();
  
      if (savedUser && savedUser.email === email && savedUser.password === password) {
        saveSession(email);
        alert('Login successful!');
        window.location.href = '../index.html';
      } else {
        alert('Incorrect email or password');
      }
    });
  }
  
  // ========================
  // LOGOUT HANDLER
  // ========================
  document.addEventListener('click', (e) => {
    if (e.target.matches('#logoutBtn')) {
      e.preventDefault();
      clearSession();
      alert('You have logged out');
      window.location.href = '../auth/login.html';
    }
  });
  
  // ========================
  // PAGE PROTECTION
  // ========================
  (function () {
    const protectedPages = ['checkout.html', 'cart.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const session = getSession();
  
    // Redirect if not logged in
    if (protectedPages.includes(currentPage) && !session) {
      window.location.href = '../auth/login.html';
    }
  
    // Redirect if already logged in and trying to go to login or signup
    if ((currentPage === 'login.html' || currentPage === 'signup.html') && session) {
      window.location.href = '../index.html';
    }
  })();
  