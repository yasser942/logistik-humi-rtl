import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { hrPositionsAPI } from "@/lib/api"
import { toast } from "sonner"

interface Position {
  id: number
  title: string
  code: string
  description?: string
  base_salary_min?: number
  base_salary_max?: number
  is_active: boolean
}

interface PositionModalProps {
  isOpen: boolean
  onClose: () => void
  position?: Position | null
  onSuccess: () => void
}

interface FormData {
  title: string
  code: string
  description: string
  base_salary_min: string
  base_salary_max: string
  is_active: boolean
}

export default function PositionModal({ isOpen, onClose, position, onSuccess }: PositionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    code: '',
    description: '',
    base_salary_min: '',
    base_salary_max: '',
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (position) {
        // Edit mode
        setFormData({
          title: position.title,
          code: position.code,
          description: position.description || '',
          base_salary_min: position.base_salary_min?.toString() || '',
          base_salary_max: position.base_salary_max?.toString() || '',
          is_active: position.is_active,
        })
      } else {
        // Add mode
        setFormData({
          title: '',
          code: '',
          description: '',
          base_salary_min: '',
          base_salary_max: '',
          is_active: true,
        })
      }
      setErrors({})
    }
  }, [isOpen, position])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان المنصب مطلوب'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'رمز المنصب مطلوب'
    } else if (formData.code.length < 2) {
      newErrors.code = 'رمز المنصب يجب أن يكون على الأقل حرفين'
    }

    // Validate salary range
    const minSalary = parseFloat(formData.base_salary_min)
    const maxSalary = parseFloat(formData.base_salary_max)

    if (formData.base_salary_min && isNaN(minSalary)) {
      newErrors.base_salary_min = 'الحد الأدنى للراتب يجب أن يكون رقماً صحيحاً'
    } else if (minSalary < 0) {
      newErrors.base_salary_min = 'الحد الأدنى للراتب لا يمكن أن يكون سالباً'
    }

    if (formData.base_salary_max && isNaN(maxSalary)) {
      newErrors.base_salary_max = 'الحد الأقصى للراتب يجب أن يكون رقماً صحيحاً'
    } else if (maxSalary < 0) {
      newErrors.base_salary_max = 'الحد الأقصى للراتب لا يمكن أن يكون سالباً'
    }

    if (formData.base_salary_min && formData.base_salary_max && !isNaN(minSalary) && !isNaN(maxSalary) && minSalary > maxSalary) {
      newErrors.base_salary_max = 'الحد الأقصى للراتب يجب أن يكون أكبر من أو يساوي الحد الأدنى'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title,
        code: formData.code,
        description: formData.description || undefined,
        base_salary_min: formData.base_salary_min ? parseFloat(formData.base_salary_min) : undefined,
        base_salary_max: formData.base_salary_max ? parseFloat(formData.base_salary_max) : undefined,
        is_active: formData.is_active,
      }

      if (position) {
        // Update existing position
        await hrPositionsAPI.update(position.id.toString(), submitData)
        toast.success('تم تحديث المنصب بنجاح')
      } else {
        // Create new position
        await hrPositionsAPI.create(submitData)
        toast.success('تم إنشاء المنصب بنجاح')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Validation errors from backend
        const backendErrors: Record<string, string> = {}
        Object.entries(error.response.data.errors).forEach(([field, messages]: [string, any]) => {
          backendErrors[field] = Array.isArray(messages) ? messages[0] : messages
        })
        setErrors(backendErrors)
      } else if (error.response?.data?.msg) {
        toast.error(error.response.data.msg)
      } else {
        toast.error('حدث خطأ أثناء حفظ المنصب')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {position ? 'تعديل المنصب' : 'إضافة منصب جديد'}
          </DialogTitle>
          <DialogDescription>
            {position ? 'قم بتعديل معلومات المنصب' : 'أدخل معلومات المنصب الجديد'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المنصب *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="مثال: مطور برمجيات"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">رمز المنصب *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="مثال: DEV"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المنصب</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="وصف مختصر للمنصب ومهامه..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary_min">الحد الأدنى للراتب (USD)</Label>
              <Input
                id="base_salary_min"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_salary_min}
                onChange={(e) => handleInputChange('base_salary_min', e.target.value)}
                placeholder="مثال: 1000"
                className={errors.base_salary_min ? 'border-red-500' : ''}
              />
              {errors.base_salary_min && (
                <p className="text-sm text-red-500">{errors.base_salary_min}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_salary_max">الحد الأقصى للراتب (USD)</Label>
              <Input
                id="base_salary_max"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_salary_max}
                onChange={(e) => handleInputChange('base_salary_max', e.target.value)}
                placeholder="مثال: 3000"
                className={errors.base_salary_max ? 'border-red-500' : ''}
              />
              {errors.base_salary_max && (
                <p className="text-sm text-red-500">{errors.base_salary_max}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">المنصب نشط</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {position ? 'جاري التحديث...' : 'جاري الإنشاء...'}
                </>
              ) : (
                position ? 'تحديث' : 'إنشاء'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 