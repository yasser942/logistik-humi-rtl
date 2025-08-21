import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { hrAttendanceAPI, hrEmployeesAPI } from "@/lib/api"
import { toast } from "sonner"

interface Attendance {
    id: number
    employee_id: number
    date: string
    check_in_time: string
    check_out_time: string
    total_hours: number
    status: string
    notes: string
}

interface Employee {
    id: number
    name: string
    email: string
    department: { id: number; name: string } | null
    position: { id: number; title: string } | null
}

interface AttendanceModalProps {
    isOpen: boolean
    onClose: () => void
    attendance?: Attendance | null
    onSuccess: () => void
}

interface FormData {
    employee_id: string
    date: string
    check_in_time: string
    check_out_time: string
    status: string
    notes: string
}

export default function AttendanceModal({ isOpen, onClose, attendance, onSuccess }: AttendanceModalProps) {
    const [formData, setFormData] = useState<FormData>({
        employee_id: '',
        date: '',
        check_in_time: '',
        check_out_time: '',
        status: 'present',
        notes: '',
    })
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (isOpen) {
            loadEmployees()
            if (attendance) {
                // Edit mode
                setFormData({
                    employee_id: attendance.employee_id.toString(),
                    date: attendance.date,
                    check_in_time: attendance.check_in_time || '',
                    check_out_time: attendance.check_out_time || '',
                    status: attendance.status,
                    notes: attendance.notes || '',
                })
            } else {
                // Add mode
                setFormData({
                    employee_id: '',
                    date: new Date().toISOString().split('T')[0],
                    check_in_time: '',
                    check_out_time: '',
                    status: 'present',
                    notes: '',
                })
            }
            setErrors({})
        }
    }, [isOpen, attendance])

    const loadEmployees = async () => {
        try {
            const response = await hrEmployeesAPI.getAll()
            if (response.status === 'success') {
                setEmployees(response.employees || [])
            }
        } catch (error) {
            console.error('Failed to load employees:', error)
        }
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.employee_id) {
            newErrors.employee_id = 'اختر الموظف'
        }

        if (!formData.date) {
            newErrors.date = 'التاريخ مطلوب'
        }

        if (!formData.check_in_time) {
            newErrors.check_in_time = 'وقت تسجيل الدخول مطلوب'
        }

        if (formData.check_out_time && formData.check_in_time) {
            const checkIn = new Date(`2000-01-01T${formData.check_in_time}`)
            const checkOut = new Date(`2000-01-01T${formData.check_out_time}`)

            if (checkOut <= checkIn) {
                newErrors.check_out_time = 'وقت تسجيل الخروج يجب أن يكون بعد وقت تسجيل الدخول'
            }
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
                employee_id: parseInt(formData.employee_id),
                date: formData.date,
                check_in_time: formData.check_in_time,
                check_out_time: formData.check_out_time || null,
                status: formData.status,
                notes: formData.notes || null,
            }

            if (attendance) {
                // Update existing attendance
                await hrAttendanceAPI.update(attendance.id.toString(), submitData)
                toast.success('تم تحديث سجل الحضور بنجاح')
            } else {
                // Create new attendance
                await hrAttendanceAPI.create(submitData)
                toast.success('تم إنشاء سجل الحضور بنجاح')
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
                toast.error('حدث خطأ أثناء حفظ سجل الحضور')
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
                        {attendance ? 'تعديل سجل الحضور' : 'إضافة سجل حضور جديد'}
                    </DialogTitle>
                    <DialogDescription>
                        {attendance ? 'قم بتعديل معلومات الحضور' : 'أدخل معلومات الحضور الجديد'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee_id">الموظف *</Label>
                            <Select
                                value={formData.employee_id}
                                onValueChange={(value) => handleInputChange('employee_id', value)}
                            >
                                <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="اختر الموظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                            {employee.name} - {employee.department?.name || 'بدون قسم'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employee_id && (
                                <p className="text-sm text-red-500">{errors.employee_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">التاريخ *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className={errors.date ? 'border-red-500' : ''}
                            />
                            {errors.date && (
                                <p className="text-sm text-red-500">{errors.date}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="check_in_time">وقت تسجيل الدخول *</Label>
                            <Input
                                id="check_in_time"
                                type="time"
                                value={formData.check_in_time}
                                onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                                className={errors.check_in_time ? 'border-red-500' : ''}
                            />
                            {errors.check_in_time && (
                                <p className="text-sm text-red-500">{errors.check_in_time}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="check_out_time">وقت تسجيل الخروج</Label>
                            <Input
                                id="check_out_time"
                                type="time"
                                value={formData.check_out_time}
                                onChange={(e) => handleInputChange('check_out_time', e.target.value)}
                                className={errors.check_out_time ? 'border-red-500' : ''}
                            />
                            {errors.check_out_time && (
                                <p className="text-sm text-red-500">{errors.check_out_time}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">الحالة</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleInputChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">حاضر</SelectItem>
                                <SelectItem value="absent">غائب</SelectItem>
                                <SelectItem value="late">متأخر</SelectItem>
                                <SelectItem value="leave">إجازة</SelectItem>
                                <SelectItem value="half_day">نصف يوم</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="ملاحظات إضافية..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {attendance ? 'جاري التحديث...' : 'جاري الإنشاء...'}
                                </>
                            ) : (
                                attendance ? 'تحديث' : 'إنشاء'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 