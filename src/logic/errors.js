// Čiste funkcije za razvrstavanje pogrešaka: ne dodiruju mrežu ni DOM.

export const ERROR_KIND = Object.freeze({
  NETWORK: 'network',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation',
  CONFLICT: 'conflict',
  SERVER: 'server',
  UNKNOWN: 'unknown',
})

export const kindFromStatus = (status) => {
  if (status === 401) return ERROR_KIND.UNAUTHORIZED
  if (status === 403) return ERROR_KIND.FORBIDDEN
  if (status === 404) return ERROR_KIND.NOT_FOUND
  if (status === 400 || status === 422) return ERROR_KIND.VALIDATION
  if (status === 409) return ERROR_KIND.CONFLICT
  if (status >= 500) return ERROR_KIND.SERVER
  return ERROR_KIND.UNKNOWN
}

const FALLBACK_MESSAGES = Object.freeze({
  [ERROR_KIND.NETWORK]: 'Poslužitelj nije dostupan. Provjerite je li pokrenut i pokušajte ponovno.',
  [ERROR_KIND.UNAUTHORIZED]: 'Prijava je istekla. Prijavite se ponovno.',
  [ERROR_KIND.FORBIDDEN]: 'Nemate ovlasti za ovu radnju.',
  [ERROR_KIND.NOT_FOUND]: 'Traženi zapis ne postoji.',
  [ERROR_KIND.VALIDATION]: 'Podaci nisu ispravni.',
  [ERROR_KIND.CONFLICT]: 'Radnja nije moguća zbog povezanih zapisa.',
  [ERROR_KIND.SERVER]: 'Na poslužitelju je došlo do pogreške. Pokušajte ponovno kasnije.',
  [ERROR_KIND.UNKNOWN]: 'Došlo je do neočekivane pogreške.',
})

// Za mrežu i 5xx uvijek prikazujemo našu poruku (tehnički tekst ide samo u konzolu);
// inače je poruka poslužitelja dovoljno razumljiva i već je na hrvatskom.
export const userMessage = (kind, serverMessage) =>
  kind === ERROR_KIND.NETWORK || kind === ERROR_KIND.SERVER
    ? FALLBACK_MESSAGES[kind]
    : serverMessage || FALLBACK_MESSAGES[kind]
