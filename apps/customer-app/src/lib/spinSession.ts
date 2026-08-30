import { OFFER_CATALOG, type OfferCode } from "@cafe/shared-types"

const TABLE_KEY = "chote-bade-table-id"

export type SpinRecord = {
  offerCode: OfferCode
  spunAt: number
  visitKey: string
}

function storageKey(visitKey: string): string {
  return `cbc-spin-visit:${visitKey}`
}

/** One spin per table visit (session). Walk-in guests share a single walk-in bucket. */
export function visitKeyFromTable(tableId: string | null | undefined): string {
  const id = tableId?.trim()
  return id ? `table:${id}` : "walkin"
}

export function currentVisitKey(): string {
  try {
    return visitKeyFromTable(sessionStorage.getItem(TABLE_KEY))
  } catch {
    return "walkin"
  }
}

export function loadSpinRecord(visitKey = currentVisitKey()): SpinRecord | null {
  try {
    const raw = sessionStorage.getItem(storageKey(visitKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SpinRecord
    if (!parsed?.offerCode || !(parsed.offerCode in OFFER_CATALOG)) return null
    return parsed
  } catch {
    return null
  }
}

export function hasSpunThisVisit(visitKey = currentVisitKey()): boolean {
  return loadSpinRecord(visitKey) != null
}

export function saveSpinResult(
  offerCode: OfferCode,
  visitKey = currentVisitKey(),
): SpinRecord {
  const record: SpinRecord = {
    offerCode,
    spunAt: Date.now(),
    visitKey,
  }
  sessionStorage.setItem(storageKey(visitKey), JSON.stringify(record))
  return record
}

export function clearSpinResult(visitKey = currentVisitKey()): void {
  sessionStorage.removeItem(storageKey(visitKey))
}
