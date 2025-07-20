import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: 'Москва',
    postalCode: '',
    deliveryDate: '',
    deliveryTime: '09:00-12:00',
    paymentMethod: 'card',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.deliveryDate) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const orderData = {
      items: items.map(item => ({
        toolId: item.id,
        quantity: item.quantity,
        days: item.duration
      })),
      startDate: formData.deliveryDate,
      endDate: new Date(new Date(formData.deliveryDate).getTime() + items[0].duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company
      },
      deliveryInfo: {
        address: `${formData.address}, ${formData.city}`,
        date: formData.deliveryDate,
        timeSlot: formData.deliveryTime,
        instructions: formData.comments
      },
      paymentMethod: formData.paymentMethod,
      notes: formData.comments
    };

    createOrderMutation.mutate(orderData);
  };

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiClient.createOrder(orderData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        clearCart();
        toast({
          title: 'Заказ создан!',
          description: `Заказ ${response.data.orderNumber} успешно оформлен`,
        });
        navigate(`/profile/orders/${response.data._id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать заказ',
        variant: 'destructive'
      });
    },
  });

  const isSubmitting = createOrderMutation.isPending;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <Icon name="ShoppingCart" className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
            <p className="text-gray-600 mb-8">Добавьте инструменты в корзину перед оформлением заказа</p>
            <Link to="/">
              <Button size="lg">
                <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                Вернуться к каталогу
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Оформление заказа</h1>
          <Link to="/cart">
            <Button variant="outline">
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Вернуться в корзину
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Форма заказа */}
            <div className="lg:col-span-2 space-y-6">
              {/* Контактная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="User" className="h-5 w-5 mr-2" />
                    Контактная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Компания (необязательно)</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Адрес доставки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="MapPin" className="h-5 w-5 mr-2" />
                    Адрес доставки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Улица, дом, квартира"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Город *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Почтовый индекс</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Доставка */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="Truck" className="h-5 w-5 mr-2" />
                    Доставка
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Дата доставки *</Label>
                      <Input
                        id="deliveryDate"
                        name="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Время доставки *</Label>
                      <RadioGroup
                        value={formData.deliveryTime}
                        onValueChange={(value) => setFormData({...formData, deliveryTime: value})}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="09:00-12:00" id="time1" />
                          <Label htmlFor="time1">09:00 - 12:00</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12:00-15:00" id="time2" />
                          <Label htmlFor="time2">12:00 - 15:00</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="15:00-18:00" id="time3" />
                          <Label htmlFor="time3">15:00 - 18:00</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Способ оплаты */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="CreditCard" className="h-5 w-5 mr-2" />
                    Способ оплаты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center">
                        <Icon name="CreditCard" className="h-4 w-4 mr-2" />
                        Банковская карта
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center">
                        <Icon name="Banknote" className="h-4 w-4 mr-2" />
                        Наличные при получении
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="invoice" id="invoice" />
                      <Label htmlFor="invoice" className="flex items-center">
                        <Icon name="FileText" className="h-4 w-4 mr-2" />
                        По счету (для юр. лиц)
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Комментарии */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="MessageSquare" className="h-5 w-5 mr-2" />
                    Комментарии к заказу
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    placeholder="Дополнительные пожелания или инструкции..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Сводка заказа */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500">{item.quantity} шт × {item.duration} дней</p>
                        </div>
                        <p className="font-medium">
                          {(item.price * item.quantity * item.duration).toLocaleString()} ₽
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Подытог:</span>
                      <span>{getTotalPrice().toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Доставка:</span>
                      <span className="text-green-600">Бесплатно</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Итого:</span>
                      <span className="text-green-600">{getTotalPrice().toLocaleString()} ₽</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                        Оформляем заказ...
                      </>
                    ) : (
                      <>
                        <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                        Оформить заказ
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Гарантии */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="Shield" className="h-5 w-5 mr-2" />
                    Гарантии
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Icon name="Check" className="h-4 w-4 mr-2 text-green-500" />
                      Страхование инструмента
                    </p>
                    <p className="flex items-center">
                      <Icon name="Check" className="h-4 w-4 mr-2 text-green-500" />
                      Техническая поддержка 24/7
                    </p>
                    <p className="flex items-center">
                      <Icon name="Check" className="h-4 w-4 mr-2 text-green-500" />
                      Замена при поломке
                    </p>
                    <p className="flex items-center">
                      <Icon name="Check" className="h-4 w-4 mr-2 text-green-500" />
                      Возврат денег при отмене
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;