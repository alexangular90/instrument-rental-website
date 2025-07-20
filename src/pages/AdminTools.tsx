import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Tool } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const AdminToolsManagement = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [newTool, setNewTool] = useState({
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    fullDescription: '',
    features: '',
    inStock: '',
    totalStock: ''
  });

  // Загружаем инструменты
  const { data: toolsResponse, isLoading } = useQuery({
    queryKey: ['admin-tools', searchQuery, selectedCategory],
    queryFn: () => apiClient.getTools({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      page: 1,
      limit: 100
    }),
  });

  // Загружаем категории
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const tools = toolsResponse?.data?.tools || [];
  const categories = categoriesResponse?.data?.map(cat => cat.name) || [];
  const brands = ['Bosch', 'DeWalt', 'Makita', 'Metabo', 'Milwaukee', 'Ryobi'];

  // Мутации
  const createToolMutation = useMutation({
    mutationFn: (toolData: Partial<Tool>) => apiClient.createTool(toolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({ title: 'Инструмент создан', description: 'Новый инструмент успешно добавлен в каталог' });
      setIsAddDialogOpen(false);
      resetNewTool();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось создать инструмент',
        variant: 'destructive'
      });
    },
  });

  const updateToolMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tool> }) => 
      apiClient.updateTool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({ title: 'Инструмент обновлен', description: 'Изменения успешно сохранены' });
      setIsEditDialogOpen(false);
      setEditingTool(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось обновить инструмент',
        variant: 'destructive'
      });
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({ title: 'Инструмент удален', description: 'Инструмент успешно удален из каталога' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось удалить инструмент',
        variant: 'destructive'
      });
    },
  });

  const filteredTools = useMemo(() => {
    let filtered = tools;

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    return filtered;
  }, [tools, searchQuery, selectedCategory]);

  const resetNewTool = () => {
    setNewTool({
      name: '',
      brand: '',
      category: '',
      subcategory: '',
      price: '',
      description: '',
      fullDescription: '',
      features: '',
      inStock: '',
      totalStock: ''
    });
  };

  const handleAddTool = () => {
    const toolData = {
      name: newTool.name,
      brand: newTool.brand,
      category: newTool.category,
      subcategory: newTool.subcategory,
      price: Number(newTool.price),
      images: ['/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'],
      description: newTool.description,
      fullDescription: newTool.fullDescription,
      features: newTool.features.split(',').map(f => f.trim()),
      inStock: Number(newTool.inStock),
      totalStock: Number(newTool.totalStock),
      specifications: {},
      included: [],
      condition: 'excellent',
      location: 'main_warehouse',
      status: 'available',
      isActive: true
    };

    createToolMutation.mutate(toolData);
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTool = () => {
    if (!editingTool) return;

    updateToolMutation.mutate({
      id: editingTool._id,
      data: editingTool
    });
  };

  const handleDeleteTool = (id: string) => {
    deleteToolMutation.mutate(id);
  };

  const toggleAvailability = (tool: Tool) => {
    const newStatus = tool.status === 'available' ? 'maintenance' : 'available';
    updateToolMutation.mutate({
      id: tool._id,
      data: { status: newStatus }
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Нет в наличии', color: 'bg-red-100 text-red-800' };
    if (stock <= 2) return { text: 'Мало', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'В наличии', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление инструментами</h1>
          <p className="text-gray-600">Полный контроль над каталогом инструментов</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить инструмент
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавить новый инструмент</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом инструменте для каталога
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название инструмента</Label>
                <Input
                  id="name"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  placeholder="Перфоратор Bosch..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Бренд</Label>
                <Select value={newTool.brand} onValueChange={(value) => setNewTool({ ...newTool, brand: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите бренд" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={newTool.category} onValueChange={(value) => setNewTool({ ...newTool, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Подкатегория</Label>
                <Input
                  id="subcategory"
                  value={newTool.subcategory}
                  onChange={(e) => setNewTool({ ...newTool, subcategory: e.target.value })}
                  placeholder="Перфораторы, Дрели..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Цена за день (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newTool.price}
                  onChange={(e) => setNewTool({ ...newTool, price: e.target.value })}
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inStock">Количество на складе</Label>
                <Input
                  id="inStock"
                  type="number"
                  value={newTool.inStock}
                  onChange={(e) => setNewTool({ ...newTool, inStock: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newTool.description}
                  onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                  placeholder="Краткое описание инструмента..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullDescription">Полное описание</Label>
                <Textarea
                  id="fullDescription"
                  value={newTool.fullDescription}
                  onChange={(e) => setNewTool({ ...newTool, fullDescription: e.target.value })}
                  placeholder="Подробное описание инструмента..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalStock">Общее количество</Label>
                <Input
                  id="totalStock"
                  type="number"
                  value={newTool.totalStock}
                  onChange={(e) => setNewTool({ ...newTool, totalStock: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Особенности (через запятую)</Label>
                <Input
                  id="features"
                  value={newTool.features}
                  onChange={(e) => setNewTool({ ...newTool, features: e.target.value })}
                  placeholder="SDS-Max, Антивибрация, Регулировка оборотов"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleAddTool} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createToolMutation.isPending}
              >
                {createToolMutation.isPending ? 'Создание...' : 'Добавить инструмент'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию, бренду или категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Каталог инструментов ({filteredTools.length})</CardTitle>
          <CardDescription>
            Управление всеми инструментами в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">
                <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Загрузка инструментов...</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Инструмент</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Цена/день</TableHead>
                  <TableHead>Склад</TableHead>
                  <TableHead>Статистика</TableHead>
                  <TableHead>Доступность</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools.map((tool) => {
                  const stockStatus = getStockStatus(tool.inStock);
                  return (
                    <TableRow key={tool._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'} 
                            alt={tool.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-sm text-gray-600">{tool.brand}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tool.category}</p>
                          <p className="text-sm text-gray-600">{tool.subcategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">₽{tool.price.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{tool.inStock} шт.</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Аренд: {tool.totalRentals}</p>
                          <p>Доход: ₽{tool.totalRevenue.toLocaleString()}</p>
                          <p className="text-gray-600">
                            {tool.rating > 0 ? `★ ${tool.rating} (${tool.reviewCount})` : 'Нет отзывов'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tool.status === 'available'}
                          onCheckedChange={() => toggleAvailability(tool)}
                          disabled={updateToolMutation.isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTool(tool)}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Icon name="Trash2" size={14} className="text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить инструмент?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Инструмент "{tool.name}" будет удален из каталога.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTool(tool._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteToolMutation.isPending}
                                >
                                  {deleteToolMutation.isPending ? 'Удаление...' : 'Удалить'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать инструмент</DialogTitle>
            <DialogDescription>
              Изменение информации об инструменте
            </DialogDescription>
          </DialogHeader>
          {editingTool && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название инструмента</Label>
                <Input
                  id="edit-name"
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Цена за день (₽)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingTool.price}
                  onChange={(e) => setEditingTool({ ...editingTool, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={editingTool.description}
                  onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-inStock">Количество на складе</Label>
                <Input
                  id="edit-inStock"
                  type="number"
                  value={editingTool.inStock}
                  onChange={(e) => setEditingTool({ ...editingTool, inStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalStock">Общее количество</Label>
                <Input
                  id="edit-totalStock"
                  type="number"
                  value={editingTool.totalStock}
                  onChange={(e) => setEditingTool({ ...editingTool, totalStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-features">Особенности (через запятую)</Label>
                <Input
                  id="edit-features"
                  value={editingTool.features.join(', ')}
                  onChange={(e) => setEditingTool({ 
                    ...editingTool, 
                    features: e.target.value.split(',').map(f => f.trim()) 
                  })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-fullDescription">Полное описание</Label>
                <Textarea
                  id="edit-fullDescription"
                  value={editingTool.fullDescription}
                  onChange={(e) => setEditingTool({ ...editingTool, fullDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateTool} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateToolMutation.isPending}
            >
              {updateToolMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminToolsManagement;