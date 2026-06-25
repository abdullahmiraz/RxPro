'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import {
  useFavoriteSetups,
  useCreateFavoriteSetup,
  useUpdateFavoriteSetup,
  useDeleteFavoriteSetup,
} from '@/hooks/useSetup'
import PageHeader from '@/components/shared/page-header/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'

interface FavoriteSetup {
  id: string
  name: string
  description: string
  data?: string
  createdAt: string
}

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required'),
  templateData: yup.string(),
})

type FormData = yup.InferType<typeof schema>

const defaultValues: FormData = {
  name: '',
  description: '',
  templateData: '',
}

const SECTION_KEYS = ['complaints', 'examination', 'investigation', 'diagnosis', 'advice', 'medications'] as const

const sectionLabels: Record<string, string> = {
  complaints: 'Complaints',
  examination: 'Examination',
  investigation: 'Investigation',
  diagnosis: 'Diagnosis',
  advice: 'Advice',
  medications: 'Medications',
}

export default function FavoriteSetupPage() {
  const { data: favorites, isLoading } = useFavoriteSetups()
  const createMutation = useCreateFavoriteSetup()
  const updateMutation = useUpdateFavoriteSetup()
  const deleteMutation = useDeleteFavoriteSetup()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFavorite, setEditingFavorite] = useState<FavoriteSetup | null>(null)
  const [sectionItems, setSectionItems] = useState<Record<string, string[]>>({
    complaints: [],
    examination: [],
    investigation: [],
    diagnosis: [],
    advice: [],
    medications: [],
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues,
  })

  const openAddDialog = useCallback(() => {
    setEditingFavorite(null)
    reset(defaultValues)
    setDialogOpen(true)
  }, [reset])

  const openEditDialog = useCallback((favorite: FavoriteSetup) => {
    setEditingFavorite(favorite)
    const parsed: Record<string, string[]> = {}
    try {
      const raw = (favorite as any).data
      if (typeof raw === 'string') {
        Object.assign(parsed, JSON.parse(raw))
      } else if (typeof raw === 'object' && raw) {
        Object.assign(parsed, raw)
      }
    } catch { /* ignore */ }
    setSectionItems({
      complaints: parsed.complaints || [],
      examination: parsed.examination || [],
      investigation: parsed.investigation || [],
      diagnosis: parsed.diagnosis || [],
      advice: parsed.advice || [],
      medications: parsed.medications || [],
    })
    reset({
      name: favorite.name,
      description: favorite.description,
      templateData: favorite.data || '',
    })
    setDialogOpen(true)
  }, [reset])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setDialogOpen(false)
      setEditingFavorite(null)
      reset(defaultValues)
      setSectionItems({ complaints: [], examination: [], investigation: [], diagnosis: [], advice: [], medications: [] })
    }
  }, [reset])

  const mutationPending = createMutation.isPending || updateMutation.isPending

  const addItem = useCallback((section: string) => {
    setSectionItems(prev => ({ ...prev, [section]: [...prev[section], ''] }))
  }, [])

  const removeItem = useCallback((section: string, index: number) => {
    setSectionItems(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }))
  }, [])

  const updateItem = useCallback((section: string, index: number, value: string) => {
    setSectionItems(prev => {
      const updated = [...prev[section]]
      updated[index] = value
      return { ...prev, [section]: updated }
    })
  }, [])

  const onSubmit = useCallback(
    async (formData: FormData) => {
      try {
        const jsonData = JSON.stringify(sectionItems)
        const payload = { name: formData.name, description: formData.description, data: jsonData }
        if (editingFavorite) {
          await updateMutation.mutateAsync({ id: editingFavorite.id, data: payload as any })
        } else {
          await createMutation.mutateAsync(payload as any)
        }
        setDialogOpen(false)
        setEditingFavorite(null)
        reset(defaultValues)
        setSectionItems({ complaints: [], examination: [], investigation: [], diagnosis: [], advice: [], medications: [] })
      } catch {
        toast.error('Failed to save favorite setup')
      }
    },
    [editingFavorite, updateMutation, createMutation, reset, sectionItems]
  )

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Favorite setup deleted')
      } catch {
        toast.error('Failed to delete favorite setup')
      }
    },
    [deleteMutation]
  )

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading favorite setups">
        <PageHeader title="Favorite Setups" description="Manage your favorite configurations" />
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Loading favorite setup data...</span>
      </div>
    )
  }

  const favoriteList = (favorites ?? []) as unknown as FavoriteSetup[]

  return (
    <div>
      <PageHeader title="Favorite Setups" description="Manage your favorite configurations">
        <Button aria-label="Add new favorite setup" onClick={openAddDialog}>
          <Plus className="size-4" />
          Add Favorite
        </Button>
      </PageHeader>

      {favoriteList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center" role="status">
          <div className="text-muted-foreground">
            <p className="text-sm font-medium">No favorite setups found</p>
            <p className="text-xs mt-1">Save your commonly used configurations for quick access.</p>
          </div>
          <Button variant="outline" className="mt-4" aria-label="Add your first favorite setup" onClick={openAddDialog}>
            <Plus className="size-4" />
            Add Favorite
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favoriteList.map((favorite) => (
                <TableRow key={favorite.id}>
                  <TableCell className="font-medium">{favorite.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{favorite.description}</TableCell>
                  <TableCell>{favorite.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${favorite.name}`}
                        onClick={() => openEditDialog(favorite)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${favorite.name}`}
                        onClick={() => handleDelete(favorite.id, favorite.name)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-xl" aria-label={editingFavorite ? 'Edit favorite setup' : 'Add new favorite setup'}>
          <DialogHeader>
            <DialogTitle>{editingFavorite ? 'Edit Favorite Setup' : 'Add Favorite Setup'}</DialogTitle>
            <DialogDescription>
              {editingFavorite ? 'Update your favorite configuration.' : 'Save a configuration as a favorite for quick access.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
                {errors.name && (
                  <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register('description')} aria-invalid={!!errors.description} />
                {errors.description && (
                  <p className="text-xs text-destructive" role="alert">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Template Sections</Label>
                <div className="rounded-lg border max-h-[400px] overflow-y-auto">
                  <div className="divide-y">
                    {SECTION_KEYS.map((key) => (
                      <div key={key} className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{sectionLabels[key]}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Add ${sectionLabels[key]} item`}
                            onClick={() => addItem(key)}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                        {sectionItems[key].length === 0 ? (
                          <p className="text-xs text-muted-foreground pl-1">No items</p>
                        ) : (
                          <div className="space-y-1.5">
                            {sectionItems[key].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => updateItem(key, idx, e.target.value)}
                                  placeholder={`Enter ${sectionLabels[key].toLowerCase()} item`}
                                  className="h-8 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Remove ${sectionLabels[key]} item`}
                                  onClick={() => removeItem(key, idx)}
                                >
                                  <X className="size-3.5 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isSubmitting || mutationPending} aria-label="Save favorite setup">
                {(isSubmitting || mutationPending) && <Loader2 className="size-4 animate-spin" />}
                {editingFavorite ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
