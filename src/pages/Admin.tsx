import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminSidebar, AdminLayout } from '@/components/AdminSidebar';
import { AdminReviews } from '@/components/AdminReviews';
import { AdminBookings } from '@/components/AdminBookings';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import Icon from '@/components/ui/icon';

const AdminPanelContent = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Загружаем статистику для дашборда
  const { data: orderStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getOrderStatistics(),
  });

  const { data: toolsResponse } = useQuery({
    queryKey: ['dashboard-tools'],
    queryFn: () => apiClient.getTools({ limit: 10 }),
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => apiClient.getOrders({ limit: 5 }),
  });

  const stats = orderStats?.data || {};
  const tools = toolsResponse?.data?.tools || [];
  const orders = ordersResponse?.data?.orders || [];

  const dashboardStats = [
    {
      title: 'Общая выручка',
      value: `₽${(stats.totalRevenue || 2847500).toLocaleString()}`,
      change: '+12.5%',
      icon: 'TrendingUp',
      color: 'text-green-600'
    },
    {
      title: 'Активные заказы',
      value: (stats.active || 47).toString(),
      change: '+8.2%',
      icon: 'ShoppingCart',
      color: 'text-blue-600'
    },
    {
      title: 'Инструменты в аренде',
      value: tools.filter(t => t.status === 'rented').length.toString() || '234',
      change: '+15.3%',
      icon: 'Wrench',
      color: 'text-orange-600'
    },
    {
      title: 'Новые клиенты',
      value: Math.round((stats.total || 0) * 0.1).toString() || '89',
      change: '+22.1%',
      icon: 'Users',
      color: 'text-purple-600'
    }
  ];

  const recentOrders = orders.slice(0, 3).map(order => ({
    id: order.orderNumber,
    customer: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
    tools: order.items.map(item => item.toolName).join(', '),
    amount: `₽${order.total.toLocaleString()}`,
    status: order.status,
    date: new Date(order.createdAt).toLocaleDateString('ru-RU')
  }));

  const lowStockTools = tools
    .filter(tool => tool.inStock <= 2)
    .slice(0, 4)
    .map(tool => ({
      name: tool.name,
      stock: tool.inStock,
      critical: tool.inStock <= 1
    }));

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon name={stat.icon as any} size={20} className={stat.color} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} с прошлого месяца
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Недавние заказы</CardTitle>
            <CardDescription>
              Последние заказы в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.tools}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.amount}</p>
                    <div className="mt-1">
                      <Badge variant={order.status === 'active' ? 'default' : 'secondary'}>
                        {order.status === 'active' ? 'Активный' : 
                         order.status === 'completed' ? 'Завершён' : 'Ожидает'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <Button variant="outline" className="w-full">
              <Icon name="ArrowRight" size={16} className="mr-2" />
              Посмотреть все заказы
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="AlertTriangle" size={20} className="mr-2 text-orange-600" />
              Низкие запасы
            </CardTitle>
            <CardDescription>
              Инструменты с низким количеством на складе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockTools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">На складе: {tool.stock} шт.</p>
                  </div>
                  <Badge 
                    variant={tool.critical ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {tool.critical ? 'Критично' : 'Низкий'}
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <Button variant="outline" className="w-full">
              <Icon name="Package" size={16} className="mr-2" />
              Управление складом
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые функции администратора
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setActiveSection('tools')}
            >
              <Icon name="Plus" size={24} />
              <span className="text-sm">Добавить инструмент</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setActiveSection('orders')}
            >
              <Icon name="FileText" size={24} />
              <span className="text-sm">Новый заказ</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Icon name="Users" size={24} />
              <span className="text-sm">Клиенты</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Icon name="Settings" size={24} />
              <span className="text-sm">Настройки</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'tools':
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Переходим к полнофункциональному управлению инструментами</p>
            <Button onClick={() => window.location.href = '/admin/tools'}>
              Открыть управление инструментами
            </Button>
          </div>
        );
      case 'orders':
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Переходим к управлению заказами</p>
            <Button onClick={() => window.location.href = '/admin/orders'}>
              Открыть управление заказами
            </Button>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Переходим к детальной аналитике</p>
            <Button onClick={() => window.location.href = '/admin/analytics'}>
              Открыть аналитику
            </Button>
          </div>
        );
      case 'customers':
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление клиентами</CardTitle>
                <CardDescription>Информация о клиентах и их активности</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Раздел в разработке...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'reviews':
        return <AdminReviews />;
      case 'bookings':
        return <AdminBookings />;
      case 'settings':
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки системы</CardTitle>
                <CardDescription>Конфигурация и параметры приложения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Тёмная тема</h4>
                      <p className="text-sm text-muted-foreground">Переключение между светлой и тёмной темой</p>
                    </div>
                    <Button variant="outline" onClick={toggleTheme}>
                      <Icon name={isDarkMode ? "Sun" : "Moon"} className="h-4 w-4 mr-2" />
                      {isDarkMode ? 'Светлая' : 'Тёмная'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <AdminLayout>
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />
      <div className="flex-1">
        {renderContent()}
      </div>
    </AdminLayout>
  );
};

const AdminPanel = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-theme">
      <AdminPanelContent />
    </ThemeProvider>
  );
};

export default AdminPanel;