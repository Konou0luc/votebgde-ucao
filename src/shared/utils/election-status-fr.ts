/** Libellés français pour les statuts renvoyés par l’API (schéma backend inchangé). */
export function electionStatusLabelFr(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Brouillon',
    SCHEDULED: 'Planifié',
    OPEN: 'Ouvert',
    CLOSED: 'Clôturé',
    ARCHIVED: 'Archivé',
  }
  return map[status.toUpperCase()] ?? status
}
