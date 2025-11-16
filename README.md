# Wazn Platform - Logistics Management System

منصة وزن للخدمات اللوجستية - نظام إدارة الشحن والتوصيل

---

## 📋 Overview

Wazn is a comprehensive logistics platform that connects clients, employers, service providers, and drivers to manage shipments efficiently. The platform supports multiple user roles with distinct features and workflows.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Set up database:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and run the SQL from `database/schema.sql`

4. **Start development server:**
   ```bash
   npm run dev
   ```

---

## 👥 User Roles

The platform supports 6 user roles:

| Role | Arabic Name | Description |
|------|------------|-------------|
| **Admin** | مسؤول النظام | System administrator with full oversight |
| **Provider** | مزود خدمة | Service provider company (e.g., Aramex, Redbox) |
| **Client** | عميل | Individual customer for personal shipments |
| **Employer** | صاحب عمل | Business owner for company shipments |
| **Driver** | سائق مستقل | Independent driver (works autonomously) |
| **Guest** | زائر | Unauthenticated visitor |

**See `ROLES_AND_RELATIONSHIPS.md` for detailed role information.**

---

## ✅ Current Status

### Fully Working Features

#### Authentication ✅
- Registration for all 4 roles (Client, Provider, Employer, Driver)
- Login with phone/email
- Logout
- Session management

#### Profile Management ✅
- All roles can load and update their profiles
- Profile data persists in Supabase
- Edit/Save/Cancel functionality

#### Order Management ✅
- **Employer**: Create orders directly
- **Client**: Complete shipment flow (create → select provider → pay → order created)
- **Provider**: View orders (New/Current tabs), Edit orders
- **Driver**: View orders, Submit proof of delivery

#### Provider Features ✅
- Drivers Management (Full CRUD)
- Orders management with edit functionality
- View order details

#### Driver Features ✅
- Proof of delivery submission
- Updates order status automatically

### UI Ready (Using Mock Data)

These pages work perfectly but use mock data:
- Order lists (some roles)
- Billing/Invoice pages
- Notifications
- Admin dashboard
- Provider permits
- Tracking page

**Note:** These can be connected to Supabase when needed.

---

## 📁 Project Structure

```
wazn_website/
├── src/
│   ├── modules/
│   │   ├── admin/          # Admin pages
│   │   ├── client/         # Client pages
│   │   ├── provider/       # Provider pages
│   │   ├── driver/         # Driver pages
│   │   ├── employer/      # Employer pages
│   │   ├── auth/           # Authentication
│   │   ├── landing/        # Landing page
│   │   └── core/           # Shared components
│   ├── services/           # Supabase service files
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   └── contexts/
│       └── authContext.tsx # Auth context
├── database/
│   ├── schema.sql          # Database schema
│   ├── cleanup.sql         # Database cleanup script
│   └── ERD.md              # Entity Relationship Diagram
└── README.md               # This file
```

---

## 🗄️ Database

### Tables
- `profiles` - User profiles
- `providers` - Provider companies
- `provider_drivers` - Provider-managed drivers
- `orders` - All orders/shipments
- `transactions` - Payments/earnings
- `proof_of_delivery` - Delivery proofs
- `permits` - Provider licenses
- `notifications` - User notifications

**See `database/ERD.md` for detailed database structure.**

### Setup
1. Run `database/schema.sql` in Supabase SQL Editor
2. Tables will be created automatically
3. RLS policies can be added later for production

---

## 🔧 Service Files

All Supabase operations are organized in service files:

- `src/services/auth.ts` - Authentication (login, register, logout)
- `src/services/profiles.ts` - Profile management
- `src/services/orders.ts` - Order operations
- `src/services/drivers.ts` - Provider drivers CRUD
- `src/services/proof.ts` - Proof of delivery

---

## 🎨 Tech Stack

- **Frontend:** React 18 + TypeScript
- **UI Library:** Ant Design
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** React Query
- **Date Handling:** Day.js
- **Build Tool:** Vite

---

## 📝 Supabase Setup

### Initial Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Choose region closest to your users

2. **Get Credentials**
   - Settings → API
   - Copy Project URL and anon key
   - Add to `.env` file

3. **Create Database Tables**
   - Run `database/schema.sql` in SQL Editor
   - Verify tables in Table Editor

4. **Configure Authentication**
   - Authentication → Settings
   - Disable email confirmation (for development)
   - Enable Email provider

### Email Confirmation

By default, Supabase requires email confirmation. For development:
- Go to Authentication → Settings
- Disable "Enable email confirmations"

**See `SUPABASE_SETUP.md` for detailed setup guide.**

---

## 🧪 Testing

### Test Registration
1. Navigate to `/select-user`
2. Choose a role
3. Fill registration form
4. Should see success and redirect

### Test Login
1. Go to `/login`
2. Enter phone and password
3. Should redirect to profile page

### Test Profile Update
1. Go to any profile page
2. Click "تعديل" (Edit)
3. Make changes
4. Click "حفظ" (Save)
5. Changes should persist

### Test Order Creation
- **Employer**: `/employer/create-order` → Fill form → Submit
- **Client**: `/client/shipments` → Create shipment → Select provider → Pay

---

## 🚧 Next Steps (Optional Enhancements)

1. **Connect Remaining Pages**
   - Replace mock data in order lists
   - Connect billing pages
   - Connect notifications

2. **File Uploads**
   - Set up Supabase Storage buckets
   - Connect permit/license uploads
   - Connect proof of delivery uploads

3. **Advanced Features**
   - Real-time order updates
   - Email notifications
   - Payment gateway integration
   - Map integration for tracking

4. **Security**
   - Add Row Level Security (RLS) policies
   - Set up proper access controls
   - Add input validation

---

## 📚 Documentation Files

- **`ROLES_AND_RELATIONSHIPS.md`** - Detailed role information and relationships
- **`database/ERD.md`** - Database Entity Relationship Diagram
- **`SUPABASE_SETUP.md`** - Complete Supabase setup guide
- **`database/schema.sql`** - Database schema (run in Supabase)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in root
- Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating `.env`

### Can't login after registration
- Check if email confirmation is enabled
- Disable it in Supabase Dashboard → Authentication → Settings
- Or check email for confirmation link

### Database errors
- Verify tables exist in Supabase Table Editor
- Check SQL Editor for error messages
- Ensure schema.sql was run successfully

---

## 📄 License

Private project - All rights reserved

---

## 🎯 Summary

**Status:** ✅ Core functionality 100% working!

- ✅ Authentication
- ✅ Profile Management
- ✅ Order Creation
- ✅ Provider Drivers Management
- ✅ Proof of Delivery
- ✅ Navigation & Routing
- ✅ Forms & Validation

**Everything that's coded is working!** 🚀

The remaining items are enhancements that can be added incrementally.
