import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import Icon from '@/components/ui/icon';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const menuItems = [
  {
    title: "Дашборд",
    icon: "BarChart3",
    id: "dashboard"
  },
  {
    title: "Инструменты",
    icon: "Wrench",
    id: "tools"
  },
  {
    title: "Заказы",
    icon: "ShoppingCart",
    id: "orders"
  },
  {
    title: "Бронирования",
    icon: "Calendar",
    id: "bookings"
  },
  {
    title: "Отзывы",
    icon: "MessageSquare",
    id: "reviews"
  },
  {
    title: "Аналитика",
    icon: "TrendingUp",
    id: "analytics"
  },
  {
    title: "Клиенты",
    icon: "Users",
    id: "customers"
  },
  {
    title: "Настройки",
    icon: "Settings",
    id: "settings"
  }
];

const quickStats = [
  { label: "Активные заказы", value: "47", color: "text-blue-600" },
  { label: "Новые клиенты", value: "12", color: "text-green-600" },
  { label: "Уведомления", value: "3", color: "text-orange-600" }
];

export function AdminSidebar({ activeSection, onSectionChange, isDarkMode, onThemeToggle }: AdminSidebarProps) {
  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <Icon name="Settings" className="h-8 w-8 text-blue-600" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Админ-панель</span>
            <span className="truncate text-xs text-muted-foreground">RentTools</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Быстрая статистика */}
        <SidebarGroup>
          <SidebarGroupLabel>Быстрая статистика</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <Badge variant="secondary" className={stat.color}>
                    {stat.value}
                  </Badge>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Основная навигация */}
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full"
                  >
                    <Icon name={item.icon as any} className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Настройки темы */}
        <SidebarGroup>
          <SidebarGroupLabel>Настройки</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name={isDarkMode ? "Moon" : "Sun"} className="h-4 w-4" />
                  <span className="text-sm">Тёмная тема</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={onThemeToggle}
                />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-4 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/img/admin-avatar.jpg" />
            <AvatarFallback>АП</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Админ Панель</span>
            <span className="truncate text-xs text-muted-foreground">admin@renttools.ru</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Icon name="LogOut" className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Панель управления</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}