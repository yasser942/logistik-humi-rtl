import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const activities = [
  {
    id: 1,
    user: "سارة أحمد",
    action: "تسجيل حضور",
    time: "منذ 5 دقائق",
    status: "success",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 2,
    user: "محمد علي",
    action: "طلب إجازة",
    time: "منذ 15 دقيقة",
    status: "pending",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 3,
    user: "فاطمة حسن",
    action: "انتهاء مناوبة شحن",
    time: "منذ 30 دقيقة",
    status: "success",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 4,
    user: "أحمد محمود",
    action: "تأخير في الحضور",
    time: "منذ ساعة",
    status: "warning",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 5,
    user: "نور الدين",
    action: "إنجاز توصيل طرود",
    time: "منذ ساعتين",
    status: "success",
    avatar: "/api/placeholder/32/32"
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case "pending":
      return <Clock className="h-4 w-4 text-blue-600" />
    default:
      return <XCircle className="h-4 w-4 text-red-600" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">مكتمل</Badge>
    case "warning":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">تحذير</Badge>
    case "pending":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">قيد الانتظار</Badge>
    default:
      return <Badge variant="destructive">خطأ</Badge>
  }
}

export function RecentActivity() {
  return (
    <Card className="gradient-card shadow-soft border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          النشاطات الأخيرة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-smooth hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {activity.user.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{activity.user}</p>
                <p className="text-xs text-muted-foreground">{activity.action}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(activity.status)}
              <div className="text-left">
                {getStatusBadge(activity.status)}
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}