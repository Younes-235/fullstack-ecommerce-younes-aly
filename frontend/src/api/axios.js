import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/login');

        if (error.response && (error.response.status === 401 || error.response.status === 403) && !isLoginRequest) {
            localStorage.removeItem('token'); 
            window.location.href = '/login';  
        }

        return Promise.reject(error);
    }
);

export default api;