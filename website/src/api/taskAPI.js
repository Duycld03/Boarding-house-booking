import axios from './axios.config';
export const getOwnerTasks = (params = {}) => {
    return axios.get('/owner/tasks', { params });
};
export const getStaffTasks = (params = {}) => {
    return axios.get('/staff/tasks', { params });
};
export const createOwnerTask = (taskData) => {
    return axios.post('/owner/tasks', taskData);
};
export const updateOwnerTask = (taskId, taskData) => {
    return axios.put(`/owner/tasks/${taskId}`, taskData);
};
export const updateStaffTaskStatus = (taskId, status) => {
    return axios.put(`/staff/tasks/${taskId}`, { status });
};
export const deleteOwnerTask = (taskId) => {
    return axios.delete(`/owner/tasks/${taskId}`);
};
export const getTaskDetails = (taskId) => {
    return axios.get(`/tasks/${taskId}`);
};