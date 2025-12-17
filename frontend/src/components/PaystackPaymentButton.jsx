import { useState } from 'react';

export default function PaystackPaymentButton({
  amount,
  email,
  currency = 'GHS',
  reference,
  onSuccess,
  onClose,
  metadata = {},
  className = ''
}) {
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);

    // Paystack Popup configuration
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
      email: email,
      amount: amount, // Amount in pesewas (GHS * 100)
      currency: currency,
      ref: reference,
      metadata: metadata,
      callback: function(response) {
        setLoading(false);
        onSuccess(response);
      },
      onClose: function() {
        setLoading(false);
        onClose();
      }
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Pay ₵{(amount / 100).toFixed(2)} with Paystack
        </>
      )}
    </button>
  );
}