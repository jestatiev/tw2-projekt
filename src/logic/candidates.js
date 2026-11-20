import { fullName } from './format.js'
import { paginate } from './pagination.js'
import { sortRows } from './sorting.js'

// Sve funkcije u ovoj datoteci su čiste: ne mijenjaju argumente i nemaju sporednih učinaka.

export const DEFAULT_CONTROLS = Object.freeze({
  term: '',
  categoryId: '',
  theory: 'all',
  sortKey: 'fullName',
  sortDir: 'asc',
  page: 1,
  perPage: 10,
})

export const findById = (items, id) => items.find((item) => String(item.id) === String(id))

const indexById = (items) => new Map(items.map((item) => [item.id, item]))

// Spaja kandidate s kategorijama i instruktorima. Izvedena polja se računaju, ne spremaju.
export const toRows = (candidates, categories, instructors) => {
  const categoryById = indexById(categories)
  const instructorById = indexById(instructors)
  return candidates.map((candidate) => {
    const category = categoryById.get(candidate.categoryId)
    const instructor = instructorById.get(candidate.instructorId)
    return {
      ...candidate,
      fullName: fullName(candidate),
      categoryCode: category?.code ?? '—',
      categoryName: category?.name ?? '—',
      instructorName: instructor ? fullName(instructor) : 'Nije dodijeljen',
    }
  })
}

// Pretraga ne razlikuje velika/mala slova ni dijakritike (čak = cak, đ = d).
export const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const SEARCH_FIELDS = ['fullName', 'candidateNumber', 'email', 'categoryName', 'instructorName']

export const searchRows = (rows, term) => {
  const words = normalize(term).split(/\s+/).filter(Boolean)
  if (words.length === 0) return rows
  return rows.filter((row) => {
    const haystack = normalize(SEARCH_FIELDS.map((field) => row[field]).join(' '))
    return words.every((word) => haystack.includes(word))
  })
}

export const filterRows = (rows, { categoryId, theory }) =>
  rows
    .filter((row) => categoryId === '' || String(row.categoryId) === String(categoryId))
    .filter((row) => theory === 'all' || (theory === 'passed' ? row.theoryPassed : !row.theoryPassed))

export const SORT_ACCESSORS = Object.freeze({
  candidateNumber: (row) => row.candidateNumber,
  fullName: (row) => `${row.lastName} ${row.firstName}`,
  categoryCode: (row) => row.categoryCode,
  instructorName: (row) => row.instructorName,
  enrolledAt: (row) => row.enrolledAt,
  theoryPassed: (row) => (row.theoryPassed ? 1 : 0),
})

// Grupiranje: broj kandidata po kategoriji, izračunano s reduce.
export const countByCategory = (rows) =>
  Object.entries(
    rows.reduce((counts, row) => ({ ...counts, [row.categoryCode]: (counts[row.categoryCode] ?? 0) + 1 }), {}),
  ).map(([code, count]) => ({ code, count }))

// Cijeli cjevovod: pretraga → filtri → sortiranje → straničenje.
export const processRows = (rows, controls) => {
  const searched = searchRows(rows, controls.term)
  const filtered = filterRows(searched, controls)
  const sorted = sortRows(filtered, SORT_ACCESSORS, controls.sortKey, controls.sortDir)
  return paginate(sorted, controls.page, controls.perPage)
}
