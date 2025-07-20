import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, getTotalItems } = useCart();
  const { user, logout } = useAuth();

  // Загружаем популярные инструменты с сервера
  const { data: toolsResponse, isLoading } = useQuery({
    queryKey: ['popular-tools'],
    queryFn: () => apiClient.getPopularTools(8),
  });

  const tools = toolsResponse?.data || [];
  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Icon name="Wrench" className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ToolRental</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#catalog" className="text-gray-600 hover:text-blue-600 transition-colors">Каталог</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Услуги</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">О нас</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Контакты</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Icon name="Phone" className="h-4 w-4 mr-2" />
                +7 (495) 123-45-67
              </Button>
              <Link to="/cart">
                <Button variant="outline" size="sm" className="relative">
                  <Icon name="ShoppingCart" className="h-4 w-4 mr-2" />
                  Корзина
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/profile">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Привет, {user.firstName}!</span>
                    <Button size="sm" variant="outline" onClick={logout}>
                      <Icon name="LogOut" className="h-4 w-4 mr-2" />
                      Выйти
                    </Button>
                  </div>
                ) : (
                  <Button size="sm">
                    <Icon name="User" className="h-4 w-4 mr-2" />
                    Войти
                  </Button>
                )}
              </Link>
              {user?.role === 'admin' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/admin'}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Icon name="Settings" className="h-4 w-4 mr-2" />
                  Админ
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Аренда профессиональных инструментов
              </h1>
              <p className="text-xl text-blue-100 max-w-lg">
                Более 500 видов инструментов в наличии. Быстрое бронирование, доставка по Москве, техническая поддержка 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Icon name="Search" className="h-5 w-5 mr-2" />
                  Найти инструмент
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Icon name="Play" className="h-5 w-5 mr-2" />
                  Как это работает
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/img/a1f08a16-886e-4eb0-836e-611ef0c78857.jpg" 
                alt="Professional tools" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="Star" className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">4.9</span>
                  <span className="text-gray-600">из 5</span>
                </div>
                <p className="text-sm text-gray-600">Более 1000 отзывов</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Booking Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Быстрое бронирование</CardTitle>
              <CardDescription>Найдите и забронируйте инструмент за минуту</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Что ищете?</label>
                  <Input 
                    placeholder="Перфоратор, болгарка..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Дата начала</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Icon name="Calendar" className="h-4 w-4 mr-2" />
                        {selectedDate ? format(selectedDate, 'dd MMM yyyy', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Период</label>
                  <Input placeholder="3 дня" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">&nbsp;</label>
                  <Button className="w-full">
                    <Icon name="Search" className="h-4 w-4 mr-2" />
                    Найти
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tools Catalog */}
      <section id="catalog" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Каталог инструментов</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Профессиональные инструменты от ведущих производителей для любых задач
            </p>
          </div>

          <Tabs defaultValue="Все" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="Все" className="space-y-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => (
                    <Card key={tool._id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'} 
                          alt={tool.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {tool.status !== 'available' && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary">Занято</Badge>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-white">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Icon name="Star" className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{tool.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {tool.price}₽<span className="text-sm text-gray-600">/день</span>
                          </span>
                          <Button 
                            size="sm" 
                            disabled={tool.status !== 'available' || tool.inStock === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Преимущества работы с нами</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы делаем аренду инструментов простой, быстрой и выгодной
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Icon name="Zap" className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрое бронирование</h3>
              <p className="text-gray-600">Забронируйте инструмент онлайн за 2 минуты. Моментальное подтверждение.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Icon name="Truck" className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Доставка по Москве</h3>
              <p className="text-gray-600">Бесплатная доставка в течение 2 часов. Работаем с 8:00 до 22:00.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Icon name="Shield" className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Гарантия качества</h3>
              <p className="text-gray-600">Регулярное техническое обслуживание. Страховка включена в стоимость.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Отзывы клиентов</h2>
            <p className="text-gray-600">Что говорят о нас наши клиенты</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">5.0</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Отличный сервис! Быстрая доставка, качественные инструменты. Буду пользоваться еще."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="User" className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Алексей Петров</p>
                  <p className="text-sm text-gray-600">Строитель</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">5.0</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Удобное бронирование через сайт. Инструменты в отличном состоянии, цены разумные."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="User" className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Мария Иванова</p>
                  <p className="text-sm text-gray-600">Дизайнер</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">4.8</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Профессиональный подход, качественная техника. Рекомендую всем коллегам."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="User" className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Дмитрий Сидоров</p>
                  <p className="text-sm text-gray-600">Прораб</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
            <p className="text-gray-600">Ответы на популярные вопросы о нашем сервисе</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Как работает аренда инструментов?</AccordionTrigger>
              <AccordionContent>
                Вы выбираете нужный инструмент на сайте, указываете период аренды и адрес доставки. Мы привозим инструмент в удобное время и забираем после окончания аренды.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Какие документы нужны для аренды?</AccordionTrigger>
              <AccordionContent>
                Для аренды необходим паспорт и залог. Размер залога зависит от стоимости инструмента и указан в карточке товара.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Что если инструмент сломается?</AccordionTrigger>
              <AccordionContent>
                Все инструменты застрахованы. При поломке по вине арендатора взимается стоимость ремонта. Если поломка произошла из-за износа - ремонт за наш счет.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Можно ли продлить аренду?</AccordionTrigger>
              <AccordionContent>
                Да, аренду можно продлить. Свяжитесь с нами по телефону или в личном кабинете минимум за день до окончания текущего периода.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Работаете ли вы в выходные?</AccordionTrigger>
              <AccordionContent>
                Да, мы работаем 7 дней в неделю. Доставка в выходные дни осуществляется с 9:00 до 20:00.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h2>
            <p className="text-gray-600">Остались вопросы? Мы всегда готовы помочь</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Icon name="Phone" className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Телефон</h3>
                    <p className="text-gray-600">+7 (495) 123-45-67</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Icon name="Mail" className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">info@toolrental.ru</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Icon name="MapPin" className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Адрес</h3>
                    <p className="text-gray-600">г. Москва, ул. Строителей, 15</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 rounded-full p-3">
                    <Icon name="Clock" className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Режим работы</h3>
                    <p className="text-gray-600">Пн-Вс: 8:00 - 22:00</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Отправить сообщение</CardTitle>
                <CardDescription>Мы ответим в течение 15 минут</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Имя</label>
                    <Input placeholder="Ваше имя" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Телефон</label>
                    <Input placeholder="+7 (___) ___-__-__" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Сообщение</label>
                  <Textarea placeholder="Расскажите о ваших потребностях..." />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Icon name="Send" className="h-4 w-4 mr-2" />
                  Отправить сообщение
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Wrench" className="h-6 w-6" />
                <span className="text-xl font-bold">ToolRental</span>
              </div>
              <p className="text-gray-400">
                Профессиональная аренда инструментов в Москве. Быстро, надежно, выгодно.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Каталог</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Электроинструмент</a></li>
                <li><a href="#" className="hover:text-white">Пневмоинструмент</a></li>
                <li><a href="#" className="hover:text-white">Ручной инструмент</a></li>
                <li><a href="#" className="hover:text-white">Садовая техника</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Компания</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">О нас</a></li>
                <li><a href="#" className="hover:text-white">Контакты</a></li>
                <li><a href="#" className="hover:text-white">Доставка</a></li>
                <li><a href="#" className="hover:text-white">Гарантии</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+7 (495) 123-45-67</li>
                <li>info@toolrental.ru</li>
                <li>г. Москва, ул. Строителей, 15</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ToolRental. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}