import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // API isteklerinin temel URL sini belirtir.
  withCredentials: true, // Çerezlerin (cookies) otomatik olarak gönderilmesini sağlar,
  withXSRFToken: true, // Tarayıcıda saklanan XSRF token'larının isteklerle gönderilmesini sağlar.
});

export default api;

