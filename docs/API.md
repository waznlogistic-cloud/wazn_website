# API Documentation

## Authentication API

### Login

```typescript
login(credentials: LoginCredentials): Promise<AuthResponse>
```

**Parameters:**
- `email` or `phone`: User identifier
- `password`: User password

**Returns:** Authentication session and user data

### Register

```typescript
register(data: RegisterData): Promise<AuthResponse>
```

**Parameters:**
- `email`: User email
- `password`: User password
- `phone`: User phone number
- `role`: User role (admin, employer, provider, driver, client)
- `metadata`: Additional user data

**Returns:** Created user and session

### Logout

```typescript
logout(): Promise<void>
```

Signs out the current user.

## Orders API

### Get Orders

```typescript
getOrders(role: string, userId: string): Promise<Order[]>
```

**Parameters:**
- `role`: User role
- `userId`: User ID

**Returns:** Array of orders filtered by role

### Create Order

```typescript
createOrder(orderData: CreateOrderData): Promise<Order>
```

**Parameters:**
- `employer_id` or `client_id`: Order creator ID
- `ship_type`: Type of shipment
- `sender_name`, `sender_phone`, `sender_address`: Sender details
- `receiver_name`, `receiver_phone`, `receiver_address`: Receiver details
- `weight`: Shipment weight in kg
- `delivery_method`: Delivery method
- `delivery_at`: Delivery date

**Returns:** Created order with tracking number

### Update Order Status

```typescript
updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
```

**Parameters:**
- `orderId`: Order ID
- `status`: New status (new, in_progress, delivered, canceled)

**Returns:** Updated order

## Profiles API

### Get Profile

```typescript
getProfile(userId: string): Promise<Profile | null>
```

**Parameters:**
- `userId`: User ID

**Returns:** User profile data

### Update Profile

```typescript
updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>
```

**Parameters:**
- `userId`: User ID
- `updates`: Profile fields to update

**Returns:** Updated profile

### Get Employer Profile

```typescript
getEmployerProfile(userId: string): Promise<EmployerProfile | null>
```

**Parameters:**
- `userId`: User ID

**Returns:** Employer-specific profile data

## Types

### Order

```typescript
interface Order {
  id: string;
  tracking_no?: string;
  ship_type?: string;
  weight?: number;
  status: OrderStatus;
  sender_name?: string;
  sender_phone?: string;
  sender_address?: string;
  receiver_name?: string;
  receiver_phone?: string;
  receiver_address?: string;
  created_at?: string;
  delivery_at?: string;
  delivered_at?: string;
  employer_id?: string;
  client_id?: string;
  provider_id?: string;
  driver_id?: string;
}
```

### Profile

```typescript
interface Profile {
  id: string;
  role: RoleKey;
  full_name?: string;
  phone: string;
  email: string;
  id_number?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
}
```

### OrderStatus

```typescript
type OrderStatus = "new" | "in_progress" | "delivered" | "canceled";
```

