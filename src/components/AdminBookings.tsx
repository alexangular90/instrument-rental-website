import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Booking } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';

export const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем бронирования
  const { data: bookingsResponse, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: () => apiClient.getBookings({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: 1,
      limit: 100
    }),
  });

  const bookings = bookingsResponse?.data?.bookings || [];

  // Мутации
  const confirmBookingMutation = useMutation({
    mutationFn: (id: string) => apiClient.confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({ title: 'Бронирование подтверждено', description: 'Бронирование успешно подтверждено' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось подтвердить бронирование',
        variant: 'destructive'
      });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      apiClient.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({ title: 'Бронирование отменено', description: 'Бронирование было отменено' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось отменить бронирование',
        variant: 'destructive'
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({ title: 'Бронирование удалено', description: 'Бронирование было удалено из системы' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось удалить бронирование',
        variant: 'destructive'
      });
    },
  });

  const cleanupExpiredMutation = useMutation({
    mutationFn: () => apiClient.cleanupExpiredBookings(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({ 
        title: 'Очистка завершена', 
        description: response.data?.message || 'Просроченные бронирования обработаны'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось выполнить очистку',
        variant: 'destructive'
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Подтверждено', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Отменено', color: 'bg-red-100 text-red-800' },
      expired: { text: 'Просрочено', color: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.toolId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    expired: bookings.filter(b => b.status === 'expired').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление бронированиями</h1>
          <p className="text-gray-600">Контроль всех бронирований инструментов</p>
        </div>
        <Button 
          onClick={() => cleanupExpiredMutation.mutate()}
          disabled={cleanupExpiredMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Icon name="Trash2" className="h-4 w-4 mr-2" />
          {cleanupExpiredMutation.isPending ? 'Очистка...' : 'Очистить просроченные'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Всего</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Подтверждены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Отменены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Просрочены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{bookingStats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по ID бронирования или инструмента..."
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
                <SelectItem value="pending">Ожидают</SelectItem>
                <SelectItem value="confirmed">Подтверждены</SelectItem>
                <SelectItem value="cancelled">Отменены</SelectItem>
                <SelectItem value="expired">Просрочены</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список бронирований ({filteredBookings.length})</CardTitle>
          <CardDescription>
            Все бронирования с возможностью управления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">
                <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Загрузка бронирований...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Инструмент</TableHead>
                    <TableHead>Период</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{booking._id.slice(-8)}</p>
                          <p className="text-xs text-gray-600">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{booking.toolId.slice(-8)}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{booking.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold">₽{booking.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">₽{booking.pricePerDay}/день</p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmBookingMutation.mutate(booking._id)}
                                disabled={confirmBookingMutation.isPending}
                                className="text-green-600"
                              >
                                <Icon name="Check" size={14} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelBookingMutation.mutate({ id: booking._id, reason: 'Отменено администратором' })}
                                disabled={cancelBookingMutation.isPending}
                                className="text-red-600"
                              >
                                <Icon name="X" size={14} />
                              </Button>
                            </>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Icon name="Trash2" size={14} className="text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить бронирование?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Бронирование будет удалено навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBookingMutation.mutate(booking._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteBookingMutation.isPending}
                                >
                                  {deleteBookingMutation.isPending ? 'Удаление...' : 'Удалить'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};