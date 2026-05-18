import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/saaid-logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ساعِد — إدارة المنصة" }] }),
  component: Admin,
});

type PageKey = "overview" | "orgs" | "influencers" | "requests" | "matches" | "reports" | "settings";

const NAV: { section: string; items: { key: PageKey; icon: string; label: string; badge?: { text: string; color: string } }[] }[] = [
  { section: "الرئيسية", items: [{ key: "overview", icon: "⊞", label: "نظرة عامة" }] },
  {
    section: "إدارة الأطراف",
    items: [
      { key: "orgs", icon: "🏛", label: "الجمعيات", badge: { text: "3", color: "bg-red-500/20 text-red-300" } },
      { key: "influencers", icon: "⭐", label: "المؤثرون" },
    ],
  },
  {
    section: "الحملات والربط",
    items: [
      { key: "requests", icon: "📣", label: "طلبات الحملات", badge: { text: "5", color: "bg-saaid-gold/20 text-saaid-gold" } },
      { key: "matches", icon: "🔗", label: "الربط والتعاقد" },
    ],
  },
  {
    section: "التقارير",
    items: [
      { key: "reports", icon: "📊", label: "التقارير المالية" },
      { key: "settings", icon: "⚙", label: "إعدادات المنصة" },
    ],
  },
];

const PAGE_TITLES: Record<PageKey, { title: string; sub: string }> = {
  overview: { title: "نظرة عامة", sub: "إحصائيات المنصة العامة" },
  orgs: { title: "الجمعيات", sub: "إدارة الجمعيات المسجلة في المنصة" },
  influencers: { title: "المؤثرون", sub: "قاعدة بيانات المؤثرين الشركاء" },
  requests: { title: "طلبات الحملات", sub: "طلبات حملات تنتظر الموافقة" },
  matches: { title: "الربط والتعاقد", sub: "ربط الجمعيات بالمؤثرين" },
  reports: { title: "التقارير المالية", sub: "تقارير الأداء والإيرادات" },
  settings: { title: "إعدادات المنصة", sub: "تكوين عام للمنصة" },
};

function Admin() {
  const [page, setPage] = useState<PageKey>("overview");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
  }, []);

  const pt = PAGE_TITLES[page];

  return (
    <div className="font-arabic h-screen flex bg-[#f0f4f2] text-saaid-td overflow-hidden" dir="rtl">
      {/* SIDEBAR */}
      <aside className="w-64 h-screen bg-[#0d3322] flex flex-col flex-shrink-0">
        <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-white/[0.07]">
          <img src={logo} alt="" className="w-9 brightness-0 invert" />
          <div>
            <div className="text-lg font-extrabold text-white leading-none">ساعِد</div>
            <div className="text-[0.55rem] tracking-[0.2em] text-white/30 mt-0.5">ADMIN</div>
          </div>
        </div>

        <div className="mx-3.5 my-2.5 bg-saaid-gold/15 border border-saaid-gold/25 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-saaid-gold animate-pulse" />
          <span className="text-xs font-semibold text-saaid-gold">وضع المسؤول</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {NAV.map((sec) => (
            <div key={sec.section}>
              <div className="text-[0.6rem] font-semibold tracking-wider text-white/25 px-2 pt-2.5 pb-1 uppercase">
                {sec.section}
              </div>
              {sec.items.map((item) => {
                const active = page === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setPage(item.key)}
                    className={
                      "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium text-right mb-px transition-colors " +
                      (active ? "bg-white/[0.12] text-white" : "text-white/55 hover:bg-white/[0.08] hover:text-white")
                    }
                  >
                    <span className={"w-4 text-center text-[0.92rem] " + (active ? "text-saaid-gold" : "")}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={"mr-auto text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full " + item.badge.color}>
                        {item.badge.text}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-2">
          <button
            onClick={() => navigate({ to: "/gate" })}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[0.82rem] text-red-300/45 hover:bg-white/[0.05] hover:text-red-300 transition-colors"
          >
            <span className="w-4 text-center">↩</span> الخروج
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-saaid-g2/10 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-extrabold text-saaid-td">{pt.title}</h1>
            <p className="text-xs text-saaid-tl mt-0.5">{pt.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-saaid-tm hover:text-saaid-g2 text-lg">🔔</button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saaid-g2 to-saaid-g3 text-white flex items-center justify-center text-sm font-bold">
              م
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {page === "overview" && <OverviewPage />}
          {page === "orgs" && <ListPage title="الجمعيات المسجلة" items={["تكاتف", "إحسان", "سند", "بناء", "كنف"]} />}
          {page === "influencers" && <ListPage title="المؤثرون" items={["أحمد سعيد", "نورة الحربي", "خالد العتيبي", "ريم القحطاني"]} />}
          {page === "requests" && <ListPage title="طلبات الحملات" items={["حملة رمضان - تكاتف", "حملة كفالة - إحسان", "حملة الشتاء - بناء"]} badge="معلّق" />}
          {page === "matches" && <ListPage title="الربط والتعاقد" items={["تكاتف × أحمد سعيد", "إحسان × نورة الحربي"]} />}
          {page === "reports" && <ReportsPage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

const STATS = [
  { n: "10", l: "جمعية مسجلة", icon: "🏛", color: "from-saaid-g2 to-saaid-g3" },
  { n: "24", l: "مؤثر شريك", icon: "⭐", color: "from-saaid-gold to-amber-500" },
  { n: "5", l: "طلب معلّق", icon: "📣", color: "from-rose-500 to-pink-500" },
  { n: "2.1M", l: "ريال تمويل", icon: "💵", color: "from-emerald-500 to-teal-600" },
];

function OverviewPage() {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-5 border border-saaid-g2/10 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,92,58,0.08)] transition-all">
            <div className={"w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-xl mb-3 " + s.color}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-saaid-td">{s.n}</div>
            <div className="text-sm text-saaid-tl mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-saaid-g2/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-saaid-td">نشاط الحملات</h3>
            <span className="text-xs text-saaid-tl">آخر 30 يوم</span>
          </div>
          <div className="h-48 flex items-end gap-1.5">
            {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-saaid-g3 to-saaid-g4 hover:from-saaid-gold hover:to-saaid-gold2 transition-colors" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-saaid-g2/10">
          <h3 className="font-bold text-saaid-td mb-4">آخر النشاطات</h3>
          <div className="space-y-3">
            {[
              { icon: "🏛", text: "تسجيل جمعية جديدة - بناء", time: "قبل 2 ساعة" },
              { icon: "📣", text: "طلب حملة جديد من تكاتف", time: "قبل 5 ساعات" },
              { icon: "💵", text: "تم تحصيل 120,000 ريال", time: "أمس" },
              { icon: "⭐", text: "انضمام مؤثر جديد", time: "أمس" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-saaid-g2/10 last:border-0">
                <div className="w-9 h-9 rounded-full bg-saaid-g5 flex items-center justify-center flex-shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-saaid-td">{a.text}</div>
                  <div className="text-xs text-saaid-tl mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ListPage({ title, items, badge }: { title: string; items: string[]; badge?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-saaid-g2/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-saaid-g2/10 flex items-center justify-between">
        <h3 className="font-bold text-saaid-td">{title}</h3>
        <button className="px-4 py-2 bg-saaid-g2 text-white rounded-lg text-sm font-semibold hover:bg-saaid-g3 transition-colors">+ إضافة جديد</button>
      </div>
      <ul className="divide-y divide-saaid-g2/10">
        {items.map((item) => (
          <li key={item} className="px-6 py-4 flex items-center justify-between hover:bg-saaid-g5/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-saaid-g5 text-saaid-g2 flex items-center justify-center font-bold">
                {item.charAt(0)}
              </div>
              <span className="font-medium text-saaid-td">{item}</span>
              {badge && <span className="text-xs bg-saaid-gold/15 text-saaid-gold px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
            </div>
            <div className="flex gap-2">
              <button className="text-saaid-tl hover:text-saaid-g2 text-sm px-3 py-1">عرض</button>
              <button className="text-saaid-tl hover:text-saaid-g2 text-sm px-3 py-1">تعديل</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[
        { label: "إجمالي التمويلات", value: "2,140,000 ريال", trend: "+12%" },
        { label: "إجمالي التبرعات", value: "186,500 ريال", trend: "+8%" },
        { label: "عدد الحملات", value: "47 حملة", trend: "+5" },
        { label: "متوسط التبرع", value: "320 ريال", trend: "+15%" },
      ].map((s) => (
        <div key={s.label} className="bg-white rounded-2xl p-6 border border-saaid-g2/10">
          <div className="text-sm text-saaid-tl mb-2">{s.label}</div>
          <div className="flex items-baseline gap-3">
            <div className="text-2xl font-extrabold text-saaid-td">{s.value}</div>
            <div className="text-sm text-emerald-600 font-semibold">{s.trend}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-saaid-g2/10 space-y-4 max-w-2xl">
      {["اسم المنصة", "البريد الإلكتروني", "كلمة الوصول للمسؤول"].map((f) => (
        <div key={f}>
          <label className="block text-sm font-medium text-saaid-td mb-2">{f}</label>
          <input className="w-full px-4 py-2.5 rounded-lg border border-saaid-g2/15 focus:border-saaid-g3 focus:outline-none transition-colors" />
        </div>
      ))}
      <button className="px-6 py-2.5 bg-saaid-g2 text-white rounded-lg font-semibold hover:bg-saaid-g3 transition-colors">حفظ</button>
    </div>
  );
}
