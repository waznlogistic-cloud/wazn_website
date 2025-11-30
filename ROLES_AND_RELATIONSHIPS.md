# Wazn Platform - Roles, Relationships & Features

## 📊 Role Relationships Diagram

```
┌─────────────┐
│   Admin     │ ──► Manages ALL (System-wide oversight)
└─────────────┘
      │
      ├──► Manages Companies (Providers)
      ├──► Manages Customers (Clients & Employers)
      ├──► Monitors All Orders
      └──► Manages All Payments

┌─────────────┐         ┌─────────────┐
│   Client    │ ──────► │  Provider   │
│  (Individual│         │  (Service   │
│   Customer) │         │   Company)  │
└─────────────┘         └─────────────┘
                              │
                              ├──► Manages Drivers
                              └──► Assigns Orders to Drivers

┌─────────────┐         ┌─────────────┐
│  Employer   │ ──────► │  Provider   │
│  (Business  │         │  (Service   │
│   Owner)    │         │   Company)  │
└─────────────┘         └─────────────┘
                              │
                              └──► Assigns Orders to Drivers

                              ┌─────────────┐
                              │   Driver    │
                              │ (Managed   │
                              │  by Provider)│
                              └─────────────┘

┌─────────────┐
│ Independent │ ──► Works independently
│   Driver    │     (Not attached to Provider)
│ (سائق مستقل)│     Receives orders directly
└─────────────┘
```

---

## 🔄 Complete Order Flow

### Flow 1: Client Order Flow (Provider-managed Driver)
```
1. Client creates shipment order
   ↓
2. Client selects Provider (Aramex, Redbox, etc.)
   ↓
3. Client pays for shipment
   ↓
4. Provider sees new order
   ↓
5. Provider assigns order to Provider-managed Driver
   ↓
6. Driver sees assigned order
   ↓
7. Driver picks up shipment
   ↓
8. Driver delivers shipment
   ↓
9. Driver uploads proof of delivery
   ↓
10. Provider pays Driver
    ↓
11. Client tracks shipment status
```

### Flow 1b: Client Order Flow (Independent Driver)
```
1. Client creates shipment order
   ↓
2. Client selects Provider OR Independent Driver
   ↓
3. Client pays for shipment
   ↓
4. Independent Driver receives order directly
   ↓
5. Independent Driver picks up shipment
   ↓
6. Independent Driver delivers shipment
   ↓
7. Independent Driver uploads proof of delivery
   ↓
8. System/Admin pays Independent Driver
   ↓
9. Client tracks shipment status
```

### Flow 2: Employer Order Flow
```
1. Employer creates business shipment order
   ↓
2. Employer selects Provider
   ↓
3. Employer pays (or company billing)
   ↓
4. Provider sees new order
   ↓
5. Provider assigns order to Driver
   ↓
6. Driver completes delivery
   ↓
7. Employer receives invoice/billing
```

---

## 👥 Role Details & Features

### 1. **Admin** (مسؤول النظام)
**Who:** System administrator  
**Purpose:** Full platform management and oversight

**Relationships:**
- Manages all Providers (Companies)
- Manages all Clients
- Manages all Employers
- Monitors all orders across the system
- Oversees all payments and financial transactions

**Features:**
- ✅ **Dashboard** - System statistics, charts, KPIs
  - Customer satisfaction rate
  - Executive summary (total actions, profits)
  - Monthly orders summary
  - Orders summary cards (all, new, in progress, completed)
  
- ✅ **Orders Management** - View all orders system-wide
  - Order number, shipment type, dates
  - Company, status, view details
  
- ✅ **Companies Management** - Manage service providers
  - Company name, commercial register
  - Contact info, partnership count
  - Customer rating, view contracts
  
- ✅ **Customers Management** - Manage all customers
  - Customer name, phone
  - Order count, last order date
  - Customer status (active/inactive)
  
- ✅ **Payments Management** - Financial oversight
  - Payment details table
  - Financial reports download
  - Wallet balance management
  - Withdraw functionality
  
- ✅ **Notifications** - System-wide notifications
  - Filter by category (orders, drivers, payments, etc.)
  - View notification details
  
- ✅ **Terms & Conditions** - Platform terms

---

### 2. **Provider** (مزود خدمة)
**Who:** Service provider company (e.g., Aramex, Redbox)  
**Purpose:** Provide shipping/logistics services

**Relationships:**
- Receives orders from Clients and Employers
- Manages Drivers (adds, edits, assigns orders)
- Pays Drivers for completed deliveries
- Receives payments from Clients/Employers

**Features:**
- ✅ **Profile** - Service provider information
  - Service provider name
  - Personal information (name, email, phone, ID, etc.)
  
- ✅ **Orders** - Manage incoming orders
  - New Orders tab (accept/reject)
  - Current Orders tab (in progress)
  - View order details
  - Edit order information
  - Assign orders to drivers
  
- ✅ **Drivers Management** - Manage driver team
  - Add new drivers
  - Edit driver information
  - Delete drivers
  - View driver list (name, mobile, ID, license, vehicle)
  
- ✅ **Permits** - Manage licenses and permits
  - Upload permits
  - View permit list
  - Track permit expiry dates
  - Download permit documents
  
- ✅ **Billing** - Financial management
  - Payment summary (total dues, paid, pending)
  - Payment details table
  - Financial reports download
  - Withdraw wallet balance
  
- ✅ **Notifications** - Receive notifications
  - Order notifications
  - Payment notifications
  - Driver notifications
  - System notifications
  
- ✅ **Terms & Conditions**

---

### 3. **Independent Driver** (سائق مستقل)
**Who:** Independent driver who works autonomously  
**Purpose:** Pick up and deliver shipments independently

**Relationships:**
- **Works independently** (NOT attached to a Provider)
- Can receive orders directly from the system/Admin
- Can also receive orders from Providers (if assigned)
- Completes deliveries and uploads proof
- Receives payments from system/Admin or Provider
- Has own wallet and billing system

**Note:** This is different from Provider-managed Drivers (drivers that Providers add to their team through the Provider's "Drivers Management" page). Provider-managed Drivers may not have their own login/UI - they're managed by the Provider.

**Features:**
- ✅ **Profile** - Personal and professional information
  - Full name, phone number, email
  - Date of birth, nationality
  - ID number (with verification badge)
  - Phone number (with verification badge)
  - Password and confirm password
  - Driving license number and expiry date
  - Vehicle type and plate number
  - Upload: Driving license image, ID image, Personal photo
  - View uploaded documents
  - Edit profile information
  - Terms and conditions agreement
  
- ✅ **Orders** - View available and assigned orders
  - Tabs: "الطلبات الجديدة" (New Orders), "الطلبات قيد التوصيل" (Orders in Progress), "الطلبات المكتملة" (Completed Orders)
  - Shipping requests table
  - Order number, sender name/phone, receiver name
  - Pickup address, delivery address
  - Order date, order status
  - View order details
  - Accept/reject orders (for new orders)
  
- ✅ **Proof of Delivery** - Upload delivery proof
  - Delivery confirmation table
  - Recipient information
  - Delivery code input
  - Delivery date
  - Image upload for proof
  - View/delete uploaded proofs
  
- ✅ **Wallet/Billing** - Manage earnings and payments
  - Circular progress charts:
    - "إجمالي الأرباح" (Total Earnings)
    - "الأرباح المستحقة" (Due Earnings)
    - "الأرباح المدفوعة" (Paid Earnings)
  - Payment details table (payment number, date, amount, status)
  - View transaction details
  - Request withdrawal ("طلب سحب")
  - Download earnings report
  
- ✅ **Terms & Conditions**

---

### 4. **Client** (عميل)
**Who:** Individual customer (personal use)  
**Purpose:** Send personal shipments

**Relationships:**
- Creates orders
- Selects Provider
- Pays for shipments
- Tracks shipments

**Features:**
- ✅ **Profile** - Personal information
  - Client name, mobile, email
  - ID number, birth date, nationality
  - Edit/Save functionality
  
- ✅ **Shipments** - Manage personal shipments
  - Create new shipment modal
    - Shipment date, type, weight, delivery method
    - Terms and conditions checkbox
  - Service provider selection
    - View providers (Aramex, Redbox)
    - Ratings and prices
    - Select provider
  - View scheduled shipments
  
- ✅ **Wallet** - Payment management
  - Payment method selection (Apple Pay, Mada)
  - Card details form (card number, expiry, CVV)
  - Payment confirmation
  
- ✅ **Tracking** - Track shipments
  - Order details (order number, date, status)
  - Sender and receiver information
  - Delivery progress tracker
  - Map view (placeholder)
  - Bill of lading download/share
  
- ✅ **Order Confirmation** - Success page
  - Tracking number
  - Bill of lading image
  - Download and share buttons
  
- ✅ **Terms & Conditions**

---

### 5. **Employer** (صاحب عمل)
**Who:** Business owner/company representative  
**Purpose:** Send business/company shipments

**Relationships:**
- Creates business orders
- Selects Provider
- Manages company billing/invoices
- Similar to Client but for businesses

**Features:**
- ✅ **Profile** - Company information
  - Company name, commercial registration/tax number
  - Personal information (name, ID, birth date, mobile, email)
  - Password update functionality
  - Edit/Save functionality
  
- ✅ **Orders** - View company orders
  - Orders table with loading/error/empty states
  - Order number, shipment type, dates
  - Company, status
  - View order details
  - Connected to Supabase
  
- ✅ **Create Order** - Create new business shipment
  - Shipment details (date, type, weight, delivery method)
  - Sender information (name, phone, address)
  - Recipient information (name, phone, address)
  - Submit order (connected to Supabase)
  
- ✅ **Billing** - Company financial management
  - Summary cards (total invoices, paid, due)
  - Invoices table
  - Invoice number, date, amount, status
  - View invoice details (modal)
  - Download invoices (HTML generation)
  
- ✅ **Terms & Conditions**

---

### 6. **Guest** (زائر)
**Who:** Unauthenticated visitor  
**Purpose:** Browse public pages

**Features:**
- ✅ View landing page
- ✅ Login
- ✅ Register (select role)
- ✅ Browse public information

---

## 🔗 Key Relationships Summary

| Relationship | Description |
|-------------|-------------|
| **Admin ↔ All Roles** | Admin manages and monitors all users and activities |
| **Client/Employer ↔ Provider** | Customers create orders, Providers receive them |
| **Provider ↔ Provider-managed Drivers** | Provider manages their driver team and assigns orders to them |
| **Independent Driver ↔ System/Admin** | Independent drivers receive orders directly, work autonomously |
| **Independent Driver ↔ Provider** | Can receive orders from Providers if assigned (optional) |
| **Client/Employer ↔ Provider-managed Driver** | Indirect - through Provider (customer orders → provider → driver) |
| **Client/Employer ↔ Independent Driver** | Can select Independent Driver directly or through system |

---

## 📋 Feature Comparison

| Feature | Admin | Provider | Independent Driver | Client | Employer |
|---------|-------|----------|-------------------|--------|----------|
| **Create Orders** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **View Orders** | ✅ (All) | ✅ (Received) | ✅ (Available/Assigned) | ✅ (Own) | ✅ (Own) |
| **Manage Drivers** | ❌ | ✅ (Provider-managed) | ❌ | ❌ | ❌ |
| **Upload Proof** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Manage Companies** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Customers** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Payments** | ✅ (All) | ✅ (Own) | ✅ (Wallet/Earnings) | ✅ (Wallet) | ✅ (Invoices) |
| **Assign Orders** | ❌ | ✅ (To Provider-managed Drivers) | ❌ | ❌ | ❌ |
| **Accept/Reject Orders** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Request Withdrawal** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Track Shipments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Notifications** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Work Independently** | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 🎯 Complete System Overview

**Total Roles:** 6 (Admin, Provider, Independent Driver, Client, Employer, Guest)  
**Total Pages Implemented:** 40+  
**Status:** ✅ All UI pages complete and matching Figma designs

**Important Note:** 
- **Independent Driver (سائق مستقل)** = Works independently, has own login/UI, manages own profile and wallet
- **Provider-managed Drivers** = Drivers added by Providers through "Drivers Management" page (may not have own login/UI)

**Next Steps:** Backend API integration

