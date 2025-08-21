import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import {
    Smartphone,
    MapPin,
    Camera,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Wifi,
    Battery
} from "lucide-react"

interface Employee {
    id: number
    name: string
    email: string
    department: { id: number; name: string } | null
    position: { id: number; title: string } | null
    branch: { id: number; name: string; latitude?: number; longitude?: number } | null
}

interface AttendanceStatus {
    status: string
    date: string
    check_in_time: string | null
    check_out_time: string | null
    total_hours: number | null
    can_check_in: boolean
    can_check_out: boolean
}

interface MobileAttendanceSimulatorProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper function to format distance
const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters)} متر`;
    } else {
        return `${(distanceInMeters / 1000).toFixed(2)} كم`;
    }
};

export default function MobileAttendanceSimulator({ isOpen, onClose, onSuccess }: MobileAttendanceSimulatorProps) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedEmployee, setSelectedEmployee] = useState('')
    const [currentStatus, setCurrentStatus] = useState<AttendanceStatus | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
    const [isCheckingIn, setIsCheckingIn] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [locationLoading, setLocationLoading] = useState(true)
    const [notes, setNotes] = useState('')
    const [locationName, setLocationName] = useState('')
    const [simulatedLocation, setSimulatedLocation] = useState({
        latitude: 24.7136,
        longitude: 46.6753,
        name: 'الرياض، المملكة العربية السعودية'
    })

    useEffect(() => {
        if (isOpen && employees.length === 0) {
            loadEmployees()
            // Simulate getting current location
            simulateLocation()
        }
    }, [isOpen, employees.length])

    // Debug: Log employees whenever they change
    useEffect(() => {
        console.log('Employees state changed:', employees)
        if (employees.length > 0) {
            console.log('First employee:', employees[0])
            console.log('Employee names:', employees.map(emp => ({ id: emp.id, name: emp.name })))
        }
    }, [employees])

    useEffect(() => {
        if (selectedEmployee) {
            loadCurrentStatus()
        }
    }, [selectedEmployee])

    const loadEmployees = async () => {
        if (isLoadingEmployees) {
            console.log('Already loading employees, skipping...')
            return
        }

        try {
            setIsLoadingEmployees(true)
            console.log('Loading employees...')
            const response = await hrEmployeesAPI.getMobileEmployees()
            console.log('Employees API response:', response)
            console.log('Response type:', typeof response)
            console.log('Response keys:', Object.keys(response))

            if (response.status === 'success') {
                const employeeList = response.employees || []
                console.log('Employee list extracted:', employeeList)
                console.log('Employee list length:', employeeList.length)
                console.log('First employee:', employeeList[0])

                setEmployees(employeeList)
                console.log('setEmployees called with:', employeeList)
            } else {
                console.error('Failed to load employees:', response)
            }
        } catch (error) {
            console.error('Failed to load employees:', error)
        } finally {
            setIsLoadingEmployees(false)
        }
    }

    const loadCurrentStatus = async () => {
        if (!selectedEmployee) return

        try {
            setIsLoading(true)
            const response = await hrAttendanceAPI.getCurrentStatus(selectedEmployee)
            if (response.status === 'success') {
                setCurrentStatus(response)
            }
        } catch (error) {
            console.error('Failed to load current status:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const simulateLocation = () => {
        // Simulate different locations for testing
        const locations = [
            { latitude: 36.63010000, longitude: 36.93140000, name: 'الرياض، المملكة العربية السعودية' },
            { latitude: 21.4858, longitude: 39.1925, name: 'جدة، المملكة العربية السعودية' },
            { latitude: 26.4207, longitude: 50.0888, name: 'الدمام، المملكة العربية السعودية' },
            { latitude: 24.4672, longitude: 39.6142, name: 'المدينة المنورة، المملكة العربية السعودية' },
        ]

        const randomLocation = locations[Math.floor(Math.random() * locations.length)]
        setSimulatedLocation(randomLocation)
        setLocationLoading(false)
    }

    const handleCheckIn = async () => {
        if (!selectedEmployee) {
            toast.error('يرجى اختيار موظف')
            return
        }

        try {
            setIsCheckingIn(true)
            const checkInData = {
                employee_id: parseInt(selectedEmployee),
                latitude: simulatedLocation?.latitude || 0,
                longitude: simulatedLocation?.longitude || 0,
                location_name: locationName || simulatedLocation?.name || 'موقع غير محدد',
                device_info: 'Web Simulator - Chrome Browser',
                notes: notes,
                // photo: null // In real app, this would be base64 photo
            }

            const response = await hrAttendanceAPI.checkIn(checkInData)
            if (response.status === 'success') {
                toast.success('تم تسجيل الدخول بنجاح!')
                setNotes('')
                setLocationName('')
                loadCurrentStatus()
                onSuccess()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.msg || 'فشل في تسجيل الدخول')
        } finally {
            setIsCheckingIn(false)
        }
    }

    const handleCheckOut = async () => {
        if (!selectedEmployee) {
            toast.error('يرجى اختيار موظف')
            return
        }

        try {
            setIsCheckingOut(true)
            const checkOutData = {
                employee_id: parseInt(selectedEmployee),
                latitude: simulatedLocation?.latitude || 0,
                longitude: simulatedLocation?.longitude || 0,
                location_name: locationName || simulatedLocation?.name || 'موقع غير محدد',
                device_info: 'Web Simulator - Chrome Browser',
                notes: notes,
                // photo: null // In real app, this would be base64 photo
            }

            const response = await hrAttendanceAPI.checkOut(checkOutData)
            if (response.status === 'success') {
                toast.success('تم تسجيل الخروج بنجاح!')
                setNotes('')
                setLocationName('')
                loadCurrentStatus()
                onSuccess()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.msg || 'فشل في تسجيل الخروج')
        } finally {
            setIsCheckingOut(false)
        }
    }

    const handleClose = () => {
        if (!isCheckingIn && !isCheckingOut) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        محاكي تطبيق الحضور
                    </DialogTitle>
                    <DialogDescription>
                        اختبر وظائف التطبيق المحمول للحضور والانصراف
                    </DialogDescription>
                </DialogHeader>

                {locationLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">جاري تحميل الموقع...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Mobile Header Simulation */}
                        <div className="bg-gray-900 text-white p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Wifi className="h-4 w-4" />
                                    <span className="text-xs">WiFi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Battery className="h-4 w-4" />
                                    <span className="text-xs">85%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold">نظام الحضور</div>
                                <div className="text-sm text-gray-300">{new Date().toLocaleDateString('ar-SA')}</div>
                            </div>
                        </div>

                        {/* Employee Selection */}
                        <div className="space-y-2">
                            <Label>اختر الموظف</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر موظف للاختبار" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingEmployees ? (
                                        <SelectItem value="loading" disabled>
                                            جاري تحميل الموظفين...
                                        </SelectItem>
                                    ) : employees.length === 0 ? (
                                        <SelectItem value="no-employees" disabled>
                                            لا يوجد موظفين
                                        </SelectItem>
                                    ) : (
                                        employees.map((employee) => {
                                            console.log('Rendering employee:', employee);
                                            return (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-medium text-foreground">
                                                            {employee.name || 'اسم غير محدد'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {employee.department?.name ? `قسم: ${employee.department.name}` : 'بدون قسم'}
                                                            {employee.branch?.name && ` | فرع: ${employee.branch.name}`}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                            {employees.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    تم تحميل {employees.length} موظف
                                </div>
                            )}
                            {/* Debug information */}
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                                <div>Debug Info:</div>
                                <div>Loading employees: {isLoadingEmployees ? 'Yes' : 'No'}</div>
                                <div>Employees loaded: {employees.length}</div>
                                <div>Selected: {selectedEmployee}</div>
                                {employees.length > 0 && (
                                    <div>First employee: {employees[0]?.name} (ID: {employees[0]?.id})</div>
                                )}
                            </div>
                        </div>

                        {/* Current Status */}
                        {selectedEmployee && currentStatus && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-blue-900 mb-2">الحالة الحالية</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>التاريخ:</span>
                                        <span className="font-medium">{currentStatus.date}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>الحالة:</span>
                                        <Badge variant={currentStatus.status === 'checked_in' ? 'default' : 'outline'}>
                                            {currentStatus.status === 'checked_in' ? 'في العمل' : 'غير مسجل'}
                                        </Badge>
                                    </div>
                                    {currentStatus.check_in_time && (
                                        <div className="flex items-center justify-between">
                                            <span>وقت الدخول:</span>
                                            <span className="font-medium">{currentStatus.check_in_time}</span>
                                        </div>
                                    )}
                                    {currentStatus.check_out_time && (
                                        <div className="flex items-center justify-between">
                                            <span>وقت الخروج:</span>
                                            <span className="font-medium">{currentStatus.check_out_time}</span>
                                        </div>
                                    )}
                                    {currentStatus.total_hours && (
                                        <div className="flex items-center justify-between">
                                            <span>إجمالي الساعات:</span>
                                            <span className="font-medium">{currentStatus.total_hours} ساعة</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Location Information */}
                        <div className="space-y-2">
                            <Label>موقع العمل</Label>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>الإحداثيات: {simulatedLocation?.latitude?.toFixed(6) || '0.000000'}, {simulatedLocation?.longitude?.toFixed(6) || '0.000000'}</span>
                                </div>
                                <div className="text-sm font-medium">{simulatedLocation?.name || 'موقع غير محدد'}</div>

                                {/* Branch Information */}
                                {selectedEmployee && employees.find(emp => emp.id.toString() === selectedEmployee)?.branch && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">الفرع:</span> {employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.name}
                                        </div>
                                        {employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.latitude &&
                                            employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.longitude && (
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">المسافة من الفرع:</span> {
                                                        formatDistance(calculateDistance(
                                                            simulatedLocation.latitude,
                                                            simulatedLocation.longitude,
                                                            employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.latitude!,
                                                            employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.longitude!
                                                        ))
                                                    }
                                                </div>
                                            )}
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={simulateLocation}
                                    className="mt-2"
                                >
                                    تغيير الموقع
                                </Button>
                            </div>
                        </div>

                        {/* Custom Location Name */}
                        <div className="space-y-2">
                            <Label htmlFor="location_name">اسم الموقع (اختياري)</Label>
                            <Input
                                id="location_name"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                placeholder="أدخل اسم الموقع المخصص"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="أضف ملاحظات إضافية..."
                                rows={2}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {currentStatus?.can_check_in && (
                                <Button
                                    onClick={handleCheckIn}
                                    disabled={isCheckingIn || isCheckingOut}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {isCheckingIn ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            جاري تسجيل الدخول...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            تسجيل الدخول
                                        </>
                                    )}
                                </Button>
                            )}

                            {currentStatus?.can_check_out && (
                                <Button
                                    onClick={handleCheckOut}
                                    disabled={isCheckingIn || isCheckingOut}
                                    className="w-full bg-red-600 hover:bg-red-700"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            جاري تسجيل الخروج...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            تسجيل الخروج
                                        </>
                                    )}
                                </Button>
                            )}

                            {!currentStatus?.can_check_in && !currentStatus?.can_check_out && currentStatus && (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    {currentStatus.status === 'checked_out'
                                        ? 'تم تسجيل الخروج لهذا اليوم'
                                        : 'لا يمكن تنفيذ أي إجراء حالياً'}
                                </div>
                            )}
                        </div>

                        {/* Photo Simulation */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                            <div className="text-center">
                                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    في التطبيق الحقيقي، سيتم التقاط صورة للموظف
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    (غير متاح في المحاكي)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isCheckingIn || isCheckingOut}>
                        إغلاق
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 