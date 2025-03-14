import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, Truck, MapPin, User, Mail, Phone, ArrowLeft, Loader2, AlertCircle, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { createTransaction } from '../services/paymentService';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryMethod: 'shipping' | 'pickup';
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'shipping'
  });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-elida-cream pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-playfair text-gray-900 mb-4">
              Jūsų krepšelis tuščias
            </h2>
            <p className="text-gray-600 mb-8">
              Pridėkite prekių į krepšelį, kad galėtumėte tęsti apsipirkimą
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
            >
              <Package className="h-5 w-5" />
              Peržiūrėti prekes
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryMethodChange = (method: 'shipping' | 'pickup') => {
    setForm(prev => ({ ...prev, deliveryMethod: method }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderRef = `ORD-${Date.now()}`;
      const baseUrl = window.location.origin;

      // Prepare order data
      const orderData = {
        reference: orderRef,
        userId: user?.uid || 'anonymous',
        email: form.email,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getCartTotal(!!user),
        shipping: {
          method: form.deliveryMethod,
          name: `${form.firstName} ${form.lastName}`,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          email: form.email,
          phone: form.phone
        },
        status: 'created'
      };

      const paymentUrl = await createTransaction({
        amount: getCartTotal(!!user),
        reference: orderRef,
        email: form.email,
        returnUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failed`,
        notificationUrl: `${baseUrl}/api/payment-notification`,
        orderData
      });

      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Įvyko klaida apdorojant užsakymą. Prašome bandyti dar kartą.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elida-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-elida-gold mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Grįžti atgal
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-elida-gold/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-elida-gold" />
                </div>
                <h2 className="text-2xl font-playfair text-gray-900">
                  Apmokėjimas
                </h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pristatymo būdas
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleDeliveryMethodChange('shipping')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.deliveryMethod === 'shipping'
                          ? 'border-elida-gold bg-elida-gold/5'
                          : 'border-gray-200 hover:border-elida-gold/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Truck className={`h-5 w-5 ${
                          form.deliveryMethod === 'shipping' ? 'text-elida-gold' : 'text-gray-400'
                        }`} />
                        <span className="font-medium">Pristatymas</span>
                      </div>
                      <p className="text-sm text-gray-500">2-3 darbo dienos</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeliveryMethodChange('pickup')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.deliveryMethod === 'pickup'
                          ? 'border-elida-gold bg-elida-gold/5'
                          : 'border-gray-200 hover:border-elida-gold/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <MapPin className={`h-5 w-5 ${
                          form.deliveryMethod === 'pickup' ? 'text-elida-gold' : 'text-gray-400'
                        }`} />
                        <span className="font-medium">Atsiėmimas</span>
                      </div>
                      <p className="text-sm text-gray-500">Vilniaus g. 23A, Panevėžys</p>
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-elida-gold" />
                    Kontaktinė informacija
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Vardas *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                 placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Pavardė *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                 placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      El. paštas *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                 placeholder-gray-400 transition-all duration-300"
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefono numeris *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                 placeholder-gray-400 transition-all duration-300"
                        placeholder="+370"
                      />
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {form.deliveryMethod === 'shipping' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-elida-gold" />
                      Pristatymo adresas
                    </h3>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresas *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                 placeholder-gray-400 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          Miestas *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 
                                   focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                   placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pašto kodas *
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={form.postalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 
                                   focus:ring-2 focus:ring-elida-gold focus:border-transparent
                                   placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-xl font-medium 
                           hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Apdorojama...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Apmokėti {getCartTotal(!!user).toFixed(2)}€
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-elida-gold/10 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-elida-gold" />
                </div>
                <h2 className="text-2xl font-playfair text-gray-900">
                  Užsakymo informacija
                </h2>
              </div>

              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={item.imageurl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/elida-logo.svg';
                          target.className = 'w-full h-full object-contain p-2';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600">Dydis: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-gray-600">Spalva: {item.selectedColor}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">Kiekis: {item.quantity}</p>
                        <p className="font-medium text-gray-900">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tarpinė suma</span>
                    <span>€{getCartTotal(false).toFixed(2)}</span>
                  </div>
                  {user && (
                    <div className="flex justify-between text-sm text-green-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Narystės nuolaida</span>
                      </div>
                      <span>-15%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Pristatymas</span>
                    <span>Apskaičiuojama užsakymo metu</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Viso</span>
                    <div className="flex flex-col items-end">
                      <span>€{getCartTotal(!!user).toFixed(2)}</span>
                      {user && (
                        <span className="text-sm text-gray-500 line-through">
                          €{getCartTotal(false).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}