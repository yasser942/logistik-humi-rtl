import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle, XCircle, Calendar, Users } from "lucide-react"

const todayAttendance = [
  {
    id: 1,
    name: "أحمد محمد",
    clockIn: "08:00",
    clockOut: null,
    status: "present",
    department: "العمليات",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 2,
    name: "سارة علي",
    clockIn: "08:15",
    clockOut: null,
    status: "present",
    department: "الشحن",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 3,
    name: "محمد حسن",
    clockIn: null,
    clockOut: null,
    status: "absent",
    department: "التوصيل",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 4,
    name: "فاطمة محمود",
    clockIn: "09:30",
    clockOut: null,
    status: "late",
    department: "المالية",
    avatar: "/api/placeholder/32/32"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "present":
      return <Badge className="bg-green-600 text-white">حاضر</Badge>
    case "absent":
      return <Badge variant="destructive">غائب</Badge>
    case "late":
      return <Badge className="bg-orange-600 text-white">متأخر</Badge>
    default:
      return <Badge variant="secondary">غير محدد</Badge>
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "absent":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "late":
      return <Clock className="h-4 w-4 text-orange-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

export default function Attendance() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الحضور والانصراف</h1>
            <p className="text-muted-foreground">متابعة حضور الموظفين اليومي</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="ml-2 h-4 w-4" />
              عرض التقويم
            </Button>
            <Button>
              <Clock className="ml-2 h-4 w-4" />
              تسجيل حضور
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">234</p>
                  <p className="text-sm text-muted-foreground">حاضر</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">13</p>
                  <p className="text-sm text-muted-foreground">غائب</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                  <p className="text-sm text-muted-foreground">متأخر</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">95%</p>
                  <p className="text-sm text-muted-foreground">نسبة الحضور</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance */}
        <Card className="gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              حضور اليوم - {new Date().toLocaleDateString('ar-EG')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAttendance.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 transition-smooth hover:shadow-soft">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{employee.name}</h4>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">دخول</p>
                      <p className="font-mono text-sm font-medium">
                        {employee.clockIn || "--:--"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">خروج</p>
                      <p className="font-mono text-sm font-medium">
                        {employee.clockOut || "--:--"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(employee.status)}
                      {getStatusBadge(employee.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}