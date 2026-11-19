import { http } from './http.js'

// Šifrarnici koji se samo čitaju: kategorije vozila i instruktori.
export const lookupsService = {
  categories: () => http.get('/categories'),
  instructors: () => http.get('/instructors'),
}
