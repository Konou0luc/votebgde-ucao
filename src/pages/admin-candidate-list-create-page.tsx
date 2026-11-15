import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FileText,
  Image as ImageIcon,
  ListOrdered,
  Plus,
  Save,
  Upload,
  Users,
  Video,
  X,
  Clapperboard,
  type LucideIcon,
} from 'lucide-react'
import {
  AdminButton,
  AdminButtonLink,
  ErrorState,
  Field,
  FormError,
  IconButton,
  LoadingState,
  PageHeader,
  Panel,
} from '../shared/ui/admin-ui'
import { adminInput, adminSelect, adminTextarea } from '../shared/ui/admin-ui-classes'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
import {
  useAdminScrutinsQuery,
  useCandidateListsQuery,
  useCreateCandidateListMutation,
  usePatchCandidateListMutation,
} from '../modules/admin-dashboard/hooks'
import { canWriteCandidateList } from '../modules/admin-dashboard/permissions'
import type { CandidateListMember } from '../modules/admin-dashboard/types'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'

function MediaPicker({
  label,
  icon: Icon,
  accept,
  file,
  currentUrl,
  kind,
  onPick,
  onClear,
}: {
  label: string
  icon: LucideIcon
  accept: string
  file: File | null
  currentUrl?: string | null
  kind: 'video' | 'image'
  onPick: (file: File) => void
  onClear: () => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-[15px] font-medium text-slate-700 dark:text-slate-300">{label}</p>
      {currentUrl && !file && (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
          {kind === 'video' ? (
            <video src={currentUrl} controls className="aspect-video w-full bg-black object-cover" />
          ) : (
            <img src={currentUrl} alt="Actuelle" className="aspect-video w-full object-cover" />
          )}
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium text-slate-900 dark:text-white">{file.name}</p>
            <p className="text-[13px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} Mo · prêt à envoyer</p>
          </div>
          <IconButton label="Retirer le fichier" icon={X} onClick={onClear} />
        </div>
      ) : (
        <label className="group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 px-3 py-3 transition-colors hover:border-brand-400 hover:bg-brand-500/[0.03] dark:border-white/15 dark:hover:border-brand-400/60">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-white/[0.06] dark:group-hover:bg-brand-500">
            <Upload className="size-4" strokeWidth={1.75} />
          </span>
          <span className="text-[15px]">
            <span className="block font-medium text-slate-900 dark:text-white">{currentUrl ? 'Remplacer le fichier' : 'Choisir un fichier'}</span>
            <span className="block text-[13px] text-slate-500">{kind === 'video' ? 'Vidéo (MP4, WebM…)' : 'Image (JPG, PNG, WebP…)'}</span>
          </span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onPick(f)
            }}
          />
        </label>
      )}
    </div>
  )
}

export function AdminCandidateListCreatePage() {
  const { id, listId } = useParams<{ id: string; listId?: string }>()
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const pushToast = useToastStore((s) => s.pushToast)

  const scrutinsQuery = useAdminScrutinsQuery()
  const election = scrutinsQuery.data?.find((s) => s.id === id)
  const listsQuery = useCandidateListsQuery(id)
  
  const createListMutation = useCreateCandidateListMutation(id ?? '')
  const updateListMutation = usePatchCandidateListMutation(id ?? '')

  const isEditMode = Boolean(listId)
  const editingList = listsQuery.data?.find((l) => l.id === listId)

  const [newListName, setNewListName] = useState('')
  const [newListOrder, setNewListOrder] = useState(1)
  const [newListSlogan, setNewListSlogan] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [newListMembers, setNewListMembers] = useState<CandidateListMember[]>([])
  const [newListActionPlan, setNewListActionPlan] = useState<string[]>([])
  const [newListVideo, setNewListVideo] = useState<File | null>(null)
  const [newListImage, setNewListImage] = useState<File | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const adminRoles = [
    'Président',
    'Vice-président',
    'Secrétaire',
    'Secrétaire Adjoint',
    'Trésorier',
    'Trésorier Adjoint',
    'Commissaire au compte',
  ]

  const [memberName, setMemberName] = useState('')
  const [memberRole, setMemberRole] = useState(adminRoles[0])
  const [planItem, setPlanItem] = useState('')

  useEffect(() => {
    if (isEditMode && editingList) {
      setNewListName(editingList.name)
      setNewListOrder(editingList.order)
      setNewListSlogan(editingList.slogan ?? '')
      setNewListDescription(editingList.description ?? '')
      setNewListMembers(editingList.members)
      setNewListActionPlan(editingList.actionPlan)
    } else if (!isEditMode && listsQuery.data && listsQuery.data.length > 0) {
      const maxOrder = Math.max(...listsQuery.data.map((l) => l.order))
      setNewListOrder(maxOrder + 1)
    }
  }, [isEditMode, editingList, listsQuery.data])

  const canListWrite = canWriteCandidateList(admin)

  async function onSaveList(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setListError(null)
    if (!newListName.trim() || newListName.trim().length < 2) {
      setListError('Nom de liste trop court.')
      return
    }

    try {
      const payload = {
        name: newListName.trim(),
        order: newListOrder,
        slogan: newListSlogan.trim() || undefined,
        description: newListDescription.trim() || undefined,
        members: newListMembers,
        actionPlan: newListActionPlan,
        video: newListVideo,
        image: newListImage,
      }

      if (isEditMode && listId) {
        await updateListMutation.mutateAsync({ id: listId, payload })
        pushToast('Liste candidate mise à jour.', 'success')
      } else {
        await createListMutation.mutateAsync({
          ...payload,
          scrutinId: id,
        })
        pushToast('Liste candidate créée avec succès.', 'success')
      }
      navigate(`${ADMIN_PRIVATE_PATH}/scrutins/${id}`)
    } catch (err) {
      setListError(getAdminErrorMessage(err, isEditMode ? 'Mise à jour impossible.' : 'Création de liste impossible.'))
    }
  }

  if (scrutinsQuery.isLoading || !id) {
    return <LoadingState />
  }

  if (scrutinsQuery.isError || !election) {
    return (
      <ErrorState
        action={
          <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins`} size="sm">
            Retour aux élections
          </AdminButtonLink>
        }
      >
        Élection introuvable.
      </ErrorState>
    )
  }

  if (!canListWrite) {
    return <ErrorState>Accès refusé : vous ne pouvez pas gérer les listes candidates.</ErrorState>
  }

  function addMember() {
    if (memberName.trim() && memberRole) {
      setNewListMembers((p) => [...p, { name: memberName.trim(), role: memberRole }])
      setMemberName('')
    }
  }

  function addPlanItem() {
    if (planItem.trim()) {
      setNewListActionPlan((p) => [...p, planItem.trim()])
      setPlanItem('')
    }
  }

  const saving = createListMutation.isPending || updateListMutation.isPending

  return (
    <div className="pb-12">
      <PageHeader
        back={{ to: `${ADMIN_PRIVATE_PATH}/scrutins/${id}`, label: election.title }}
        title={isEditMode ? 'Modifier la liste' : 'Nouvelle liste candidate'}
        description={
          <>
            Pour l&apos;élection <span className="font-medium text-slate-900 dark:text-white">{election.title}</span>
          </>
        }
      />

      <form onSubmit={onSaveList}>
        <div className="grid items-start gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Panel title="Informations" icon={FileText}>
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-[1fr_1fr_8rem]">
                  <Field label="Nom de la liste" htmlFor="cl-name" required>
                    <input
                      id="cl-name"
                      required
                      value={newListName}
                      onChange={(ev) => setNewListName(ev.target.value)}
                      placeholder="Ex : Excellence UCAO"
                      className={adminInput}
                    />
                  </Field>
                  <Field label="Slogan" htmlFor="cl-slogan">
                    <input
                      id="cl-slogan"
                      value={newListSlogan}
                      onChange={(ev) => setNewListSlogan(ev.target.value)}
                      placeholder="Ex : Bâtir ensemble"
                      className={adminInput}
                    />
                  </Field>
                  <Field label="N° d'ordre" htmlFor="cl-order">
                    <input
                      id="cl-order"
                      type="number"
                      min={1}
                      value={newListOrder}
                      onChange={(ev) => setNewListOrder(Number(ev.target.value) || 1)}
                      className={adminInput}
                    />
                  </Field>
                </div>
                <Field label="Description" htmlFor="cl-desc">
                  <textarea
                    id="cl-desc"
                    rows={4}
                    value={newListDescription}
                    onChange={(ev) => setNewListDescription(ev.target.value)}
                    placeholder="Détaillez les ambitions de cette liste…"
                    className={adminTextarea}
                  />
                </Field>
              </div>
            </Panel>

            <Panel
              title="Membres"
              icon={Users}
              delay={0.04}
              description={`${newListMembers.length} membre${newListMembers.length > 1 ? 's' : ''}`}
            >
              {newListMembers.length > 0 && (
                <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200/80 dark:divide-white/[0.06] dark:border-white/[0.08]">
                  {newListMembers.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-3 px-3 py-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                        {m.name
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((x) => x[0]?.toUpperCase())
                          .join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-[13px] text-slate-500">{m.role}</p>
                      </div>
                      <IconButton
                        label={`Retirer ${m.name}`}
                        icon={X}
                        tone="danger"
                        onClick={() => setNewListMembers((prev) => prev.filter((_, i) => i !== idx))}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="cl-member-name" className="sr-only">
                  Nom du membre
                </label>
                <input
                  id="cl-member-name"
                  placeholder="Nom du membre"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addMember()
                    }
                  }}
                  className={`${adminInput} flex-1`}
                />
                <label htmlFor="cl-member-role" className="sr-only">
                  Rôle
                </label>
                <select
                  id="cl-member-role"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className={`${adminSelect} sm:w-56`}
                >
                  {adminRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <AdminButton icon={Plus} onClick={addMember} disabled={!memberName.trim()} className="h-11">
                  Ajouter
                </AdminButton>
              </div>
            </Panel>

            <Panel
              title="Programme"
              icon={ListOrdered}
              delay={0.08}
              description={`${newListActionPlan.length} point${newListActionPlan.length > 1 ? 's' : ''}`}
            >
              {newListActionPlan.length > 0 && (
                <ol className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200/80 dark:divide-white/[0.06] dark:border-white/[0.08]">
                  {newListActionPlan.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 px-3 py-2.5">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[13px] tabular-nums text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <p className="flex-1 pt-0.5 text-[15px] text-slate-700 dark:text-slate-300">{item}</p>
                      <IconButton
                        label="Retirer ce point"
                        icon={X}
                        tone="danger"
                        onClick={() => setNewListActionPlan((prev) => prev.filter((_, i) => i !== idx))}
                      />
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex gap-2">
                <label htmlFor="cl-plan" className="sr-only">
                  Point du programme
                </label>
                <input
                  id="cl-plan"
                  placeholder="Ajouter un point au programme… (Entrée pour valider)"
                  value={planItem}
                  onChange={(e) => setPlanItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addPlanItem()
                    }
                  }}
                  className={`${adminInput} flex-1`}
                />
                <AdminButton icon={Plus} onClick={addPlanItem} disabled={!planItem.trim()} className="h-11">
                  Ajouter
                </AdminButton>
              </div>
            </Panel>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6">
            <Panel title="Médias" icon={Clapperboard} delay={0.06}>
              <div className="space-y-6">
                <MediaPicker
                  label="Vidéo de présentation"
                  icon={Video}
                  kind="video"
                  accept="video/*"
                  file={newListVideo}
                  currentUrl={isEditMode ? editingList?.videoUrl : null}
                  onPick={setNewListVideo}
                  onClear={() => setNewListVideo(null)}
                />
                <MediaPicker
                  label="Photo de la liste"
                  icon={ImageIcon}
                  kind="image"
                  accept="image/*"
                  file={newListImage}
                  currentUrl={isEditMode ? editingList?.imageUrl : null}
                  onPick={setNewListImage}
                  onClear={() => setNewListImage(null)}
                />
              </div>
            </Panel>

            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-white/[0.07] dark:bg-night-900/60">
              {listError && <FormError>{listError}</FormError>}
              <AdminButton type="submit" variant="primary" className="w-full" loading={saving} icon={isEditMode ? Save : Plus}>
                {isEditMode ? 'Enregistrer les modifications' : 'Créer la liste'}
              </AdminButton>
              <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}`} variant="ghost" className="w-full">
                Annuler
              </AdminButtonLink>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
