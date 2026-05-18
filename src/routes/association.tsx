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
  { n: "186K", l: "ريال تبرعات هذا الشهر", icon: "💵", c: "from-saaid-g2 to-saaid-g3" },
  { n: "12", l: "حملة نشطة", icon: "📣", c: "from-saaid-gold to-amber-500" },
  { n: "47K", l: "وصول إعلامي", icon: "📡", c: "from-sky-500 to-cyan-600" },
  { n: "+18%", l: "نمو المتابعين", icon: "📈", c: "from-emerald-500 to-teal-600" },
];

function Overview() {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-5 border border-saaid-g2/10 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(26,92,58,0.08)] transition-all">
            <div className={"w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-xl mb-3 " + s.c}>{s.icon}</div>
            <div className="text-2xl font-extrabold text-saaid-td">{s.n}</div>
            <div className="text-sm text-saaid-tl mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-saaid-g2/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-saaid-td">التبرعات الأسبوعية</h3>
            <span className="text-xs text-saaid-tl">آخر 7 أيام</span>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[50, 72, 60, 88, 65, 92, 78].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-saaid-g3 to-saaid-gold" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-saaid-g2/10">
          <h3 className="font-bold text-saaid-td mb-4">مهام اليوم</h3>
          <ul className="space-y-3">
            {[
              { t: "نشر تغطية الحملة", done: true },
              { t: "تصميم بوست رمضان", done: false },
              { t: "مكالمة مع المؤثر", done: false },
              { t: "تقرير شهري", done: false },
            ].map((tk, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className={"w-4 h-4 rounded-full flex items-center justify-center text-[0.6rem] " + (tk.done ? "bg-emerald-500 text-white" : "border border-saaid-g2/30")}>{tk.done ? "✓" : ""}</span>
                <span className={tk.done ? "line-through text-saaid-tl" : "text-saaid-td"}>{tk.t}</span>
              </li>
            ))}
          </ul>
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
