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

/** Libellés simples pour les étudiants (pages publiques). */
export function voteStatusLabelPublic(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'En préparation',
    SCHEDULED: 'Bientôt ouvert',
    OPEN: 'En cours',
    CLOSED: 'Terminé',
    ARCHIVED: 'Terminé',
  }
  return map[status.toUpperCase()] ?? status
}
