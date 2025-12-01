import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryProvider } from "@/contexts/queryClient";
import { antdTheme } from "@/antd/antdTheme";
import MainLayout from "@/modules/core/layouts/MainLayout";

/* ---------- Lazy pages ---------- */
// Auth & Onboarding
const Login = lazy(() => import("@/modules/auth/pages/Login"));
const Logout = lazy(() => import("@/modules/auth/pages/Logout"));
const RegisterProvider = lazy(() => import("@/modules/auth/pages/register/RegisterProvider"));
const RegisterEmployer = lazy(() => import("@/modules/auth/pages/register/RegisterEmployer"));
const RegisterClient = lazy(() => import("@/modules/auth/pages/register/RegisterClient"));
const RegisterDriver = lazy(() => import("@/modules/auth/pages/register/RegisterDriver"));
const UserTypeSelection = lazy(() => import("@/modules/onboarding/pages/UserTypeSelection"));
// Core
const OtpVerification = lazy(() => import("@/modules/core/pages/OtpVerification"));
// Admin
const AdminHome = lazy(() => import("@/modules/admin/pages/Home"));
const AdminOrders = lazy(() => import("@/modules/admin/pages/Orders"));
const AdminCompanies = lazy(() => import("@/modules/admin/pages/Companies"));
const AdminCustomers = lazy(() => import("@/modules/admin/pages/Customers"));
const AdminPayments = lazy(() => import("@/modules/admin/pages/Payments"));
const AdminNotifications = lazy(() => import("@/modules/admin/pages/Notifications"));
const AdminTerms = lazy(() => import("@/modules/admin/pages/Terms"));
// Employer
const EmployerProfile = lazy(() => import("@/modules/employer/pages/Profile"));
const EmployerOrders = lazy(() => import("@/modules/employer/pages/Orders"));
const EmployerCreateOrder = lazy(() => import("@/modules/employer/pages/CreateOrder"));
const EmployerBilling = lazy(() => import("@/modules/employer/pages/Billing"));
const EmployerTerms = lazy(() => import("@/modules/employer/pages/Terms"));
// Provider
const ProviderProfile = lazy(() => import("@/modules/provider/pages/Profile"));
const ProviderOrders = lazy(() => import("@/modules/provider/pages/Orders"));
const ProviderDrivers = lazy(() => import("@/modules/provider/pages/Drivers"));
const ProviderPermits = lazy(() => import("@/modules/provider/pages/Permits"));
const ProviderBilling = lazy(() => import("@/modules/provider/pages/Billing"));
const ProviderNotifications = lazy(() => import("@/modules/provider/pages/Notifications"));
const ProviderTerms = lazy(() => import("@/modules/provider/pages/Terms"));
// Driver
const DriverProfile = lazy(() => import("@/modules/driver/pages/Profile"));
const DriverOrders = lazy(() => import("@/modules/driver/pages/Orders"));
const DriverProof = lazy(() => import("@/modules/driver/pages/Proof"));
const DriverBilling = lazy(() => import("@/modules/driver/pages/Billing"));
const DriverTerms = lazy(() => import("@/modules/driver/pages/Terms"));
// Client
const ClientProfile = lazy(() => import("@/modules/client/pages/Profile"));
const ClientShipments = lazy(() => import("@/modules/client/pages/Shipments"));
const ClientWallet = lazy(() => import("@/modules/client/pages/Wallet"));
const ClientTerms = lazy(() => import("@/modules/client/pages/Terms"));
const ClientTracking = lazy(() => import("@/modules/client/pages/Tracking"));
const OrderConfirmation = lazy(() => import("@/modules/client/pages/OrderConfirmation"));
// Landing
const LandingPage = lazy(() => import("@/modules/landing/pages/LandingPage"));

export default function App() {
  return (
    <ConfigProvider direction="rtl" theme={antdTheme}>
      <BrowserRouter>
        <QueryProvider>
          <Suspense fallback={
            <div style={{ 
              minHeight: "100vh", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontFamily: "Tajawal, sans-serif",
              fontSize: "18px"
            }}>
              جاري التحميل...
            </div>
          }>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/select-user" element={<UserTypeSelection />} />
              <Route path="/register/provider" element={<RegisterProvider />} />
              <Route path="/register/employer" element={<RegisterEmployer />} />
              <Route path="/register/client" element={<RegisterClient />} />
              <Route path="/register/driver" element={<RegisterDriver />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/otp-verification" element={<OtpVerification />} />

              {/* Admin */}
              <Route
                path="/admin/home"
                element={
                  <MainLayout>
                    <AdminHome />
                  </MainLayout>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <MainLayout>
                    <AdminOrders />
                  </MainLayout>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <MainLayout>
                    <AdminCompanies />
                  </MainLayout>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <MainLayout>
                    <AdminCustomers />
                  </MainLayout>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <MainLayout>
                    <AdminPayments />
                  </MainLayout>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <MainLayout>
                    <AdminNotifications />
                  </MainLayout>
                }
              />
              <Route
                path="/admin/terms"
                element={
                  <MainLayout>
                    <AdminTerms />
                  </MainLayout>
                }
              />

              {/* Employer */}
              <Route
                path="/employer/profile"
                element={
                  <MainLayout>
                    <EmployerProfile />
                  </MainLayout>
                }
              />
              <Route
                path="/employer/orders"
                element={
                  <MainLayout>
                    <EmployerOrders />
                  </MainLayout>
                }
              />
              <Route
                path="/employer/orders/new"
                element={
                  <MainLayout>
                    <EmployerCreateOrder />
                  </MainLayout>
                }
              />
              <Route
                path="/employer/billing"
                element={
                  <MainLayout>
                    <EmployerBilling />
                  </MainLayout>
                }
              />
              <Route
                path="/employer/terms"
                element={
                  <MainLayout>
                    <EmployerTerms />
                  </MainLayout>
                }
              />

              {/* Provider */}
              <Route
                path="/provider/profile"
                element={
                  <MainLayout>
                    <ProviderProfile />
                  </MainLayout>
                }
              />
              <Route
                path="/provider/orders"
                element={
                  <MainLayout>
                    <ProviderOrders />
                  </MainLayout>
                }
              />
              <Route
                path="/provider/drivers"
                element={
                  <MainLayout>
                    <ProviderDrivers />
                  </MainLayout>
                }
              />
              <Route
                path="/provider/permits"
                element={
                  <MainLayout>
                    <ProviderPermits />
                  </MainLayout>
                }
              />
              <Route
                path="/provider/billing"
                element={
                  <MainLayout>
                    <ProviderBilling />
                  </MainLayout>
                }
              />
              <Route
                path="/provider/notifications"
                element={
                  <MainLayout>
                    <ProviderNotifications />
                  </MainLayout>
                }
              />
              <Route
                path="/provider/terms"
                element={
                  <MainLayout>
                    <ProviderTerms />
                  </MainLayout>
                }
              />

              {/* Driver */}
              <Route
                path="/driver/profile"
                element={
                  <MainLayout>
                    <DriverProfile />
                  </MainLayout>
                }
              />
              <Route
                path="/driver/orders"
                element={
                  <MainLayout>
                    <DriverOrders />
                  </MainLayout>
                }
              />
              <Route
                path="/driver/proof"
                element={
                  <MainLayout>
                    <DriverProof />
                  </MainLayout>
                }
              />
              <Route
                path="/driver/billing"
                element={
                  <MainLayout>
                    <DriverBilling />
                  </MainLayout>
                }
              />
              <Route
                path="/driver/terms"
                element={
                  <MainLayout>
                    <DriverTerms />
                  </MainLayout>
                }
              />

              {/* Client */}
              <Route
                path="/client/profile"
                element={
                  <MainLayout>
                    <ClientProfile />
                  </MainLayout>
                }
              />
              <Route
                path="/client/shipments"
                element={
                  <MainLayout>
                    <ClientShipments />
                  </MainLayout>
                }
              />
              <Route
                path="/client/wallet"
                element={
                  <MainLayout>
                    <ClientWallet />
                  </MainLayout>
                }
              />
              <Route
                path="/client/terms"
                element={
                  <MainLayout>
                    <ClientTerms />
                  </MainLayout>
                }
              />
              <Route
                path="/client/tracking"
                element={
                  <MainLayout>
                    <ClientTracking />
                  </MainLayout>
                }
              />
              <Route
                path="/client/order-confirmation"
                element={
                  <MainLayout>
                    <OrderConfirmation />
                  </MainLayout>
                }
              />
            </Routes>
          </Suspense>
        </QueryProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
