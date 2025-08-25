import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  Bell,
  FileText,
  Settings,
  Truck,
  Package,
  LogOut,
  MapPin,
  Target
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon: any
  external?: boolean
}

const mainItems: NavItem[] = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "إدارة الموظفين", url: "/employees", icon: Users },
  { title: "إدارة الأقسام", url: "/departments", icon: Building2 },
  { title: "إدارة المناصب", url: "/positions", icon: Briefcase },
  { title: "الحضور والانصراف", url: "/attendance", icon: Clock },
  { title: "جدولة المناوبات", url: "/shifts", icon: Calendar },
  { title: "تتبع المواقع", url: "/location-tracking", icon: MapPin },
  { title: "إعدادات التتبع", url: "/location-settings", icon: Target },
]

const logisticsItems: NavItem[] = [
  { title: "جدولة الشحن", url: "/cargo-schedule", icon: Truck },
  { title: "إدارة الطرود", url: "/packages", icon: Package },
]

const businessItems: NavItem[] = [
  { title: "المرتبات", url: "/payroll", icon: DollarSign },
  { title: "التقارير", url: "/reports", icon: FileText },
  { title: "الإشعارات", url: "/notifications", icon: Bell },
  { title: "إعدادات الموارد البشرية", url: "", icon: Settings, external: true },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { logout } = useAuth()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground hover:text-sidebar-accent-foreground"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon" side="right">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-end space-x-reverse-2 space-x-2">
          <div className="w-16 h-16 flex items-center justify-center">
            <img src="/img2.png" alt="شركة الفاتح" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="text-right">
              <h2 className="text-lg font-bold text-sidebar-primary">شركة الفاتح</h2>
              <p className="text-xs text-sidebar-foreground opacity-70">نظام إدارة الموارد البشرية</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4 sidebar-content">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium pr-4 pl-3 mb-2 text-right flex justify-end">
            {!collapsed && "القوائم الرئيسية"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavCls}
                    >
                      {!collapsed && <span className="text-right flex-1">{item.title}</span>}
                      <item.icon className="mr-2 h-4 w-4" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium pr-4 pl-3 mb-2 text-right flex justify-end">
            {!collapsed && "العمليات اللوجستية"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {logisticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavCls}
                    >
                      {!collapsed && <span className="text-right flex-1">{item.title}</span>}
                      <item.icon className="mr-2 h-4 w-4" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium pr-4 pl-3 mb-2 text-right flex justify-end">
            {!collapsed && "الإدارة والتقارير"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={getNavCls({ isActive: false })}
                      >
                        {!collapsed && <span className="text-right flex-1">{item.title}</span>}
                        <item.icon className="mr-2 h-4 w-4" />
                      </a>
                    ) : (
                      <NavLink
                        to={item.url}
                        end
                        className={getNavCls}
                      >
                        {!collapsed && <span className="text-right flex-1">{item.title}</span>}
                        <item.icon className="mr-2 h-4 w-4" />
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {!collapsed && <span className="text-right flex-1">تسجيل الخروج</span>}
                  <LogOut className="mr-2 h-4 w-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}