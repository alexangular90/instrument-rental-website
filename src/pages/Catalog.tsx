import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function Catalog() {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('Все бренды');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAvailable, setShowAvailable] = useState(false);

  // Загружаем инструменты
  const { data: toolsResponse, isLoading } = useQuery({
    queryKey: ['catalog-tools', searchQuery, selectedCategory, selectedBrand, priceRange, showAvailable],
    queryFn: () => apiClient.getTools({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      brand: selectedBrand !== 'Все бренды' ? selectedBrand : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      available: showAvailable || undefined,
      page: 1,
      limit: 50
    }),
  });

  // Загружаем категории
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const tools = toolsResponse?.data?.tools || [];
  const categoriesData = categoriesResponse?.data || [];
  
  const categories = [
    { id: 'all', name: 'Все категории', count: tools.length },
    ...categoriesData.map(cat => ({
      id: cat.name.toLowerCase(),
      name: cat.name,
      count: tools.filter(t => t.category === cat.name).length
    }))
  ];

  const brands = ['Все бренды', ...Array.from(new Set(tools.map(t => t.brand)))];

  const filteredTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             tool.category.toLowerCase() === selectedCategory;
      const matchesBrand = selectedBrand === 'Все бренды' || tool.brand === selectedBrand;
      const matchesPrice = tool.price >= priceRange[0] && tool.price <= priceRange[1];
      const matchesAvailable = !showAvailable || (tool.status === 'available' && tool.inStock > 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesAvailable;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, showAvailable]);

  const handleToolClick = (toolId: number) => {
    window.location.href = `/product/${toolId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Icon name="Wrench" className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ToolRental</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Главная</a>
              <a href="/catalog" className="text-blue-600 font-medium">Каталог</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Услуги</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">О нас</a>
            </nav>
            <Button size="sm">
              <Icon name="User" className="h-4 w-4 mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Каталог инструментов</h1>
              <p className="text-gray-600 mt-2">Найдено {filteredTools.length} инструментов</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Вид:</span>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Icon name="Grid3x3" className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Icon name="List" className="h-4 w-4" />
                </Button>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сортировать по" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price-low">Сначала дешёвые</SelectItem>
                  <SelectItem value="price-high">Сначала дорогие</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Mobile Filters */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Icon name="Filter" className="h-4 w-4 mr-2" />
                      Фильтры
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Фильтры</SheetTitle>
                      <SheetDescription>Настройте параметры поиска</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Mobile filter content will be here */}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:block space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Поиск</label>
                  <div className="relative">
                    <Input
                      placeholder="Найти инструмент..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Icon name="Search" className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Категория</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`cursor-pointer p-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{category.name}</span>
                          <span className="text-xs text-gray-500">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Brand */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Бренд</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">
                    Цена: {priceRange[0]}₽ - {priceRange[1]}₽
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={3000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0₽</span>
                    <span>3000₽</span>
                  </div>
                </div>

                <Separator />

                {/* Availability */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available"
                      checked={showAvailable}
                      onCheckedChange={setShowAvailable}
                    />
                    <label
                      htmlFor="available"
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Только в наличии
                    </label>
                  </div>
                </div>

                {/* Reset Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBrand('Все бренды');
                    setPriceRange([0, 3000]);
                    setShowAvailable(false);
                  }}
                >
                  <Icon name="RotateCcw" className="h-4 w-4 mr-2" />
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredTools.map((tool) => (
                  <Card 
                    key={tool._id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      viewMode === 'list' ? 'flex flex-row' : ''
                    }`}
                    onClick={() => handleToolClick(tool._id)}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img 
                        src={tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'} 
                        alt={tool.name}
                        className={`object-cover ${
                          viewMode === 'grid' 
                            ? 'w-full h-48 rounded-t-lg' 
                            : 'w-full h-full rounded-l-lg'
                        }`}
                      />
                      {tool.status !== 'available' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">Занято</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-white">
                          {tool.subcategory}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{tool.brand}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              <Icon name="Star" className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{tool.rating}</span>
                            </div>
                            <span className="text-sm text-gray-400">({tool.reviewCount} отзывов)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {tool.price}₽
                          </div>
                          <div className="text-sm text-gray-600">/день</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tool.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Icon name="Zap" className="h-4 w-4" />
                            <span>{tool.specifications.power || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Weight" className="h-4 w-4" />
                            <span>{tool.specifications.weight || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            В наличии: {tool.inStock}
                          </span>
                          <Button 
                            size="sm" 
                            disabled={tool.status !== 'available' || tool.inStock === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tool.status === 'available' && tool.inStock > 0) {
                                addToCart({
                                  id: tool._id,
                                  name: tool.name,
                                  price: tool.price,
                                  image: tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg',
                                  category: tool.category,
                                  duration: 1
                                });
                              }
                            }}
                          >
                            {tool.status === 'available' && tool.inStock > 0 ? 'В корзину' : 'Занято'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}