// Bazna adresa API-ja čita se iz varijable okoline (datoteka .env → VITE_API_URL).
const raw = import.meta.env.VITE_API_URL

if (!raw) {
  console.error('Nedostaje VITE_API_URL. Kopirajte .env.example u .env i ponovno pokrenite aplikaciju.')
}

export const API_URL = (raw ?? '').replace(/\/+$/, '')
