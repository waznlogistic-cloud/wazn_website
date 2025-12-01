# Wazn Platform

A comprehensive logistics and shipping management platform built with React, TypeScript, and Supabase.

## Overview

Wazn is a multi-role logistics platform that connects clients, employers, providers, and drivers to facilitate efficient shipping and delivery services across Saudi Arabia.

## Features

### Core Functionality
- **Multi-role Authentication** - Support for Admin, Employer, Provider, Driver, and Client roles
- **Order Management** - Create, track, and manage shipping orders
- **Real-time Tracking** - Track shipments with status updates
- **Payment Integration** - Invoice management, wallet balances, and payout requests
- **Address Management** - Interactive map-based address selection using Leaflet
- **Profile Management** - Comprehensive user profile management for all roles

### Role-Specific Features

#### Employer
- Create and manage shipping orders
- View order history and details
- Manage company profile and billing
- Track shipments

#### Provider
- Receive and manage orders
- Assign orders to drivers
- Manage driver team
- View permits and licenses
- Handle billing and payouts

#### Driver
- View assigned orders
- Submit proof of delivery
- Track earnings and wallet balance
- Request payouts

#### Client
- Create shipping orders
- Select providers
- Track shipments
- Manage addresses
- View wallet balance

#### Admin
- System-wide dashboard
- Manage all users and companies
- View all orders and transactions
- System notifications

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS 4
- **Maps**: Leaflet, React Leaflet
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Context API, TanStack Query
- **Form Handling**: React Hook Form, Zod validation
- **Routing**: React Router DOM 7

## Project Structure

```
wazn_website/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── admin/        # Admin pages
│   │   ├── employer/     # Employer pages
│   │   ├── provider/     # Provider pages
│   │   ├── driver/       # Driver pages
│   │   ├── client/       # Client pages
│   │   ├── auth/         # Authentication
│   │   ├── landing/      # Landing page
│   │   └── core/         # Shared components
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   ├── lib/             # Library configurations
│   └── config/           # App configuration
├── database/             # Database schemas and migrations
├── public/               # Static assets
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Maps API key (optional, for address picker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wazn_website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key  # Optional
```

4. Set up the database:
   - Run SQL scripts in `database/` folder in order:
     1. `schema.sql` - Base tables
     2. `schema_enhanced.sql` - Payment tables
     3. `rls_policies.sql` - Base RLS policies
     4. `rls_policies_enhanced.sql` - Payment RLS policies
     5. `fix_login_rls.sql` - Login RLS policy
     6. `storage_setup.sql` - Storage buckets
     7. `triggers.sql` - Auto-update triggers

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173)

## Database Schema

The platform uses PostgreSQL with the following main tables:

- `profiles` - User profiles
- `employers` - Employer-specific data
- `providers` - Provider companies
- `orders` - Shipping orders
- `transactions` - Payment transactions
- `invoices` - Employer invoices
- `payout_requests` - Driver/provider payout requests
- `wallet_balances` - User wallet balances
- `proof_of_delivery` - Delivery proofs
- `permits` - Provider permits/licenses
- `notifications` - System notifications

See `database/ERD.md` for the complete entity relationship diagram.

## Authentication

The platform uses Supabase Authentication with:
- Email/password authentication
- Phone number lookup for login
- Role-based access control (RBAC)
- Row Level Security (RLS) policies

## API Documentation

### Services

- `auth.ts` - Authentication (login, register, logout)
- `orders.ts` - Order management (create, get, update)
- `profiles.ts` - Profile management
- `drivers.ts` - Driver management
- `proof.ts` - Proof of delivery

### Environment Variables

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting
- React Hooks best practices

## Deployment

### Build for Production

```bash
npm run build
```

The `dist` folder contains the production-ready files.

### Environment Setup

Ensure all environment variables are set in your deployment platform:
- Vercel: Add in Project Settings → Environment Variables
- Netlify: Add in Site Settings → Environment Variables
- Other platforms: Follow their environment variable documentation

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Ant Design for the UI components
- Supabase for the backend infrastructure
- Leaflet for map functionality
