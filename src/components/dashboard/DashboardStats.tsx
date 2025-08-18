import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Truck, AlertCircle, TrendingUp, Calendar } from "lucide-react"

const stats = [
  {
    title: "إجمالي الموظفين",
    value: "247",
    change: "+12 هذا الشهر",
    icon: Users,
    trend: "up",
    color: "text-primary"
  },
  {
    title: "الحضور اليوم", 
    value: "234",
    change: "95% من الموظفين",
    icon: Clock,
    trend: "up",
    color: "text-green-600"
  },
  {
    title: "مناوبات الشحن",
    value: "18",
    change: "6 قيد التنفيذ",
    icon: Truck,
    trend: "stable",
    color: "text-blue-600"
  },
  {
    title: "الإشعارات",
    value: "7",
    change: "تحتاج متابعة",
    icon: AlertCircle,
    trend: "down",
    color: "text-orange-600"
  }
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="gradient-card shadow-soft border-border/50 transition-smooth hover:shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-600" />}
              {stat.trend === "down" && <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />}
              {stat.trend === "stable" && <Calendar className="h-3 w-3 text-blue-600" />}
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}