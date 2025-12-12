# Wazn Platform - Tools & Project Description

## 🛠️ All Tools & Technologies Used

### **Frontend Framework & Libraries**
- **React 19.1.1** - UI framework
- **TypeScript 5.8.3** - Type-safe JavaScript
- **React Router DOM 7.9.1** - Client-side routing
- **React Hook Form 7.63.0** - Form management
- **Zod 4.1.11** - Schema validation

### **UI & Styling**
- **Ant Design 5.27.4** - Component library
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

### **Maps & Location**
- **Leaflet 1.9.4** - Interactive maps
- **React Leaflet 5.0.0** - React bindings for Leaflet
- **OpenStreetMap** - Map tiles (via Nominatim)

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication system
  - Row Level Security (RLS)
  - Storage buckets
  - Real-time subscriptions

### **State Management & Data Fetching**
- **React Context API** - Global state management
- **TanStack Query 5.90.1** - Server state management
- **Axios 1.12.2** - HTTP client

### **Date & Time**
- **Day.js 1.11.19** - Date manipulation library

### **Build Tools & Development**
- **Vite 7.1.6** - Build tool and dev server
- **ESLint 9.35.0** - Code linting
- **Prettier 3.6.2** - Code formatting
- **TypeScript ESLint** - TypeScript linting
- **@vitejs/plugin-react 5.0.2** - React plugin for Vite

### **Third-Party Integrations**
- **Aramex API** - Shipping and logistics API
- **Tap Payments API** - Payment processing
- **Mrsool API** - Delivery service integration

### **Deployment & Hosting**
- **Vercel** - Frontend hosting and deployment
- **Git** - Version control
- **GitHub** - Code repository hosting

### **Development Tools**
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **VS Code / Cursor** - Code editor
- **Postman** - API testing (for Aramex collection)

### **Database Tools**
- **Supabase SQL Editor** - Database management
- **PostgreSQL** - Relational database

### **Documentation**
- **Markdown** - Documentation format
- **Mermaid** - ERD diagrams

---

## 📝 Project Description (300 words)

**Wazn** is a comprehensive logistics and shipping management platform designed to streamline the entire shipping ecosystem across Saudi Arabia. The platform connects multiple stakeholders—employers, clients, shipping providers, drivers, and administrators—through a unified digital interface.

At its core, Wazn enables businesses (employers) and individuals (clients) to create shipping orders with ease. Users can select pickup and delivery addresses using an interactive map powered by Leaflet and OpenStreetMap, specify shipment details (type, weight, delivery method), and choose from integrated shipping companies like Aramex and Mrsool. The platform automatically calculates shipping rates with a 7% profit margin, ensuring transparent pricing.

The multi-step order creation process guides users through shipment details collection, shipping company selection, payment processing via Tap Payments, and order confirmation. Once an order is created, it's automatically synchronized with the selected shipping provider's API, generating tracking numbers and shipping labels.

For shipping providers, Wazn offers order management capabilities, allowing them to receive orders, assign them to drivers, manage their driver teams, and track permits and licenses. Drivers can view assigned orders, submit proof of delivery, and manage their earnings through a built-in wallet system.

The platform includes comprehensive payment features: employers and clients can pay for orders securely, while providers and drivers can track earnings, view invoices, and request payouts. All financial transactions are recorded and tracked through the system.

Built with modern web technologies—React 19, TypeScript, and Supabase—Wazn ensures scalability, security through Row Level Security policies, and a responsive Arabic-first user interface. The platform supports real-time order tracking, notifications, and a complete audit trail of all shipping activities, making it a complete solution for logistics management in the Saudi market.

