import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend runs on different port
});

// Add a request interceptor to include the token
API.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const { token } = JSON.parse(user);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;
