import React, { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Building2, Hash, FileText } from "lucide-react"
import { hrDepartmentsAPI } from "@/lib/api"
import { toast } from "sonner"
import DepartmentModal from "@/components/DepartmentModal"
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

interface Department {
    id: number
    name: string
    code: string
    description?: string
    is_active: boolean
    employees_count?: number
    created_at: string
    updated_at: string
}

export default function Departments() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPaginationLoading, setIsPaginationLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; departmentId: number | null }>({ isOpen: false, departmentId: null })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(15)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        loadDepartments(1, false)
    }, [searchTerm, perPage])

    // Ensure currentPage is valid when totalPages changes
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [totalPages, currentPage])

    const handlePageChange = async (page: number) => {
        setCurrentPage(page)
        await loadDepartments(page, true)
    }

    const handlePerPageChange = async (newPerPage: number) => {
        setPerPage(newPerPage)
        setCurrentPage(1)
        await loadDepartments(1, true)
    }

    const loadDepartments = async (page = currentPage, isPagination = false) => {
        try {
            if (isPagination) {
                setIsPaginationLoading(true)
            } else {
                setIsLoading(true)
            }

            const response = await hrDepartmentsAPI.getPaginated({
                search: searchTerm,
                page: page,
                per_page: perPage
            })

            if (response.status === 'success') {
                setDepartments(response.departments || [])
                setCurrentPage(response.pagination?.current_page || 1)
                setTotalPages(response.pagination?.last_page || 1)
                setTotal(response.pagination?.total || 0)
            }
        } catch (error) {
            toast.error('فشل في تحميل بيانات الأقسام')
        } finally {
            if (isPagination) {
                setIsPaginationLoading(false)
            } else {
                setIsLoading(false)
            }
        }
    }

    const handleAddDepartment = () => {
        setSelectedDepartment(null)
        setIsModalOpen(true)
    }

    const handleEditDepartment = (department: Department) => {
        setSelectedDepartment(department)
        setIsModalOpen(true)
    }

    const handleDeleteDepartment = (departmentId: number) => {
        setDeleteDialog({ isOpen: true, departmentId })
    }

    const confirmDelete = async () => {
        if (!deleteDialog.departmentId) return

        try {
            await hrDepartmentsAPI.delete(deleteDialog.departmentId.toString())
            toast.success('تم حذف القسم بنجاح')

            // If we're on the last page and it becomes empty, go to previous page
            if (departments.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1)
                loadDepartments(currentPage - 1, false)
            } else {
                loadDepartments(currentPage, false)
            }
        } catch (error: any) {
            if (error.response?.data?.msg) {
                toast.error(error.response.data.msg)
            } else {
                toast.error('فشل في حذف القسم')
            }
        } finally {
            setDeleteDialog({ isOpen: false, departmentId: null })
        }
    }

    const handleModalSuccess = () => {
        setCurrentPage(1)
        loadDepartments(1, false)
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
                        <h1 className="text-2xl font-bold text-foreground">إدارة الأقسام</h1>
                        <p className="text-muted-foreground">إدارة أقسام الشركة والموظفين</p>
                    </div>
                    <Button onClick={handleAddDepartment} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة قسم جديد
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="البحث في الأقسام..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setCurrentPage(1)
                            loadDepartments(1, false)
                        }}
                        disabled={isPaginationLoading}
                    >
                        بحث
                    </Button>
                </div>

                {/* Departments Grid */}
                {departments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((department) => (
                            <Card key={department.id} className="gradient-card shadow-soft border-border/50 transition-smooth hover:shadow-medium">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Building2 className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">{department.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    {department.code}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(department.is_active)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        {department.description && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span className="text-muted-foreground line-clamp-2">{department.description}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">عدد الموظفين:</span>
                                            <Badge variant="outline">{department.employees_count || 0}</Badge>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditDepartment(department)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteDepartment(department.id)}
                                            disabled={department.employees_count && department.employees_count > 0}
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
                            {searchTerm ? 'لا توجد نتائج للبحث المحدد' : 'لا يوجد أقسام حالياً'}
                        </div>
                        {searchTerm && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('')
                                    setCurrentPage(1)
                                    loadDepartments(1)
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

                {/* Department Modal */}
                <DepartmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    department={selectedDepartment}
                    onSuccess={handleModalSuccess}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                                هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.
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