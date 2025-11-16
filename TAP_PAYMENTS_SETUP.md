# Tap Payments Integration Guide

دليل تكامل Tap Payments مع منصة وزن

---

## 📋 Setup Steps

### Step 1: Get Tap Payments API Keys

1. **Create Tap Payments Account**
   - Go to [tap.company](https://tap.company)
   - Sign up for an account
   - Complete business verification

2. **Get API Keys**
   - Go to Dashboard → Settings → API Keys
   - Copy:
     - **Public Key** (starts with `pk_test_` or `pk_live_`)
     - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Add to Environment Variables

Add to `.env` file:

```env
VITE_TAP_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
VITE_TAP_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

**Note:** Use `pk_test_` and `sk_test_` for development, `pk_live_` and `sk_live_` for production.

### Step 3: Install Tap Payments SDK

```bash
npm install @tap-payments/tapjs
```

---

## 🔧 Implementation

### Payment Service File

Create `src/services/payments.ts`:

```typescript
import Tap from '@tap-payments/tapjs';

const tapPublicKey = import.meta.env.VITE_TAP_PUBLIC_KEY;
const tapSecretKey = import.meta.env.VITE_TAP_SECRET_KEY;

if (!tapPublicKey || !tapSecretKey) {
  console.warn('Tap Payments keys not configured');
}

// Initialize Tap Payments
const tap = tapPublicKey && tapSecretKey ? new Tap({
  secretKey: tapSecretKey,
  publicKey: tapPublicKey,
}) : null;

export interface PaymentData {
  amount: number;
  currency?: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Process payment using Tap Payments
 */
export async function processPayment(paymentData: PaymentData): Promise<PaymentResult> {
  if (!tap) {
    return {
      success: false,
      error: 'Tap Payments not configured',
    };
  }

  try {
    // Create charge
    const charge = await tap.Charges.create({
      amount: paymentData.amount,
      currency: paymentData.currency || 'SAR',
      customer: {
        first_name: paymentData.customerName.split(' ')[0] || paymentData.customerName,
        last_name: paymentData.customerName.split(' ').slice(1).join(' ') || '',
        email: paymentData.customerEmail,
        phone: {
          country_code: '966',
          number: paymentData.customerPhone.replace(/^0/, '').replace(/^966/, ''),
        },
      },
      source: {
        id: 'src_all', // Use saved card or create new
      },
      description: paymentData.description || `Payment for order ${paymentData.orderId}`,
      metadata: {
        order_id: paymentData.orderId,
      },
    });

    if (charge.status === 'CAPTURED' || charge.status === 'AUTHORIZED') {
      return {
        success: true,
        transactionId: charge.id,
      };
    }

    return {
      success: false,
      error: charge.response?.message || 'Payment failed',
    };
  } catch (error: any) {
    console.error('Tap Payments error:', error);
    return {
      success: false,
      error: error?.message || 'Payment processing failed',
    };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(transactionId: string): Promise<PaymentResult> {
  if (!tap) {
    return {
      success: false,
      error: 'Tap Payments not configured',
    };
  }

  try {
    const charge = await tap.Charges.retrieve(transactionId);
    
    if (charge.status === 'CAPTURED' || charge.status === 'AUTHORIZED') {
      return {
        success: true,
        transactionId: charge.id,
      };
    }

    return {
      success: false,
      error: 'Payment not completed',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Verification failed',
    };
  }
}
```

---

## 📝 Usage in Wallet Page

Update `src/modules/client/pages/Wallet.tsx`:

```typescript
import { processPayment } from '@/services/payments';

const handleSubmit = async () => {
  // ... existing validation ...
  
  // Process payment
  const paymentResult = await processPayment({
    amount: shipmentData.price || 15,
    currency: 'SAR',
    orderId: 'temp-order-id', // Will be replaced with actual order ID
    customerName: user?.user_metadata?.full_name || 'Customer',
    customerEmail: user?.email || '',
    customerPhone: values.phone || shipmentData.senderPhone,
    description: `Payment for shipment ${shipmentData.shipmentType}`,
  });

  if (!paymentResult.success) {
    message.error(paymentResult.error || 'فشل معالجة الدفع');
    return;
  }

  // Create order after successful payment
  const order = await createOrder({
    // ... order data ...
  });

  // Create transaction record
  // ... save transaction ...
  
  message.success('تم الدفع وإنشاء الطلب بنجاح!');
  navigate('/client/order-confirmation');
};
```

---

## 🧪 Testing

### Test Mode

Use test cards from Tap Payments:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0000 0000 3220`

### Test Flow

1. Create a test order
2. Go to wallet page
3. Enter test card details
4. Submit payment
5. Verify payment success
6. Check order creation

---

## 📚 Resources

- [Tap Payments Documentation](https://tap.company/docs)
- [Tap Payments API Reference](https://tap.company/docs/api)
- [Tap Payments Test Cards](https://tap.company/docs/test-cards)

---

## ⚠️ Important Notes

1. **Never expose secret key** in frontend code
2. **Use environment variables** for all keys
3. **Test thoroughly** before going to production
4. **Handle errors** gracefully
5. **Store transaction IDs** in database for reference

---

**Ready to implement?** Let me know when you have the API keys! 🚀

