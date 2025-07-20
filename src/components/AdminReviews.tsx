import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Review } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';

export const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Загружаем отзывы
  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ['admin-reviews', statusFilter],
    queryFn: () => apiClient.getReviews({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: 1,
      limit: 50
    }),
  });

  const reviews = reviewsResponse?.data?.reviews || [];

  // Мутации
  const approveReviewMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Отзыв одобрен', description: 'Отзыв успешно одобрен и опубликован' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось одобрить отзыв',
        variant: 'destructive'
      });
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      apiClient.rejectReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Отзыв отклонен', description: 'Отзыв был отклонен' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось отклонить отзыв',
        variant: 'destructive'
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Отзыв удален', description: 'Отзыв был удален из системы' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось удалить отзыв',
        variant: 'destructive'
      });
    },
  });

  const getStatusBadge = (review: Review) => {
    if (!review.isApproved) {
      return <Badge className="bg-yellow-100 text-yellow-800">На модерации</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Опубликован</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const handleAddResponse = () => {
    if (!selectedReview || !responseText.trim()) return;

    // Здесь должна быть мутация для добавления ответа
    console.log('Adding response:', responseText);
    setIsResponseDialogOpen(false);
    setResponseText('');
    setSelectedReview(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление отзывами</h1>
          <p className="text-gray-600">Модерация и управление отзывами клиентов</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Все отзывы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все отзывы</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="approved">Опубликованные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Отзывы ({reviews.length})</CardTitle>
          <CardDescription>
            Все отзывы с возможностью модерации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">
                <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Загрузка отзывов...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Отзыв</TableHead>
                    <TableHead>Инструмент</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium">{review.title}</p>
                          <p className="text-sm text-gray-600 truncate">{review.comment}</p>
                          {review.isVerified && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Проверенная покупка
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">ID: {review.toolId}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(review.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {!review.isApproved && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveReviewMutation.mutate(review._id)}
                                disabled={approveReviewMutation.isPending}
                                className="text-green-600"
                              >
                                <Icon name="Check" size={14} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectReviewMutation.mutate({ id: review._id })}
                                disabled={rejectReviewMutation.isPending}
                                className="text-red-600"
                              >
                                <Icon name="X" size={14} />
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review);
                              setIsResponseDialogOpen(true);
                            }}
                          >
                            <Icon name="MessageSquare" size={14} />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Icon name="Trash2" size={14} className="text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Отзыв будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReviewMutation.mutate(review._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteReviewMutation.isPending}
                                >
                                  {deleteReviewMutation.isPending ? 'Удаление...' : 'Удалить'}
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

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ответить на отзыв</DialogTitle>
            <DialogDescription>
              Добавьте официальный ответ от имени компании
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedReview.title}</h4>
                <p className="text-sm text-gray-700">{selectedReview.comment}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Icon 
                        key={i} 
                        name="Star" 
                        className={`h-4 w-4 ${
                          i < selectedReview.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(selectedReview.createdAt)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ваш ответ</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Введите ответ от имени компании..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddResponse} className="bg-blue-600 hover:bg-blue-700">
              Отправить ответ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};