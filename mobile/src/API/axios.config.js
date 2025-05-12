import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    async function (config) {
        // Do something before request is sent
        const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2EyYmVlNmI3NjM0NjYwMjI0MGUxMjAiLCJ1c2VybmFtZSI6Im93bmVyMTIzIiwicm9sZSI6Im93bmVyIiwiaWF0IjoxNzQ3MDE2NjA1LCJleHAiOjE3NDcxMDMwMDV9.zJ1RtXr8_Svmqg0zsAv7bsy2SSwvDTKBihnL5JzfWaY";
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        console.log('Request error', error);
        return Promise.reject(error);
    },
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        if (response && response.data) return response.data;
        return response;
    },
    function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        if (error.response) {
            // Server responded with a status code out of 2xx range
            console.log('Response error data:', error.response.data);
            console.log('Response error status:', error.response.status);
            console.log('Response error headers:', error.response.headers);
        } else if (error.request) {
            // Request was made but no response was received
            console.log('Request error', error.request);
        } else {
            // Something happened in setting up the request
            console.log('Error', error.message);
        }

        return Promise.reject(error);
    },
);

export default instance;
