import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/saaid-logo.png";

export const Route = createFileRoute("/association")({
  head: () => ({ meta: [{ title: "ساعِد — لوحة الجمعية" }] }),
  component: Association,
});

type PageKey =
  | "overview" | "profile" | "team" | "tasks" | "donations"
  | "content" | "campaigns" | "influencers" | "services" | "analytics" | "settings";

const NAV: { section: string; items: { key: PageKey; icon: string; label: string; badge?: { text: string; cls: string } }[] }[] = [
  {
    section: "الرئيسية",
    items: [
      { key: "overview", icon: "⊞", label: "نظرة عامة" },
      { key: "profile", icon: "📋", label: "ملف الجمعية", badge: { text: "AI", cls: "bg-emerald-500/25 text-emerald-300" } },
    ],
  },
  {
    section: "الإدارة",
    items: [
      { key: "team", icon: "👥", label: "الفريق" },
      { key: "tasks", icon: "✅", label: "المهام", badge: { text: "2", cls: "bg-red-500/20 text-red-300" } },
      { key: "donations", icon: "💳", label: "التبرعات" },
    ],
  },
  {
    section: "المحتوى",
    items: [
      { key: "content", icon: "✦", label: "محتوى تسويقي" },
      { key: "campaigns", icon: "📣", label: "الحملات" },
      { key: "influencers", icon: "⭐", label: "المؤثرون" },
    ],
  },
  {
    section: "الخدمات",
    items: [
      { key: "services", icon: "🛎", label: "خدماتنا" },
      { key: "analytics", icon: "📊", label: "التحليلات" },
    ],
  },
  { section: "الإعدادات", items: [{ key: "settings", icon: "⚙", label: "الإعدادات" }] },
];

const TITLES: Record<PageKey, { title: string; sub: string }> = {
  overview: { title: "نظرة عامة", sub: "ملخص أداء جمعيتك" },
  profile: { title: "ملف الجمعية", sub: "بياناتك ورسالتك الإعلامية" },
  team: { title: "الفريق", sub: "أعضاء فريق الجمعية" },
  tasks: { title: "المهام", sub: "مهام الفريق والمتابعة" },
  donations: { title: "التبرعات", sub: "متابعة التبرعات والمانحين" },
  content: { title: "محتوى تسويقي", sub: "توليد المحتوى بالذكاء الاصطناعي" },
  campaigns: { title: "الحملات", sub: "إدارة حملاتك الإعلامية" },
  influencers: { title: "المؤثرون", sub: "المؤثرون الشركاء" },
  services: { title: "خدماتنا", sub: "خدمات ساعِد المتاحة لك" },
  analytics: { title: "التحليلات", sub: "أرقام وأداء" },
  settings: { title: "الإعدادات", sub: "تفضيلات الحساب" },
};

function Association() {
  const [page, setPage] = useState<PageKey>("overview");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
  }, []);

  const t = TITLES[page];

  return (
    <div className="font-arabic h-screen flex bg-[#f4f7f5] text-saaid-td overflow-hidden" dir="rtl">
      {/* SIDEBAR */}
      <aside className="w-64 h-screen bg-saaid-g2 flex flex-col flex-shrink-0 relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-saaid-gold/[0.06] pointer-events-none" />

        <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-white/[0.08] relative z-10">
          <img src={logo} alt="" className="w-9 brightness-0 invert" />
          <div>
            <div className="text-lg font-extrabold text-white leading-none">ساعِد</div>
            <div className="text-[0.55rem] tracking-[0.2em] text-white/40 mt-0.5">ASSOCIATION</div>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07] bg-white/[0.04] relative z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saaid-gold to-amber-300 text-saaid-g2 flex items-center justify-center font-bold text-sm">ت</div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">جمعية تكاتف</div>
            <div className="text-[0.6rem] text-white/40 bg-white/10 rounded-full px-2 inline-block mt-0.5">مفعّلة</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-2 relative z-10">
          {NAV.map((sec) => (
            <div key={sec.section}>
              <div className="text-[0.6rem] font-semibold tracking-wider text-white/25 px-2 pt-2.5 pb-1 uppercase">{sec.section}</div>
              {sec.items.map((item) => {
                const active = page === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setPage(item.key)}
                    className={
                      "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[0.86rem] font-medium text-right mb-px transition-colors " +
                      (active ? "bg-white/[0.12] text-white" : "text-white/60 hover:bg-white/[0.08] hover:text-white")
                    }
                  >
                    <span className={"w-4 text-center " + (active ? "text-saaid-gold" : "")}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={"mr-auto text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full " + item.badge.cls}>
                        {item.badge.text}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-2 relative z-10">
          <button
            onClick={() => { sessionStorage.removeItem("saaid-auth"); navigate({ to: "/gate" }); }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[0.83rem] text-red-300/50 hover:bg-white/[0.05] hover:text-red-300 transition-colors"
          >
            <span className="w-4 text-center">⬡</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-saaid-g2/10 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-extrabold text-saaid-td">{t.title}</h1>
            <p className="text-xs text-saaid-tl mt-0.5">{t.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-saaid-tm hover:text-saaid-g2 text-lg">🔔</button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saaid-gold to-amber-300 text-saaid-g2 flex items-center justify-center text-sm font-bold">ت</div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {page === "overview" && <Overview />}
          {page === "profile" && <Profile />}
          {page === "tasks" && <Tasks />}
          {page === "donations" && <Donations />}
          {page === "content" && <ContentAI />}
          {(["team","campaigns","influencers","services","analytics","settings"] as PageKey[]).includes(page) && (
            <Generic title={t.title} />
          )}
        </div>
      </main>
    </div>
  );
}

const STATS = [
  { n: "—", l: "متابع على المنصات", change: "+ ابدأ بتفعيل حسابك", changeCls: "text-saaid-g3" },
  { n: "—", l: "تبرعات هذا الشهر", change: "+ ابدأ حملتك الأولى", changeCls: "text-saaid-g3" },
  { n: "0", l: "قطعة محتوى مُنتجة", change: "+ ارفع الملف التعريفي", changeCls: "text-saaid-g3" },
  { n: "5", l: "خدمات متاحة لك", change: "✓ جاهزة للتفعيل", changeCls: "text-saaid-g3" },
];

const QUICK = [
  { icon: "📋", title: "رفع الملف التعريفي", sub: "PDF أو Word — يحلله AI فوراً", bg: "bg-saaid-g5", titleCls: "text-saaid-g2", border: "border-saaid-g3/15", hover: "hover:bg-emerald-100", page: "profile" as const },
  { icon: "🛎", title: "استعرض خدماتنا", sub: "5 خدمات متكاملة للجمعيات", bg: "bg-amber-50", titleCls: "text-amber-800", border: "border-saaid-gold/20", hover: "hover:bg-amber-100", page: "services" as const },
  { icon: "📣", title: "ابدأ حملة", sub: "حملات رمضان، التبرع، التوعية", bg: "bg-indigo-50", titleCls: "text-indigo-800", border: "border-indigo-200", hover: "hover:bg-indigo-100", page: "campaigns" as const },
];

function Overview({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  return (
    <>
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-l from-saaid-g1 to-saaid-g3 rounded-2xl p-6 flex items-center gap-5 text-white">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-saaid-gold/10 pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl flex-shrink-0">🏛️</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/60 mb-1">مرحباً بكم في منصة ساعِد</div>
          <div className="text-xl font-extrabold mb-1">أهلاً بجمعيتكم الكريمة</div>
          <div className="text-sm text-white/70">ارفعوا ملف الجمعية لبدء توليد المحتوى التسويقي بالذكاء الاصطناعي</div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          متصل
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div key={s.l} className="bg-white rounded-xl p-4 border border-saaid-g2/10 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,92,58,0.08)] transition-all">
            <div className="text-2xl font-extrabold text-saaid-td">{s.n}</div>
            <div className="text-xs text-saaid-tl mt-1">{s.l}</div>
            <div className={"text-[0.7rem] mt-2 font-semibold " + s.changeCls}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* SECTION: START HERE */}
      <div className="bg-white rounded-2xl border border-saaid-g2/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-saaid-g2/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-saaid-g5 text-saaid-g2 flex items-center justify-center text-lg">🚀</div>
          <div>
            <div className="font-bold text-saaid-td">ابدأ هنا</div>
            <div className="text-xs text-saaid-tl mt-0.5">ارفع ملف جمعيتك التعريفي ليحلله الذكاء الاصطناعي</div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid md:grid-cols-3 gap-3">
            {QUICK.map((q) => (
              <button
                key={q.title}
                onClick={() => onNavigate(q.page)}
                className={`text-right rounded-xl p-4 border transition-colors cursor-pointer ${q.bg} ${q.border} ${q.hover}`}
              >
                <div className="text-2xl mb-1.5">{q.icon}</div>
                <div className={`text-sm font-bold mb-1 ${q.titleCls}`}>{q.title}</div>
                <div className="text-xs text-saaid-tl">{q.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Profile() {
  return (
    <div className="bg-white rounded-2xl border border-saaid-g2/10 p-6 max-w-3xl space-y-4">
      {[
        ["اسم الجمعية", "جمعية تكاتف"],
        ["رقم الترخيص", "12345"],
        ["البريد الإلكتروني", "info@takaful.org"],
        ["الموقع الإلكتروني", "www.takaful.org"],
      ].map(([l, v]) => (
        <div key={l}>
          <label className="block text-sm font-medium text-saaid-td mb-2">{l}</label>
          <input defaultValue={v} className="w-full px-4 py-2.5 rounded-lg border border-saaid-g2/15 focus:border-saaid-g3 focus:outline-none transition-colors" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-saaid-td mb-2">نبذة عن الجمعية</label>
        <textarea rows={4} className="w-full px-4 py-2.5 rounded-lg border border-saaid-g2/15 focus:border-saaid-g3 focus:outline-none transition-colors" />
      </div>
      <button className="px-6 py-2.5 bg-saaid-g2 text-white rounded-lg font-semibold hover:bg-saaid-g3 transition-colors">حفظ التعديلات</button>
    </div>
  );
}

function Tasks() {
  const items = [
    { t: "نشر تغطية الحملة الميدانية", p: "عاجل", c: "bg-red-100 text-red-700" },
    { t: "تصميم بوست رمضان", p: "هام", c: "bg-amber-100 text-amber-700" },
    { t: "إرسال تقرير شهري", p: "عادي", c: "bg-slate-100 text-slate-600" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-saaid-g2/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-saaid-g2/10 flex items-center justify-between">
        <h3 className="font-bold text-saaid-td">قائمة المهام</h3>
        <button className="px-4 py-2 bg-saaid-g2 text-white rounded-lg text-sm font-semibold hover:bg-saaid-g3 transition-colors">+ مهمة جديدة</button>
      </div>
      <ul className="divide-y divide-saaid-g2/10">
        {items.map((it) => (
          <li key={it.t} className="px-6 py-4 flex items-center gap-3 hover:bg-saaid-g5/30 transition-colors">
            <input type="checkbox" className="w-4 h-4 accent-saaid-g2" />
            <span className="flex-1 text-saaid-td">{it.t}</span>
            <span className={"text-xs px-2.5 py-1 rounded-full font-semibold " + it.c}>{it.p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Donations() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { l: "إجمالي التبرعات", v: "186,500 ريال" },
        { l: "هذا الشهر", v: "42,300 ريال" },
        { l: "عدد المتبرعين", v: "127 متبرع" },
      ].map((s) => (
        <div key={s.l} className="bg-white rounded-2xl p-6 border border-saaid-g2/10">
          <div className="text-sm text-saaid-tl mb-2">{s.l}</div>
          <div className="text-2xl font-extrabold text-saaid-td">{s.v}</div>
        </div>
      ))}
    </div>
  );
}

function ContentAI() {
  return (
    <div className="bg-gradient-to-br from-saaid-g1 to-saaid-g3 rounded-2xl p-8 text-white">
      <div className="inline-flex items-center gap-2 bg-saaid-gold/15 border border-saaid-gold/30 text-saaid-gold rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-saaid-gold animate-pulse" />
        مولّد المحتوى الذكي
      </div>
      <h3 className="text-2xl font-extrabold mb-3">أنشئ محتوى تسويقي بضغطة زر</h3>
      <p className="text-white/65 mb-6 leading-loose max-w-2xl">اختر نوع المحتوى، ودع الذكاء الاصطناعي يقترح عليك نصوصًا وصورًا متوافقة مع هوية جمعيتك.</p>
      <textarea rows={4} placeholder="صف ما تريد إنشاءه..." className="w-full bg-white/[0.08] border border-white/15 rounded-xl p-4 text-white placeholder:text-white/40 focus:border-saaid-gold focus:outline-none mb-4" />
      <button className="px-6 py-3 bg-saaid-gold text-saaid-g2 rounded-full font-bold hover:-translate-y-0.5 transition-all">توليد ✨</button>
    </div>
  );
}

function Generic({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-saaid-g2/10 p-10 text-center">
      <div className="text-5xl mb-3">🚧</div>
      <h3 className="font-bold text-saaid-td text-lg">{title}</h3>
      <p className="text-sm text-saaid-tl mt-1">قيد التطوير — قريبًا</p>
    </div>
  );
}
