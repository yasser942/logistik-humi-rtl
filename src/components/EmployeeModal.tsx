import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { hrEmployeesAPI, hrDepartmentsAPI, hrPositionsAPI, hrCitiesAPI, hrBranchesAPI } from '@/lib/api'
import { toast } from 'sonner'

interface EmployeeModalProps {
    isOpen: boolean
    onClose: () => void
    employee?: any
    onSuccess: () => void
}

interface FormData {
    name: string
    email: string
    username: string
    password: string
    phone: string
    employee_id: string
    department_id: string
    position_id: string
    city_id: string
    branch_id: string
    hire_date: Date | undefined
    employment_type: string
    is_active: boolean
}

export default function EmployeeModal({ isOpen, onClose, employee, onSuccess }: EmployeeModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [departments, setDepartments] = useState([])
    const [positions, setPositions] = useState([])
    const [cities, setCities] = useState([])
    const [branches, setBranches] = useState([])
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        employee_id: '',
        department_id: '',
        position_id: '',
        city_id: '',
        branch_id: '',
        hire_date: undefined,
        employment_type: 'full_time',
        is_active: true
    })

    const isEdit = !!employee

    useEffect(() => {
        if (isOpen) {
            const initializeForm = async () => {
                setIsInitializing(true)
                try {
                    await loadDropdowns()

                    if (employee) {
                        setFormData({
                            name: employee.user?.name || '',
                            email: employee.user?.email || '',
                            username: employee.user?.username || '',
                            password: '',
                            phone: employee.user?.phone || '',
                            employee_id: employee.employee_id || '',
                            department_id: employee.department?.id || '',
                            position_id: employee.position?.id || '',
                            city_id: employee.city?.id || '',
                            branch_id: employee.branch?.id || '',
                            hire_date: employee.hire_date ? new Date(employee.hire_date) : undefined,
                            employment_type: employee.employment_type || 'full_time',
                            is_active: employee.is_active ?? true
                        })
                    } else {
                        setFormData({
                            name: '',
                            email: '',
                            username: '',
                            password: '',
                            phone: '',
                            employee_id: '',
                            department_id: '',
                            position_id: '',
                            city_id: '',
                            branch_id: '',
                            hire_date: undefined,
                            employment_type: 'full_time',
                            is_active: true
                        })
                    }
                } finally {
                    setIsInitializing(false)
                }
            }

            initializeForm()
        }
    }, [isOpen, employee])

    const loadDropdowns = async () => {
        try {
            const [deptResponse, posResponse, citiesResponse, branchesResponse] = await Promise.all([
                hrDepartmentsAPI.getAll(),
                hrPositionsAPI.getAll(),
                hrCitiesAPI.getAll(),
                hrBranchesAPI.getAll()
            ])

            if (deptResponse.status === 'success') {
                setDepartments(deptResponse.departments || [])
            } else {
                console.error('Departments response error:', deptResponse)
            }

            if (posResponse.status === 'success') {
                setPositions(posResponse.positions || [])
            } else {
                console.error('Positions response error:', posResponse)
            }

            if (citiesResponse.status === 'success') {
                setCities(citiesResponse.cities || [])
            } else {
                console.error('Cities response error:', citiesResponse)
            }

            if (branchesResponse.status === 'success') {
                setBranches(branchesResponse.branches || [])
            } else {
                console.error('Branches response error:', branchesResponse)
            }
        } catch (error) {
            console.error('Error loading dropdowns:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isEdit) {
                await hrEmployeesAPI.update(employee.id, formData)
                toast.success('تم تحديث بيانات الموظف بنجاح')
            } else {
                await hrEmployeesAPI.create(formData)
                toast.success('تم إضافة الموظف بنجاح')
            }

            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.response?.data?.msg || 'حدث خطأ أثناء حفظ البيانات')
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'قم بتعديل بيانات الموظف المحدد' : 'أدخل بيانات الموظف الجديد'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isInitializing && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>جاري تحميل البيانات...</span>
                            </div>
                        </div>
                    )}

                    {!isInitializing && (
                        <>
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">الاسم الكامل *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">اسم المستخدم *</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        كلمة المرور {isEdit ? '' : '*'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        required={!isEdit}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">رقم الموظف *</Label>
                                    <Input
                                        id="employee_id"
                                        value={formData.employee_id}
                                        onChange={(e) => handleInputChange('employee_id', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* HR Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">القسم *</Label>
                                    <Select
                                        value={formData.department_id}
                                        onValueChange={(value) => handleInputChange('department_id', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر القسم" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept: any) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position_id">المنصب *</Label>
                                    <Select
                                        value={formData.position_id}
                                        onValueChange={(value) => handleInputChange('position_id', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المنصب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((pos: any) => (
                                                <SelectItem key={pos.id} value={pos.id}>
                                                    {pos.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city_id">المدينة *</Label>
                                    <Select
                                        value={formData.city_id}
                                        onValueChange={(value) => handleInputChange('city_id', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المدينة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city: any) => (
                                                <SelectItem key={city.id} value={city.id}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">الفرع *</Label>
                                    <Select
                                        value={formData.branch_id}
                                        onValueChange={(value) => handleInputChange('branch_id', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الفرع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch: any) => (
                                                <SelectItem key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hire_date">تاريخ التعيين *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-right font-normal",
                                                    !formData.hire_date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="ml-2 h-4 w-4" />
                                                {formData.hire_date ? (
                                                    format(formData.hire_date, "PPP", { locale: ar })
                                                ) : (
                                                    <span>اختر التاريخ</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.hire_date}
                                                onSelect={(date) => handleInputChange('hire_date', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employment_type">نوع التوظيف *</Label>
                                    <Select
                                        value={formData.employment_type}
                                        onValueChange={(value) => handleInputChange('employment_type', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full_time">دوام كامل</SelectItem>
                                            <SelectItem value="part_time">دوام جزئي</SelectItem>
                                            <SelectItem value="contract">عقد مؤقت</SelectItem>
                                            <SelectItem value="intern">متدرب</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="is_active">حالة الموظف</Label>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="is_active" className="text-sm">
                                            موظف نشط
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    {isEdit ? 'تحديث' : 'إضافة'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
} 