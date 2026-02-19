import api from './axios';

export const getPlans = async () => {
    const response = await api.get('/content/plans');
    return response.data;
};

export const getTrainers = async () => {
    const response = await api.get('/content/trainers');
    return response.data;
};

export const submitContact = async (data) => {
    const response = await api.post('/content/contact', data);
    return response.data;
};
