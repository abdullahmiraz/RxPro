'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { useSetup, useCreateSetup, useUpdateSetup, useDeleteSetup } from '@/hooks/useSetup'
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

interface Setup {
  id: string
  name: string
  type: string
  description: string
  createdAt: string
}

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  type: yup.string().required('Type is required'),
  description: yup.string().required('Description is required'),
})

type FormData = yup.InferType<typeof schema>

const defaultValues: FormData = {
  name: '',
  type: '',
  description: '',
}

export default function SetupPage() {
  const { data: setups, isLoading } = useSetup()
  const createMutation = useCreateSetup()
  const updateMutation = useUpdateSetup()
  const deleteMutation = useDeleteSetup()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSetup, setEditingSetup] = useState<Setup | null>(null)

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
    setEditingSetup(null)
    reset(defaultValues)
    setDialogOpen(true)
  }, [reset])

  const openEditDialog = useCallback((setup: Setup) => {
    setEditingSetup(setup)
    reset({
      name: setup.name,
      type: setup.type,
      description: setup.description,
    })
    setDialogOpen(true)
  }, [reset])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setDialogOpen(false)
      setEditingSetup(null)
      reset(defaultValues)
    }
  }, [reset])

  const mutationPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = useCallback(
    async (data: FormData) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submitData = data as any
      try {
        if (editingSetup) {
          await updateMutation.mutateAsync({ id: editingSetup.id, data: submitData })
        } else {
          await createMutation.mutateAsync(submitData)
        }
        setDialogOpen(false)
        setEditingSetup(null)
        reset(defaultValues)
      } catch {
        // mutation error — dialog stays open
      }
    },
    [editingSetup, updateMutation, createMutation, reset]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id)
    },
    [deleteMutation]
  )

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading setups">
        <PageHeader title="Setup Management" description="Manage system configurations" />
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Loading setup data...</span>
      </div>
    )
  }

  const setupList = (setups ?? []) as unknown as Setup[]

  return (
    <div>
      <PageHeader title="Setup Management" description="Manage system configurations">
        <Button aria-label="Add new setup" onClick={openAddDialog}>
          <Plus className="size-4" />
          Add Setup
        </Button>
      </PageHeader>

      {setupList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center" role="status">
          <div className="text-muted-foreground">
            <p className="text-sm font-medium">No setups found</p>
            <p className="text-xs mt-1">Get started by adding a new setup configuration.</p>
          </div>
          <Button variant="outline" className="mt-4" aria-label="Add your first setup" onClick={openAddDialog}>
            <Plus className="size-4" />
            Add Setup
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setupList.map((setup) => (
                <TableRow key={setup.id}>
                  <TableCell className="font-medium">{setup.name}</TableCell>
                  <TableCell>{setup.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{setup.description}</TableCell>
                  <TableCell>{setup.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${setup.name}`}
                        onClick={() => openEditDialog(setup)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${setup.name}`}
                        onClick={() => handleDelete(setup.id)}
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
        <DialogContent className="sm:max-w-md" aria-label={editingSetup ? 'Edit setup' : 'Add new setup'}>
          <DialogHeader>
            <DialogTitle>{editingSetup ? 'Edit Setup' : 'Add Setup'}</DialogTitle>
            <DialogDescription>
              {editingSetup ? 'Update the setup configuration details.' : 'Fill in the details to create a new setup.'}
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
                <Label htmlFor="type">Type</Label>
                <Input id="type" {...register('type')} aria-invalid={!!errors.type} />
                {errors.type && (
                  <p className="text-xs text-destructive" role="alert">{errors.type.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} {...register('description')} aria-invalid={!!errors.description} />
                {errors.description && (
                  <p className="text-xs text-destructive" role="alert">{errors.description.message}</p>
                )}
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isSubmitting || mutationPending} aria-label="Save setup">
                {(isSubmitting || mutationPending) && <Loader2 className="size-4 animate-spin" />}
                {editingSetup ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
