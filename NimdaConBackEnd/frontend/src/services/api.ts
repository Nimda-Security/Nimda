const API_BASE = ''; // 프록시 설정으로 인해 빈 문자열

export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  register: async (userData: { username: string; password: string; email: string }) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
};

export const usersAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/api/users/profile`);
    return response.json();
  },

  getUserById: async (id: string) => {
    const response = await fetch(`${API_BASE}/api/users/${id}`);
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_BASE}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return response.json();
  }
};
