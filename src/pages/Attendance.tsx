import React, { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  Calendar,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Download,
  Filter,
  Navigation,
  Home,
  Building2,
  AlertTriangle
} from "lucide-react"
import { hrAttendanceAPI, hrEmployeesAPI } from "@/lib/api"
import { toast } from "sonner"
import AttendanceModal from "@/components/AttendanceModal"
import MobileAttendanceSimulator from "@/components/MobileAttendanceSimulator"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Attendance {
  id: number
  employee_id: number
  date: string
  check_in_time: string
  check_out_time: string
  total_hours: number
  status: string
  notes: string
  latitude: number | null
  longitude: number | null
  location: any
  employee: {
    id: number
    name: string
    email: string
    department: { id: number; name: string } | null
    position: { id: number; title: string } | null
    branch_id?: number
    branch?: { id: number; name: string }
  }
  is_checked_in: boolean
  is_checked_out: boolean
  work_duration: any
}

interface Employee {
  id: number
  name: string
  email: string
  department: { id: number; name: string } | null
  position: { id: number; title: string } | null
  branch_id?: number
  branch?: { id: number; name: string }
}

// Helper function to safely format coordinates
const formatCoordinate = (coord: number | null | undefined): string => {
  if (coord === null || coord === undefined || typeof coord !== 'number') {
    return '0.000000'
  }
  return coord.toFixed(6)
}

// Helper function to format distance
const formatDistance = (distance: number | null | undefined): string => {
  if (distance === null || distance === undefined || typeof distance !== 'number') {
    return 'غير محدد'
  }
  if (distance < 1000) {
    return `${Math.round(distance)} متر`
  } else {
    return `${(distance / 1000).toFixed(1)} كم`
  }
}

// Helper function to format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'غير محدد'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'تاريخ غير صحيح'

    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'تاريخ غير صحيح'
  }
}

// Helper function to format time
const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return 'لم يسجل'

  try {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    let time = timeString
    if (timeString.includes('T')) {
      // If it's a full datetime string
      const date = new Date(timeString)
      if (isNaN(date.getTime())) return 'وقت غير صحيح'
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      // If it's just a time string like "09:30:00" or "09:30"
      const [hours, minutes] = timeString.split(':')
      if (hours && minutes) {
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
      }
      return 'وقت غير صحيح'
    }
  } catch (error) {
    return 'وقت غير صحيح'
  }
}

// Helper function to get location status badge
const getLocationStatusBadge = (status: string, isAtAssignedBranch: boolean) => {
  if (status === 'valid' && isAtAssignedBranch) {
    return <Badge className="bg-green-600">في الفرع المخصص</Badge>
  } else if (status === 'outside_radius' || !isAtAssignedBranch) {
    return <Badge className="bg-orange-600">خارج الفرع المخصص</Badge>
  } else if (status === 'unknown') {
    return <Badge variant="outline">غير محدد</Badge>
  }
  return <Badge variant="outline">غير محدد</Badge>
}

// Helper function to render location information
const renderLocationInfo = (attendance: Attendance) => {
  if (!attendance.location) return null

  const location = attendance.location
  const hasCheckInLocation = location.name && location.address
  const hasCheckOutLocation = location.checkout_name && location.checkout_address

  return (
    <div className="space-y-4" style={{ direction: 'rtl' }}>
      {/* Check-in Location */}
      {hasCheckInLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3" style={{ direction: 'rtl' }}>
          <div className="flex items-center gap-3 mb-3" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
            <div style={{ textAlign: 'right' }}>
              <h5 className="text-sm font-semibold text-green-800">موقع تسجيل الدخول</h5>
              <p className="text-xs text-green-600">Check-in Location</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>

          <div className="space-y-2 mr-8" style={{ textAlign: 'right' }}>
            {/* Address */}
            <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
              <span className="text-xs text-green-700">{location.address}</span>
              <MapPin className="h-3 w-3 text-green-600" />
            </div>

            {/* Coordinates */}
            {attendance.latitude && attendance.longitude && (
              <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                <span className="text-xs text-green-700 font-mono">
                  {formatCoordinate(attendance.latitude)}, {formatCoordinate(attendance.longitude)}
                </span>
                <Navigation className="h-3 w-3 text-green-600" />
              </div>
            )}

            {/* Device Info */}
            {location.device_info && (
              <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                <span className="text-xs text-green-700">{location.device_info}</span>
                <Smartphone className="h-3 w-3 text-green-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check-out Location */}
      {hasCheckOutLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" style={{ direction: 'rtl' }}>
          <div className="flex items-center gap-3 mb-3" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
            <div style={{ textAlign: 'right' }}>
              <h5 className="text-sm font-semibold text-blue-800">موقع تسجيل الخروج</h5>
              <p className="text-xs text-blue-600">Check-out Location</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <div className="space-y-2 mr-8" style={{ textAlign: 'right' }}>
            {/* Address and Branch */}
            <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
              <span className="text-xs text-blue-700">{location.checkout_address}</span>
              {location.checkout_branch_name && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {location.checkout_branch_name}
                </span>
              )}
              <MapPin className="h-3 w-3 text-blue-600" />
            </div>

            {/* Location Status */}
            <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end' }}>
              <div className="flex items-center gap-2" style={{ flexDirection: 'row-reverse' }}>
                {getLocationStatusBadge(
                  location.checkout_location_status || 'unknown',
                  location.checkout_is_at_assigned_branch || false
                )}

                {/* Warning if checked out outside assigned branch */}
                {attendance.employee.branch_id && !location.checkout_is_at_assigned_branch && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full border border-orange-200" style={{ flexDirection: 'row-reverse' }}>
                    <span>خارج الفرع المخصص</span>
                    <AlertTriangle className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Distance Information */}
            {location.checkout_distance_from_branch && (
              <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                <span className="text-xs text-blue-700">
                  المسافة: {formatDistance(location.checkout_distance_from_branch)}
                </span>
                <Navigation className="h-3 w-3 text-blue-600" />
              </div>
            )}

            {/* Coordinates */}
            {location.checkout_latitude && location.checkout_longitude && (
              <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                <span className="text-xs text-blue-700 font-mono">
                  {formatCoordinate(location.checkout_latitude)}, {formatCoordinate(location.checkout_longitude)}
                </span>
                <Navigation className="h-3 w-3 text-blue-600" />
              </div>
            )}

            {/* Device Info */}
            {location.device_info && (
              <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                <span className="text-xs text-blue-700">{location.device_info}</span>
                <Smartphone className="h-3 w-3 text-blue-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branch Assignment Info */}
      {attendance.employee.branch && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3" style={{ direction: 'rtl' }}>
          <div className="flex items-center gap-3 mb-3" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
            <div style={{ textAlign: 'right' }}>
              <h5 className="text-sm font-semibold text-purple-800">الفرع المخصص</h5>
              <p className="text-xs text-purple-600">Assigned Branch</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
          </div>

          <div className="mr-8" style={{ textAlign: 'right' }}>
            <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
              <span className="text-xs text-purple-700 font-medium">{attendance.employee.branch.name}</span>
              <Home className="h-3 w-3 text-purple-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Attendance() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; attendanceId: number | null }>({ isOpen: false, attendanceId: null })
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          loadAttendances(1, false),
          loadEmployees(),
          loadStatistics()
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, []) // Empty dependency array for initial load only

  // Separate useEffect for filters that should trigger reload
  useEffect(() => {
    if (attendances.length > 0) { // Only reload if we already have data
      loadAttendances(1, false)
    }
  }, [searchTerm, selectedEmployee, dateFrom, dateTo, statusFilter, perPage])

  // Ensure currentPage is valid when totalPages changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handlePageChange = async (page: number) => {
    setIsPaginationLoading(true)
    setCurrentPage(page)
    await loadAttendances(page, false)
    setIsPaginationLoading(false)
  }

  const handlePerPageChange = async (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
    await loadAttendances(1, true)
  }

  const loadAttendances = async (page: number = 1, showLoading: boolean = true) => {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('hr_token')
      if (!token) {
        console.error('No authentication token found')
        toast.error('يرجى تسجيل الدخول أولاً')
        setAttendances([])
        setTotalPages(1)
        return
      }

      // Test API connectivity first
      try {
        const healthResponse = await fetch('/api/hr/health')
        console.log('Health check response:', healthResponse.status)
      } catch (healthError) {
        console.error('Health check failed:', healthError)
        toast.error('لا يمكن الاتصال بالخادم، يرجى التحقق من الاتصال')
        setAttendances([])
        setTotalPages(1)
        return
      }

      const params: any = {
        page,
        per_page: perPage
      }

      if (searchTerm) params.search = searchTerm
      if (selectedEmployee) params.employee_id = selectedEmployee
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (statusFilter) params.status = statusFilter

      console.log('Loading attendances with params:', params)
      console.log('Using token:', token ? 'Token exists' : 'No token')

      const response = await hrAttendanceAPI.getAll(params)
      console.log('API Response:', response)

      // Debug: Log the first attendance record to see date formats
      if (response.attendances && response.attendances.length > 0) {
        console.log('Sample attendance record:', response.attendances[0])
        console.log('Date format:', response.attendances[0].date)
        console.log('Check-in time format:', response.attendances[0].check_in_time)
        console.log('Check-out time format:', response.attendances[0].check_out_time)
      } else {
        console.log('No attendances found in response')
      }

      setAttendances(response.attendances || [])
      setTotalPages(response.pagination?.last_page || 1)
      setCurrentPage(page)
    } catch (error: any) {
      console.error('Error loading attendances:', error)
      console.error('Error details:', error.response?.data)
      console.error('Error status:', error.response?.status)

      if (error.response?.status === 401) {
        toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
      } else if (error.response?.status === 403) {
        toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة')
      } else {
        toast.error(error.response?.data?.msg || 'فشل في تحميل سجلات الحضور')
      }

      // Set empty data to prevent infinite loading
      setAttendances([])
      setTotalPages(1)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

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

  const loadStatistics = async () => {
    try {
      const params: any = {}
      if (selectedEmployee) params.employee_id = selectedEmployee
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const response = await hrAttendanceAPI.getStatistics(params)
      if (response.status === 'success') {
        setStatistics(response.statistics)
      }
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }

  const handleAddAttendance = () => {
    setSelectedAttendance(null)
    setIsModalOpen(true)
  }

  const handleEditAttendance = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setIsModalOpen(true)
  }

  const handleDeleteAttendance = (attendanceId: number) => {
    setDeleteDialog({ isOpen: true, attendanceId })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.attendanceId) return

    try {
      await hrAttendanceAPI.delete(deleteDialog.attendanceId.toString())
      toast.success('تم حذف سجل الحضور بنجاح')

      if (attendances.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
        loadAttendances(currentPage - 1, false)
      } else {
        loadAttendances(currentPage, false)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'فشل في حذف سجل الحضور')
    } finally {
      setDeleteDialog({ isOpen: false, attendanceId: null })
    }
  }

  const handleModalSuccess = () => {
    setCurrentPage(1)
    loadAttendances(1, false)
    loadStatistics()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-600">حاضر</Badge>
      case 'absent':
        return <Badge variant="outline" className="border-red-500 text-red-600">غائب</Badge>
      case 'late':
        return <Badge className="bg-yellow-600">متأخر</Badge>
      case 'leave':
        return <Badge className="bg-blue-600">إجازة</Badge>
      case 'half_day':
        return <Badge className="bg-orange-600">نصف يوم</Badge>
      default:
        return <Badge variant="outline">غير محدد</Badge>
    }
  }

  const getAttendanceStatus = (attendance: Attendance) => {
    if (attendance.is_checked_in && !attendance.is_checked_out) {
      return <Badge className="bg-blue-600">في العمل</Badge>
    } else if (attendance.is_checked_out) {
      return <Badge className="bg-gray-600">انتهى العمل</Badge>
    } else {
      return <Badge variant="outline">لم يسجل حضور</Badge>
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedEmployee('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mr-3 text-lg">جاري التحميل...</span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border border-primary/20">
          <div className="text-right">
            <h1 className="text-3xl font-bold text-foreground mb-2">نظام الحضور والانصراف</h1>
            <p className="text-muted-foreground text-lg">إدارة حضور الموظفين وتتبع أوقات العمل مع مراقبة المواقع</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                تتبع المواقع
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                إدارة الوقت
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                إدارة الموظفين
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsMobileSimulatorOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 border-2 hover:bg-muted/50"
            >
              <Smartphone className="h-5 w-5" />
              محاكاة التطبيق
            </Button>
            <Button
              onClick={handleAddAttendance}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              إضافة سجل حضور
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الأيام</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{statistics.total_days}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Days</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statistics.total_employees}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Employees</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي ساعات العمل</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{statistics.total_hours}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Hours</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط ساعات العمل</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{statistics.average_hours}</div>
                <p className="text-xs text-muted-foreground mt-1">Average Hours</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Location Statistics */}
        {attendances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">تسجيلات مع مواقع</CardTitle>
                <div className="p-2 bg-green-200 rounded-lg">
                  <MapPin className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {attendances.filter(a => a.location).length}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  من أصل {attendances.length} تسجيل
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">خروج من الفرع المخصص</CardTitle>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {attendances.filter(a =>
                    a.location?.checkout_is_at_assigned_branch === true
                  ).length}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  تسجيل خروج صحيح
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">خروج خارج الفرع</CardTitle>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {attendances.filter(a =>
                    a.location?.checkout_is_at_assigned_branch === false
                  ).length}
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  تسجيل خروج من موقع آخر
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="shadow-md border-2 border-border/20">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-border/30">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              فلاتر البحث
              <span className="text-sm text-muted-foreground font-normal">Search Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  البحث
                </label>
                <Input
                  placeholder="البحث في الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  الموظف
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full border-2 border-border rounded-md px-3 py-2 bg-background focus:border-primary transition-colors"
                >
                  <option value="">جميع الموظفين</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  من تاريخ
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border-2 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  إلى تاريخ
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border-2 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  حالة الموقع
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-border rounded-md px-3 py-2 bg-background focus:border-primary transition-colors"
                >
                  <option value="">جميع الحالات</option>
                  <option value="with_location">مع بيانات موقع</option>
                  <option value="at_assigned_branch">في الفرع المخصص</option>
                  <option value="outside_branch">خارج الفرع المخصص</option>
                  <option value="no_location">بدون بيانات موقع</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2 px-6 py-2 border-2 hover:bg-muted/50"
              >
                <XCircle className="h-4 w-4" />
                مسح الفلاتر
              </Button>
              <Button
                onClick={() => loadAttendances(1, false)}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90"
              >
                <Filter className="h-4 w-4" />
                تطبيق الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="list">قائمة الحضور</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filter Summary */}
            {(searchTerm || selectedEmployee || dateFrom || dateTo || statusFilter) && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-sm text-blue-700 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Filter className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-bold text-lg">الفلاتر المطبقة</span>
                    <span className="text-blue-500">Applied Filters</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mr-12">
                    {searchTerm && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 px-3 py-1">
                        <Search className="h-3 w-3 mr-1" />
                        بحث: {searchTerm}
                      </Badge>
                    )}
                    {selectedEmployee && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 px-3 py-1">
                        <User className="h-3 w-3 mr-1" />
                        موظف: {employees.find(e => e.id.toString() === selectedEmployee)?.name || selectedEmployee}
                      </Badge>
                    )}
                    {dateFrom && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 px-3 py-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        من: {dateFrom}
                      </Badge>
                    )}
                    {dateTo && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 px-3 py-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        إلى: {dateTo}
                      </Badge>
                    )}
                    {statusFilter && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {statusFilter === 'with_location' && 'مع بيانات موقع'}
                        {statusFilter === 'at_assigned_branch' && 'في الفرع المخصص'}
                        {statusFilter === 'outside_branch' && 'خارج الفرع المخصص'}
                        {statusFilter === 'no_location' && 'بدون بيانات موقع'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {attendances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ direction: 'rtl' }}>
                {attendances.map((attendance, index) => (
                  <Card key={attendance.id} className="gradient-card shadow-soft border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden" style={{
                    direction: 'rtl',
                    textAlign: 'right',
                    unicodeBidi: 'bidi-override'
                  }}>
                    {/* Card Header - Employee Info and Status */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b border-border/30" style={{ direction: 'rtl' }}>
                      <div className="flex items-center justify-between mb-3" style={{ flexDirection: 'row-reverse' }}>
                        {/* Employee Avatar and Name */}
                        <div className="flex items-center gap-3" style={{ flexDirection: 'row-reverse' }}>
                          <div className="p-3 bg-primary/20 rounded-full border-2 border-primary/30">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div style={{ textAlign: 'right', flex: 1 }}>
                            <h3 className="font-bold text-xl text-foreground" style={{ textAlign: 'right' }}>{attendance.employee.name}</h3>
                            <div className="flex items-center gap-2 mt-1" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                              {getAttendanceStatus(attendance)}
                              {getStatusBadge(attendance.status)}
                            </div>
                          </div>
                        </div>

                        {/* Location Warning Badge */}
                        {attendance.location?.checkout_is_at_assigned_branch === false && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-full border border-orange-200 font-medium" style={{ flexDirection: 'row-reverse' }}>
                            <span>خارج الفرع</span>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Employee Meta Information */}
                      <div className="flex flex-wrap gap-2" style={{ justifyContent: 'flex-end' }}>
                        {attendance.employee.department && (
                          <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm" style={{ flexDirection: 'row-reverse' }}>
                            <span className="font-medium">{attendance.employee.department.name}</span>
                            <Building2 className="h-3 w-3" />
                          </span>
                        )}
                        {attendance.employee.position && (
                          <span className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-green-700 text-sm" style={{ flexDirection: 'row-reverse' }}>
                            <span className="font-medium">{attendance.employee.position.title}</span>
                            <User className="h-3 w-3" />
                          </span>
                        )}
                        {attendance.employee.branch && (
                          <span className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-purple-700 text-sm" style={{ flexDirection: 'row-reverse' }}>
                            <span className="font-medium">{attendance.employee.branch.name}</span>
                            <Home className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-0" style={{ direction: 'rtl' }}>
                      {/* Date and Time Section */}
                      <div className="p-4 bg-muted/30" style={{ direction: 'rtl' }}>
                        <div className="flex items-center gap-2 mb-3" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{formatDate(attendance.date)}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Check-in Time */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2" style={{ flexDirection: 'row-reverse' }}>
                              <span className="text-sm font-medium text-green-700">تسجيل الدخول</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="text-lg font-bold text-green-800">
                              {formatTime(attendance.check_in_time)}
                            </div>
                          </div>

                          {/* Check-out Time */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2" style={{ flexDirection: 'row-reverse' }}>
                              <span className="text-sm font-medium text-blue-700">تسجيل الخروج</span>
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-lg font-bold text-blue-800">
                              {formatTime(attendance.check_out_time)}
                            </div>
                          </div>

                          {/* Total Hours */}
                          <div className="bg-primary/10 border border-primary/200 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2" style={{ flexDirection: 'row-reverse' }}>
                              <span className="text-sm font-medium text-primary">إجمالي الساعات</span>
                              <BarChart3 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-lg font-bold text-primary">
                              {attendance.total_hours ? `${attendance.total_hours} ساعة` : 'غير محدد'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Location Information */}
                      {attendance.location && (
                        <div className="p-4 border-b border-border/30" style={{ direction: 'rtl' }}>
                          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                            <MapPin className="h-5 w-5 text-primary" />
                            معلومات الموقع
                          </h4>
                          {renderLocationInfo(attendance)}
                        </div>
                      )}

                      {/* Notes Section */}
                      {attendance.notes && (
                        <div className="p-4 border-b border-border/30" style={{ direction: 'rtl' }}>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2" style={{ justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-700">ملاحظات</span>
                            </div>
                            <div className="text-sm text-yellow-800" style={{ textAlign: 'right' }}>{attendance.notes}</div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="p-4 bg-muted/20" style={{ direction: 'rtl' }}>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-start', flexDirection: 'row-reverse' }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAttendance(attendance)}
                            className="flex items-center gap-2"
                            style={{ flexDirection: 'row-reverse' }}
                          >
                            <Edit className="h-4 w-4" />
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive flex items-center gap-2"
                            onClick={() => handleDeleteAttendance(attendance.id)}
                            style={{ flexDirection: 'row-reverse' }}
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg">
                  {searchTerm || selectedEmployee || dateFrom || dateTo || statusFilter
                    ? 'لا توجد نتائج للفلاتر المحددة'
                    : 'لا توجد سجلات حضور حالياً'}
                </div>
                {(searchTerm || selectedEmployee || dateFrom || dateTo || statusFilter) && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {total > 0 && totalPages > 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      عرض {((currentPage - 1) * perPage) + 1} إلى {Math.min(currentPage * perPage, total)} من {total} نتيجة
                    </span>
                    <div className="flex items-center gap-2">
                      <span>عرض:</span>
                      <select
                        value={perPage}
                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                        disabled={isPaginationLoading}
                        className="border border-border rounded px-2 py-1 bg-background disabled:opacity-50"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>

                {isPaginationLoading && (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="mr-2 text-sm text-muted-foreground">جاري التحميل...</span>
                  </div>
                )}

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 || isPaginationLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {(() => {
                      if (!totalPages || totalPages <= 1) return null

                      const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages))
                      const pages = new Set<number>()

                      pages.add(validCurrentPage)

                      for (let i = -2; i <= 2; i++) {
                        const pageNum = validCurrentPage + i
                        if (pageNum >= 1 && pageNum <= totalPages) {
                          pages.add(pageNum)
                        }
                      }

                      if (totalPages > 1) {
                        pages.add(1)
                        pages.add(totalPages)
                      }

                      const sortedPages = Array.from(pages).sort((a, b) => a - b)

                      return sortedPages.map((pageNum, index) => {
                        const prevPage = sortedPages[index - 1]
                        const showEllipsis = prevPage && pageNum - prevPage > 1

                        return (
                          <React.Fragment key={`page-${pageNum}`}>
                            {showEllipsis && (
                              <PaginationItem key={`ellipsis-${pageNum}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem key={`item-${pageNum}`}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={pageNum === validCurrentPage}
                                className={isPaginationLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        )
                      })
                    })()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages || isPaginationLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Attendance Modal */}
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          attendance={selectedAttendance}
          onSuccess={handleModalSuccess}
        />

        {/* Mobile Simulator Modal */}
        <MobileAttendanceSimulator
          isOpen={isMobileSimulatorOpen}
          onClose={() => setIsMobileSimulatorOpen(false)}
          onSuccess={handleModalSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف سجل الحضور هذا؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}