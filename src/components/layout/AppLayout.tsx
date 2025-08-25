import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Bell, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function UserDropdown() {
  const { user, hrEmployee, logout } = useAuth();

  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt="صورة المستخدم" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user ? getUserInitials(user.name) : 'م'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-sm text-right">
            <p className="font-medium">{user?.name || 'مستخدم'}</p>
            <p className="text-xs text-muted-foreground">
              {hrEmployee?.position || 'موظف'}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card shadow-soft">
            <div className="flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-4">
                <div className="relative w-96 max-w-sm">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="بحث في النظام..."
                    className="pr-10 bg-muted/50 border-muted"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <SidebarTrigger className="mr-2" />
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
                </Button>

                <UserDropdown />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background" key={location.pathname}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}