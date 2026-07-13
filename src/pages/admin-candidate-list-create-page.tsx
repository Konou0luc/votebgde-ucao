import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Users,
  Video,
  Image as ImageIcon,
  X,
  FileVideo,
  FileImage,
  Megaphone,
  Save,
} from 'lucide-react'
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
    return (
      <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Chargement...</p>
      </div>
    )
  }

  if (scrutinsQuery.isError || !election) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-8 text-sm text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100">
        <p>Élection introuvable.</p>
        <Link to={`${ADMIN_PRIVATE_PATH}/scrutins`} className="mt-4 inline-block font-medium text-blue-600 dark:text-blue-400">
          Retour aux élections
        </Link>
      </div>
    )
  }

  if (!canListWrite) {
    return <div className="p-8 text-center text-rose-600">Accès refusé.</div>
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <header className="mb-8 flex flex-col gap-4">
        <Link
          to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}`}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-3" strokeWidth={2} />
          Retour à l&apos;élection
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">
            {isEditMode ? 'Modifier la Liste' : 'Nouvelle Liste Candidate'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pour l&apos;élection : <span className="font-semibold text-blue-600 dark:text-blue-400">{election.title}</span>
          </p>
        </div>
      </header>

      <form
        onSubmit={onSaveList}
        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-slate-900 md:p-10"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2.5">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Nom</label>
              <input
                required
                value={newListName}
                onChange={(ev) => setNewListName(ev.target.value)}
                placeholder="Ex: Excellence UCAO"
                className="h-11 md:h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm md:text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Slogan</label>
              <input
                value={newListSlogan}
                onChange={(ev) => setNewListSlogan(ev.target.value)}
                placeholder="Ex: Bâtir ensemble"
                className="h-11 md:h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm md:text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Ordre d&apos;affichage</label>
              <input
                type="number"
                min={1}
                value={newListOrder}
                onChange={(ev) => setNewListOrder(Number(ev.target.value) || 1)}
                className="h-11 md:h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm md:text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
            <textarea
              rows={3}
              value={newListDescription}
              onChange={(ev) => setNewListDescription(ev.target.value)}
              placeholder="Détaillez les ambitions de cette liste..."
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm md:text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 md:size-5 text-blue-600" />
                <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Membres</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {newListMembers.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] md:text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-white/[0.05] dark:text-slate-200 dark:ring-white/[0.1]"
                  >
                    {m.name} ({m.role})
                    <button
                      type="button"
                      onClick={() => setNewListMembers((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="size-3 md:size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-3 rounded-2xl bg-slate-50/50 p-4 md:p-5 dark:bg-white/5">
                <input
                  placeholder="Nom du membre"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="h-11 md:h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm md:text-base font-medium outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
                />
                <div className="flex gap-2">
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="h-11 md:h-12 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm md:text-base font-medium outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
                  >
                    {adminRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (memberName && memberRole) {
                        setNewListMembers((p) => [...p, { name: memberName, role: memberRole }])
                        setMemberName('')
                      }
                    }}
                    className="flex size-11 md:size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
                  >
                    <Plus className="size-5 md:size-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 md:size-5 text-amber-500" />
                <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Plan d&apos;action</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {newListActionPlan.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] md:text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-white/[0.05] dark:text-slate-200 dark:ring-white/[0.1]"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => setNewListActionPlan((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="size-3 md:size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 rounded-2xl bg-slate-50/50 p-4 md:p-5 dark:bg-white/5">
                <input
                  placeholder="Ajouter un point au programme..."
                  value={planItem}
                  onChange={(e) => setPlanItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (planItem.trim()) {
                        setNewListActionPlan((p) => [...p, planItem.trim()])
                        setPlanItem('')
                      }
                    }
                  }}
                  className="h-11 md:h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm md:text-base font-medium outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (planItem.trim()) {
                      setNewListActionPlan((p) => [...p, planItem.trim()])
                      setPlanItem('')
                    }
                  }}
                  className="flex size-11 md:size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
                >
                  <Plus className="size-5 md:size-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2"> 
            {/* Section Vidéo */} 
            <div className="space-y-4"> 
              <div className="flex items-center gap-2"> 
                <Video className="size-4 md:size-5 text-rose-500" /> 
                <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Vidéo de présentation</h4> 
              </div> 
              
              {/* Prévisualisation de la vidéo existante */} 
              {isEditMode && editingList?.videoUrl && !newListVideo && ( 
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"> 
                  <video src={editingList.videoUrl} controls className="aspect-video w-full object-cover" /> 
                  <div className="p-2 text-center bg-slate-100 dark:bg-white/5"> 
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Vidéo actuelle</p> 
                  </div> 
                </div> 
              )} 
          
              {newListVideo ? ( 
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-3 md:p-4 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30"> 
                  <div className="flex items-center gap-3"> 
                    <div className="rounded-lg bg-white p-2 md:p-2.5 shadow-sm dark:bg-white/5"> 
                      <FileVideo className="size-5 md:size-6 text-emerald-600" /> 
                    </div> 
                    <div className="min-w-0"> 
                      <p className="truncate text-xs md:text-sm font-bold text-emerald-900 dark:text-emerald-200">{newListVideo.name}</p> 
                      <p className="text-[10px] md:text-xs text-emerald-600">{(newListVideo.size / (1024 * 1024)).toFixed(2)} MB</p> 
                    </div> 
                  </div> 
                  <button type="button" onClick={() => setNewListVideo(null)} className="rounded-lg p-2 md:p-2.5 text-emerald-600 transition hover:bg-rose-50 hover:text-rose-600"> 
                    <X className="size-4 md:size-5" /> 
                  </button> 
                </div> 
              ) : ( 
                <label className="group flex h-28 md:h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-white/10 dark:bg-white/5"> 
                  <div className="mb-2 md:mb-3 flex size-10 md:size-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white dark:bg-white/5"> 
                    <Video className="size-5 md:size-6" /> 
                  </div> 
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-blue-600"> 
                    {isEditMode && editingList?.videoUrl ? 'Remplacer la vidéo' : 'Choisir une vidéo'} 
                  </span> 
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setNewListVideo(file); }} /> 
                </label> 
              )} 
            </div> 
          
            {/* Section Photo */} 
            <div className="space-y-4"> 
              <div className="flex items-center gap-2"> 
                <ImageIcon className="size-4 md:size-5 text-blue-500" /> 
                <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Photo de liste</h4> 
              </div> 
          
              {/* Prévisualisation de l'image existante */} 
              {isEditMode && editingList?.imageUrl && !newListImage && ( 
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"> 
                  <img src={editingList.imageUrl} alt="Actuelle" className="aspect-video w-full object-cover" /> 
                  <div className="p-2 text-center bg-slate-100 dark:bg-white/5"> 
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Photo actuelle</p> 
                  </div> 
                </div> 
              )} 
          
              {newListImage ? ( 
                <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-3 md:p-4 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-500/30"> 
                  <div className="flex items-center gap-3"> 
                    <div className="rounded-lg bg-white p-2 md:p-2.5 shadow-sm dark:bg-white/5"> 
                      <FileImage className="size-5 md:size-6 text-blue-600" /> 
                    </div> 
                    <div className="min-w-0"> 
                      <p className="truncate text-xs md:text-sm font-bold text-blue-900 dark:text-blue-200">{newListImage.name}</p> 
                      <p className="text-[10px] md:text-xs text-blue-600">{(newListImage.size / (1024 * 1024)).toFixed(2)} MB</p> 
                    </div> 
                  </div> 
                  <button type="button" onClick={() => setNewListImage(null)} className="rounded-lg p-2 md:p-2.5 text-blue-600 transition hover:bg-rose-50 hover:text-rose-600"> 
                    <X className="size-4 md:size-5" /> 
                  </button> 
                </div> 
              ) : ( 
                <label className="group flex h-28 md:h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-white/10 dark:bg-white/5"> 
                  <div className="mb-2 md:mb-3 flex size-10 md:size-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white dark:bg-white/5"> 
                    <ImageIcon className="size-5 md:size-6" /> 
                  </div> 
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-blue-600"> 
                    {isEditMode && editingList?.imageUrl ? 'Remplacer la photo' : 'Choisir une photo'} 
                  </span> 
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setNewListImage(file); }} /> 
                </label> 
              )} 
            </div> 
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-8 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] md:text-xs font-bold text-rose-500">{listError}</p>
            <div className="flex gap-3 md:gap-4">
              <Link
                to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}`}
                className="flex h-11 md:h-12 flex-1 md:flex-none items-center justify-center rounded-xl bg-slate-100 px-6 md:px-8 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={createListMutation.isPending || updateListMutation.isPending}
                className="flex h-11 md:h-12 flex-[2] md:flex-none items-center justify-center gap-2 md:gap-3 rounded-xl bg-blue-600 px-6 md:px-10 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
              >
                {createListMutation.isPending || updateListMutation.isPending ? (
                  <Loader2 className="size-4 md:size-5 animate-spin" />
                ) : isEditMode ? (
                  <Save className="size-4 md:size-5" />
                ) : (
                  <Plus className="size-4 md:size-5" />
                )}
                {isEditMode ? 'Enregistrer les modifications' : 'Créer la liste'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
