// Čiste funkcije za prikaz datuma, vremena i imena.

const pad = (n) => String(n).padStart(2, '0')

export const formatDate = (iso) => {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year}.`
}

export const fullName = (person) => (person ? `${person.firstName} ${person.lastName}` : '')

// Današnji datum kao GGGG-MM-DD; "sada" se prima kao argument da se funkcija može ispitati.
export const todayIso = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

export const toMinutes = (hhmm) => {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

export const toHHMM = (totalMinutes) => `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`

export const endTime = (start, durationMinutes) => toHHMM(toMinutes(start) + durationMinutes)

export const formatDuration = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}
