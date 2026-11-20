export const PER_PAGE_OPTIONS = Object.freeze([10, 20, 50])

export const paginate = (items, page, perPage) => {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), pages)
  const offset = (current - 1) * perPage
  return {
    items: items.slice(offset, offset + perPage),
    page: current,
    pages,
    total,
    from: total === 0 ? 0 : offset + 1,
    to: Math.min(offset + perPage, total),
  }
}

// Brojevi stranica oko trenutne, npr. [3, 4, 5, 6, 7].
export const pageWindow = (page, pages, size = 5) => {
  const start = Math.max(1, Math.min(page - Math.floor(size / 2), pages - size + 1))
  const end = Math.min(pages, start + size - 1)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
