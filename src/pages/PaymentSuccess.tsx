import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Package, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/paymentService';
import { useStore } from '../store/useStore';

interface PaymentDetails {
  reference: string;
  amount: string;
  email: string;
  name: string;
  date: string;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      const transactionId = searchParams.get('payment_reference');
      
      if (!transactionId) {
        setError('No transaction ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const isValid = await verifyPayment(transactionId);
        
        if (isValid) {
          // Clear the cart after successful payment
          clearCart();

          // Collect payment details from URL parameters
          const details: PaymentDetails = {
            reference: searchParams.get('reference') || '',
            amount: searchParams.get('amount') || '',
            email: searchParams.get('email') || '',
            name: searchParams.get('name') || '',
            date: new Date().toISOString()
          };

          setPaymentDetails(details);

          // Send webhook to Make.com
          await fetch("https://hook.eu2.make.com/cpw4ynt56urvf97eb2l9ap1rsm67hef2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionId,
              status: "COMPLETED",
              ...details,
              message: "Payment completed successfully"
            }),
          });
        } else {
          setError('Payment verification failed');
          navigate('/payment-failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('An error occurred while verifying the payment');
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [navigate, clearCart, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-elida-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Loader2 className="h-12 w-12 text-elida-gold animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-playfair text-gray-900 mb-4">
            Apdorojamas mokėjimas
          </h2>
          <p className="text-gray-600">
            Prašome palaukti, kol patikrinsime jūsų mokėjimą...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-elida-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-playfair text-gray-900 mb-4">
            {error}
          </h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Grįžti į pagrindinį puslapį
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elida-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-elida-gold mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Grįžti į pagrindinį puslapį
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
          </motion.div>

          <h2 className="text-2xl font-playfair text-gray-900 mb-4 text-center">
            Mokėjimas sėkmingas!
          </h2>
          
          <p className="text-gray-600 mb-8 text-center">
            Jūsų užsakymas buvo sėkmingai apmokėtas. Netrukus gausite patvirtinimo el. laišką.
          </p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-elida-gold" />
                  <span>Užsakymo numeris:</span>
                </div>
                <span className="font-medium text-gray-900">{paymentDetails.reference}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-elida-gold" />
                  <span>Suma:</span>
                </div>
                <span className="font-medium text-gray-900">€{paymentDetails.amount}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-elida-gold" />
                  <span>Data:</span>
                </div>
                <span className="font-medium text-gray-900">
                  {new Date(paymentDetails.date).toLocaleDateString('lt-LT')}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/profile"
              className="block w-full py-3 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-xl font-medium 
                       hover:shadow-lg transition-all duration-300 text-center"
            >
              Peržiūrėti užsakymus
            </Link>

            <Link
              to="/"
              className="block w-full py-3 bg-white text-elida-gold border border-elida-gold/20 rounded-xl font-medium 
                       hover:bg-elida-gold/5 transition-all duration-300 text-center"
            >
              Grįžti į pagrindinį puslapį
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}