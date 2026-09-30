// import axios from 'axios';

// const api = axios.create({
// baseURL: import.meta.env.VITE_API_BASE || '/api',
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       localStorage.removeItem('role');
//       window.location.href = '/';
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
});

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    /*
     * IMPORTANT:
     * A 401 from a login endpoint means the credentials were invalid.
     *
     * Do NOT redirect the user.
     * LoginPage.jsx will catch the error and display the toast.
     */
    const isLoginRequest =
      requestUrl.includes('/auth/voter-login') ||
      requestUrl.includes('/auth/admin-login') ||
      requestUrl.includes('/auth/candidate-login');

    if (status === 401 && !isLoginRequest) {
      /*
       * This is a 401 from a protected endpoint.
       * The saved session/token is probably no longer valid.
       */
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;