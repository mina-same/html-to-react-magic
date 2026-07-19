import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { Toaster } from "sonner";

import saaidLogo from "@/assets/saaid-logo.png";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "default" | "destructive";
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

interface DashboardShellProps {
  navGroups: DashboardNavGroup[];
  activePage: string;
  onNavigate: (id: string) => void;
  pageTitle: string;
  identityName: string;
  identityInitial: string;
  identitySubtitle?: string;
  onLogout: () => void;
  /** Extra content rendered in the topbar, before the notification bell (e.g. "syncing…" indicator). */
  topbarExtras?: ReactNode;
  notificationCount?: number;
  children: ReactNode;
}

/**
 * Shared shell for all three role dashboards (association/admin/employee):
 * a brand-green shadcn Sidebar (RTL: docked right, collapsible-to-icons,
 * built-in mobile Sheet) plus a sticky topbar and scrollable content area.
 */
export function DashboardShell({
  navGroups,
  activePage,
  onNavigate,
  pageTitle,
  identityName,
  identityInitial,
  identitySubtitle,
  onLogout,
  topbarExtras,
  notificationCount = 0,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <Toaster position="top-center" richColors />
      <Sidebar side="right" collapsible="icon">
        <SidebarHeader className="gap-3 border-b border-sidebar-border/60 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src={saaidLogo}
              alt="ساعِد"
              className="h-8 w-8 shrink-0 brightness-0 invert"
            />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="text-base font-extrabold leading-none text-white">ساعِد</div>
              <div className="mt-1 text-[0.55rem] tracking-[0.2em] text-white/40">
                SAAID PLATFORM
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] p-2 group-data-[collapsible=icon]:hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-gold to-[#e8c96e] text-xs font-bold text-primary">
              {identityInitial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-tight text-white">
                {identityName || "—"}
              </div>
              {identitySubtitle && (
                <div className="truncate text-[0.65rem] text-white/50">{identitySubtitle}</div>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 px-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-white/35">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activePage === item.id}
                        tooltip={item.label}
                        onClick={() => onNavigate(item.id)}
                        className="text-white/65 data-[active=true]:bg-white/[0.13] data-[active=true]:text-white hover:bg-white/10 hover:text-white"
                      >
                        <item.icon className={cn(activePage === item.id && "text-gold")} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge != null && (
                        <SidebarMenuBadge
                          className={cn(
                            "right-auto left-1 text-white",
                            item.badgeVariant === "destructive" ? "bg-red-500/25" : "bg-gold/90 text-primary",
                          )}
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                className="text-red-300/80 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut />
                <span>تسجيل الخروج</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="max-h-dvh">
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b bg-white px-4 md:px-6">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <SidebarTrigger className="hidden md:flex" />
          <h1 className="flex-1 truncate text-[1.02rem] font-bold text-foreground">{pageTitle}</h1>
          {topbarExtras}
          {identityName && (
            <Badge variant="secondary" className="hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex">
              {identityName}
            </Badge>
          )}
          <button
            type="button"
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white text-muted-foreground transition-colors hover:bg-muted"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-2 border-white bg-gold" />
            )}
          </button>
          <Avatar className="hidden h-8 w-8 shrink-0 sm:flex">
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {identityInitial}
            </AvatarFallback>
          </Avatar>
        </header>

        <div className="flex-1 overflow-y-auto bg-app-bg p-4 md:p-5">
          <div className="w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
