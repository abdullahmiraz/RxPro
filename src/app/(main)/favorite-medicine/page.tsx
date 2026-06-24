'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import PageHeader from '@/components/shared/page-header/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogClose,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface FavoriteMedicine {
  id: string
  name: string
  genericName: string
  dosage: string
  instructions: string
  routeType: string
}

const routeTypes = ['Oral', 'Topical', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Inhalation', 'Ophthalmic', 'Otic']

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  genericName: yup.string().required('Generic name is required'),
  dosage: yup.string().required('Dosage is required'),
  instructions: yup.string().required('Instructions are required'),
  routeType: yup.string().required('Route type is required'),
})

type FormData = yup.InferType<typeof schema>

const defaultValues: FormData = {
  name: '',
  genericName: '',
  dosage: '',
  instructions: '',
  routeType: '',
}

export default function FavoriteMedicinePage() {
  const [medicines, setMedicines] = useState<FavoriteMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<FavoriteMedicine | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues,
  })

  const selectedRouteType = watch('routeType')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const openAddDialog = useCallback(() => {
    setEditingMedicine(null)
    reset(defaultValues)
    setDialogOpen(true)
  }, [reset])

  const openEditDialog = useCallback((medicine: FavoriteMedicine) => {
    setEditingMedicine(medicine)
    reset({
      name: medicine.name,
      genericName: medicine.genericName,
      dosage: medicine.dosage,
      instructions: medicine.instructions,
      routeType: medicine.routeType,
    })
    setDialogOpen(true)
  }, [reset])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setDialogOpen(false)
      setEditingMedicine(null)
      reset(defaultValues)
    }
  }, [reset])

  const onSubmit = useCallback(
    (data: FormData) => {
      if (editingMedicine) {
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === editingMedicine.id
              ? { ...m, ...data }
              : m
          )
        )
      } else {
        const newMedicine: FavoriteMedicine = {
          id: crypto.randomUUID(),
          ...data,
        }
        setMedicines((prev) => [...prev, newMedicine])
      }
      setDialogOpen(false)
      setEditingMedicine(null)
      reset(defaultValues)
    },
    [editingMedicine, reset]
  )

  const handleDelete = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading favorite medicines">
        <PageHeader title="Favorite Medicines" description="Manage frequently prescribed medicines" />
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/5 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Loading favorite medicine data...</span>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Favorite Medicines" description="Manage frequently prescribed medicines">
        <Button aria-label="Add new favorite medicine" onClick={openAddDialog}>
          <Plus className="size-4" />
          Add Medicine
        </Button>
      </PageHeader>

      {medicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center" role="status">
          <div className="text-muted-foreground">
            <p className="text-sm font-medium">No favorite medicines found</p>
            <p className="text-xs mt-1">Add your frequently prescribed medicines for quick access.</p>
          </div>
          <Button variant="outline" className="mt-4" aria-label="Add your first favorite medicine" onClick={openAddDialog}>
            <Plus className="size-4" />
            Add Medicine
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Generic Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Instructions</TableHead>
                <TableHead>Route Type</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell>{medicine.genericName}</TableCell>
                  <TableCell>{medicine.dosage}</TableCell>
                  <TableCell className="max-w-xs truncate">{medicine.instructions}</TableCell>
                  <TableCell>{medicine.routeType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${medicine.name}`}
                        onClick={() => openEditDialog(medicine)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${medicine.name}`}
                        onClick={() => handleDelete(medicine.id)}
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
        <DialogContent className="sm:max-w-md" aria-label={editingMedicine ? 'Edit favorite medicine' : 'Add new favorite medicine'}>
          <DialogHeader>
            <DialogTitle>{editingMedicine ? 'Edit Favorite Medicine' : 'Add Favorite Medicine'}</DialogTitle>
            <DialogDescription>
              {editingMedicine ? 'Update the medicine details.' : 'Add a new medicine to your favorites for quick prescription.'}
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
                <Label htmlFor="genericName">Generic Name</Label>
                <Input id="genericName" {...register('genericName')} aria-invalid={!!errors.genericName} />
                {errors.genericName && (
                  <p className="text-xs text-destructive" role="alert">{errors.genericName.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" {...register('dosage')} aria-invalid={!!errors.dosage} />
                {errors.dosage && (
                  <p className="text-xs text-destructive" role="alert">{errors.dosage.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" rows={3} {...register('instructions')} aria-invalid={!!errors.instructions} />
                {errors.instructions && (
                  <p className="text-xs text-destructive" role="alert">{errors.instructions.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="routeType">Route Type</Label>
                <Select
                  value={selectedRouteType ?? ''}
                  onValueChange={(value) => value && setValue('routeType', value)}
                >
                  <SelectTrigger aria-label="Select route type" id="routeType">
                    <SelectValue placeholder="Select route type" />
                  </SelectTrigger>
                  <SelectContent>
                    {routeTypes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.routeType && (
                  <p className="text-xs text-destructive" role="alert">{errors.routeType.message}</p>
                )}
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isSubmitting} aria-label="Save favorite medicine">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {editingMedicine ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}