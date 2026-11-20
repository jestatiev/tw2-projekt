import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_CONTROLS,
  countByCategory,
  filterRows,
  findById,
  normalize,
  processRows,
  searchRows,
  toRows,
} from './candidates.js'
import { sortRows, nextSortState } from './sorting.js'
import { paginate, pageWindow } from './pagination.js'
import { combineStatuses, STATUS } from './status.js'

const categories = [
  { id: 1, code: 'A', name: 'Motocikl' },
  { id: 2, code: 'B', name: 'Osobni automobil' },
]
const instructors = [{ id: 7, firstName: 'Petra', lastName: 'Babić' }]
const candidates = [
  { id: 1, firstName: 'Čedomir', lastName: 'Žugaj', candidateNumber: 'AK-2026-001', categoryId: 2, instructorId: 7, theoryPassed: true, enrolledAt: '2026-01-10' },
  { id: 2, firstName: 'Ana', lastName: 'Horvat', candidateNumber: 'AK-2026-002', categoryId: 1, instructorId: null, theoryPassed: false, enrolledAt: '2026-02-01' },
  { id: 3, firstName: 'Bruno', lastName: 'Đurić', candidateNumber: 'AK-2026-003', categoryId: 2, instructorId: 7, theoryPassed: false, enrolledAt: '2026-01-20' },
]
const rows = toRows(candidates, categories, instructors)

test('toRows spaja kategoriju i instruktora bez mijenjanja ulaza', () => {
  assert.equal(rows[0].categoryCode, 'B')
  assert.equal(rows[0].instructorName, 'Petra Babić')
  assert.equal(rows[1].instructorName, 'Nije dodijeljen')
  assert.equal('fullName' in candidates[0], false)
})

test('normalize uklanja dijakritike i velika slova', () => {
  assert.equal(normalize('Čedomir Đurić'), 'cedomir duric')
})

test('searchRows pronalazi bez obzira na dijakritike i redoslijed riječi', () => {
  assert.deepEqual(searchRows(rows, 'zugaj cedomir').map((r) => r.id), [1])
  assert.equal(searchRows(rows, '').length, 3)
  assert.equal(searchRows(rows, 'nema takvog').length, 0)
})

test('filterRows filtrira po kategoriji i teoriji', () => {
  assert.deepEqual(filterRows(rows, { categoryId: '2', theory: 'all' }).map((r) => r.id), [1, 3])
  assert.deepEqual(filterRows(rows, { categoryId: '2', theory: 'passed' }).map((r) => r.id), [1])
  assert.deepEqual(filterRows(rows, { categoryId: '', theory: 'pending' }).map((r) => r.id), [2, 3])
})

test('sortRows ne mijenja ulazno polje i podržava oba smjera', () => {
  const frozen = Object.freeze([...rows])
  const accessors = { enrolledAt: (r) => r.enrolledAt }
  assert.deepEqual(sortRows(frozen, accessors, 'enrolledAt', 'asc').map((r) => r.id), [1, 3, 2])
  assert.deepEqual(sortRows(frozen, accessors, 'enrolledAt', 'desc').map((r) => r.id), [2, 3, 1])
  assert.deepEqual(frozen.map((r) => r.id), [1, 2, 3])
})

test('nextSortState mijenja smjer samo za isti stupac', () => {
  assert.deepEqual(nextSortState({ sortKey: 'a', sortDir: 'asc' }, 'a'), { sortKey: 'a', sortDir: 'desc' })
  assert.deepEqual(nextSortState({ sortKey: 'a', sortDir: 'desc' }, 'b'), { sortKey: 'b', sortDir: 'asc' })
})

test('paginate vraća ispravan odsječak i ograničava stranicu', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)
  const second = paginate(items, 2, 10)
  assert.deepEqual(second.items, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  assert.equal(second.pages, 3)
  assert.equal(paginate(items, 99, 10).page, 3)
  assert.equal(paginate([], 1, 10).from, 0)
})

test('pageWindow drži prozor unutar granica', () => {
  assert.deepEqual(pageWindow(1, 10), [1, 2, 3, 4, 5])
  assert.deepEqual(pageWindow(10, 10), [6, 7, 8, 9, 10])
  assert.deepEqual(pageWindow(1, 2), [1, 2])
})

test('countByCategory grupira kandidate', () => {
  assert.deepEqual(countByCategory(rows), [{ code: 'B', count: 2 }, { code: 'A', count: 1 }])
})

test('processRows povezuje pretragu, filtar, sortiranje i straničenje', () => {
  const result = processRows(rows, { ...DEFAULT_CONTROLS, categoryId: '2', sortKey: 'fullName', sortDir: 'asc' })
  assert.deepEqual(result.items.map((r) => r.id), [3, 1])
  assert.equal(result.total, 2)
})

test('findById uspoređuje kao tekst (parametar rute je tekst)', () => {
  assert.equal(findById(rows, '2').firstName, 'Ana')
  assert.equal(findById(rows, '99'), undefined)
})

test('combineStatuses prikazuje najgore stanje', () => {
  assert.equal(combineStatuses(STATUS.SUCCEEDED, STATUS.FAILED), STATUS.FAILED)
  assert.equal(combineStatuses(STATUS.SUCCEEDED, STATUS.LOADING), STATUS.LOADING)
  assert.equal(combineStatuses(STATUS.SUCCEEDED, STATUS.SUCCEEDED), STATUS.SUCCEEDED)
  assert.equal(combineStatuses(STATUS.SUCCEEDED, STATUS.IDLE), STATUS.IDLE)
})
