// Update the handleSubmit function in Checkout.tsx
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

export default handleSubmit