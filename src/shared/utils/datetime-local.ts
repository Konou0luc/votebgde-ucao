/** Convertit une valeur `<input type="datetime-local" />` en ISO 8601 pour l’API. */
export function toIsoFromDatetimeLocal(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error('Date invalide')
  }
  return d.toISOString()
}

/** Affiche une date ISO dans un champ datetime-local (heure locale). */
export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
