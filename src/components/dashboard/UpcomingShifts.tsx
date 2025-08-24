import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Truck, Package } from "lucide-react"

const upcomingShifts = [
  {
    id: 1,
    title: "مناوبة شحن صباحية",
    time: "08:00 - 16:00",
    date: "غداً",
    employees: ["أحمد محمد", "سارة علي"],
    type: "shipping",
    status: "scheduled"
  },
  {
    id: 2,
    title: "توصيل طرود المدينة",
    time: "14:00 - 22:00",
    date: "بعد غد",
    employees: ["محمد حسن", "فاطمة أحمد"],
    type: "delivery",
    status: "confirmed"
  },
  {
    id: 3,
    title: "مناوبة ليلية",
    time: "22:00 - 06:00",
    date: "الخميس",
    employees: ["علي محمود"],
    type: "night",
    status: "pending"
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "shipping":
      return <Truck className="h-4 w-4" />
    case "delivery":
      return <Package className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "shipping":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">شحن</Badge>
    case "delivery":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">توصيل</Badge>
    case "night":
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">ليلية</Badge>
    default:
      return <Badge variant="secondary">عادية</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-600">مؤكد</Badge>
    case "pending":
      return <Badge variant="outline" className="border-orange-500 text-orange-600">قيد الانتظار</Badge>
    case "scheduled":
      return <Badge variant="secondary">مجدول</Badge>
    default:
      return <Badge variant="secondary">غير محدد</Badge>
  }
}

export function UpcomingShifts() {
  return (
    <Card className="gradient-card shadow-soft border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          المناوبات القادمة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingShifts.map((shift) => (
          <div key={shift.id} className="p-4 rounded-lg border border-border/50 bg-card/50 transition-smooth hover:shadow-soft">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(shift.type)}
                <h4 className="font-medium text-foreground">{shift.title}</h4>
              </div>
              <div className="flex gap-2">
                {getTypeBadge(shift.type)}
                {getStatusBadge(shift.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{shift.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{shift.time}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">الموظفين المكلفين:</p>
              <div className="flex flex-wrap gap-1">
                {shift.employees.map((employee, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {employee}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}