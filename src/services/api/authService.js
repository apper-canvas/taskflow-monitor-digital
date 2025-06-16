import users from '../mockData/users.json';

let currentUser = JSON.parse(localStorage.getItem('taskflow_user')) || null;
let authToken = localStorage.getItem('taskflow_token') || null;

const authService = {
  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const token = `token_${user.id}_${Date.now()}`;
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          
          currentUser = userWithoutPassword;
          authToken = token;
          
          localStorage.setItem('taskflow_user', JSON.stringify(currentUser));
          localStorage.setItem('taskflow_token', token);
          
          resolve({ user: currentUser, token });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  },

  async signup(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
          reject(new Error('User with this email already exists'));
          return;
        }

        const newUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3b82f6&color=fff`,
          createdAt: new Date().toISOString(),
          role: 'user'
        };

        // Add to mock database
        users.push(newUser);

        const token = `token_${newUser.id}_${Date.now()}`;
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        
        currentUser = userWithoutPassword;
        authToken = token;
        
        localStorage.setItem('taskflow_user', JSON.stringify(currentUser));
        localStorage.setItem('taskflow_token', token);
        
        resolve({ user: currentUser, token });
      }, 1000);
    });
  },

  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentUser = null;
        authToken = null;
        localStorage.removeItem('taskflow_user');
        localStorage.removeItem('taskflow_token');
        resolve();
      }, 200);
    });
  },

  getCurrentUser() {
    return currentUser;
  },

  getToken() {
    return authToken;
  },

  isAuthenticated() {
    return !!currentUser && !!authToken;
  }
};

export default authService;