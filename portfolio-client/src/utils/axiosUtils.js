import axios from 'axios';

// // Add a request interceptor
// axios.interceptors.request.use(
//   function (config) {
//     const token = Cookies.get('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {

    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      window.location.href = '/login';

      return axios(originalRequest); // Retry the original request
    }
    return Promise.reject(error);
  }
);

export default axios;
