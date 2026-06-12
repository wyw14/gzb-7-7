import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    config.headers['X-User-Id'] = userId
  }
  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API错误:', error)
    return Promise.reject(error)
  }
)

export const userApi = {
  login: (data) => api.post('/users/login', data),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  listUsers: (params) => api.get('/users', { params })
}

export const instrumentApi = {
  list: (params) => api.get('/instruments', { params }),
  get: (id) => api.get(`/instruments/${id}`),
  create: (data) => api.post('/instruments', data),
  update: (id, data) => api.put(`/instruments/${id}`, data),
  remove: (id) => api.delete(`/instruments/${id}`)
}

export const borrowApi = {
  list: (params) => api.get('/borrows', { params }),
  get: (id) => api.get(`/borrows/${id}`),
  create: (data) => api.post('/borrows', data),
  update: (id, data) => api.put(`/borrows/${id}`, data)
}

export const invitationApi = {
  list: (params) => api.get('/invitations', { params }),
  listByUser: (userId) => api.get(`/invitations/user/${userId}`),
  create: (data) => api.post('/invitations', data),
  update: (id, data) => api.put(`/invitations/${id}`, data)
}

export const checkinApi = {
  list: (params) => api.get('/checkins', { params }),
  stats: (userId) => api.get(`/checkins/stats/${userId}`),
  create: (data) => api.post('/checkins', data)
}

export const reviewApi = {
  list: (params) => api.get('/reviews', { params }),
  check: (params) => api.get('/reviews/check', { params }),
  create: (data) => api.post('/reviews', data)
}

export const recommendApi = {
  buddies: (userId, params) => api.get(`/recommendations/buddies/${userId}`, { params }),
  instruments: (userId, params) => api.get(`/recommendations/instruments/${userId}`, { params }),
  pieces: (userId) => api.get(`/recommendations/pieces/${userId}`)
}

export default api
