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
    Battery,
    Globe
} from "lucide-react"
import LocationMapPicker from "./LocationMapPicker"

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
    const [branchInfo, setBranchInfo] = useState<any>(null)
    const [simulatedLocation, setSimulatedLocation] = useState({
        latitude: 24.7136,
        longitude: 46.6753,
        name: 'الرياض، المملكة العربية السعودية'
    })
    const [showMapPicker, setShowMapPicker] = useState(false)

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (isOpen && employees.length === 0) {
            loadEmployees()
            // Simulate getting current location
            simulateLocation()
        }
    }, [isOpen, employees.length])



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


            if (response.status === 'success') {
                const employeeList = response.employees || []

                setEmployees(employeeList)
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

    const handleLocationSelectFromMap = (location: { latitude: number; longitude: number; name?: string }) => {
        setSimulatedLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name || `موقع محدد (${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`
        })
        setShowMapPicker(false)
        setLocationLoading(false)
    }

    const openMapPicker = () => {
        setShowMapPicker(true)
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
                // Show checkout location information
                const checkoutInfo = response.checkout_info
                let successMessage = 'تم تسجيل الخروج بنجاح!'

                if (checkoutInfo) {
                    if (checkoutInfo.is_at_assigned_branch) {
                        successMessage += `\nالموقع: ${checkoutInfo.branch_name}`
                    } else {
                        successMessage += `\nالموقع: ${checkoutInfo.branch_name} (خارج النطاق المسموح)`
                        if (checkoutInfo.distance_from_branch) {
                            successMessage += `\nالمسافة: ${checkoutInfo.distance_from_branch}`
                        }
                    }
                }

                toast.success(successMessage)
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

    // Fetch branch information for the selected employee
    const fetchBranchInfo = async (employeeId: string) => {
        if (!employeeId) return;

        try {
            const response = await hrAttendanceAPI.getBranchInfo(employeeId);
            setBranchInfo(response.branch_info);
        } catch (error: any) {
            console.error('Error fetching branch info:', error);
            setBranchInfo(null);
        }
    };

    // Handle employee selection change
    const handleEmployeeChange = (employeeId: string) => {
        setSelectedEmployee(employeeId);
        if (employeeId) {
            fetchBranchInfo(employeeId);
        } else {
            setBranchInfo(null);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 bg-white ${isOpen ? 'block' : 'hidden'}`}>
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    <h1 className="text-lg font-semibold">محاكي تطبيق الحضور</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleClose} className="text-white border-white hover:bg-white hover:text-gray-900">
                        إغلاق
                    </Button>
                </div>
            </div>

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
                        <Select value={selectedEmployee} onValueChange={handleEmployeeChange}>
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
                    </div>

                    {/* Branch Information Display */}
                    {branchInfo && (
                        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <h3 className="font-semibold text-blue-800">معلومات الفرع المخصص</h3>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">اسم الفرع:</span>
                                    <span className="font-medium">{branchInfo.branch_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">العنوان:</span>
                                    <span className="font-medium">{branchInfo.branch_address || 'غير محدد'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المدينة:</span>
                                    <span className="font-medium">{branchInfo.city_name || 'غير محدد'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">نصف قطر الحضور:</span>
                                    <span className="font-medium">{branchInfo.check_in_radius_meters} متر</span>
                                </div>
                            </div>

                            {branchInfo.has_coordinates ? (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">إحداثيات الفرع متوفرة</span>
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">
                                        يمكن التحقق من موقعك بدقة
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="flex items-center gap-2 text-yellow-700">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">إحداثيات الفرع غير متوفرة</span>
                                    </div>
                                    <div className="text-xs text-yellow-600 mt-1">
                                        سيتم استخدام الإحداثيات الافتراضية
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <div className="text-xs text-blue-700">
                                    <strong>تعليمات:</strong> يمكنك الحضور فقط من الفرع المخصص لك.
                                    تأكد من أنك ضمن النطاق المحدد ({branchInfo.check_in_radius_meters} متر) من موقع الفرع.
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* Location Simulation */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">موقع العمل</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>الإحداثيات:</span>
                                <span className="font-medium">{simulatedLocation?.latitude?.toFixed(6) || '0.000000'}, {simulatedLocation?.longitude?.toFixed(6) || '0.000000'}</span>
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

                            <div className="flex gap-2 mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openMapPicker}
                                    className="flex-1"
                                >
                                    <Globe className="h-4 w-4 mr-2" />
                                    اختر من الخريطة
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={simulateLocation}
                                    className="flex-1"
                                >
                                    موقع عشوائي
                                </Button>
                            </div>
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
                            <>
                                {/* Checkout Location Status */}
                                {branchInfo && (
                                    <div className="bg-gray-50 p-3 rounded-lg border">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">موقع الخروج:</span>
                                            <span className={`font-medium ${branchInfo.has_coordinates ? 'text-blue-600' : 'text-gray-500'
                                                }`}>
                                                {simulatedLocation.name}
                                            </span>
                                        </div>
                                        {branchInfo.has_coordinates && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                <div className="flex items-center justify-between">
                                                    <span>الفرع المخصص:</span>
                                                    <span>{branchInfo.branch_name}</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span>المسافة:</span>
                                                    <span className="font-medium">
                                                        {(() => {
                                                            // Calculate distance if we have both coordinates
                                                            if (branchInfo.coordinates?.latitude && branchInfo.coordinates?.longitude) {
                                                                const distance = calculateDistance(
                                                                    simulatedLocation.latitude,
                                                                    simulatedLocation.longitude,
                                                                    branchInfo.coordinates.latitude,
                                                                    branchInfo.coordinates.longitude
                                                                );
                                                                return distance < 1000
                                                                    ? `${Math.round(distance)} متر`
                                                                    : `${(distance / 1000).toFixed(1)} كم`;
                                                            }
                                                            return 'غير محدد';
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                            </>
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

            <div className="p-4 border-t bg-gray-50">
                <Button variant="outline" onClick={handleClose} disabled={isCheckingIn || isCheckingOut} className="w-full">
                    إغلاق
                </Button>
            </div>

            {/* Map Picker Modal */}
            {showMapPicker && (
                <LocationMapPicker
                    initialLocation={simulatedLocation}
                    onLocationSelect={handleLocationSelectFromMap}
                    onClose={() => setShowMapPicker(false)}
                    branchLocation={
                        selectedEmployee && employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.latitude
                            ? {
                                latitude: employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.latitude!,
                                longitude: employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.longitude!,
                                name: employees.find(emp => emp.id.toString() === selectedEmployee)?.branch?.name || 'الفرع'
                            }
                            : undefined
                    }
                />
            )}
        </div>
    )
} 