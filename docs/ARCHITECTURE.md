# Architecture Documentation

## System Architecture

Wazn Platform follows a modern React application architecture with clear separation of concerns.

## Frontend Architecture

### Component Structure

- **Pages** - Top-level route components
- **Components** - Reusable UI components
- **Services** - API interaction layer
- **Contexts** - Global state management
- **Hooks** - Custom React hooks
- **Types** - TypeScript type definitions

### State Management

- **React Context** - Global authentication state
- **TanStack Query** - Server state and caching
- **Local State** - Component-level state with useState

### Routing

- React Router DOM for client-side routing
- Protected routes based on user roles
- Dynamic route generation based on role

## Backend Architecture

### Database

- PostgreSQL via Supabase
- Row Level Security (RLS) for data access control
- Triggers for automatic timestamp updates
- Foreign key constraints for data integrity

### Authentication

- Supabase Auth for user authentication
- JWT tokens for session management
- Role-based access control (RBAC)
- Phone number lookup for login

### Storage

- Supabase Storage for file uploads
- Buckets for different file types:
  - `proof-of-delivery` - Delivery proofs
  - `permits` - Provider licenses
  - `profiles` - Profile images

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Users can only access their own data
- Public read access for login (email/role only)
- Role-based data access

### Authentication Flow

1. User enters phone number
2. System looks up email from profiles table
3. Authenticate with Supabase using email
4. Set role from profile or metadata
5. Redirect to role-specific dashboard

## Data Flow

### Order Creation Flow

1. User fills order form
2. Form validation (Zod)
3. Submit to `createOrder` service
4. Insert into `orders` table
5. Generate tracking number
6. Return success response
7. Redirect to orders page

### Order Status Updates

1. Driver submits proof of delivery
2. Update order status to "delivered"
3. Set `delivered_at` timestamp
4. Trigger notifications
5. Update wallet balances

## API Structure

### Service Layer

Services are organized by domain:
- `auth.ts` - Authentication operations
- `orders.ts` - Order operations
- `profiles.ts` - Profile operations
- `drivers.ts` - Driver operations

### Error Handling

- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging
- Error boundaries for React components

## Performance Considerations

- Code splitting with React.lazy
- Image lazy loading
- Query caching with TanStack Query
- Optimistic updates where appropriate

