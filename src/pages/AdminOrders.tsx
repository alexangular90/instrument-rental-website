import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Order } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const AdminOrdersManagement = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Загружаем заказы
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, searchQuery],
    queryFn: () => apiClient.getOrders({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: 1,
      limit: 100
    }),
  });

  // Загружаем статистику
  const { data: statsResponse } = useQuery({
    queryKey: ['order-statistics'],
    queryFn: () => apiClient.getOrderStatistics(),
  });

  const orders = ordersResponse?.data?.orders || [];
  const stats = statsResponse?.data || {};

  // Мутация для обновления статуса заказа
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: string; note?: string }) =>
      apiClient.updateOrderStatus(orderId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-statistics'] });
      toast({ title: 'Статус обновлен', description: 'Статус заказа успешно изменен' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось обновить статус',
        variant: 'destructive'
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Подтверждён', color: 'bg-blue-100 text-blue-800' },
      active: { text: 'Активный', color: 'bg-green-100 text-green-800' },
      completed: { text: 'Завершён', color: 'bg-gray-100 text-gray-800' },
      cancelled: { text: 'Отменён', color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerInfo.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: stats.total || 0,
    pending: stats.pending || 0,
    active: stats.active || 0,
    completed: stats.completed || 0,
    revenue: stats.totalRevenue || 0
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const calculateDaysLeft = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление заказами</h1>
          <p className="text-gray-600">Контроль всех заказов и бронирований</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Icon name="Plus" size={16} className="mr-2" />
          Создать заказ
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Всего заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Активные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Завершённые</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{orderStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Общая выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₽{orderStats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по номеру заказа, имени клиента или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="confirmed">Подтверждён</SelectItem>
                <SelectItem value="active">Активный</SelectItem>
                <SelectItem value="completed">Завершён</SelectItem>
                <SelectItem value="cancelled">Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список заказов ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Все заказы с возможностью управления статусами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">
                <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Загрузка заказов...</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заказ</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Инструменты</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const daysLeft = calculateDaysLeft(order.endDate);
                  
                  return (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                          <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.items.length} инструмент(ов)</p>
                          <p className="text-sm text-gray-600">
                            {order.items[0]?.toolName}
                            {order.items.length > 1 && ` +${order.items.length - 1}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {formatDate(order.startDate)} - {formatDate(order.endDate)}
                          </p>
                          {order.status === 'active' && (
                            <p className="text-xs text-gray-600">
                              {daysLeft > 0 ? `Осталось ${daysLeft} дн.` : 'Просрочен'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">₽{order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            Залог: ₽{order.deposit.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Icon name="Eye" size={14} />
                          </Button>
                          
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="text-blue-600"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Icon name="Check" size={14} />
                            </Button>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'active')}
                              className="text-green-600"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Icon name="Play" size={14} />
                            </Button>
                          )}
                          
                          {order.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'completed')}
                              className="text-gray-600"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Icon name="Square" size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Детали заказа {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Полная информация о заказе и клиенте
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Информация о клиенте</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Имя клиента</Label>
                      <p className="mt-1">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Телефон</Label>
                      <p className="mt-1">{selectedOrder.customerInfo.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="mt-1">{selectedOrder.customerInfo.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Детали заказа</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Дата начала</Label>
                        <p className="mt-1">{formatDate(selectedOrder.startDate)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Дата окончания</Label>
                        <p className="mt-1">{formatDate(selectedOrder.endDate)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Статус</Label>
                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Tools List */}
                    <div>
                      <Label className="text-sm font-medium">Арендованные инструменты</Label>
                      <div className="mt-2 space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.toolName}</p>
                              <p className="text-sm text-gray-600">
                                Количество: {item.quantity} | Дней: {item.days}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₽{item.total.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">₽{item.pricePerDay}/день</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Общая сумма</Label>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          ₽{selectedOrder.total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Залог</Label>
                        <p className="text-2xl font-bold text-orange-600 mt-1">
                          ₽{selectedOrder.deposit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {selectedOrder.notes && (
                      <div>
                        <Label className="text-sm font-medium">Примечания</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Закрыть
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Редактировать заказ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersManagement;