import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Mail, Phone, MapPin } from "lucide-react"

const employees = [
  {
    id: 1,
    name: "أحمد محمد السيد",
    position: "مدير العمليات",
    department: "العمليات",
    email: "ahmed.mohamed@company.com",
    phone: "+966 12 345 6789",
    location: "الرياض",
    status: "active",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    name: "سارة علي أحمد",
    position: "منسقة الشحن",
    department: "الشحن",
    email: "sara.ali@company.com", 
    phone: "+966 12 345 6790",
    location: "جدة",
    status: "active",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    name: "محمد حسن علي",
    position: "سائق توصيل",
    department: "التوصيل",
    email: "mohamed.hassan@company.com",
    phone: "+966 12 345 6791", 
    location: "الدمام",
    status: "on-leave",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 4,
    name: "فاطمة محمود",
    position: "محاسبة المرتبات",
    department: "المالية",
    email: "fatima.mahmoud@company.com",
    phone: "+966 12 345 6792",
    location: "الرياض", 
    status: "active",
    avatar: "/api/placeholder/40/40"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-600">نشط</Badge>
    case "on-leave":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">في إجازة</Badge>
    case "inactive":
      return <Badge variant="outline" className="border-red-500 text-red-600">غير نشط</Badge>
    default:
      return <Badge variant="secondary">غير محدد</Badge>
  }
}

export default function Employees() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
            <p className="text-muted-foreground">إدارة ومتابعة بيانات الموظفين</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
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
                />
              </div>
              <Button variant="outline" className="md:w-auto">
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="gradient-card shadow-soft border-border/50 transition-smooth hover:shadow-medium">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee.name.split(' ')[0].charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">{employee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  {getStatusBadge(employee.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground ltr">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground ltr">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{employee.location}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <Badge variant="outline" className="text-xs">
                    {employee.department}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}