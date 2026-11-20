import { test } from 'node:test'
import assert from 'node:assert/strict'
import { endTime, formatDate, formatDuration, todayIso } from './format.js'
import { ERROR_KIND, kindFromStatus, userMessage } from './errors.js'

test('formatDate pretvara ISO datum u hrvatski zapis', () => {
  assert.equal(formatDate('2026-03-07'), '07.03.2026.')
  assert.equal(formatDate(null), '—')
})

test('todayIso daje lokalni datum', () => {
  assert.equal(todayIso(new Date(2026, 0, 5)), '2026-01-05')
})

test('endTime i formatDuration', () => {
  assert.equal(endTime('14:30', 90), '16:00')
  assert.equal(formatDuration(135), '2 h 15 min')
  assert.equal(formatDuration(45), '45 min')
})

test('kindFromStatus razlikuje 401, 5xx i ostalo', () => {
  assert.equal(kindFromStatus(401), ERROR_KIND.UNAUTHORIZED)
  assert.equal(kindFromStatus(503), ERROR_KIND.SERVER)
  assert.equal(kindFromStatus(400), ERROR_KIND.VALIDATION)
})

test('userMessage za 5xx i mrežu ne otkriva tehnički tekst', () => {
  assert.match(userMessage(ERROR_KIND.SERVER, 'SQLSTATE 42'), /pogreška|pogreške/)
  assert.doesNotMatch(userMessage(ERROR_KIND.SERVER, 'SQLSTATE 42'), /SQLSTATE/)
  assert.equal(userMessage(ERROR_KIND.CONFLICT, 'Kategorija ima kandidate.'), 'Kategorija ima kandidate.')
})
