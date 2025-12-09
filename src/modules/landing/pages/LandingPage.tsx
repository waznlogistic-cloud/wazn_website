import { Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { getAssetUrl } from "@/modules/landing/components/useAssetUrl";
import LogoStrip from "@/modules/landing/components/LogoStrip";
import Logo from "@/components/Logo";
import "../landing.css";

const partners = ["dhl", "redbox", "aramex", "marsool", "transoor", "mekhbaz"];
const supporters = ["modon", "kaust", "waddi", "monshaat", "ubt"];

export default function LandingPage() {
  const navigate = useNavigate();
  const sea = getAssetUrl("seabackground") || "";
  const heroOverlay = getAssetUrl("landing"); // optional decorative image

  const handleGetStarted = () => {
    // Navigate to user type selection
    navigate("/select-user");
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    if (!email || !email.includes("@")) {
      message.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    
    // TODO: Connect to newsletter API
    message.success("تم الاشتراك في النشرة البريدية بنجاح!");
    e.currentTarget.reset();
  };

  const handleCreateOrder = () => {
    // Check if user is logged in, if not redirect to login
    // For now, redirect to login - user can create order after login
    navigate("/login");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <header className="w-full bg-[#0E2A4D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="cursor-pointer">
              <Logo className="h-8 w-auto" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/login")}>تسجيل الدخول</Button>
            <Button onClick={() => navigate("/select-user")}>إنشاء حساب</Button>
            <Button type="primary" onClick={handleCreateOrder}>
              إنشاء طلب
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative w-full"
        style={{
          backgroundImage: `url(${sea})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#0E2A4D]/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 flex flex-col items-center text-center text-white">
          {/* لوجو وزن */}
          <img
            src={getAssetUrl("waznlogo")}
            alt="Wazn Logo"
            className="h-32 w-auto mb-6 opacity-95"
          />
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">حلول لوجستية مبتكرة لأعمالك</h1>
          <p className="max-w-2xl text-white/90">
            نُشّط عملياتك اللوجستية بتقنيات متطورة وخدمات متخصصة
          </p>
          <Button type="primary" size="large" className="mt-6" onClick={handleGetStarted}>
            ابدأ الآن
          </Button>
        </div>
        <div className="h-4 rounded-t-3xl bg-white" />
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* النص */}
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl font-semibold mb-3">من نحن؟</h2>
            <h3 className="text-xl font-semibold mb-2">حلول لوجستية مبتكرة لأعمالك</h3>
            <p className="text-gray-700 leading-7">
              وزن للخدمات اللوجستية هو مزوّد رائد لحلول التوزيع الخاصة مع التكنولوجيا المتطورة وفريق
              من الخبراء. نقدم خدمات موثوقة وفعّالة واقتصادية للشركات في جميع الأحجام.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
              <span>استيراد وتخزين</span>•<span>نقل داخلي</span>•<span>التوصيل</span>•
              <span>تتبع</span>
            </div>
          </div>

          {/* الصورة بجانب النص */}
          <div className="order-1 lg:order-2">
            {heroOverlay && (
              <img src={heroOverlay} alt="landing" className="w-full h-auto rounded-xl shadow-sm" />
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">خدماتنا</h3>
          <div className="h-px flex-1 mx-4 bg-gray-300" />
        </div>

        <Card className="!bg-[#0E2A4D] !border-0 rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "التحليلات اللوجستية",
              "التخزين",
              "نقل البضائع",
              "خدمة الذكاء الاصطناعي",
              "التوصيل السريع",
              "الشحن العالمي",
            ].map((title, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/10 backdrop-blur text-white text-center py-4 px-3"
              >
                {title}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Partners (auto scrolling) */}
      <div className="mx-auto max-w-7xl px-4">
        <LogoStrip title="شركاء النجاح" names={partners} />
        <LogoStrip title="الشركاء الداعمون" names={supporters} />
      </div>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h3 className="text-xl font-semibold mb-2">النشرة البريدية</h3>
        <p className="text-gray-600 mb-4">اشترك في نشرتنا البريدية لتلقي الخدمات والعروض الخاصة</p>
        <form
          onSubmit={handleNewsletterSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl"
        >
          <input
            name="email"
            type="email"
            className="flex-1 border rounded-md px-3 py-2"
            placeholder="بريدك الإلكتروني"
            required
          />
          <Button type="primary" htmlType="submit">
            اشتراك
          </Button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E2A4D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo className="h-8 w-auto mb-2" />
            <p className="text-white/80 text-sm">
              حلول لوجستية موثوقة وسريعة، مع دعم مستمر وتقنية متقدمة.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">تواصل معنا</h4>
            <p className="text-white/80 text-sm">الرقم الموحد: 7050286465</p>
            <p className="text-white/80 text-sm">مركز الأعمال السعودي</p>
          </div>
          <div className="self-end text-sm text-white/70">© {new Date().getFullYear()} Wazn</div>
        </div>
      </footer>
    </div>
  );
}
