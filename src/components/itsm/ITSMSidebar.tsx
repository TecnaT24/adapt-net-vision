import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  AlertCircle, 
  FileText, 
  Settings, 
  Users, 
  BarChart3,
  BookOpen,
  Package,
  ClipboardList,
  LogOut,
  User,
  Network,
  Activity,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { 
    group: 'Main',
    items: [
      { title: 'Dashboard', url: '/itsm', icon: LayoutDashboard },
      { title: 'Incidents', url: '/itsm/incidents', icon: AlertCircle },
      { title: 'Service Requests', url: '/itsm/requests', icon: ClipboardList },
    ]
  },
  {
    group: 'Management',
    items: [
      { title: 'Assets', url: '/itsm/assets', icon: Package },
      { title: 'Knowledge Base', url: '/itsm/knowledge', icon: BookOpen },
      { title: 'Changes', url: '/itsm/changes', icon: FileText },
    ]
  },
  {
    group: 'Admin',
    items: [
      { title: 'Analytics', url: '/itsm/analytics', icon: BarChart3 },
      { title: 'User Management', url: '/itsm/users', icon: Users },
      { title: 'SLA Settings', url: '/itsm/sla', icon: Settings },
      { title: 'Audit Logs', url: '/itsm/audit', icon: Shield },
    ],
    adminOnly: true
  }
];

export function ITSMSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { profile, role, signOut, isAdmin, isITSupport } = useAuth();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;
  
  const getRoleBadgeVariant = () => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'it_support': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'it_support': return 'IT Support';
      default: return 'Employee';
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/itsm" className="flex items-center gap-2 group">
          <div className="relative flex-shrink-0">
            <Network className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <Activity className="h-4 w-4 text-secondary absolute -bottom-1 -right-1 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg">ITSM Portal</span>
              <span className="text-xs text-muted-foreground">Service Desk</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section) => {
          // Hide admin sections from non-admins
          if (section.adminOnly && !isAdmin && !isITSupport) return null;
          
          return (
            <SidebarGroup key={section.group}>
              <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <Badge variant={getRoleBadgeVariant()} className="text-xs">
                {getRoleLabel()}
              </Badge>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2 justify-start"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
