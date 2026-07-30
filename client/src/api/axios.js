import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject({ ...error, message });
    }
);

export default api;
