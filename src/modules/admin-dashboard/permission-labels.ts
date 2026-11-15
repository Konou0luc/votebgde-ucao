export const ALL_PERMISSIONS = [
  { id: 'scrutin:read', label: 'Voir les élections' },
  { id: 'scrutin:write', label: 'Gérer les élections' },
  { id: 'candidate-list:read', label: 'Voir les listes' },
  { id: 'candidate-list:write', label: 'Gérer les listes' },
  { id: 'results:publish', label: 'Publier les résultats' },
  { id: 'dashboard:read', label: 'Voir le tableau de bord' },
  { id: 'audit:read', label: "Voir le journal d'audit" },
]

export function permissionLabel(id: string) {
  return ALL_PERMISSIONS.find((p) => p.id === id)?.label ?? id
}

export function roleLabel(role: string) {
  return role === 'SUPER_ADMIN' ? 'Super admin' : 'Administrateur'
}
