import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

const AdminAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Загружаем статистику заказов
  const { data: orderStats } = useQuery({
    queryKey: ['order-statistics'],
    queryFn: () => apiClient.getOrderStatistics(),
  });

  // Загружаем популярные инструменты
  const { data: popularToolsResponse } = useQuery({
    queryKey: ['popular-tools-analytics'],
    queryFn: () => apiClient.getPopularTools(10),
  });

  // Загружаем все инструменты для анализа
  const { data: allToolsResponse } = useQuery({
    queryKey: ['all-tools-analytics'],
    queryFn: () => apiClient.getTools({ limit: 1000 }),
  });

  const stats = orderStats?.data || {};
  const popularTools = popularToolsResponse?.data || [];
  const allTools = allToolsResponse?.data?.tools || [];

  const revenueData = [
    { month: 'Янв', revenue: stats.totalRevenue * 0.3 || 245000, orders: stats.total * 0.3 || 89, tools: 156 },
    { month: 'Фев', revenue: stats.totalRevenue * 0.4 || 298000, orders: stats.total * 0.4 || 112, tools: 189 },
    { month: 'Мар', revenue: stats.totalRevenue * 0.5 || 356000, orders: stats.total * 0.5 || 134, tools: 223 },
    { month: 'Апр', revenue: stats.totalRevenue * 0.6 || 412000, orders: stats.total * 0.6 || 156, tools: 267 },
    { month: 'Май', revenue: stats.totalRevenue * 0.7 || 478000, orders: stats.total * 0.7 || 178, tools: 298 },
    { month: 'Июн', revenue: stats.totalRevenue * 0.8 || 523000, orders: stats.total * 0.8 || 195, tools: 334 },
    { month: 'Июл', revenue: stats.totalRevenue || 587000, orders: stats.total || 218, tools: 378 }
  ];

  const topTools = popularTools.slice(0, 5).map(tool => ({
    name: tool.name,
    rents: tool.totalRentals,
    revenue: tool.totalRevenue,
    rating: tool.rating
  }));

  // Группируем инструменты по категориям для статистики
  const categoryStats = allTools.reduce((acc: any[], tool) => {
    const existing = acc.find(cat => cat.name === tool.category);
    if (existing) {
      existing.revenue += tool.totalRevenue;
      existing.orders += tool.totalRentals;
    } else {
      acc.push({
        name: tool.category,
        revenue: tool.totalRevenue,
        orders: tool.totalRentals,
        share: 0 // Будет рассчитано ниже
      });
    }
    return acc;
  }, []);

  // Рассчитываем долю каждой категории
  const totalRevenue = categoryStats.reduce((sum, cat) => sum + cat.revenue, 0);
  categoryStats.forEach(cat => {
    cat.share = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
  });

  const customerSegments = [
    { segment: 'Частные лица', count: 1247, share: 58, avgOrder: 2340 },
    { segment: 'Строительные компании', count: 456, share: 32, avgOrder: 5670 },
    { segment: 'Ремонтные бригады', count: 234, share: 10, avgOrder: 3450 }
  ];

  const financialKPIs = [
    { name: 'Общая выручка', value: `₽${(stats.totalRevenue || 2847500).toLocaleString()}`, change: '+12.5%', positive: true },
    { name: 'Средний чек', value: `₽${(stats.averageOrderValue || 3245).toLocaleString()}`, change: '+8.2%', positive: true },
    { name: 'Коэффициент использования', value: '78%', change: '+15.3%', positive: true },
    { name: 'Прибыль с инструмента', value: '₽12,180', change: '+22.1%', positive: true }
  ];

  const dailyStats = [
    { day: 'Пн', orders: 23, revenue: 67800 },
    { day: 'Вт', orders: 34, revenue: 89200 },
    { day: 'Ср', orders: 41, revenue: 123400 },
    { day: 'Чт', orders: 38, revenue: 112300 },
    { day: 'Пт', orders: 45, revenue: 134500 },
    { day: 'Сб', orders: 52, revenue: 156700 },
    { day: 'Вс', orders: 28, revenue: 78900 }
  ];

  const currentMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const growthRate = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Аналитика и отчёты</h1>
          <p className="text-gray-600">Подробная статистика по доходам и использованию</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="quarter">Квартал</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="revenue">Доходы</TabsTrigger>
          <TabsTrigger value="tools">Инструменты</TabsTrigger>
          <TabsTrigger value="customers">Клиенты</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialKPIs.map((kpi, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.name}
                  </CardTitle>
                  <Icon 
                    name={kpi.positive ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className={kpi.positive ? 'text-green-600' : 'text-red-600'} 
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className={`text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change} с прошлого периода
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Chart Simulation */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика доходов по месяцам</CardTitle>
              <CardDescription>
                Рост выручки: +{growthRate}% за последний месяц
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data, index) => {
                  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                  const percentage = (data.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{data.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">₽{data.revenue.toLocaleString()}</span>
                          <span className="text-xs text-gray-600">{data.orders} заказов</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика по дням недели</CardTitle>
              <CardDescription>
                Активность клиентов в течение недели
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {dailyStats.map((day, index) => {
                  const maxOrders = Math.max(...dailyStats.map(d => d.orders));
                  const intensity = (day.orders / maxOrders) * 100;
                  
                  return (
                    <div key={index} className="text-center space-y-2">
                      <div className="font-medium">{day.day}</div>
                      <div 
                        className="w-full h-16 bg-blue-500 rounded opacity-80 flex items-end justify-center text-white text-xs font-medium"
                        style={{ height: `${Math.max(intensity, 20)}px` }}
                      >
                        {day.orders}
                      </div>
                      <div className="text-xs text-gray-600">
                        ₽{day.revenue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Доходы по категориям</CardTitle>
                <CardDescription>
                  Распределение выручки по типам инструментов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-gray-600">{category.share}%</span>
                    </div>
                    <Progress value={category.share} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>₽{category.revenue.toLocaleString()}</span>
                      <span>{category.orders} заказов</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performing Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Топ инструментов по доходам</CardTitle>
                <CardDescription>
                  Самые прибыльные позиции каталога
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTools.map((tool, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tool.name}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-600">{tool.rents} аренд</span>
                          <span className="text-xs">★ {tool.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₽{tool.revenue.toLocaleString()}</p>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Анализ использования инструментов</CardTitle>
              <CardDescription>
                Подробная статистика по каждому инструменту
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Инструмент</TableHead>
                    <TableHead>Аренды</TableHead>
                    <TableHead>Доход</TableHead>
                    <TableHead>Загрузка</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTools.map((tool, index) => {
                    const utilizationRate = Math.min((tool.rents / 200) * 100, 100);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell>{tool.rents}</TableCell>
                        <TableCell>₽{tool.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={utilizationRate} className="h-2" />
                            <span className="text-xs text-gray-600">{utilizationRate.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                            <span>{tool.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={utilizationRate > 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {utilizationRate > 70 ? 'Высокая' : 'Средняя'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Сегменты клиентов</CardTitle>
                <CardDescription>
                  Распределение клиентской базы
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{segment.segment}</span>
                      <span className="text-sm text-gray-600">{segment.share}%</span>
                    </div>
                    <Progress value={segment.share} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{segment.count} клиентов</span>
                      <span>Средний чек: ₽{segment.avgOrder.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Метрики клиентов</CardTitle>
                <CardDescription>
                  Ключевые показатели работы с клиентами
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                    <div className="text-sm text-gray-600">Всего клиентов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round((stats.total || 0) * 0.1)}</div>
                    <div className="text-sm text-gray-600">Новых за месяц</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">67%</div>
                    <div className="text-sm text-gray-600">Возвращаются</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{(stats.averageOrderValue / 1000 || 4.2).toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Аренд на клиента</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;