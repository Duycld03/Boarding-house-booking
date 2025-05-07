import axios from 'axios';

const api = axios.create({
    baseURL: 'http://2402:800:63b5:f2e6:49df:2153:cad3:ca9d/',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export default api;
