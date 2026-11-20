// Stanja tijeka zahtjeva: mirovanje, učitavanje, uspjeh, pogreška.
export const STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
})

// Zaslon koji ovisi o više zahtjeva prikazuje najgore od njihovih stanja.
export const combineStatuses = (...statuses) => {
  if (statuses.includes(STATUS.FAILED)) return STATUS.FAILED
  if (statuses.includes(STATUS.LOADING)) return STATUS.LOADING
  return statuses.every((status) => status === STATUS.SUCCEEDED) ? STATUS.SUCCEEDED : STATUS.IDLE
}
