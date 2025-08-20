import React, { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Mail, Phone, MapPin, Edit, Trash2, Eye } from "lucide-react"
import { hrEmployeesAPI } from "@/lib/api"
import { toast } from "sonner"
import EmployeeModal from "@/components/EmployeeModal"
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

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, employeeId: null })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadEmployees(1, false)
  }, [searchTerm, perPage])

  // Ensure currentPage is valid when totalPages changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    await loadEmployees(page, true)
  }

  const handlePerPageChange = async (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
    await loadEmployees(1, true)
  }

  const loadEmployees = async (page = currentPage, isPagination = false) => {
    try {
      if (isPagination) {
        setIsPaginationLoading(true)
      } else {
        setIsLoading(true)
      }

      const response = await hrEmployeesAPI.getAll({
        search: searchTerm,
        page: page,
        per_page: perPage
      })
      if (response.status === 'success') {
        setEmployees(response.employees || [])
        setCurrentPage(response.pagination?.current_page || 1)
        setTotalPages(response.pagination?.last_page || 1)
        setTotal(response.pagination?.total || 0)
      }
    } catch (error) {
      toast.error('فشل في تحميل بيانات الموظفين')
    } finally {
      if (isPagination) {
        setIsPaginationLoading(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setIsModalOpen(true)
  }

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleDeleteEmployee = (employeeId: number) => {
    setDeleteDialog({ isOpen: true, employeeId })
  }

  const confirmDelete = async () => {
    try {
      await hrEmployeesAPI.delete(deleteDialog.employeeId)
      toast.success('تم حذف الموظف بنجاح')

      // If we're on the last page and it becomes empty, go to previous page
      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
        loadEmployees(currentPage - 1, false)
      } else {
        loadEmployees(currentPage, false)
      }
    } catch (error) {
      toast.error('فشل في حذف الموظف')
    } finally {
      setDeleteDialog({ isOpen: false, employeeId: null })
    }
  }

  const handleModalSuccess = () => {
    setCurrentPage(1)
    loadEmployees(1, false)
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-600">نشط</Badge>
    } else {
      return <Badge variant="outline" className="border-red-500 text-red-600">غير نشط</Badge>
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات الموظفين...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
            <p className="text-muted-foreground">إدارة ومتابعة بيانات الموظفين</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAddEmployee}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف جديد
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="gradient-card shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث عن موظف..."
                  className="pr-10 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1)
                      loadEmployees(1, false)
                    }
                  }}
                />
              </div>
              <Button variant="outline" className="md:w-auto" onClick={() => {
                setCurrentPage(1)
                loadEmployees(1, false)
              }}>
                <Filter className="ml-2 h-4 w-4" />
                بحث
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid */}
        {employees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee: any) => (
              <Card key={employee.id} className="gradient-card shadow-soft border-border/50 transition-smooth hover:shadow-medium">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/api/placeholder/40/40" alt={employee.user?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {employee.user?.name?.split(' ')[0]?.charAt(0) || 'م'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-semibold">{employee.user?.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{employee.position?.title}</p>
                      </div>
                    </div>
                    {getStatusBadge(employee.is_active)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground ltr">{employee.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground ltr">{employee.user?.phone || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{employee.department?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{employee.city?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{employee.branch?.name}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {employee.employment_type === 'full_time' ? 'دوام كامل' :
                        employee.employment_type === 'part_time' ? 'دوام جزئي' :
                          employee.employment_type === 'contract' ? 'عقد مؤقت' : 'متدرب'}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEmployee(employee.id)}
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
              {searchTerm ? 'لا توجد نتائج للبحث المحدد' : 'لا يوجد موظفين حالياً'}
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                  loadEmployees(1)
                }}
                className="mt-4"
              >
                مسح البحث
              </Button>
            )}
          </div>
        )}

        {/* Pagination and Results Info */}
        {total > 0 && totalPages > 1 && (
          <div className="space-y-4">
            {/* Results Info */}
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

            {/* Pagination */}
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

                {/* Generate page numbers with smart logic to avoid duplicates */}
                {(() => {
                  // If only one page or invalid totalPages, don't show pagination
                  if (!totalPages || totalPages <= 1) {
                    return null
                  }

                  // Ensure currentPage is within valid range
                  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages))

                  const pages = new Set<number>()

                  // Always add current page (ensure it's valid)
                  pages.add(validCurrentPage)

                  // Add pages around current page (2 before, 2 after)
                  for (let i = -2; i <= 2; i++) {
                    const pageNum = validCurrentPage + i
                    if (pageNum >= 1 && pageNum <= totalPages) {
                      pages.add(pageNum)
                    }
                  }

                  // Always add first and last page if they're not already included
                  if (totalPages > 1) {
                    pages.add(1)
                    pages.add(totalPages)
                  }

                  // Convert to array and sort
                  const sortedPages = Array.from(pages).sort((a, b) => a - b)

                 
                  // Render pages with ellipsis
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

        {/* Employee Modal */}
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={selectedEmployee}
          onSuccess={handleModalSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.
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