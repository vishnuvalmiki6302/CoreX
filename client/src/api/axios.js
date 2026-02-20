import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error('CRITICAL ERROR: VITE_API_URL is not defined! API requests will fail.');
}

const api = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject({ ...error, message });
    }
);

export default api;
