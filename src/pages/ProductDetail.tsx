import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';


Особенности:
- Система SDS-Max для быстрой смены оснастки без дополнительных инструментов
- Антивибрационная система (AVT) снижает вибрацию до 50%
- Электронная регулировка частоты ударов
- Автоматическое отключение при заклинивании оснастки
- Светодиодная подсветка рабочей зоны
- Эргономичная конструкция с дополнительной рукояткой

Технические характеристики:
- Мощность: 1750 Вт
- Энергия удара: 41 Дж
- Частота ударов: 1400-2840 уд/мин
- Патрон: SDS-Max
- Максимальный диаметр сверления в бетоне: 50 мм
- Вес: 11,1 кг
- Уровень шума: 107 дБ(A)
- Уровень вибрации: 12 м/с²`,
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [rentalDays, setRentalDays] = useState(1);
  const [quantity, setQuantity] = useState(1);

  // Загружаем данные инструмента
  const { data: toolResponse, isLoading: toolLoading } = useQuery({
    queryKey: ['tool', id],
    queryFn: () => apiClient.getTool(id!),
    enabled: !!id,
  });

  // Загружаем отзывы
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['tool-reviews', id],
    queryFn: () => apiClient.getToolReviews(id!, { page: 1, limit: 10 }),
    enabled: !!id,
  });

  const toolData = toolResponse?.data;
  const reviewsData = reviewsResponse?.data;
  const reviews = reviewsData?.reviews || [];
  const rating = reviewsData?.rating || { rating: 0, count: 0 };

  // Создаем периоды аренды на основе цены инструмента
  const rentalPeriods = toolData ? [
    { days: 1, price: toolData.price, discount: 0 },
    { days: 3, price: toolData.price * 3 * 0.9, discount: 10 },
    { days: 7, price: toolData.price * 7 * 0.85, discount: 15 },
    { days: 14, price: toolData.price * 14 * 0.8, discount: 20 },
    { days: 30, price: toolData.price * 30 * 0.7, discount: 30 }
  ] : [];

  if (!id) {
    return <div>Инструмент не найден</div>;
  }

  if (toolLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon name="Loader2" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!toolData) {
    return <div>Инструмент не найден</div>;
  }

  const selectedPeriod = rentalPeriods.find(p => p.days === rentalDays) || rentalPeriods[0];
  const totalPrice = selectedPeriod.price * quantity;
  const savings = (toolData.price * rentalDays * quantity) - totalPrice;

  const handleAddToCart = () => {
    addToCart({
      id: toolData._id,
      name: toolData.name,
      price: toolData.price,
      image: toolData.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg',
      category: toolData.category,
      duration: rentalDays
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: \`${toolData.name} добавлен в корзину на ${rentalDays} дней`,
    });
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
              <a href="/catalog" className="text-gray-600 hover:text-blue-600 transition-colors">Каталог</a>
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

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-gray-600 hover:text-blue-600">Главная</a>
            <Icon name="ChevronRight" className="h-4 w-4 text-gray-400" />
            <a href="/catalog" className="text-gray-600 hover:text-blue-600">Каталог</a>
            <Icon name="ChevronRight" className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{toolData.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                <img 
                  src={toolData.images[selectedImage]} 
                  alt={toolData.name}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4 space-y-2">
                  <Badge variant="outline" className="bg-white">
                    {toolData.subcategory}
                  </Badge>
                  {toolData.status === 'available' && toolData.inStock > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      В наличии
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-2">
                {toolData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={\`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={\`${toolData.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details & Booking */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{toolData.name}</h1>
              <p className="text-gray-600 mb-4">{toolData.brand} · {toolData.model || ''}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Icon 
                        key={i} 
                        name="Star" 
                        className={\`h-4 w-4 ${
                          i < Math.floor(rating.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{rating.rating}</span>
                </div>
                <span className="text-sm text-gray-600">({rating.count} отзывов)</span>
              </div>

              <p className="text-gray-700 mb-6">{toolData.description}</p>

              {/* Key Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {toolData.features.slice(0, 4).map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Booking Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">Забронировать</CardTitle>
                <CardDescription>Выберите период аренды</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rental Period */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Период аренды
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {rentalPeriods.map((period) => (
                      <button
                        key={period.days}
                        onClick={() => setRentalDays(period.days)}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          rentalDays === period.days
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {period.days} {period.days === 1 ? 'день' : 'дней'}
                        </div>
                        {period.discount > 0 && (
                          <div className="text-xs text-green-600">
                            -{period.discount}%
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                      Дата начала
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Icon name="Calendar" className="h-4 w-4 mr-2" />
                          {startDate ? format(startDate, 'dd.MM', { locale: ru }) : 'Выберите'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            if (date) {
                              setEndDate(addDays(date, rentalDays));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                      Дата окончания
                    </label>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Icon name="Calendar" className="h-4 w-4 mr-2" />
                      {endDate ? format(endDate, 'dd.MM', { locale: ru }) : 'Автоматически'}
                    </Button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Количество
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Icon name="Minus" className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(toolData.totalStock, quantity + 1))}
                      disabled={quantity >= toolData.inStock}
                    >
                      <Icon name="Plus" className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 ml-2">
                      Доступно: {toolData.inStock}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Базовая цена</span>
                    <span>{toolData.price * rentalDays * quantity}₽</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Скидка</span>
                      <span>-{savings}₽</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого</span>
                    <span>{totalPrice}₽</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {Math.round(totalPrice / rentalDays)}₽ за день
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddToCart}
                    disabled={!startDate || toolData.status !== 'available' || toolData.inStock === 0}
                  >
                    <Icon name="ShoppingCart" className="h-4 w-4 mr-2" />
                    Добавить в корзину
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Icon name="Heart" className="h-4 w-4 mr-2" />
                    В избранное
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Нужна консультация?</p>
                  <Button variant="outline" size="sm">
                    <Icon name="Phone" className="h-4 w-4 mr-2" />
                    +7 (495) 123-45-67
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="specifications">Характеристики</TabsTrigger>
              <TabsTrigger value="included">Комплектация</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы ({rating.count})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-700">
                      {toolData.fullDescription}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(toolData.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="included" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {toolData.included.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon name="Check" className="h-5 w-5 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {rating.rating}
                        </div>
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Icon 
                              key={i} 
                              name="Star" 
                              className={`h-5 w-5 ${
                                i < Math.floor(rating.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">
                          Основано на {rating.count} отзывах
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-8">{rating}</span>
                            <Icon name="Star" className="h-4 w-4 text-yellow-400" />
                            <Progress value={rating === 5 ? 80 : rating === 4 ? 15 : 5} className="flex-1" />
                            <span className="text-sm text-gray-600 w-8">
                              {rating === 5 ? '80%' : rating === 4 ? '15%' : '5%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <Icon name="Loader2" className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Пока нет отзывов</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.customerId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{review.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Icon 
                                        key={i} 
                                        name="Star" 
                                        className={`h-4 w-4 ${
                                          i < review.rating 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ru })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center space-x-4">
                              <Button variant="ghost" size="sm">
                                <Icon name="ThumbsUp" className="h-4 w-4 mr-1" />
                                Полезно ({review.helpfulVotes})
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Flag" className="h-4 w-4 mr-1" />
                                Пожаловаться
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  )}
                </div>

                {/* Add Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Оставить отзыв</CardTitle>
                    <CardDescription>
                      Поделитесь своим опытом использования этого инструмента
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">
                          Оценка
                        </label>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon 
                              key={i} 
                              name="Star" 
                              className="h-6 w-6 text-gray-300 cursor-pointer hover:text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">
                          Ваше имя
                        </label>
                        <Input placeholder="Введите ваше имя" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">
                          Отзыв
                        </label>
                        <Textarea 
                          placeholder="Расскажите о своем опыте использования..."
                          rows={4}
                        />
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Отправить отзыв
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}