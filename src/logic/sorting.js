// Opće sortiranje: uvijek radi nad kopijom, ulazno polje ostaje netaknuto.

export const compareValues = (a, b) => {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'hr', { sensitivity: 'base' })
}

// accessors: { ključStupca: (redak) => vrijednostZaSortiranje }
export const sortRows = (rows, accessors, key, direction = 'asc') => {
  const accessor = accessors[key]
  if (!accessor) return rows
  const factor = direction === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => factor * compareValues(accessor(a), accessor(b)))
}

// Isti stupac mijenja smjer, novi stupac kreće uzlazno.
export const nextSortState = (current, key) => ({
  sortKey: key,
  sortDir: current.sortKey === key && current.sortDir === 'asc' ? 'desc' : 'asc',
})
