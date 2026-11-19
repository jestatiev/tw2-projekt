import { http } from './http.js'

export const candidatesService = {
  list: () => http.get('/candidates'),
  create: (data) => http.post('/candidates', data),
  update: (id, data) => http.put(`/candidates/${id}`, data),
  remove: (id) => http.delete(`/candidates/${id}`),
}
