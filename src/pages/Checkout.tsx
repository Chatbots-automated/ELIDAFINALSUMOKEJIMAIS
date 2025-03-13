import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createTransaction } from '../services/paymentService';
import { 
  CreditCard, 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Shield, 
  Loader2, 
  ArrowLeft, 
  ChevronRight,
  Info,
  Store
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  deliveryMethod: 'shipping' | 'pickup';
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CheckoutForm>({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    deliveryMethod: 'shipping'
  });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-elida-cream pt-24">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-playfair text-gray-900 mb-4">Jūsų krepšelis tuščias</h2>
            <p className="text-gray-600 mb-8">Pridėkite prekių į krepšelį, kad galėtumėte tęsti</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
            >
              Peržiūrėti prekes
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderRef = `ORD-${Date.now()}`;
      const baseUrl = window.location.origin;

      const paymentUrl = await createTransaction({
        amount: getCartTotal(!!user),
        reference: orderRef,
        email: form.email,
        returnUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failed`,
        notificationUrl: `${baseUrl}/api/payment-notification`
      });

      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Įvyko klaida apdorojant užsakymą. Prašome bandyti dar kartą.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elida-cream pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-elida-gold mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Grįžti į parduotuvę
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-elida-gold/10 rounded-lg">
                <Shield className="h-6 w-6 text-elida-gold" />
              </div>
              <h2 className="text-2xl font-playfair text-gray-900">
                Pristatymo informacija
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <Info className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-elida-gold" />
                  Kontaktinė informacija
                </h3>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    El. paštas *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                             focus:ring-2 focus:ring-elida-gold focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-elida-gold" />
                  Asmeninė informacija
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
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                               focus:ring-2 focus:ring-elida-gold focus:border-transparent"
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
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                               focus:ring-2 focus:ring-elida-gold focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-elida-gold" />
                  Pristatymo būdas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, deliveryMethod: 'shipping' })}
                    className={`p-4 rounded-xl border ${
                      form.deliveryMethod === 'shipping'
                        ? 'border-elida-gold bg-elida-gold/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors text-left`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className={`h-5 w-5 ${form.deliveryMethod === 'shipping' ? 'text-elida-gold' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-900">Pristatymas</span>
                    </div>
                    <p className="text-sm text-gray-600">Pristatysime į nurodytą adresą</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, deliveryMethod: 'pickup' })}
                    className={`p-4 rounded-xl border ${
                      form.deliveryMethod === 'pickup'
                        ? 'border-elida-gold bg-elida-gold/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors text-left`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Store className={`h-5 w-5 ${form.deliveryMethod === 'pickup' ? 'text-elida-gold' : 'text-gray-400'}`} />
                      <span className="font-medium text-gray-900">Atsiėmimas</span>
                    </div>
                    <p className="text-sm text-gray-600">Atsiimkite mūsų salone</p>
                  </button>
                </div>
              </div>

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
                      onChange={handleChange}
                      required={form.deliveryMethod === 'shipping'}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                               focus:ring-2 focus:ring-elida-gold focus:border-transparent"
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
                        onChange={handleChange}
                        required={form.deliveryMethod === 'shipping'}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent"
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
                        onChange={handleChange}
                        required={form.deliveryMethod === 'shipping'}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                                 focus:ring-2 focus:ring-elida-gold focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.deliveryMethod === 'pickup' && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Store className="h-5 w-5 text-elida-gold flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Atsiėmimo vieta</h4>
                      <p className="text-gray-600">Vilniaus g. 23A, Panevėžys</p>
                      <p className="text-gray-600">LT-36234</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Darbo laikas:<br />
                    I-V: 9:00 - 20:00<br />
                    VI: 9:00 - 16:00<br />
                    VII: 9:00 - 14:00
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-elida-gold" />
                  Kontaktinis numeris
                </h3>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefonas *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 
                             focus:ring-2 focus:ring-elida-gold focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-xl 
                         font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2
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
                    Pereiti prie apmokėjimo
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-elida-gold/10 rounded-lg">
                  <Package className="h-6 w-6 text-elida-gold" />
                </div>
                <h2 className="text-2xl font-playfair text-gray-900">
                  Užsakymo santrauka
                </h2>
              </div>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.imageurl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600">Dydis: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-gray-600">Spalva: {item.selectedColor}</p>
                      )}
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-600">Kiekis: {item.quantity}</p>
                        <p className="font-medium text-gray-900">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="space-y-4 mb-6">
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

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck className="h-5 w-5 flex-shrink-0 text-elida-gold" />
                <p className="text-sm">
                  {form.deliveryMethod === 'pickup' 
                    ? 'Atsiėmimas salone nemokamai'
                    : 'Nemokamas pristatymas visoje Lietuvoje. Pristatymo laikas: 2-4 darbo dienos'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}