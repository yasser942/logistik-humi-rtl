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
  Filter
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
}

// Helper function to safely format coordinates
const formatCoordinate = (coord: number | null | undefined): string => {
  if (coord === null || coord === undefined || typeof coord !== 'number') {
    return '0.000000'
  }
  return coord.toFixed(6)
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
    loadAttendances(1, false)
    loadEmployees()
    loadStatistics()
  }, [searchTerm, selectedEmployee, dateFrom, dateTo, statusFilter, perPage])

  // Ensure currentPage is valid when totalPages changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    await loadAttendances(page, true)
  }

  const handlePerPageChange = async (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
    await loadAttendances(1, true)
  }

  const loadAttendances = async (page = currentPage, isPagination = false) => {
    try {
      if (isPagination) {
        setIsPaginationLoading(true)
      } else {
        setIsLoading(true)
      }

      const params: any = {
        search: searchTerm,
        page: page,
        per_page: perPage
      }

      if (selectedEmployee) params.employee_id = selectedEmployee
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (statusFilter) params.status = statusFilter

      const response = await hrAttendanceAPI.getAll(params)

      if (response.status === 'success') {
        setAttendances(response.attendances || [])
        setCurrentPage(response.pagination?.current_page || 1)
        setTotalPages(response.pagination?.last_page || 1)
        setTotal(response.pagination?.total || 0)
      }
    } catch (error) {
      toast.error('فشل في تحميل بيانات الحضور')
    } finally {
      if (isPagination) {
        setIsPaginationLoading(false)
      } else {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">نظام الحضور والانصراف</h1>
            <p className="text-muted-foreground">إدارة حضور الموظفين وتتبع أوقات العمل</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsMobileSimulatorOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              محاكاة التطبيق
            </Button>
            <Button onClick={handleAddAttendance} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة سجل حضور
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الأيام</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_days}</div>
            </CardContent>
          </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_employees}</div>
            </CardContent>
          </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي ساعات العمل</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total_hours}</div>
            </CardContent>
          </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط ساعات العمل</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.average_hours}</div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              فلاتر البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <Input
                  placeholder="البحث في الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الموظف</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 bg-background"
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
                <label className="text-sm font-medium">من تاريخ</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">إلى تاريخ</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={clearFilters} variant="outline">
                مسح الفلاتر
              </Button>
              <Button onClick={() => loadAttendances(1, false)}>
                تطبيق الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">قائمة الحضور</TabsTrigger>
            <TabsTrigger value="mobile">محاكاة التطبيق</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {attendances.length > 0 ? (
            <div className="space-y-4">
                {attendances.map((attendance) => (
                  <Card key={attendance.id} className="gradient-card shadow-soft border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{attendance.employee.name}</h3>
                              {getAttendanceStatus(attendance)}
                              {getStatusBadge(attendance.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {attendance.date}
                              </span>
                              {attendance.employee.department && (
                                <span>{attendance.employee.department.name}</span>
                              )}
                              {attendance.employee.position && (
                                <span>{attendance.employee.position.title}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">تسجيل الدخول:</span>
                            <span className="mr-2 font-medium">
                              {attendance.check_in_time || 'لم يسجل'}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">تسجيل الخروج:</span>
                            <span className="mr-2 font-medium">
                              {attendance.check_out_time || 'لم يسجل'}
                            </span>
                          </div>
                          {attendance.total_hours && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">إجمالي الساعات:</span>
                              <span className="mr-2 font-medium text-primary">
                                {attendance.total_hours} ساعة
                              </span>
                            </div>
                          )}
                    </div>
                  </div>
                  
                      {/* Location and Notes */}
                      {(attendance.latitude || attendance.notes) && (
                        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                          {attendance.latitude && attendance.longitude && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {attendance.location?.name || 'موقع محدد'}
                                ({formatCoordinate(attendance.latitude)}, {formatCoordinate(attendance.longitude)})
                              </span>
                            </div>
                          )}
                          {attendance.notes && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">ملاحظات:</span> {attendance.notes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAttendance(attendance)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAttendance(attendance.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                        disabled={currentPage <= 1 || isPaginationLoading}
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
                        disabled={currentPage >= totalPages || isPaginationLoading}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
            </div>
            )}
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  محاكاة تطبيق الهاتف المحمول
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  اختبر وظائف التطبيق المحمول للحضور والانصراف
                </p>
                <Button
                  onClick={() => setIsMobileSimulatorOpen(true)}
                  className="w-full"
                >
                  فتح محاكي التطبيق
                </Button>
          </CardContent>
        </Card>
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