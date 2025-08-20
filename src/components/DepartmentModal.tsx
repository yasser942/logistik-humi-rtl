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
import { hrDepartmentsAPI } from "@/lib/api"
import { toast } from "sonner"

interface Department {
    id: number
    name: string
    code: string
    description?: string
    is_active: boolean
}

interface DepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    department?: Department | null
    onSuccess: () => void
}

interface FormData {
    name: string
    code: string
    description: string
    is_active: boolean
}

export default function DepartmentModal({ isOpen, onClose, department, onSuccess }: DepartmentModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        code: '',
        description: '',
        is_active: true,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (isOpen) {
            if (department) {
                // Edit mode
                setFormData({
                    name: department.name,
                    code: department.code,
                    description: department.description || '',
                    is_active: department.is_active,
                })
            } else {
                // Add mode
                setFormData({
                    name: '',
                    code: '',
                    description: '',
                    is_active: true,
                })
            }
            setErrors({})
        }
    }, [isOpen, department])

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'اسم القسم مطلوب'
        }

        if (!formData.code.trim()) {
            newErrors.code = 'رمز القسم مطلوب'
        } else if (formData.code.length < 2) {
            newErrors.code = 'رمز القسم يجب أن يكون على الأقل حرفين'
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
            if (department) {
                // Update existing department
                await hrDepartmentsAPI.update(department.id.toString(), formData)
                toast.success('تم تحديث القسم بنجاح')
            } else {
                // Create new department
                await hrDepartmentsAPI.create(formData)
                toast.success('تم إنشاء القسم بنجاح')
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
                toast.error('حدث خطأ أثناء حفظ القسم')
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {department ? 'تعديل القسم' : 'إضافة قسم جديد'}
                    </DialogTitle>
                    <DialogDescription>
                        {department ? 'قم بتعديل معلومات القسم' : 'أدخل معلومات القسم الجديد'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم القسم *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="مثال: الموارد البشرية"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">رمز القسم *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                placeholder="مثال: HR"
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">وصف القسم</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="وصف مختصر للقسم ومهامه..."
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                        <Label htmlFor="is_active">القسم نشط</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {department ? 'جاري التحديث...' : 'جاري الإنشاء...'}
                                </>
                            ) : (
                                department ? 'تحديث' : 'إنشاء'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 