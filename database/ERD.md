# Wazn Platform - Entity Relationship Diagram (ERD)

## Mermaid ERD

```mermaid
erDiagram
    auth_users ||--o| profiles : "has"
    profiles ||--o| providers : "can be"
    profiles ||--o| orders_client : "creates"
    profiles ||--o| orders_employer : "creates"
    profiles ||--o| orders_driver : "assigned to"
    profiles ||--o| transactions : "has"
    profiles ||--o| proof_of_delivery : "creates"
    profiles ||--o| notifications : "receives"
    
    providers ||--o{ provider_drivers : "manages"
    providers ||--o{ orders : "receives"
    providers ||--o{ permits : "has"
    
    provider_drivers ||--o{ orders : "assigned to"
    
    orders ||--o{ transactions : "generates"
    orders ||--o| proof_of_delivery : "has"
    
    auth_users {
        uuid id PK
        string email
        jsonb raw_user_meta_data
        timestamp created_at
    }
    
    profiles {
        uuid id PK "FK -> auth.users"
        enum role "admin, employer, provider, driver, client"
        string full_name
        string phone
        string email
        string id_number
        date date_of_birth
        string nationality
        string address
        timestamp created_at
        timestamp updated_at
    }
    
    providers {
        uuid id PK "FK -> profiles"
        string company_name
        string commercial_registration
        string tax_number
        string activity_type
        decimal rating
        timestamp created_at
        timestamp updated_at
    }
    
    provider_drivers {
        uuid id PK
        uuid provider_id FK "FK -> providers"
        string name
        string phone
        string id_number
        string license_number
        date license_expiry
        string vehicle_type
        string vehicle_plate
        timestamp created_at
        timestamp updated_at
    }
    
    orders {
        uuid id PK
        string tracking_no UNIQUE
        uuid client_id FK "FK -> profiles"
        uuid employer_id FK "FK -> profiles"
        uuid provider_id FK "FK -> providers"
        uuid driver_id FK "FK -> profiles (independent driver)"
        uuid provider_driver_id FK "FK -> provider_drivers"
        string ship_type
        string status "new, in_progress, delivered, canceled"
        string sender_name
        string sender_phone
        string sender_address
        string receiver_name
        string receiver_phone
        string receiver_address
        decimal weight
        decimal price
        string delivery_method
        timestamp created_at
        timestamp delivery_at
        timestamp delivered_at
    }
    
    transactions {
        uuid id PK
        uuid user_id FK "FK -> profiles"
        uuid order_id FK "FK -> orders"
        string type "payment, withdrawal, earning"
        decimal amount
        string status "pending, paid, processing, failed"
        string description
        timestamp created_at
    }
    
    proof_of_delivery {
        uuid id PK
        uuid order_id FK "FK -> orders"
        uuid driver_id FK "FK -> profiles"
        string receiver_name
        string receiver_id_number
        string delivery_code
        date delivery_date
        string proof_image_url
        string signature_url
        timestamp created_at
    }
    
    permits {
        uuid id PK
        uuid provider_id FK "FK -> providers"
        string permit_type
        string permit_number
        string permit_file_url
        date expiry_date
        timestamp created_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK "FK -> profiles"
        string title
        string message
        string type "order, payment, driver, system"
        boolean read
        timestamp created_at
    }
```

## Text-Based ERD

```
┌─────────────────────────────────────────────────────────────────┐
│                        auth.users (Supabase)                    │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK)                                                │
│  • email                                                        │
│  • raw_user_meta_data (JSONB)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:1
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         profiles                                │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK) ──► FK to auth.users                          │
│  • role (enum: admin, employer, provider, driver, client)      │
│  • full_name                                                    │
│  • phone                                                        │
│  • email                                                        │
│  • id_number                                                    │
│  • date_of_birth                                               │
│  • nationality                                                 │
│  • address                                                     │
│  • created_at, updated_at                                       │
└────┬──────────┬──────────┬──────────┬──────────┬──────────────┘
     │          │          │          │          │
     │          │          │          │          │
     │ 1:1      │ 1:N      │ 1:N      │ 1:N      │ 1:N
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐
│providers│ │ orders  │ │ orders  │ │ orders  │ │transactions │
│         │ │(client) │ │(employer│ │(driver) │ │              │
│         │ │         │ │)        │ │         │ │              │
│• id (FK)│ │• client │ │•employer│ │• driver │ │• user_id (FK)│
│•company │ │  _id(FK)│ │  _id(FK)│ │  _id(FK)│ │• order_id(FK)│
│  _name  │ └─────────┘ └─────────┘ └─────────┘ │• type        │
│•commerc│                                        │• amount      │
│  ial_  │                                        │• status      │
│  reg   │                                        └──────────────┘
│•tax_num│
│•rating │
└────┬───┘
     │
     │ 1:N
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    provider_drivers                            │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK)                                                │
│  • provider_id (FK) ──► FK to providers                        │
│  • name                                                         │
│  • phone                                                        │
│  • id_number                                                    │
│  • license_number                                               │
│  • license_expiry                                               │
│  • vehicle_type                                                 │
│  • vehicle_plate                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:N
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         orders                                 │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK)                                               │
│  • tracking_no (UNIQUE)                                        │
│  • client_id (FK) ──► profiles                                 │
│  • employer_id (FK) ──► profiles                               │
│  • provider_id (FK) ──► providers                              │
│  • driver_id (FK) ──► profiles (independent driver)           │
│  • provider_driver_id (FK) ──► provider_drivers               │
│  • ship_type                                                   │
│  • status (new, in_progress, delivered, canceled)              │
│  • sender_name, sender_phone, sender_address                   │
│  • receiver_name, receiver_phone, receiver_address             │
│  • weight, price                                               │
│  • delivery_method                                             │
│  • created_at, delivery_at, delivered_at                       │
└────┬────────────────────────────────────────────────────────────┘
     │
     │ 1:1
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   proof_of_delivery                            │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK)                                               │
│  • order_id (FK) ──► orders                                   │
│  • driver_id (FK) ──► profiles                                │
│  • receiver_name                                               │
│  • receiver_id_number                                          │
│  • delivery_code                                               │
│  • delivery_date                                               │
│  • proof_image_url                                             │
│  • signature_url                                               │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         permits                                 │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK)                                               │
│  • provider_id (FK) ──► providers                             │
│  • permit_type                                                 │
│  • permit_number                                               │
│  • permit_file_url                                             │
│  • expiry_date                                                 │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      notifications                              │
│  ────────────────────────────────────────────────────────────  │
│  • id (UUID, PK)                                               │
│  • user_id (FK) ──► profiles                                   │
│  • title                                                       │
│  • message                                                     │
│  • type (order, payment, driver, system)                      │
│  • read (boolean)                                              │
│  • created_at                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Key Relationships

1. **auth.users → profiles** (1:1)
   - Every user has one profile
   - Profile extends user with role and additional info

2. **profiles → providers** (1:1, optional)
   - A profile with role='provider' can have a provider record

3. **profiles → orders** (1:N)
   - A profile can create orders as client, employer, or be assigned as driver

4. **providers → provider_drivers** (1:N)
   - A provider manages multiple drivers (these are NOT users with profiles)

5. **providers → orders** (1:N)
   - A provider receives orders

6. **orders → transactions** (1:N)
   - An order can generate multiple transactions

7. **orders → proof_of_delivery** (1:1)
   - An order can have one proof of delivery

8. **profiles → notifications** (1:N)
   - A user receives multiple notifications

## Important Notes

- **Independent Drivers**: Have a `profiles` record with `role='driver'` and can be assigned to orders via `orders.driver_id`
- **Provider-managed Drivers**: Are in `provider_drivers` table, NOT users, assigned via `orders.provider_driver_id`
- **Orders can have**: Either `driver_id` (independent) OR `provider_driver_id` (provider-managed), or both can be NULL initially

