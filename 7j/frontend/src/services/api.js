import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Flask backend URL
});

export const sendMessage = (message) => API.post('/chat', { message });
