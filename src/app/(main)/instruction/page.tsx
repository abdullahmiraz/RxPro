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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
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
import { Plus, Pencil, Trash2, Loader2, FileText, Route } from 'lucide-react'

interface Instruction {
  id: string
  name: string
  description: string
}

interface RouteType {
  id: string
  name: string
  description: string
}

const instructionSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required'),
})

const routeTypeSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required'),
})

type InstructionFormData = yup.InferType<typeof instructionSchema>
type RouteTypeFormData = yup.InferType<typeof routeTypeSchema>

const defaultInstructionValues: InstructionFormData = {
  name: '',
  description: '',
}

const defaultRouteTypeValues: RouteTypeFormData = {
  name: '',
  description: '',
}

export default function InstructionPage() {
  const [activeTab, setActiveTab] = useState('instructions')
  const [instructions, setInstructions] = useState<Instruction[]>([])
  const [routeTypes, setRouteTypes] = useState<RouteType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInstruction, setEditingInstruction] = useState<Instruction | null>(null)
  const [editingRouteType, setEditingRouteType] = useState<RouteType | null>(null)

  const instructionForm = useForm<InstructionFormData>({
    resolver: yupResolver(instructionSchema),
    defaultValues: defaultInstructionValues,
  })

  const routeTypeForm = useForm<RouteTypeFormData>({
    resolver: yupResolver(routeTypeSchema),
    defaultValues: defaultRouteTypeValues,
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const openAddInstructionDialog = useCallback(() => {
    setEditingInstruction(null)
    setEditingRouteType(null)
    instructionForm.reset(defaultInstructionValues)
    setDialogOpen(true)
  }, [instructionForm])

  const openEditInstructionDialog = useCallback((instruction: Instruction) => {
    setEditingInstruction(instruction)
    setEditingRouteType(null)
    instructionForm.reset({
      name: instruction.name,
      description: instruction.description,
    })
    setDialogOpen(true)
  }, [instructionForm])

  const openAddRouteTypeDialog = useCallback(() => {
    setEditingInstruction(null)
    setEditingRouteType(null)
    routeTypeForm.reset(defaultRouteTypeValues)
    setDialogOpen(true)
  }, [routeTypeForm])

  const openEditRouteTypeDialog = useCallback((routeType: RouteType) => {
    setEditingInstruction(null)
    setEditingRouteType(routeType)
    routeTypeForm.reset({
      name: routeType.name,
      description: routeType.description,
    })
    setDialogOpen(true)
  }, [routeTypeForm])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setDialogOpen(false)
      setEditingInstruction(null)
      setEditingRouteType(null)
      instructionForm.reset(defaultInstructionValues)
      routeTypeForm.reset(defaultRouteTypeValues)
    }
  }, [instructionForm, routeTypeForm])

  const onInstructionSubmit = useCallback(
    (data: InstructionFormData) => {
      if (editingInstruction) {
        setInstructions((prev) =>
          prev.map((i) =>
            i.id === editingInstruction.id
              ? { ...i, ...data }
              : i
          )
        )
      } else {
        const newInstruction: Instruction = {
          id: crypto.randomUUID(),
          ...data,
        }
        setInstructions((prev) => [...prev, newInstruction])
      }
      setDialogOpen(false)
      setEditingInstruction(null)
      instructionForm.reset(defaultInstructionValues)
    },
    [editingInstruction, instructionForm]
  )

  const onRouteTypeSubmit = useCallback(
    (data: RouteTypeFormData) => {
      if (editingRouteType) {
        setRouteTypes((prev) =>
          prev.map((r) =>
            r.id === editingRouteType.id
              ? { ...r, ...data }
              : r
          )
        )
      } else {
        const newRouteType: RouteType = {
          id: crypto.randomUUID(),
          ...data,
        }
        setRouteTypes((prev) => [...prev, newRouteType])
      }
      setDialogOpen(false)
      setEditingRouteType(null)
      routeTypeForm.reset(defaultRouteTypeValues)
    },
    [editingRouteType, routeTypeForm]
  )

  const handleDeleteInstruction = useCallback((id: string) => {
    setInstructions((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handleDeleteRouteType = useCallback((id: string) => {
    setRouteTypes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const isEditingInstruction = activeTab === 'instructions' ? !!editingInstruction : false
  const isEditingRouteType = activeTab === 'route-types' ? !!editingRouteType : false

  const dialogTitle = activeTab === 'instructions'
    ? (editingInstruction ? 'Edit Instruction' : 'Add Instruction')
    : (editingRouteType ? 'Edit Route Type' : 'Add Route Type')

  const dialogDescription = activeTab === 'instructions'
    ? (editingInstruction ? 'Update the instruction details.' : 'Add a new prescription instruction.')
    : (editingRouteType ? 'Update the route type details.' : 'Add a new route type.')

  const getDialogForm = () => {
    if (activeTab === 'instructions') {
      return (
        <form onSubmit={instructionForm.handleSubmit(onInstructionSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="instr-name">Name</Label>
              <Input id="instr-name" {...instructionForm.register('name')} aria-invalid={!!instructionForm.formState.errors.name} />
              {instructionForm.formState.errors.name && (
                <p className="text-xs text-destructive" role="alert">{instructionForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instr-description">Description</Label>
              <Textarea id="instr-description" rows={3} {...instructionForm.register('description')} aria-invalid={!!instructionForm.formState.errors.description} />
              {instructionForm.formState.errors.description && (
                <p className="text-xs text-destructive" role="alert">{instructionForm.formState.errors.description.message}</p>
              )}
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={instructionForm.formState.isSubmitting} aria-label="Save instruction">
              {instructionForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {editingInstruction ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      )
    }

    return (
      <form onSubmit={routeTypeForm.handleSubmit(onRouteTypeSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rt-name">Name</Label>
            <Input id="rt-name" {...routeTypeForm.register('name')} aria-invalid={!!routeTypeForm.formState.errors.name} />
            {routeTypeForm.formState.errors.name && (
              <p className="text-xs text-destructive" role="alert">{routeTypeForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rt-description">Description</Label>
            <Textarea id="rt-description" rows={3} {...routeTypeForm.register('description')} aria-invalid={!!routeTypeForm.formState.errors.description} />
            {routeTypeForm.formState.errors.description && (
              <p className="text-xs text-destructive" role="alert">{routeTypeForm.formState.errors.description.message}</p>
            )}
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button type="submit" disabled={routeTypeForm.formState.isSubmitting} aria-label="Save route type">
            {routeTypeForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {editingRouteType ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading instructions">
        <PageHeader title="Instructions" description="Manage prescription instructions and route types" />
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <div className="h-8 w-28 animate-pulse rounded bg-muted" />
              <div className="h-8 w-28 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <span className="sr-only">Loading instruction data...</span>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Instructions" description="Manage prescription instructions and route types" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="instructions" aria-label="Instructions tab">
            <FileText className="size-4" />
            Instructions
          </TabsTrigger>
          <TabsTrigger value="route-types" aria-label="Route types tab">
            <Route className="size-4" />
            Route Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions">
          <div className="mb-4 flex justify-end">
            <Button aria-label="Add new instruction" onClick={openAddInstructionDialog}>
              <Plus className="size-4" />
              Add Instruction
            </Button>
          </div>

          {instructions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center" role="status">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium">No instructions found</p>
                <p className="text-xs mt-1">Add prescription instructions to use in your prescriptions.</p>
              </div>
              <Button variant="outline" className="mt-4" aria-label="Add your first instruction" onClick={openAddInstructionDialog}>
                <Plus className="size-4" />
                Add Instruction
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructions.map((instruction) => (
                    <TableRow key={instruction.id}>
                      <TableCell className="font-medium">{instruction.name}</TableCell>
                      <TableCell className="max-w-md truncate">{instruction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit instruction ${instruction.name}`}
                            onClick={() => openEditInstructionDialog(instruction)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete instruction ${instruction.name}`}
                            onClick={() => handleDeleteInstruction(instruction.id)}
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
        </TabsContent>

        <TabsContent value="route-types">
          <div className="mb-4 flex justify-end">
            <Button aria-label="Add new route type" onClick={openAddRouteTypeDialog}>
              <Plus className="size-4" />
              Add Route Type
            </Button>
          </div>

          {routeTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center" role="status">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium">No route types found</p>
                <p className="text-xs mt-1">Add medication route types to use in your prescriptions.</p>
              </div>
              <Button variant="outline" className="mt-4" aria-label="Add your first route type" onClick={openAddRouteTypeDialog}>
                <Plus className="size-4" />
                Add Route Type
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeTypes.map((routeType) => (
                    <TableRow key={routeType.id}>
                      <TableCell className="font-medium">{routeType.name}</TableCell>
                      <TableCell className="max-w-md truncate">{routeType.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit route type ${routeType.name}`}
                            onClick={() => openEditRouteTypeDialog(routeType)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete route type ${routeType.name}`}
                            onClick={() => handleDeleteRouteType(routeType.id)}
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
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md" aria-label={dialogTitle}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {getDialogForm()}
        </DialogContent>
      </Dialog>
    </div>
  )
}