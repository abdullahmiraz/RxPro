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
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface FavoriteSetup {
  id: string
  name: string
  description: string
  notes?: string
  createdAt: string
}

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required'),
  notes: yup.string(),
})

type FormData = yup.InferType<typeof schema>

const defaultValues: FormData = {
  name: '',
  description: '',
  notes: '',
}

export default function FavoriteSetupPage() {
  const { data: favorites, isLoading } = useFavoriteSetups()
  const createMutation = useCreateFavoriteSetup()
  const updateMutation = useUpdateFavoriteSetup()
  const deleteMutation = useDeleteFavoriteSetup()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFavorite, setEditingFavorite] = useState<FavoriteSetup | null>(null)

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
    reset({
      name: favorite.name,
      description: favorite.description,
      notes: favorite.notes,
    })
    setDialogOpen(true)
  }, [reset])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setDialogOpen(false)
      setEditingFavorite(null)
      reset(defaultValues)
    }
  }, [reset])

  const mutationPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (editingFavorite) {
          await updateMutation.mutateAsync({ id: editingFavorite.id, data: data as any })
        } else {
          await createMutation.mutateAsync(data as any)
        }
        setDialogOpen(false)
        setEditingFavorite(null)
        reset(defaultValues)
      } catch {
        // mutation error — dialog stays open
      }
    },
    [editingFavorite, updateMutation, createMutation, reset]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id)
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
                        onClick={() => handleDelete(favorite.id)}
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
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md" aria-label={editingFavorite ? 'Edit favorite setup' : 'Add new favorite setup'}>
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...register('notes')} />
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
