import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/association")({
  head: () => ({ meta: [{ title: "ساعِد — لوحة الجمعية" }] }),
  component: Association,
});

const STYLES = `
:root{
  --g1:#0d3322;--g2:#1a5c3a;--g3:#2d7a52;--g4:#4a9e70;
  --g5:#e8f5ee;--g6:#f2faf6;
  --gold:#c9a84c;--gold2:#f0dfa0;--gold3:#fdf8ec;
  --td:#111827;--tm:#374151;--tl:#6b7280;--th:#9ca3af;
  --white:#fff;--bg:#f4f7f5;--border:rgba(45,122,82,.12);
  --sw:260px;--r:12px;--rs:8px;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;font-family:'Tajawal','Cairo',sans-serif;background:var(--bg);color:var(--td);direction:rtl}
#app{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sidebar{width:var(--sw);height:100vh;background:var(--g2);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;position:relative}
.sidebar::after{content:'';position:absolute;bottom:-50px;right:-50px;width:160px;height:160px;border-radius:50%;background:rgba(201,168,76,.06);pointer-events:none}
.sb-logo{padding:14px 16px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-logo-text{display:flex;flex-direction:column}
.sb-logo-name{font-size:1.15rem;font-weight:800;color:white;line-height:1}
.sb-logo-sub{font-size:.56rem;color:rgba(255,255,255,.38);letter-spacing:2px;margin-top:2px}
.sb-assoc{padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.04)}
.sb-av{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--gold),#e8c96e);display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;color:var(--g2);flex-shrink:0}
.sb-aname{font-size:.85rem;font-weight:700;color:white;line-height:1.3}
.sb-atag{font-size:.63rem;color:rgba(255,255,255,.4);background:rgba(255,255,255,.08);padding:2px 7px;border-radius:20px;display:inline-block;margin-top:3px}
.sb-nav{flex:1;overflow-y:auto;padding:8px 8px 0}
.sb-nav::-webkit-scrollbar{width:2px}
.sb-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}
.sb-sec{font-size:.6rem;font-weight:600;letter-spacing:.12em;color:rgba(255,255,255,.26);padding:10px 8px 4px;text-transform:uppercase}
.sbi{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;color:rgba(255,255,255,.6);font-size:.86rem;font-weight:500;cursor:pointer;transition:all .17s;margin-bottom:1px;text-decoration:none;border:none;background:transparent;width:100%;text-align:right}
.sbi:hover{background:rgba(255,255,255,.08);color:white}
.sbi.active{background:rgba(255,255,255,.13);color:white}
.sbi.active .sbi-ic{color:var(--gold)}
.sbi-ic{font-size:.95rem;width:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.sbi-badge{margin-right:auto;background:var(--gold);color:var(--g2);font-size:.6rem;font-weight:700;padding:1px 6px;border-radius:20px}
.sbi-badge.green{background:rgba(74,158,112,.25);color:#7dcea0}
.sbi-badge.red{background:rgba(220,38,38,.2);color:#ef4444}
.sb-bot{padding:8px;border-top:1px solid rgba(255,255,255,.07)}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:58px;background:white;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 22px;gap:12px;flex-shrink:0}
.tb-title{font-size:1.02rem;font-weight:700;color:var(--td);flex:1}
.tb-assoc-name{font-size:.83rem;font-weight:600;color:var(--g3);background:var(--g5);padding:5px 12px;border-radius:20px}
.tb-notif{width:32px;height:32px;border-radius:var(--rs);border:1.5px solid var(--border);background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.95rem;position:relative}
.tb-notif:hover{background:var(--g5)}
.tb-dot{position:absolute;top:5px;left:5px;width:6px;height:6px;background:var(--gold);border-radius:50%;border:2px solid white}
.content{flex:1;overflow-y:auto;padding:20px 22px}
.content::-webkit-scrollbar{width:4px}
.content::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

/* WELCOME BANNER */
.welcome-banner{background:linear-gradient(135deg,var(--g2) 0%,var(--g3) 60%,var(--g4) 100%);border-radius:14px;padding:20px 24px;margin-bottom:18px;display:flex;align-items:center;gap:18px;position:relative;overflow:hidden}
.welcome-banner::before{content:'';position:absolute;left:-30px;top:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
.wb-icon{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.wb-text{flex:1}
.wb-greeting{font-size:.8rem;color:rgba(255,255,255,.58);margin-bottom:2px}
.wb-name{font-size:1.3rem;font-weight:800;color:white;margin-bottom:3px}
.wb-sub{font-size:.8rem;color:rgba(255,255,255,.52)}
.wb-status{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);padding:5px 13px;border-radius:20px;flex-shrink:0}
.wb-dot{width:7px;height:7px;background:#7dcea0;border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.2)}}
.wb-stxt{font-size:.78rem;color:rgba(255,255,255,.75);font-weight:600}

/* SECTION CARD */
.section-card{background:white;border-radius:13px;border:1px solid var(--border);margin-bottom:18px;overflow:hidden}
.sc-header{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.sc-icon{width:30px;height:30px;border-radius:7px;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:.95rem;color:var(--g3);flex-shrink:0}
.sc-title{font-size:.92rem;font-weight:700;color:var(--td)}
.sc-sub{font-size:.76rem;color:var(--tl);margin-top:1px}
.sc-badge{margin-right:auto;font-size:.68rem;font-weight:600;padding:3px 10px;border-radius:20px}
.sc-badge.ai{background:linear-gradient(135deg,#e8f5ee,#d4eddf);color:var(--g2);border:1px solid rgba(45,122,82,.15)}
.sc-body{padding:18px}

/* STATS */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:18px}
.stat-card{background:white;border-radius:11px;border:1px solid var(--border);padding:13px 15px}
.stat-num{font-size:1.45rem;font-weight:800;color:var(--g2);line-height:1}
.stat-label{font-size:.73rem;color:var(--tl);margin-top:4px}
.stat-change{font-size:.7rem;font-weight:600;color:#059669;margin-top:5px}

/* PAGES */
.page{display:none}
.page.active{display:block}

/* UPLOAD & PROFILE ZONE */
.upload-zone{border:2px dashed var(--border);border-radius:11px;padding:28px 20px;text-align:center;cursor:pointer;transition:all .25s;background:var(--g6);position:relative}
.upload-zone:hover,.upload-zone.drag{border-color:var(--g3);background:var(--g5)}
.uz-icon{font-size:2.2rem;margin-bottom:8px;opacity:.5}
.uz-title{font-size:.9rem;font-weight:700;color:var(--tm);margin-bottom:4px}
.uz-sub{font-size:.78rem;color:var(--tl)}
.uz-types{display:flex;gap:6px;justify-content:center;margin-top:9px;flex-wrap:wrap}
.uz-type{font-size:.68rem;background:rgba(45,122,82,.08);color:var(--g3);padding:2px 8px;border-radius:20px;font-weight:600}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.file-preview{display:none;align-items:center;gap:12px;padding:11px 13px;background:var(--g5);border-radius:9px;margin-top:11px;border:1px solid rgba(45,122,82,.12)}
.fp-icon{font-size:1.5rem;flex-shrink:0}
.fp-name{font-size:.85rem;font-weight:600;color:var(--td)}
.fp-size{font-size:.73rem;color:var(--tl)}
.fp-remove{margin-right:auto;font-size:.73rem;color:#dc2626;cursor:pointer;font-weight:600}
.ai-btn{width:100%;padding:12px;border-radius:9px;background:linear-gradient(135deg,var(--g2),var(--g3));color:white;border:none;font-family:'Tajawal',sans-serif;font-size:.92rem;font-weight:700;cursor:pointer;transition:all .2s;margin-top:13px;display:flex;align-items:center;justify-content:center;gap:8px}
.ai-btn:hover{opacity:.9;transform:translateY(-1px)}
.ai-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.ai-btn .spin{animation:spin .8s linear infinite;display:inline-block}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.ai-results{display:none}
.ai-results.visible{display:block;animation:fadeUp .4s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.summary-box{background:linear-gradient(135deg,#f0faf5,#e8f5ee);border:1px solid rgba(45,122,82,.15);border-radius:11px;padding:16px 18px;margin-bottom:14px}
.summary-label{font-size:.7rem;font-weight:700;letter-spacing:.08em;color:var(--g3);text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px}
.summary-text{font-size:.88rem;line-height:1.75;color:var(--tm)}
.ip-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:14px}
.ip-card{background:white;border-radius:11px;border:1px solid var(--border);overflow:hidden}
.ip-card-head{padding:11px 13px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
.ip-card-head.ideas{background:linear-gradient(135deg,#f0faf5,#e8f5ee)}
.ip-card-head.pain{background:linear-gradient(135deg,#fff8f0,#fdeee0)}
.ip-head-icon{font-size:1rem}
.ip-head-title{font-size:.83rem;font-weight:700;color:var(--td)}
.ip-body{padding:11px 13px}
.ip-item{display:flex;align-items:flex-start;gap:7px;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.04);font-size:.8rem;color:var(--tm);line-height:1.5}
.ip-item:last-child{border-bottom:none}
.ip-bullet{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px}
.ip-bullet.green{background:var(--g3)}
.ip-bullet.amber{background:#d97706}
.content-tabs{display:flex;gap:6px;margin-bottom:13px;border-bottom:1px solid var(--border);padding-bottom:0}
.ctab{padding:7px 13px;font-size:.81rem;font-weight:600;cursor:pointer;color:var(--tl);border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .17s;font-family:'Tajawal',sans-serif}
.ctab.active{color:var(--g2);border-bottom-color:var(--g3)}
.content-area{background:var(--g6);border-radius:9px;border:1px solid var(--border);padding:15px;min-height:110px;font-size:.85rem;color:var(--tm);line-height:1.75;position:relative}
.content-area .copy-btn{position:absolute;top:9px;left:9px;font-size:.7rem;padding:3px 9px;border-radius:6px;border:1px solid var(--border);background:white;cursor:pointer;font-family:'Tajawal',sans-serif;color:var(--tl);transition:all .15s}
.content-area .copy-btn:hover{background:var(--g5);color:var(--g3);border-color:var(--g3)}
.regen-btn{display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:7px;border:1px solid var(--border);background:white;font-family:'Tajawal',sans-serif;font-size:.8rem;color:var(--tm);cursor:pointer;transition:all .2s;margin-top:9px}
.regen-btn:hover{background:var(--g5);border-color:var(--g3);color:var(--g3)}
.skeleton{background:linear-gradient(90deg,#e8f0eb 25%,#d4e6d9 50%,#e8f0eb 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.ai-loading{display:none;text-align:center;padding:28px 18px}
.ai-loading.visible{display:block}
.al-spinner{width:38px;height:38px;border:3px solid var(--g5);border-top-color:var(--g3);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 11px}
.al-text{font-size:.85rem;color:var(--tl);font-weight:500}
.al-step{font-size:.76rem;color:var(--th);margin-top:4px}
.ai-placeholder{text-align:center;padding:28px 18px;color:var(--th)}
.ap-icon{font-size:2rem;margin-bottom:9px;opacity:.3}
.ap-text{font-size:.85rem}

/* SERVICES */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
.srv-card{background:white;border-radius:11px;border:1px solid var(--border);padding:15px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.srv-card:hover{border-color:var(--g3);transform:translateY(-2px);box-shadow:0 4px 18px rgba(45,122,82,.1)}
.srv-card.selected{border-color:var(--g3);background:var(--g6)}
.srv-card.selected::after{content:'✓';position:absolute;top:9px;left:9px;width:19px;height:19px;background:var(--g3);border-radius:50%;color:white;font-size:.68rem;display:flex;align-items:center;justify-content:center;font-weight:700}
.srv-icon{font-size:1.35rem;margin-bottom:7px}
.srv-title{font-size:.81rem;font-weight:700;color:var(--td);margin-bottom:4px;line-height:1.4}
.srv-desc{font-size:.72rem;color:var(--tl);line-height:1.5}
.srv-price{font-size:.73rem;font-weight:600;color:var(--g3);margin-top:7px}

/* ============================================
   MANAGEMENT — NOTION-STYLE TASK BOARD
   ============================================ */

/* KPI CARDS */
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:18px}
.kpi-card{background:white;border-radius:11px;border:1px solid var(--border);padding:14px 16px;position:relative;overflow:hidden}
.kpi-card::before{content:'';position:absolute;top:0;right:0;width:4px;height:100%;border-radius:0 11px 11px 0}
.kpi-card.green::before{background:var(--g3)}
.kpi-card.gold::before{background:var(--gold)}
.kpi-card.blue::before{background:#3b82f6}
.kpi-card.purple::before{background:#8b5cf6}
.kpi-num{font-size:1.55rem;font-weight:800;line-height:1;margin-bottom:3px}
.kpi-label{font-size:.73rem;color:var(--tl)}
.kpi-sub{font-size:.68rem;font-weight:600;margin-top:5px}

/* TWO-COL LAYOUT */
.mgmt-grid{display:grid;grid-template-columns:280px 1fr;gap:16px;margin-bottom:18px;align-items:start}

/* EMPLOYEES */
.emp-list{display:flex;flex-direction:column;gap:0}
.emp-row{display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid rgba(0,0,0,.04);transition:background .15s;cursor:pointer}
.emp-row:last-child{border-bottom:none}
.emp-row:hover{background:var(--g6)}
.emp-row:hover .emp-actions{opacity:1}
.emp-actions{opacity:0;display:flex;gap:5px;margin-right:auto;transition:opacity .15s}
.emp-act-btn{padding:4px 10px;border-radius:6px;font-size:.72rem;font-weight:600;cursor:pointer;border:none;font-family:'Tajawal',sans-serif;transition:all .15s}
.emp-act-edit{background:var(--g5);color:var(--g2)}
.emp-act-edit:hover{background:var(--g3);color:white}
.emp-act-del{background:#fee2e2;color:#dc2626}
.emp-act-del:hover{background:#dc2626;color:white}
.emp-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:white;flex-shrink:0}
.emp-name{font-size:.84rem;font-weight:600;color:var(--td);line-height:1.2}
.emp-role{font-size:.7rem;color:var(--tl)}
.emp-badge{margin-right:auto;font-size:.65rem;padding:2px 8px;border-radius:20px;font-weight:600;white-space:nowrap}
.emp-badge.active{background:#dcfce7;color:#166534}
.emp-badge.away{background:#fef9c3;color:#854d0e}
.emp-badge.off{background:#f1f5f9;color:var(--th)}

/* TASK BOARD — NOTION STYLE */
.task-toolbar{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border)}
.task-filter-btn{padding:5px 12px;border-radius:20px;border:1px solid var(--border);background:white;font-family:'Tajawal',sans-serif;font-size:.75rem;font-weight:600;color:var(--tl);cursor:pointer;transition:all .17s}
.task-filter-btn.active{background:var(--g2);color:white;border-color:var(--g2)}
.task-filter-btn:hover:not(.active){background:var(--g5);color:var(--g3)}
.task-add-btn{margin-right:auto;padding:6px 13px;border-radius:7px;background:var(--g3);color:white;border:none;font-family:'Tajawal',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .17s}
.task-add-btn:hover{background:var(--g2)}

/* KANBAN BOARD */
.kanban-board{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:14px 16px}
.kanban-col{background:var(--g6);border-radius:10px;min-height:300px}
.kanban-col-head{padding:10px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:7px;border-radius:10px 10px 0 0;background:white}
.kanban-col-head.todo{border-top:3px solid #94a3b8}
.kanban-col-head.doing{border-top:3px solid #f59e0b}
.kanban-col-head.done{border-top:3px solid var(--g3)}
.kanban-col-title{font-size:.8rem;font-weight:700;color:var(--td)}
.kanban-col-count{font-size:.68rem;background:rgba(0,0,0,.07);color:var(--tl);padding:1px 7px;border-radius:20px;font-weight:600}
.kanban-cards{padding:10px;display:flex;flex-direction:column;gap:8px;min-height:200px}

/* TASK CARD */
.task-card{background:white;border-radius:9px;border:1px solid var(--border);padding:11px 13px;cursor:pointer;transition:all .18s;position:relative}
.task-card:hover{box-shadow:0 2px 12px rgba(45,122,82,.1);border-color:rgba(45,122,82,.25);transform:translateY(-1px)}
.task-card-title{font-size:.83rem;font-weight:600;color:var(--td);line-height:1.45;margin-bottom:8px}
.task-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.task-urgency{font-size:.66rem;padding:2px 8px;border-radius:20px;font-weight:700}
.task-urgency.urgent{background:#fee2e2;color:#b91c1c}
.task-urgency.high{background:#fef3c7;color:#92400e}
.task-urgency.normal{background:#e0f2fe;color:#0369a1}
.task-urgency.low{background:#f0fdf4;color:#166534}
.task-deadline{font-size:.67rem;color:var(--tl);display:flex;align-items:center;gap:3px}
.task-deadline.overdue{color:#dc2626;font-weight:600}
.task-assignee{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700;color:white;margin-right:auto;flex-shrink:0;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.1)}
.task-card-category{font-size:.64rem;color:var(--g3);font-weight:600;background:var(--g5);padding:1px 7px;border-radius:20px}

/* TASK MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
.modal-overlay.hidden{display:none}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.task-modal{background:white;border-radius:14px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:slideUp .25s cubic-bezier(.22,1,.36,1)}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.modal-header{padding:18px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:10px}
.modal-status-badge{font-size:.72rem;padding:3px 10px;border-radius:20px;font-weight:700;flex-shrink:0;margin-top:3px}
.modal-status-badge.todo{background:#f1f5f9;color:#64748b}
.modal-status-badge.doing{background:#fef9c3;color:#92400e}
.modal-status-badge.done{background:#dcfce7;color:#166534}
.modal-title{font-size:1rem;font-weight:700;color:var(--td);flex:1;line-height:1.4;outline:none;border:none;font-family:'Tajawal',sans-serif;background:transparent}
.modal-title:focus{border-bottom:2px solid var(--g3)}
.modal-close{width:28px;height:28px;border-radius:6px;border:none;background:var(--bg);cursor:pointer;font-size:1rem;color:var(--tl);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.modal-body{padding:18px 20px}
.modal-field{margin-bottom:16px}
.modal-field label{display:block;font-size:.75rem;font-weight:700;color:var(--tl);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.modal-select{width:100%;padding:8px 12px;border-radius:7px;border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.87rem;color:var(--td);background:white;outline:none;transition:border-color .2s}
.modal-select:focus{border-color:var(--g3)}
.modal-input{width:100%;padding:8px 12px;border-radius:7px;border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.87rem;color:var(--td);outline:none;transition:border-color .2s}
.modal-input:focus{border-color:var(--g3)}
.modal-textarea{width:100%;padding:9px 12px;border-radius:7px;border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.85rem;color:var(--td);outline:none;resize:vertical;min-height:80px;line-height:1.65;transition:border-color .2s}
.modal-textarea:focus{border-color:var(--g3)}
.modal-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.modal-footer{padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:9px;justify-content:flex-end}
.modal-btn-primary{padding:9px 20px;border-radius:8px;background:var(--g3);color:white;border:none;font-family:'Tajawal',sans-serif;font-size:.86rem;font-weight:700;cursor:pointer;transition:all .17s}
.modal-btn-primary:hover{background:var(--g2)}
.modal-btn-secondary{padding:9px 16px;border-radius:8px;background:white;border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.86rem;font-weight:600;color:var(--tl);cursor:pointer;transition:all .17s}
.modal-btn-secondary:hover{border-color:var(--g3);color:var(--g3)}
.modal-btn-danger{padding:9px 16px;border-radius:8px;background:white;border:1.5px solid #fecaca;font-family:'Tajawal',sans-serif;font-size:.86rem;font-weight:600;color:#dc2626;cursor:pointer;transition:all .17s}
.modal-btn-danger:hover{background:#fee2e2}

/* INFLUENCER CARDS */
.inf-card{background:white;border-radius:12px;border:1px solid var(--border);padding:18px;transition:all .2s;cursor:pointer}
.inf-card:hover{border-color:var(--g3);transform:translateY(-2px);box-shadow:0 4px 18px rgba(45,122,82,.1)}
.inf-avatar{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.15rem;font-weight:700;color:white;flex-shrink:0;margin-bottom:10px}
.inf-handle{font-size:.95rem;font-weight:700;color:var(--td);margin-bottom:2px}
.inf-niche{font-size:.75rem;color:var(--tl);margin-bottom:10px}
.inf-stats{display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.inf-stat{display:flex;flex-direction:column;gap:1px}
.inf-stat-num{font-size:.88rem;font-weight:700;color:var(--td)}
.inf-stat-label{font-size:.67rem;color:var(--th)}
.inf-footer{display:flex;align-items:center;gap:7px;padding-top:10px;border-top:1px solid var(--border)}
.inf-platform-badge{font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:20px}
.inf-platform-badge.Instagram{background:#fce7f3;color:#be185d}
.inf-platform-badge.X{background:#e0f2fe;color:#0369a1}
.inf-platform-badge.TikTok{background:#f0fdf4;color:#166534}
.inf-platform-badge.YouTube{background:#fee2e2;color:#b91c1c}
.inf-platform-badge.Snapchat{background:#fef9c3;color:#854d0e}
.inf-status-badge{font-size:.68rem;font-weight:600;padding:2px 8px;border-radius:20px;margin-right:auto}
.inf-status-badge.active{background:#dcfce7;color:#166534}
.inf-status-badge.pending{background:#fef9c3;color:#92400e}
.inf-status-badge.ended{background:#f1f5f9;color:var(--th)}

/* DONATIONS TABLE */
.don-table{width:100%;border-collapse:collapse;font-size:.82rem}
.don-th{padding:9px 15px;text-align:right;color:var(--tl);font-weight:600;background:var(--g6);border-bottom:1px solid var(--border)}
.don-td{padding:10px 15px;border-bottom:1px solid rgba(0,0,0,.04);vertical-align:middle;color:var(--tm)}
.don-row:last-child .don-td{border-bottom:none}
.don-row:hover .don-td{background:var(--g6)}
.don-status{display:inline-block;font-size:.68rem;padding:2px 9px;border-radius:20px;font-weight:600}
.don-status.completed{background:#dcfce7;color:#166534}
.don-status.pending{background:#fef9c3;color:#854d0e}
.don-channel-icon{font-size:.85rem;margin-left:4px}
`;
const BODY = `<div id="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sb-logo">
      <img src="data:image/png;base64,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" alt="ساعِد" style="width:42px;height:auto;filter:brightness(0) invert(1)">
      <div class="sb-logo-text">
        <div class="sb-logo-name">ساعِد</div>
        <div class="sb-logo-sub">SAAID PLATFORM</div>
      </div>
    </div>
    <div class="sb-assoc">
      <div class="sb-av" id="sbav">ج</div>
      <div>
        <div class="sb-aname" id="sbAssocName">اسم الجمعية</div>
        <span class="sb-atag">جمعية خيرية</span>
      </div>
    </div>
    <nav class="sb-nav">
      <div class="sb-sec">الرئيسية</div>
      <button class="sbi active" onclick="showPage('overview',this)"><span class="sbi-ic">⊞</span> نظرة عامة</button>
      <button class="sbi" onclick="showPage('profile',this)"><span class="sbi-ic">📋</span> ملف الجمعية <span class="sbi-badge green">AI</span></button>
      <div class="sb-sec">الإدارة</div>
      <button class="sbi" onclick="showPage('team',this)"><span class="sbi-ic">👥</span> الفريق</button>
      <button class="sbi" onclick="showPage('tasks',this)"><span class="sbi-ic">✅</span> المهام <span class="sbi-badge red" id="sb-urgent-count">2</span></button>
      <button class="sbi" onclick="showPage('donations',this)"><span class="sbi-ic">💳</span> التبرعات</button>
      <div class="sb-sec">المحتوى</div>
      <button class="sbi" onclick="showPage('content',this)"><span class="sbi-ic">✦</span> محتوى تسويقي</button>
      <button class="sbi" onclick="showPage('campaigns',this)"><span class="sbi-ic">📣</span> الحملات</button>
      <button class="sbi" onclick="showPage('influencers',this)"><span class="sbi-ic">⭐</span> المؤثرون</button>
      <div class="sb-sec">الخدمات</div>
      <button class="sbi" onclick="showPage('services',this)"><span class="sbi-ic">🛎</span> خدماتنا</button>
      <button class="sbi" onclick="showPage('analytics',this)"><span class="sbi-ic">📊</span> التحليلات</button>
      <div class="sb-sec">الإعدادات</div>
      <button class="sbi" onclick="showPage('settings',this)"><span class="sbi-ic">⚙</span> الإعدادات</button>
    </nav>
    <div class="sb-bot">
      <button class="sbi" style="color:rgba(255,100,100,.5);font-size:.83rem" onclick="sessionStorage.removeItem('saaid_user'); sessionStorage.removeItem('saaid_devAccess'); window.location.href='dashboard.html'"><span class="sbi-ic">⬡</span> تسجيل الخروج</button>
    </div>
  </aside>

  <!-- MAIN -->
  <div class="main">
    <header class="topbar">
      <div class="tb-title" id="pageTitle">نظرة عامة</div>
      <div class="tb-assoc-name" id="topAssocName">أهلاً — سجّل بياناتك أولاً</div>
      <div class="tb-notif">🔔<div class="tb-dot"></div></div>
    </header>

    <div class="content">

      <!-- ===== PAGE: OVERVIEW ===== -->
      <div class="page active" id="page-overview">
        <div class="welcome-banner">
          <div class="wb-icon">🏛️</div>
          <div class="wb-text">
            <div class="wb-greeting">مرحباً بكم في منصة ساعِد</div>
            <div class="wb-name" id="bannerName">أهلاً بجمعيتكم الكريمة</div>
            <div class="wb-sub">ارفعوا ملف الجمعية لبدء توليد المحتوى التسويقي بالذكاء الاصطناعي</div>
          </div>
          <div class="wb-status">
            <div class="wb-dot"></div>
            <span class="wb-stxt">متصل</span>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-num" id="statFollowers">—</div>
            <div class="stat-label">متابع على المنصات</div>
            <div class="stat-change">+ ابدأ بتفعيل حسابك</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" id="statDonations">—</div>
            <div class="stat-label">تبرعات هذا الشهر</div>
            <div class="stat-change">+ ابدأ حملتك الأولى</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" id="statContent">0</div>
            <div class="stat-label">قطعة محتوى مُنتجة</div>
            <div class="stat-change">+ ارفع الملف التعريفي</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">5</div>
            <div class="stat-label">خدمات متاحة لك</div>
            <div class="stat-change" style="color:var(--g3)">✓ جاهزة للتفعيل</div>
          </div>
        </div>

        <!-- Quick Action: go to profile -->
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">🚀</div>
            <div>
              <div class="sc-title">ابدأ هنا</div>
              <div class="sc-sub">ارفع ملف جمعيتك التعريفي ليحلله الذكاء الاصطناعي</div>
            </div>
          </div>
          <div class="sc-body">
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <div onclick="showPage('profile',document.querySelector('.sbi:nth-child(2)'))" style="flex:1;min-width:220px;background:var(--g5);border-radius:10px;padding:16px;cursor:pointer;border:1px solid rgba(45,122,82,.12);transition:all .2s" onmouseover="this.style.background='#d4eddf'" onmouseout="this.style.background='var(--g5)'">
                <div style="font-size:1.5rem;margin-bottom:6px">📋</div>
                <div style="font-size:.88rem;font-weight:700;color:var(--g2);margin-bottom:3px">رفع الملف التعريفي</div>
                <div style="font-size:.78rem;color:var(--tl)">PDF أو Word — يحلله AI فوراً</div>
              </div>
              <div onclick="showPage('services',document.querySelectorAll('.sbi')[5])" style="flex:1;min-width:220px;background:#fff8f0;border-radius:10px;padding:16px;cursor:pointer;border:1px solid rgba(201,168,76,.15);transition:all .2s" onmouseover="this.style.background='#fdeee0'" onmouseout="this.style.background='#fff8f0'">
                <div style="font-size:1.5rem;margin-bottom:6px">🛎</div>
                <div style="font-size:.88rem;font-weight:700;color:#92400e;margin-bottom:3px">استعرض خدماتنا</div>
                <div style="font-size:.78rem;color:var(--tl)">5 خدمات متكاملة للجمعيات</div>
              </div>
              <div onclick="showPage('campaigns',document.querySelectorAll('.sbi')[4])" style="flex:1;min-width:220px;background:#f0f4ff;border-radius:10px;padding:16px;cursor:pointer;border:1px solid rgba(99,102,241,.12);transition:all .2s" onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#f0f4ff'">
                <div style="font-size:1.5rem;margin-bottom:6px">📣</div>
                <div style="font-size:.88rem;font-weight:700;color:#3730a3;margin-bottom:3px">ابدأ حملة</div>
                <div style="font-size:.78rem;color:var(--tl)">حملات رمضان، التبرع، التوعية</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: PROFILE + AI ANALYSIS ===== -->
      <div class="page" id="page-profile">

        <!-- Upload Section -->
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">📤</div>
            <div>
              <div class="sc-title">ملف الجمعية التعريفي</div>
              <div class="sc-sub">ارفع الملف وسيقوم الذكاء الاصطناعي بتحليله وتوليد المحتوى</div>
            </div>
            <span class="sc-badge ai">✦ مدعوم بـ AI</span>
          </div>
          <div class="sc-body">
            <!-- Name input -->
            <div style="margin-bottom:14px">
              <label style="display:block;font-size:.82rem;font-weight:600;color:var(--tm);margin-bottom:5px">اسم الجمعية</label>
              <input type="text" id="assocNameInput" placeholder="مثال: جمعية تكاتف الخيرية" style="width:100%;padding:10px 13px;border-radius:var(--rs);border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.93rem;color:var(--td);outline:none;background:white;transition:border-color .2s" onfocus="this.style.borderColor='var(--g3)'" onblur="this.style.borderColor='var(--border)'">
            </div>

            <div class="upload-zone" id="uploadZone" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="dropFile(event)">
              <div class="uz-icon">📄</div>
              <div class="uz-title">اسحب الملف هنا أو اضغط للرفع</div>
              <div class="uz-sub">الملف التعريفي للجمعية، التقرير السنوي، أو أي وثيقة تعريفية</div>
              <div class="uz-types">
                <span class="uz-type">PDF</span>
                <span class="uz-type">Word</span>
                <span class="uz-type">TXT</span>
                <span class="uz-type">صور JPG/PNG</span>
              </div>
              <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" onchange="fileSelected(this)">
            </div>

            <div class="file-preview" id="filePreview">
              <div class="fp-icon" id="fpIcon">📄</div>
              <div>
                <div class="fp-name" id="fpName">—</div>
                <div class="fp-size" id="fpSize">—</div>
              </div>
              <span class="fp-remove" onclick="removeFile()">✕ إزالة</span>
            </div>

            <!-- Text fallback -->
            <div style="margin-top:14px">
              <label style="display:block;font-size:.82rem;font-weight:600;color:var(--tm);margin-bottom:5px">أو أكتب وصف الجمعية مباشرة</label>
              <textarea id="assocDesc" placeholder="أكتب هنا نبذة عن الجمعية، مجال عملها، مشاريعها، وأهدافها..." style="width:100%;padding:11px 13px;border-radius:var(--rs);border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.87rem;color:var(--td);outline:none;background:white;resize:vertical;min-height:90px;line-height:1.65;transition:border-color .2s" onfocus="this.style.borderColor='var(--g3)'" onblur="this.style.borderColor='var(--border)'"></textarea>
            </div>

            <button class="ai-btn" id="analyzeBtn" onclick="analyzeProfile()">
              <span id="analyzeBtnText">✦ تحليل الملف بالذكاء الاصطناعي</span>
            </button>
          </div>
        </div>

        <!-- AI Loading -->
        <div class="ai-loading" id="aiLoading">
          <div class="al-spinner"></div>
          <div class="al-text">يجري الذكاء الاصطناعي التحليل...</div>
          <div class="al-step" id="aiStep">جاري قراءة الملف التعريفي</div>
        </div>

        <!-- AI Results -->
        <div class="ai-results" id="aiResults">

          <!-- Summary -->
          <div class="section-card">
            <div class="sc-header">
              <div class="sc-icon">✦</div>
              <div>
                <div class="sc-title">ملخص الجمعية</div>
                <div class="sc-sub">تحليل AI للملف التعريفي</div>
              </div>
            </div>
            <div class="sc-body">
              <div class="summary-box">
                <div class="summary-label">✦ ملخص تلقائي</div>
                <div class="summary-text" id="aiSummary">—</div>
              </div>
            </div>
          </div>

          <!-- Ideas & Pain Points -->
          <div class="section-card">
            <div class="sc-header">
              <div class="sc-icon">💡</div>
              <div>
                <div class="sc-title">أفكار وتحديات تسويقية</div>
                <div class="sc-sub">توصيات AI لتحسين الحضور الإعلامي</div>
              </div>
            </div>
            <div class="sc-body">
              <div class="ip-grid">
                <div class="ip-card">
                  <div class="ip-card-head ideas">
                    <span class="ip-head-icon">💡</span>
                    <span class="ip-head-title">أفكار للمحتوى التسويقي</span>
                  </div>
                  <div class="ip-body" id="ideasList">—</div>
                </div>
                <div class="ip-card">
                  <div class="ip-card-head pain">
                    <span class="ip-head-icon">⚠️</span>
                    <span class="ip-head-title">تحديات ونقاط ضعف إعلامية</span>
                  </div>
                  <div class="ip-body" id="painList">—</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick content preview -->
          <div class="section-card">
            <div class="sc-header">
              <div class="sc-icon">✍️</div>
              <div>
                <div class="sc-title">محتوى تسويقي مقترح</div>
                <div class="sc-sub">محتوى جاهز للنشر مُولَّد بالذكاء الاصطناعي</div>
              </div>
            </div>
            <div class="sc-body">
              <div class="content-tabs">
                <button class="ctab active" onclick="switchTab(this,'post')">منشور سوشيال</button>
                <button class="ctab" onclick="switchTab(this,'story')">قصة إنسانية</button>
                <button class="ctab" onclick="switchTab(this,'donation')">نداء تبرع</button>
              </div>
              <div class="content-area" id="contentDisplay">
                <button class="copy-btn" onclick="copyContent()">نسخ</button>
                <span id="contentText">—</span>
              </div>
              <button class="regen-btn" onclick="regenContent()">🔄 توليد نص جديد</button>
            </div>
          </div>

        </div>
        <!-- placeholder before analysis -->
        <div class="ai-placeholder" id="aiPlaceholder">
          <div class="ap-icon">✦</div>
          <div class="ap-text">ارفع الملف التعريفي أو اكتب وصف الجمعية لبدء التحليل</div>
        </div>
      </div>



      <!-- ===== PAGE: TEAM ===== -->
      <div class="page" id="page-team">
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">👥</div>
            <div>
              <div class="sc-title">الفريق</div>
              <div class="sc-sub" id="emp-sub-count">7 موظفين</div>
            </div>
            <div style="margin-right:auto;display:flex;gap:8px;align-items:center">
              <span id="active-emp-badge" style="font-size:.72rem;background:#dcfce7;color:#166534;padding:2px 9px;border-radius:20px;font-weight:600">4 نشطين</span>
              <button onclick="openAddEmployee()" style="padding:6px 14px;border-radius:var(--rs);background:var(--g3);color:white;border:none;font-family:'Tajawal',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer">+ إضافة موظف</button>
            </div>
          </div>
          <div class="emp-list" id="employeesList"></div>
        </div>
      </div>

      <!-- ===== PAGE: TASKS ===== -->
      <div class="page" id="page-tasks">
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">✅</div>
            <div>
              <div class="sc-title">لوحة المهام</div>
              <div class="sc-sub">Notion-style Kanban</div>
            </div>
            <div style="margin-right:auto;display:flex;gap:8px;align-items:center">
              <span id="kpi-urgent-sub" style="font-size:.72rem;background:#fef3c7;color:#92400e;padding:2px 9px;border-radius:20px;font-weight:600">⚡ 2 عاجلة</span>
              <button onclick="openTaskModal(null)" class="task-add-btn">+ مهمة جديدة</button>
            </div>
          </div>
          <div class="task-toolbar">
            <button class="task-filter-btn active" onclick="setTaskFilter('all',this)">الكل</button>
            <button class="task-filter-btn" onclick="setTaskFilter('urgent',this)">⚡ عاجلة</button>
            <button class="task-filter-btn" onclick="setTaskFilter('overdue',this)">⏰ متأخرة</button>
            <button class="task-filter-btn" onclick="setTaskFilter('mine',this)">👤 الخاصة بي</button>
            <select id="assigneeFilter" onchange="renderBoard()" style="padding:4px 10px;border-radius:20px;border:1px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.74rem;color:var(--tl);background:white;margin-right:auto">
              <option value="all">كل الموظفين</option>
            </select>
          </div>
          <div class="kanban-board">
            <div class="kanban-col">
              <div class="kanban-col-head todo">
                <span style="width:8px;height:8px;border-radius:50%;background:#94a3b8;flex-shrink:0"></span>
                <span class="kanban-col-title">لم تبدأ</span>
                <span class="kanban-col-count" id="col-count-todo">0</span>
              </div>
              <div class="kanban-cards" id="col-todo"></div>
            </div>
            <div class="kanban-col">
              <div class="kanban-col-head doing">
                <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0"></span>
                <span class="kanban-col-title">قيد التنفيذ</span>
                <span class="kanban-col-count" id="col-count-doing">0</span>
              </div>
              <div class="kanban-cards" id="col-doing"></div>
            </div>
            <div class="kanban-col">
              <div class="kanban-col-head done">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--g3);flex-shrink:0"></span>
                <span class="kanban-col-title">مكتملة</span>
                <span class="kanban-col-count" id="col-count-done">0</span>
              </div>
              <div class="kanban-cards" id="col-done"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: DONATIONS ===== -->
      <div class="page" id="page-donations">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:18px">
          <div class="stat-card" style="border-right:3px solid #3b82f6">
            <div class="stat-num" style="color:#1e40af">48,500</div>
            <div class="stat-label">تبرعات هذا الشهر (ر.س)</div>
            <div class="stat-change" style="color:#2563eb">↑ 18% عن السابق</div>
          </div>
          <div class="stat-card" style="border-right:3px solid var(--g3)">
            <div class="stat-num" style="color:var(--g2)">134</div>
            <div class="stat-label">متبرع نشط</div>
            <div class="stat-change">↑ 22 جديد هذا الشهر</div>
          </div>
          <div class="stat-card" style="border-right:3px solid #f59e0b">
            <div class="stat-num" style="color:#92400e">2</div>
            <div class="stat-label">تبرعات معلقة</div>
            <div class="stat-change" style="color:#d97706">⚡ تحتاج متابعة</div>
          </div>
          <div class="stat-card" style="border-right:3px solid #8b5cf6">
            <div class="stat-num" style="color:#5b21b6">20,000</div>
            <div class="stat-label">أعلى تبرع (ر.س)</div>
            <div class="stat-change" style="color:#7c3aed">شيك — مؤسسة الأمل</div>
          </div>
        </div>
        <div class="section-card">
          <div class="sc-header" style="flex-wrap:wrap;gap:8px">
            <div class="sc-icon">💳</div>
            <div>
              <div class="sc-title">سجل التبرعات</div>
              <div class="sc-sub" id="don-sub-count">جميع التبرعات</div>
            </div>
            <div style="margin-right:auto;display:flex;gap:7px;flex-wrap:wrap;align-items:center">
              <select id="donPeriodFilter" onchange="renderDonations()" style="padding:5px 10px;border-radius:var(--rs);border:1px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.76rem;color:var(--tm);background:white">
                <option value="all">كل الفترات</option>
                <option value="week">آخر أسبوع</option>
                <option value="month">آخر شهر</option>
                <option value="month-1">يناير</option>
                <option value="month-2">فبراير</option>
                <option value="month-3">مارس</option>
                <option value="month-4">أبريل</option>
                <option value="month-5">مايو</option>
                <option value="month-6">يونيو</option>
                <option value="month-7">يوليو</option>
                <option value="month-8">أغسطس</option>
                <option value="month-9">سبتمبر</option>
                <option value="month-10">أكتوبر</option>
                <option value="month-11">نوفمبر</option>
                <option value="month-12">ديسمبر</option>
              </select>
              <select id="donFilter" onchange="renderDonations()" style="padding:5px 10px;border-radius:var(--rs);border:1px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.76rem;color:var(--tm);background:white">
                <option value="all">كل التبرعات</option>
                <option value="large">تبرعات كبيرة +2500</option>
                <option value="pending">معلقة فقط</option>
                <option value="completed">مكتملة فقط</option>
              </select>
            </div>
          </div>
          <div class="sc-body" style="padding:0">
            <table class="don-table">
              <thead>
                <tr>
                  <th class="don-th">المتبرع</th>
                  <th class="don-th">المبلغ</th>
                  <th class="don-th">القناة</th>
                  <th class="don-th">التاريخ</th>
                  <th class="don-th">الحالة</th>
                </tr>
              </thead>
              <tbody id="donationsTable"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TASK MODAL -->
      <div class="modal-overlay hidden" id="taskModalOverlay" onclick="closeTaskModalIfOutside(event)">
        <div class="task-modal" id="taskModal">
          <div class="modal-header">
            <span class="modal-status-badge todo" id="modalStatusBadge">لم تبدأ</span>
            <input class="modal-title" id="modalTitle" placeholder="عنوان المهمة..." type="text">
            <button class="modal-close" onclick="closeTaskModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-row">
              <div class="modal-field">
                <label>الحالة</label>
                <select class="modal-select" id="modalStatus" onchange="updateModalStatusBadge()">
                  <option value="todo">لم تبدأ</option>
                  <option value="doing">قيد التنفيذ</option>
                  <option value="done">مكتملة</option>
                </select>
              </div>
              <div class="modal-field">
                <label>الأولوية</label>
                <select class="modal-select" id="modalUrgency">
                  <option value="urgent">🔴 عاجلة</option>
                  <option value="high">🟡 مرتفعة</option>
                  <option value="normal" selected>🔵 عادية</option>
                  <option value="low">🟢 منخفضة</option>
                </select>
              </div>
            </div>
            <div class="modal-row">
              <div class="modal-field">
                <label>المسؤول</label>
                <select class="modal-select" id="modalAssignee">
                  <option value="">غير محدد</option>
                </select>
              </div>
              <div class="modal-field">
                <label>الموعد النهائي</label>
                <input class="modal-input" id="modalDeadline" type="date">
              </div>
            </div>
            <div class="modal-field">
              <label>التصنيف</label>
              <select class="modal-select" id="modalCategory">
                <option value="محتوى">📱 محتوى</option>
                <option value="حملات">📣 حملات</option>
                <option value="تبرعات">💳 تبرعات</option>
                <option value="إدارة">🏛 إدارة</option>
                <option value="تصميم">🎨 تصميم</option>
                <option value="شراكات">🤝 شراكات</option>
              </select>
            </div>
            <div class="modal-field">
              <label>ملاحظات</label>
              <textarea class="modal-textarea" id="modalNotes" placeholder="تفاصيل إضافية..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn-danger" id="modalDeleteBtn" onclick="deleteCurrentTask()">حذف</button>
            <button class="modal-btn-secondary" onclick="closeTaskModal()">إلغاء</button>
            <button class="modal-btn-primary" onclick="saveTask()">حفظ المهمة</button>
          </div>
        </div>
      </div>

      <!-- ADD EMPLOYEE MODAL -->
      <div class="modal-overlay hidden" id="empModalOverlay" onclick="closeEmpModalIfOutside(event)">
        <div class="task-modal" style="width:400px">
          <div class="modal-header">
            <span class="modal-status-badge doing">موظف جديد</span>
            <span style="flex:1;font-size:.95rem;font-weight:700;color:var(--td);padding-right:8px">إضافة فرد للفريق</span>
            <button class="modal-close" onclick="closeEmpModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-field">
              <label>الاسم الكامل</label>
              <input class="modal-input" id="empNameInput" placeholder="مثال: سارة العمري" type="text">
            </div>
            <div class="modal-field">
              <label>المسمى الوظيفي</label>
              <input class="modal-input" id="empRoleInput" placeholder="مثال: مدير تسويق" type="text">
            </div>
            <div class="modal-field">
              <label>الحالة</label>
              <select class="modal-select" id="empStatusInput">
                <option value="active">نشط</option>
                <option value="away">بعيد</option>
                <option value="off">خارج العمل</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn-secondary" onclick="closeEmpModal()">إلغاء</button>
            <button class="modal-btn-primary" onclick="saveEmployee()">إضافة للفريق</button>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: MARKETING CONTENT ===== -->
      <div class="page" id="page-content">
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">✍️</div>
            <div>
              <div class="sc-title">استوديو المحتوى التسويقي</div>
              <div class="sc-sub">أنواع متعددة من المحتوى بالذكاء الاصطناعي</div>
            </div>
            <span class="sc-badge ai">✦ AI</span>
          </div>
          <div class="sc-body">
            <div id="contentPageBody">
              <div class="ai-placeholder">
                <div class="ap-icon">✦</div>
                <div class="ap-text">أكمل تحليل ملف الجمعية أولاً من صفحة "ملف الجمعية"</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: INFLUENCERS ===== -->
      <div class="page" id="page-influencers">

        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:18px">
          <div class="stat-card" style="border-right:3px solid #8b5cf6">
            <div class="stat-num" style="color:#5b21b6" id="inf-kpi-total">6</div>
            <div class="stat-label">مؤثر متعاقد</div>
            <div class="stat-change" style="color:#7c3aed" id="inf-kpi-active">4 نشطون حالياً</div>
          </div>
          <div class="stat-card" style="border-right:3px solid #ec4899">
            <div class="stat-num" style="color:#be185d" id="inf-kpi-reach">2.4M</div>
            <div class="stat-label">إجمالي المتابعين</div>
            <div class="stat-change" style="color:#db2777">عبر كل المنصات</div>
          </div>
          <div class="stat-card" style="border-right:3px solid #f59e0b">
            <div class="stat-num" style="color:#92400e" id="inf-kpi-campaigns">8</div>
            <div class="stat-label">حملة مُنفَّذة</div>
            <div class="stat-change" style="color:#d97706">هذا العام</div>
          </div>
          <div class="stat-card" style="border-right:3px solid var(--g3)">
            <div class="stat-num" style="color:var(--g2)" id="inf-kpi-eng">4.2%</div>
            <div class="stat-label">متوسط التفاعل</div>
            <div class="stat-change">↑ أعلى من المتوسط</div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">⭐</div>
            <div>
              <div class="sc-title">المؤثرون المتاحون للحملات</div>
              <div class="sc-sub" id="inf-sub-count">4 مؤثر متاح</div>
            </div>
            <div style="margin-right:auto;display:flex;gap:7px;align-items:center">
              <select id="infPlatformFilter" onchange="renderInfluencers()" style="padding:5px 10px;border-radius:var(--rs);border:1px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.76rem;color:var(--tm);background:white">
                <option value="all">كل المنصات</option>
                <option value="X">X (تويتر)</option>
                <option value="Instagram">إنستقرام</option>
                <option value="TikTok">تيك توك</option>
                <option value="YouTube">يوتيوب</option>
                <option value="Snapchat">سناب شات</option>
              </select>
              <select id="infStatusFilter" onchange="renderInfluencers()" style="padding:5px 10px;border-radius:var(--rs);border:1px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.76rem;color:var(--tm);background:white">
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">قيد التفاوض</option>
                <option value="ended">انتهى العقد</option>
              </select>
              <button onclick="openInfluencerModal(null)" style="padding:6px 14px;border-radius:var(--rs);background:var(--g3);color:white;border:none;font-family:'Tajawal',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer">+ إضافة مؤثر</button>
            </div>
          </div>

          <!-- Influencers Grid -->
          <div class="sc-body">
            <div id="influencersGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px"></div>
          </div>
        </div>
      </div>


      <!-- CAMPAIGN REQUEST MODAL -->
      <div class="modal-overlay hidden" id="campReqOverlay" onclick="if(event.target===this)closeCampReq()">
        <div class="task-modal" style="width:500px">
          <div class="modal-header">
            <span class="modal-status-badge doing">طلب حملة جديدة</span>
            <span style="flex:1;font-size:.95rem;font-weight:700;color:var(--td);padding-right:10px" id="campReqTitle">—</span>
            <button class="modal-close" onclick="closeCampReq()">✕</button>
          </div>
          <div class="modal-body">

            <!-- Influencer summary -->
            <div id="campReqInfCard" style="background:var(--g6);border-radius:10px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;gap:12px;border:1px solid var(--border)">
              <div id="campReqAvatar" style="width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:white;flex-shrink:0"></div>
              <div>
                <div id="campReqInfName" style="font-size:.9rem;font-weight:700;color:var(--td)"></div>
                <div id="campReqInfMeta" style="font-size:.77rem;color:var(--tl);margin-top:2px"></div>
              </div>
              <div style="margin-right:auto;text-align:left">
                <div style="font-size:.7rem;color:var(--tl)">يبدأ من</div>
                <div id="campReqPrice" style="font-size:1.1rem;font-weight:800;color:var(--g2)"></div>
              </div>
            </div>

            <div class="modal-row">
              <div class="modal-field">
                <label>نوع الحملة</label>
                <select class="modal-select" id="campType">
                  <option value="خيرية">📢 حملة خيرية عامة</option>
                  <option value="رمضان">🌙 حملة رمضان</option>
                  <option value="تبرع">💳 حملة جمع تبرعات</option>
                  <option value="توعية">💡 حملة توعوية</option>
                  <option value="مشروع">🏗 مشروع محدد</option>
                </select>
              </div>
              <div class="modal-field">
                <label>الميزانية المتوقعة (ر.س)</label>
                <input class="modal-input" id="campBudget" type="number" placeholder="مثال: 500" dir="ltr" min="250">
              </div>
            </div>

            <div class="modal-row">
              <div class="modal-field">
                <label>تاريخ البداية المقترح</label>
                <input class="modal-input" id="campStartDate" type="date">
              </div>
              <div class="modal-field">
                <label>مدة الحملة</label>
                <select class="modal-select" id="campDuration">
                  <option value="يوم واحد">يوم واحد</option>
                  <option value="3 أيام">3 أيام</option>
                  <option value="أسبوع" selected>أسبوع</option>
                  <option value="أسبوعان">أسبوعان</option>
                  <option value="شهر">شهر</option>
                </select>
              </div>
            </div>

            <div class="modal-field">
              <label>رسالة الحملة / الهدف المطلوب</label>
              <textarea class="modal-textarea" id="campMessage" placeholder="اكتب هنا ما تريد إيصاله من الحملة، وأي تفاصيل تساعد المؤثر على فهم رسالتكم..." style="min-height:90px"></textarea>
            </div>

            <!-- Price note -->
            <div style="background:#fff8f0;border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:11px 14px;font-size:.8rem;color:#92400e;line-height:1.6">
              💡 <strong>ملاحظة:</strong> السعر المبدئي تقديري ويبدأ من 250 ر.س. السعر النهائي يُحدَّد بعد مراجعة فريق ساعِد والتواصل مع المؤثر بناءً على تفاصيل الحملة.
            </div>

          </div>
          <div class="modal-footer">
            <button class="modal-btn-secondary" onclick="closeCampReq()">إلغاء</button>
            <button class="modal-btn-primary" onclick="submitCampRequest()">إرسال الطلب ←</button>
          </div>
        </div>
      </div>

      <!-- INFLUENCER MODAL -->
      <div class="modal-overlay hidden" id="infModalOverlay" onclick="if(event.target===this)closeInfModal()">
        <div class="task-modal" style="width:480px">
          <div class="modal-header">
            <span class="modal-status-badge doing" id="infModalBadge">مؤثر جديد</span>
            <span style="flex:1;font-size:.95rem;font-weight:700;color:var(--td);padding-right:8px" id="infModalTitleLabel">إضافة مؤثر</span>
            <button class="modal-close" onclick="closeInfModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-row">
              <div class="modal-field">
                <label>الاسم / الحساب</label>
                <input class="modal-input" id="inf-name" placeholder="اسم المؤثر" type="text">
              </div>
              <div class="modal-field">
                <label>المنصة الرئيسية</label>
                <select class="modal-select" id="inf-platform">
                  <option value="Instagram">Instagram</option>
                  <option value="X">X (تويتر)</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Snapchat">Snapchat</option>
                </select>
              </div>
            </div>
            <div class="modal-row">
              <div class="modal-field">
                <label>عدد المتابعين</label>
                <input class="modal-input" id="inf-followers" placeholder="مثال: 150000" type="number" dir="ltr">
              </div>
              <div class="modal-field">
                <label>نسبة التفاعل %</label>
                <input class="modal-input" id="inf-engagement" placeholder="مثال: 4.5" type="number" step="0.1" dir="ltr">
              </div>
            </div>
            <div class="modal-row">
              <div class="modal-field">
                <label>حالة العقد</label>
                <select class="modal-select" id="inf-status">
                  <option value="active">نشط</option>
                  <option value="pending">قيد التفاوض</option>
                  <option value="ended">انتهى العقد</option>
                </select>
              </div>
              <div class="modal-field">
                <label>عدد الحملات المُنفَّذة</label>
                <input class="modal-input" id="inf-campaigns" placeholder="0" type="number" dir="ltr">
              </div>
            </div>
            <div class="modal-field">
              <label>تخصص المحتوى</label>
              <input class="modal-input" id="inf-niche" placeholder="مثال: محتوى خيري، ديني، عائلي..." type="text">
            </div>
            <div class="modal-field">
              <label>ملاحظات</label>
              <textarea class="modal-textarea" id="inf-notes" placeholder="شروط العقد، تواريخ، ملاحظات..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn-danger" id="infDeleteBtn" onclick="deleteInfluencer()" style="display:none">حذف</button>
            <button class="modal-btn-secondary" onclick="closeInfModal()">إلغاء</button>
            <button class="modal-btn-primary" onclick="saveInfluencer()">حفظ</button>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: CAMPAIGNS ===== -->
      <div class="page" id="page-campaigns">
        <div class="welcome-banner">
          <div class="wb-icon">📣</div>
          <div class="wb-text">
            <div class="wb-greeting">الحملات الإعلامية</div>
            <div class="wb-name">حملاتك القادمة</div>
            <div class="wb-sub">خطط لحملاتك الموسمية مسبقاً</div>
          </div>
        </div>
        <div class="section-card">
          <div class="sc-body" style="text-align:center;padding:40px">
            <div style="font-size:2rem;margin-bottom:10px">📣</div>
            <div style="font-size:.92rem;font-weight:600;color:var(--tm);margin-bottom:5px">الحملات قيد الإنشاء</div>
            <div style="font-size:.8rem;color:var(--tl)">سيتم تفعيل هذه الصفحة بعد تحليل ملف الجمعية</div>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: ANALYTICS ===== -->
      <div class="page" id="page-analytics">
        <div class="section-card">
          <div class="sc-body" style="text-align:center;padding:40px">
            <div style="font-size:2rem;margin-bottom:10px">📊</div>
            <div style="font-size:.92rem;font-weight:600;color:var(--tm);margin-bottom:5px">التحليلات قادمة قريباً</div>
            <div style="font-size:.8rem;color:var(--tl)">لوحة تحليلات متكاملة لأداء منصاتك</div>
          </div>
        </div>
      </div>


      <!-- ===== PAGE: SERVICES ===== -->
      <div class="page" id="page-services">
        <div class="welcome-banner" style="margin-bottom:22px">
          <div class="wb-icon">🛎</div>
          <div class="wb-text">
            <div class="wb-greeting">خدمات ساعِد الإعلامية</div>
            <div class="wb-name">5 خدمات متكاملة لجمعيتكم</div>
            <div class="wb-sub">اختاروا الخدمة المناسبة وسيتواصل معكم فريقنا</div>
          </div>
        </div>
        <div class="services-grid" id="servicesGrid">
          <div class="srv-card" onclick="toggleService(this,'الظهور الإعلامي وبناء الهوية')">
            <div class="srv-icon">📱</div>
            <div class="srv-title">الظهور الإعلامي وبناء الهوية</div>
            <div class="srv-desc">إدارة حسابات التواصل الاجتماعي وبناء الهوية البصرية للجمعية</div>
            <div class="srv-price">يشمل: إدارة المنصات، هوية بصرية، توحيد الرسائل</div>
          </div>
          <div class="srv-card" onclick="toggleService(this,'صناعة المحتوى المؤثر')">
            <div class="srv-icon">🎬</div>
            <div class="srv-title">صناعة المحتوى المؤثر</div>
            <div class="srv-desc">محتوى قصصي إنساني، فيديوهات توعوية، تغطيات ميدانية</div>
            <div class="srv-price">يشمل: Storytelling، فيديو، محتوى تفاعلي</div>
          </div>
          <div class="srv-card" onclick="toggleService(this,'تصميم التقارير والملفات')">
            <div class="srv-icon">📊</div>
            <div class="srv-title">تصميم التقارير والملفات</div>
            <div class="srv-desc">تصميم الملف التعريفي، تقارير المشاريع، تحويل البيانات لمحتوى بصري</div>
            <div class="srv-price">يشمل: ملفات PDF، موشن جرافيك، إنفوجرافيك</div>
          </div>
          <div class="srv-card" onclick="toggleService(this,'الحملات الإعلامية وجمع التبرعات')">
            <div class="srv-icon">💰</div>
            <div class="srv-title">الحملات الإعلامية وجمع التبرعات</div>
            <div class="srv-desc">حملات رمضان، الحج، الأعياد، صفحات هبوط مخصصة للتبرع</div>
            <div class="srv-price">يشمل: حملات موسمية، صفحات هبوط، رسائل تحفيزية</div>
          </div>
          <div class="srv-card" onclick="toggleService(this,'إدارة المؤثرين والشراكات')">
            <div class="srv-icon">🤝</div>
            <div class="srv-title">إدارة المؤثرين والشراكات</div>
            <div class="srv-desc">ربط الجمعية بمؤثرين مناسبين، إدارة الحملات، توثيق الشراكات</div>
            <div class="srv-price">يشمل: اختيار المؤثرين، إدارة الحملة، التوثيق</div>
          </div>
          <div class="srv-card" style="border:2px dashed var(--border);background:var(--g6);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px" onclick="alert('سيتم إضافة المزيد من الخدمات قريباً')">
            <div style="font-size:1.8rem;opacity:.3;margin-bottom:8px">+</div>
            <div style="font-size:.82rem;color:var(--tl);text-align:center">المزيد قريباً</div>
          </div>
        </div>
        <div id="selectedServices" style="display:none;margin-top:18px">
          <div class="section-card">
            <div class="sc-header">
              <div class="sc-icon">✓</div>
              <div>
                <div class="sc-title">الخدمات المختارة</div>
                <div class="sc-sub">سيتواصل معكم فريق ساعِد لمناقشة التفاصيل</div>
              </div>
            </div>
            <div class="sc-body">
              <div id="selectedList" style="margin-bottom:14px;font-size:.87rem;color:var(--tm);line-height:2"></div>
              <button class="ai-btn" onclick="requestServices()">إرسال طلب الخدمة ←</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PAGE: SETTINGS ===== -->
      <div class="page" id="page-settings">
        <div class="section-card">
          <div class="sc-header">
            <div class="sc-icon">⚙</div>
            <div><div class="sc-title">إعدادات الجمعية</div></div>
          </div>
          <div class="sc-body">
            <div style="display:grid;gap:12px">
              <div>
                <label style="display:block;font-size:.82rem;font-weight:600;color:var(--tm);margin-bottom:5px">اسم الجمعية</label>
                <input type="text" id="settingsName" placeholder="اسم الجمعية" style="width:100%;padding:10px 13px;border-radius:var(--rs);border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.9rem;color:var(--td);outline:none">
              </div>
              <div>
                <label style="display:block;font-size:.82rem;font-weight:600;color:var(--tm);margin-bottom:5px">البريد الإلكتروني للتواصل</label>
                <input type="email" placeholder="email@association.org" style="width:100%;padding:10px 13px;border-radius:var(--rs);border:1.5px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.9rem;color:var(--td);outline:none">
              </div>
              <button class="ai-btn" style="background:linear-gradient(135deg,#374151,#6b7280)" onclick="alert('تم الحفظ')">حفظ الإعدادات</button>
            </div>
          </div>
        </div>
      </div>


    </div><!-- /content -->
  </div><!-- /main -->
</div><!-- /app -->

`;
const SCRIPT = `
;

window.__saaidGuard = (function() {
  var SB_URL = 'https://zbihqfxafxacucgpajoe.supabase.co'
  var SB_KEY = 'sb_publishable_nmNbrIOTR5dSaivRaXtVmQ_uWyuICE2'
  var DEV_PASS = 'saaid2025dev'

  function hasAccess() {
    return sessionStorage.getItem('saaid_devAccess') === DEV_PASS
        || !!sessionStorage.getItem('saaid_user')
  }

  function loadUser() {
    try {
      var u = JSON.parse(sessionStorage.getItem('saaid_user') || 'null')
      if(!u) return
      var map = {topAssocName: u.name, sbAssocName: u.name, sbav: u.av || u.name.charAt(0)}
      Object.keys(map).forEach(function(id) {
        var el = document.getElementById(id)
        if(el) el.textContent = map[id]
      })
    } catch(e) {}
  }

  function showGate() {
    var overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:linear-gradient(135deg,#0a2818,#1a5c3a);display:flex;align-items:center;justify-content:center'
    overlay.innerHTML = '<div style="background:white;border-radius:16px;padding:36px 32px;width:340px;text-align:center;font-family:Tajawal,sans-serif"><div style=\\"font-size:2rem;margin-bottom:12px\\">\\uD83D\\uDD12</div><div style=\\"font-size:1.1rem;font-weight:700;color:#111827;margin-bottom:6px\\">صفحة محمية</div><div style=\\"font-size:.85rem;color:#6b7280;margin-bottom:20px\\">أدخل كلمة المرور للمتابعة</div><input id=\\"dpi\\" type=\\"password\\" placeholder=\\"كلمة المرور...\\" dir=\\"ltr\\" style=\\"width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid #e5e7eb;font-size:.95rem;outline:none;margin-bottom:12px;text-align:center\\"><button id=\\"dpb\\" style=\\"width:100%;padding:11px;border-radius:8px;background:linear-gradient(135deg,#1a5c3a,#2d7a52);color:white;border:none;font-family:Tajawal,sans-serif;font-size:.95rem;font-weight:700;cursor:pointer\\">دخول</button><div id=\\"dpe\\" style=\\"color:#dc2626;font-size:.8rem;margin-top:10px;display:none\\">كلمة المرور غير صحيحة</div></div>'
    document.body.appendChild(overlay)
    function tryPass() {
      var val = document.getElementById('dpi').value
      if(val === DEV_PASS) {
        sessionStorage.setItem('saaid_devAccess', DEV_PASS)
        overlay.remove(); loadUser()
      } else {
        document.getElementById('dpe').style.display = 'block'
        document.getElementById('dpi').style.borderColor = '#dc2626'
      }
    }
    document.getElementById('dpb').onclick = tryPass
    document.getElementById('dpi').onkeydown = function(e){ if(e.key==='Enter') tryPass() }
    setTimeout(function(){ var i=document.getElementById('dpi'); if(i) i.focus() }, 100)
  }

  function init() {
    // 1. dev access or user session already saved → allow immediately
    if(hasAccess()) { loadUser(); return }
    // 2. check Supabase for live session
    try {
      var _sb = window.supabase.createClient(SB_URL, SB_KEY)
      _sb.auth.getSession().then(function(res) {
        var session = res.data.session
        if(session && session.user) {
          var name = (session.user.user_metadata && session.user.user_metadata.full_name) || session.user.email
          var av = (name || '?').charAt(0).toUpperCase()
          sessionStorage.setItem('saaid_user', JSON.stringify({name:name, av:av, role:'مدير الجمعية'}))
          loadUser()
        } else {
          // re-check sessionStorage one more time before showing gate
          // (handles the case where tryPass() just ran and set saaid_devAccess)
          if(hasAccess()) { loadUser(); return }
          showGate()
        }
      }).catch(function(){
        if(hasAccess()) { loadUser(); return }
        showGate()
      })
    } catch(e) {
      if(hasAccess()) { loadUser(); return }
      showGate()
    }
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  return {loadUser: loadUser}
})()
// ════════════════ INFLUENCERS ════════════════
const infColors = ['#7c3aed','#be185d','#0369a1','#b91c1c','#166534','#92400e','#0f766e']

let influencers = [
  {id:1, name:'أبو خالد العوضي',   platform:'Instagram', followers:320000, engagement:5.2, status:'active',  campaigns:4, niche:'محتوى خيري وعائلي',    notes:'تعاقد سنوي',              basePrice:1800},
  {id:2, name:'هند الرشيدي',       platform:'X',         followers:890000, engagement:3.8, status:'active',  campaigns:2, niche:'شؤون اجتماعية',         notes:'',                         basePrice:3500},
  {id:3, name:'أحمد القحطاني',     platform:'TikTok',    followers:1200000,engagement:7.1, status:'active',  campaigns:1, niche:'ترفيهي وخيري',          notes:'حملة رمضان فقط',           basePrice:5000},
  {id:4, name:'نورة العتيبي',      platform:'Snapchat',  followers:450000, engagement:4.5, status:'pending', campaigns:0, niche:'محتوى عائلي',            notes:'قيد التفاوض على الأسعار',  basePrice:2200},
  {id:5, name:'سالم الدوسري',      platform:'YouTube',   followers:280000, engagement:6.3, status:'active',  campaigns:1, niche:'وثائقي خيري',            notes:'',                         basePrice:1500},
  {id:6, name:'ريهام السبيعي',     platform:'Instagram', followers:175000, engagement:8.9, status:'ended',   campaigns:2, niche:'محتوى نسائي واجتماعي', notes:'انتهى عقدها مارس 2025',    basePrice:250},
]
let editingInfId = null
let nextInfId = 7

function formatFollowers(n) {
  if(n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if(n >= 1000) return (n/1000).toFixed(0) + 'K'
  return n.toString()
}

function calcPrice(inf) {
  // base price from data, min 250 SAR
  return Math.max(250, inf.basePrice || 250)
}

function renderInfluencers() {
  const grid = document.getElementById('influencersGrid')
  if(!grid) return
  const pf = document.getElementById('infPlatformFilter')?.value || 'all'
  const sf = document.getElementById('infStatusFilter')?.value  || 'all'
  let list = influencers
  if(pf !== 'all') list = list.filter(i => i.platform === pf)
  if(sf !== 'all') list = list.filter(i => i.status  === sf)

  const statusLabels = {active:'نشط', pending:'قيد التفاوض', ended:'انتهى العقد'}
  const platIcons = {Instagram:'📸', X:'✦', TikTok:'🎵', YouTube:'▶', Snapchat:'👻'}
  const statusColors = {active:'#dcfce7;color:#166534', pending:'#fef9c3;color:#92400e', ended:'#f1f5f9;color:#94a3b8'}

  grid.innerHTML = list.map((inf,idx) => {
    const color = infColors[idx % infColors.length]
    const initials = inf.name.split(' ').map(n=>n[0]).slice(0,2).join('')
    const price = calcPrice(inf)
    const canRequest = inf.status === 'active'
    return \`<div class="inf-card" style="display:flex;flex-direction:column">
      <!-- Header -->
      <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">
        <div class="inf-avatar" style="background:\${color};width:46px;height:46px;font-size:1.1rem">\${initials}</div>
        <div style="flex:1;min-width:0">
          <div class="inf-handle" style="font-size:.9rem">\${inf.name}</div>
          <div class="inf-niche" style="font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${inf.niche}</div>
        </div>
        <span style="font-size:.68rem;padding:3px 9px;border-radius:20px;font-weight:600;background:\${statusColors[inf.status] || statusColors.ended};flex-shrink:0">\${statusLabels[inf.status]}</span>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">
        <div style="background:var(--g6);border-radius:8px;padding:8px 6px;text-align:center">
          <div style="font-size:.85rem;font-weight:700;color:var(--td)">\${formatFollowers(inf.followers)}</div>
          <div style="font-size:.65rem;color:var(--th);margin-top:1px">متابع</div>
        </div>
        <div style="background:var(--g6);border-radius:8px;padding:8px 6px;text-align:center">
          <div style="font-size:.85rem;font-weight:700;color:var(--td)">\${inf.engagement}%</div>
          <div style="font-size:.65rem;color:var(--th);margin-top:1px">تفاعل</div>
        </div>
        <div style="background:var(--g6);border-radius:8px;padding:8px 6px;text-align:center">
          <div style="font-size:.85rem;font-weight:700;color:var(--td)">\${inf.campaigns}</div>
          <div style="font-size:.65rem;color:var(--th);margin-top:1px">حملة</div>
        </div>
      </div>

      <!-- Platform -->
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <span class="inf-platform-badge \${inf.platform}" style="font-size:.72rem">\${platIcons[inf.platform]||''} \${inf.platform}</span>
      </div>

      <!-- Price + CTA — pushed to bottom -->
      <div style="margin-top:auto;border-top:1px solid var(--border);padding-top:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div>
            <div style="font-size:.68rem;color:var(--tl)">السعر المبدئي للحملة</div>
            <div style="font-size:1.05rem;font-weight:800;color:var(--g2)">يبدأ من \${price.toLocaleString()} ر.س</div>
          </div>
          <div style="font-size:.68rem;color:var(--th);text-align:left;max-width:90px;line-height:1.4">يُحدَّد السعر النهائي بعد التواصل</div>
        </div>
        \${canRequest
          ? \`<button onclick="openCampaignRequest(\${inf.id})" style="width:100%;padding:9px;border-radius:8px;background:linear-gradient(135deg,var(--g2),var(--g3));color:white;border:none;font-family:'Tajawal',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .18s" onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">📣 طلب حملة</button>\`
          : \`<div style="width:100%;padding:9px;border-radius:8px;background:var(--bg);color:var(--th);border:1px solid var(--border);font-family:'Tajawal',sans-serif;font-size:.82rem;font-weight:600;text-align:center">غير متاح حالياً</div>\`
        }
      </div>
    </div>\`
  }).join('') || '<div style="grid-column:1/-1;padding:30px;text-align:center;color:var(--th);font-size:.85rem">لا يوجد مؤثرون في هذه الفئة</div>'

  // update KPIs
  const el = document.getElementById('inf-sub-count')
  if(el) el.textContent = list.filter(i=>i.status==='active').length + ' مؤثر متاح'
  const kpiTotal  = document.getElementById('inf-kpi-total')
  const kpiActive = document.getElementById('inf-kpi-active')
  const kpiReach  = document.getElementById('inf-kpi-reach')
  const kpiCamp   = document.getElementById('inf-kpi-campaigns')
  if(kpiTotal)  kpiTotal.textContent  = influencers.length
  if(kpiActive) kpiActive.textContent = influencers.filter(i=>i.status==='active').length + ' نشطون حالياً'
  const totalReach = influencers.reduce((s,i)=>s+i.followers,0)
  if(kpiReach) kpiReach.textContent = formatFollowers(totalReach)
  const totalCamp = influencers.reduce((s,i)=>s+i.campaigns,0)
  if(kpiCamp)  kpiCamp.textContent  = totalCamp
}

function openInfluencerModal(id) {
  editingInfId = id
  const inf = id ? influencers.find(i=>i.id===id) : null
  document.getElementById('inf-name').value       = inf ? inf.name       : ''
  document.getElementById('inf-platform').value   = inf ? inf.platform   : 'Instagram'
  document.getElementById('inf-followers').value  = inf ? inf.followers  : ''
  document.getElementById('inf-engagement').value = inf ? inf.engagement : ''
  document.getElementById('inf-status').value     = inf ? inf.status     : 'active'
  document.getElementById('inf-campaigns').value  = inf ? inf.campaigns  : '0'
  document.getElementById('inf-niche').value      = inf ? inf.niche      : ''
  document.getElementById('inf-notes').value      = inf ? inf.notes      : ''
  const badge = document.getElementById('infModalBadge')
  const label = document.getElementById('infModalTitleLabel')
  const delBtn = document.getElementById('infDeleteBtn')
  if(badge) badge.textContent = id ? 'تعديل' : 'مؤثر جديد'
  if(label) label.textContent = id ? (inf ? inf.name : '') : 'إضافة مؤثر'
  if(delBtn) delBtn.style.display = id ? 'block' : 'none'
  document.getElementById('infModalOverlay').classList.remove('hidden')
}

function saveInfluencer() {
  const name = document.getElementById('inf-name').value.trim()
  if(!name) { document.getElementById('inf-name').focus(); return }
  const data = {
    name,
    platform:   document.getElementById('inf-platform').value,
    followers:  parseInt(document.getElementById('inf-followers').value) || 0,
    engagement: parseFloat(document.getElementById('inf-engagement').value) || 0,
    status:     document.getElementById('inf-status').value,
    campaigns:  parseInt(document.getElementById('inf-campaigns').value) || 0,
    niche:      document.getElementById('inf-niche').value.trim(),
    notes:      document.getElementById('inf-notes').value.trim(),
  }
  if(editingInfId) {
    const idx = influencers.findIndex(i=>i.id===editingInfId)
    if(idx>-1) influencers[idx] = {...influencers[idx], ...data}
  } else {
    influencers.unshift({id: nextInfId++, ...data})
  }
  closeInfModal()
  renderInfluencers()
}

function deleteInfluencer() {
  if(!editingInfId) return
  const inf = influencers.find(i=>i.id===editingInfId)
  if(!inf || !confirm('حذف ' + inf.name + '؟')) return
  influencers = influencers.filter(i=>i.id!==editingInfId)
  closeInfModal()
  renderInfluencers()
}

function closeInfModal() {
  document.getElementById('infModalOverlay').classList.add('hidden')
}

// ════════ CAMPAIGN REQUEST ════════
function openCampaignRequest(id) {
  const inf = influencers.find(i => i.id === id)
  if(!inf) return
  const color = infColors[influencers.indexOf(inf) % infColors.length]
  const initials = inf.name.split(' ').map(n=>n[0]).slice(0,2).join('')
  const platIcons = {Instagram:'📸', X:'✦', TikTok:'🎵', YouTube:'▶', Snapchat:'👻'}
  const price = calcPrice(inf)

  document.getElementById('campReqTitle').textContent  = inf.name
  document.getElementById('campReqAvatar').textContent = initials
  document.getElementById('campReqAvatar').style.background = color
  document.getElementById('campReqInfName').textContent = inf.name
  document.getElementById('campReqInfMeta').textContent = (platIcons[inf.platform]||'') + ' ' + inf.platform + ' · ' + formatFollowers(inf.followers) + ' متابع · ' + inf.engagement + '% تفاعل'
  document.getElementById('campReqPrice').textContent  = 'يبدأ من ' + price.toLocaleString() + ' ر.س'
  document.getElementById('campBudget').value = price
  document.getElementById('campBudget').min   = 250

  // set default date to today
  const today = new Date().toISOString().slice(0,10)
  document.getElementById('campStartDate').value = today
  document.getElementById('campMessage').value   = ''

  document.getElementById('campReqOverlay').classList.remove('hidden')
}

function closeCampReq() {
  document.getElementById('campReqOverlay').classList.add('hidden')
}

function submitCampRequest() {
  const type     = document.getElementById('campType').value
  const budget   = parseInt(document.getElementById('campBudget').value) || 0
  const date     = document.getElementById('campStartDate').value
  const duration = document.getElementById('campDuration').value
  const message  = document.getElementById('campMessage').value.trim()
  const infName  = document.getElementById('campReqTitle').textContent

  if(budget < 250) {
    document.getElementById('campBudget').style.borderColor = '#dc2626'
    setTimeout(()=>{ document.getElementById('campBudget').style.borderColor='' }, 1500)
    return
  }
  if(!message) {
    document.getElementById('campMessage').style.borderColor = '#dc2626'
    setTimeout(()=>{ document.getElementById('campMessage').style.borderColor='' }, 1500)
    return
  }

  // Success feedback
  closeCampReq()
  // Show toast
  const toast = document.createElement('div')
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1a5c3a,#2d7a52);color:white;padding:13px 24px;border-radius:12px;font-family:Tajawal,sans-serif;font-size:.92rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.25);animation:slideUp .3s ease'
  toast.textContent = '✓ تم إرسال طلب الحملة مع ' + infName + ' — سيتواصل معكم فريق ساعِد'
  document.body.appendChild(toast)
  setTimeout(()=>{ toast.style.opacity='0'; toast.style.transition='opacity .4s'; setTimeout(()=>toast.remove(), 400) }, 3500)
}


;

// ========== STATE ==========
const state = {
  assocName: '',
  fileData: null,
  fileName: null,
  analysisData: null,
  selectedTab: 'post',
  selectedServices: new Set()
}

// ========== NAV ==========
const pageTitles = {
  overview:'نظرة عامة', profile:'ملف الجمعية', services:'خدماتنا',
  content:'المحتوى التسويقي', campaigns:'الحملات', analytics:'التحليلات', settings:'الإعدادات',
  team:'الفريق', tasks:'لوحة المهام', donations:'التبرعات', influencers:'المؤثرون'
}
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  const pg = document.getElementById('page-' + id)
  if(pg) pg.classList.add('active')
  document.querySelectorAll('.sbi').forEach(b => b.classList.remove('active'))
  if(el) el.classList.add('active')
  document.getElementById('pageTitle').textContent = pageTitles[id] || id
  if(id === 'team')      renderEmployees()
  if(id === 'tasks')     { populateAssigneeSelects(); renderBoard(); }
  if(id === 'donations')   renderDonations()
  if(id === 'influencers') renderInfluencers()
}

// ========== FILE HANDLING ==========
function dragOver(e) {
  e.preventDefault()
  document.getElementById('uploadZone').classList.add('drag')
}
function dragLeave(e) {
  document.getElementById('uploadZone').classList.remove('drag')
}
function dropFile(e) {
  e.preventDefault()
  document.getElementById('uploadZone').classList.remove('drag')
  const f = e.dataTransfer.files[0]
  if(f) processFile(f)
}
function fileSelected(input) {
  if(input.files[0]) processFile(input.files[0])
}
function processFile(file) {
  state.fileName = file.name
  const ext = file.name.split('.').pop().toLowerCase()
  const icons = {pdf:'📕',doc:'📘',docx:'📘',txt:'📄',jpg:'🖼',jpeg:'🖼',png:'🖼'}
  const sizes = ['B','KB','MB']
  let s = file.size, i = 0
  while(s >= 1024 && i < 2) { s /= 1024; i++ }
  document.getElementById('fpIcon').textContent = icons[ext] || '📄'
  document.getElementById('fpName').textContent = file.name
  document.getElementById('fpSize').textContent = s.toFixed(1) + ' ' + sizes[i]
  document.getElementById('filePreview').style.display = 'flex'
  const reader = new FileReader()
  reader.onload = r => { state.fileData = r.target.result }
  if(ext === 'pdf' || ext === 'doc' || ext === 'docx') {
    reader.readAsArrayBuffer(file)
  } else {
    reader.readAsText(file)
  }
}
function removeFile() {
  state.fileData = null; state.fileName = null
  document.getElementById('filePreview').style.display = 'none'
  document.getElementById('fileInput').value = ''
}

// ========== AI ANALYSIS ==========
async function analyzeProfile() {
  const nameInput = document.getElementById('assocNameInput').value.trim()
  const descInput = document.getElementById('assocDesc').value.trim()
  if(!nameInput && !descInput && !state.fileData) {
    alert('من فضلك أدخل اسم الجمعية ووصفها أو ارفع ملف تعريفي')
    return
  }
  const assocName = nameInput || 'الجمعية'
  state.assocName = assocName
  updateAssocName(assocName)

  const btn = document.getElementById('analyzeBtn')
  btn.disabled = true
  document.getElementById('analyzeBtnText').innerHTML = '<span class="spin">⟳</span> جاري التحليل...'
  document.getElementById('aiPlaceholder').style.display = 'none'
  document.getElementById('aiLoading').classList.add('visible')
  document.getElementById('aiResults').classList.remove('visible')

  const steps = ['جاري قراءة الملف التعريفي...', 'تحليل رسالة وأهداف الجمعية...', 'توليد الأفكار والمحتوى...', 'إنهاء التقرير...']
  let si = 0
  const stepInterval = setInterval(() => {
    if(si < steps.length) {
      document.getElementById('aiStep').textContent = steps[si++]
    }
  }, 1800)

  const prompt = \`أنت خبير تسويق للجمعيات الخيرية في السعودية. 
اسم الجمعية: \${assocName}
\${descInput ? 'وصف الجمعية: ' + descInput : ''}
\${state.fileName ? 'تم رفع ملف باسم: ' + state.fileName : ''}

قم بتحليل الجمعية وأجب بـ JSON فقط (بدون أي نص خارج JSON، بدون markdown):
{
  "summary": "ملخص احترافي عن الجمعية في 3 جمل",
  "ideas": ["فكرة 1 للمحتوى التسويقي", "فكرة 2", "فكرة 3", "فكرة 4"],
  "pain_points": ["تحدي إعلامي 1", "تحدي 2", "تحدي 3", "تحدي 4"],
  "post": "منشور سوشيال ميديا جذاب للجمعية باللغة العربية (3-4 أسطر مع هاشتاقات)",
  "story": "قصة إنسانية قصيرة تعبر عن أثر الجمعية (4-5 أسطر)",
  "donation": "نداء تبرع عاطفي ومحفز (3-4 أسطر)"
}\`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await res.json()
    clearInterval(stepInterval)
    const text = data.content?.map(i => i.text || '').join('') || ''
    let parsed
    try {
      const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
      parsed = JSON.parse(clean)
    } catch(e) {
      parsed = {
        summary: \`\${assocName} جمعية خيرية تسعى إلى تقديم خدمات إنسانية متميزة للمجتمع، وتعمل على تحقيق أهدافها من خلال مبادرات متعددة تعزز التكافل الاجتماعي وتدعم الفئات المحتاجة.\`,
        ideas: ['إنتاج محتوى قصصي عن المستفيدين', 'توثيق الأثر بالأرقام والصور', 'حملة رمضان المقبلة', 'بث مباشر من الميدان'],
        pain_points: ['ضعف الحضور البصري على المنصات', 'محدودية الوصول للجمهور المستهدف', 'قلة المحتوى العاطفي المحفز للتبرع', 'غياب الاستراتيجية الإعلامية الموحدة'],
        post: \`✨ \${assocName} تواصل مسيرتها في خدمة الإنسانية\\n\\nكل تبرع صغير يصنع فرقاً كبيراً في حياة من يحتاج\\nانضم إلينا اليوم واجعل أثرك يمتد\\n\\n#\${assocName} #عمل_خيري #السعودية\`,
        story: \`في يوم عادي، وصل فريق \${assocName} إلى قرية نائية... وجدوا أسرة تحتاج مساعدة عاجلة. بفضل تبرعاتكم الكريمة، استطعنا تحويل حزنهم إلى فرحة وأملهم إلى حقيقة. هذا هو أثر كلمة "أساعد".\`,
        donation: \`أخي الكريم... طفل ينتظر، أسرة تحلم، مستقبل ينتظر يدك.\\nتبرعك اليوم لـ\${assocName} يصنع غداً أفضل\\n💚 تبرع الآن واجعل لك أثراً باقياً\`
      }
    }

    state.analysisData = parsed
    document.getElementById('aiLoading').classList.remove('visible')
    document.getElementById('aiSummary').textContent = parsed.summary
    renderIdeas(parsed.ideas)
    renderPain(parsed.pain_points)
    state.contentMap = { post: parsed.post, story: parsed.story, donation: parsed.donation }
    document.getElementById('contentText').textContent = parsed.post
    document.getElementById('aiResults').classList.add('visible')
    document.getElementById('statContent').textContent = '3+'
    populateContentPage(parsed)
  } catch(e) {
    clearInterval(stepInterval)
    document.getElementById('aiLoading').classList.remove('visible')
    document.getElementById('aiPlaceholder').style.display = 'block'
    alert('حدث خطأ في التحليل، تأكد من الاتصال بالإنترنت')
  }

  btn.disabled = false
  document.getElementById('analyzeBtnText').innerHTML = '✦ تحليل الملف بالذكاء الاصطناعي'
}

function renderIdeas(ideas) {
  const el = document.getElementById('ideasList')
  el.innerHTML = (ideas || []).map(i =>
    \`<div class="ip-item"><div class="ip-bullet green"></div><span>\${i}</span></div>\`
  ).join('')
}
function renderPain(points) {
  const el = document.getElementById('painList')
  el.innerHTML = (points || []).map(p =>
    \`<div class="ip-item"><div class="ip-bullet amber"></div><span>\${p}</span></div>\`
  ).join('')
}

// ========== CONTENT TABS ==========
function switchTab(btn, type) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  state.selectedTab = type
  if(state.contentMap && state.contentMap[type]) {
    document.getElementById('contentText').textContent = state.contentMap[type]
  }
}
function copyContent() {
  const t = document.getElementById('contentText').textContent
  navigator.clipboard.writeText(t).then(() => {
    const btn = document.querySelector('.copy-btn')
    btn.textContent = '✓ تم النسخ'
    setTimeout(() => btn.textContent = 'نسخ', 1500)
  })
}
async function regenContent() {
  if(!state.assocName) { alert('ارفع الملف التعريفي أولاً'); return }
  const typeLabels = {post:'منشور سوشيال', story:'قصة إنسانية', donation:'نداء تبرع'}
  document.getElementById('contentText').textContent = 'جاري التوليد...'
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: \`اكتب \${typeLabels[state.selectedTab]} جديد ومختلف لـ\${state.assocName} بالعربية فقط، بدون تعليق أو شرح.\` }]
      })
    })
    const data = await res.json()
    const text = data.content?.map(i => i.text || '').join('')
    document.getElementById('contentText').textContent = text || 'تعذر التوليد'
    if(state.contentMap) state.contentMap[state.selectedTab] = text
  } catch(e) {
    document.getElementById('contentText').textContent = 'تعذر التوليد'
  }
}

function populateContentPage(parsed) {
  document.getElementById('contentPageBody').innerHTML = \`
    <div class="content-tabs">
      <button class="ctab active" onclick="switchContentPageTab(this,'post')">منشور سوشيال</button>
      <button class="ctab" onclick="switchContentPageTab(this,'story')">قصة إنسانية</button>
      <button class="ctab" onclick="switchContentPageTab(this,'donation')">نداء تبرع</button>
    </div>
    <div class="content-area" id="cpContentDisplay">
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('cpContentText').textContent)">نسخ</button>
      <span id="cpContentText">\${parsed.post || '—'}</span>
    </div>
    <button class="regen-btn" onclick="regenContentPage()">🔄 توليد نص جديد</button>
  \`
}
function switchContentPageTab(btn, type) {
  btn.closest('.content-tabs').querySelectorAll('.ctab').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  state.cpTab = type
  if(state.contentMap && state.contentMap[type]) {
    document.getElementById('cpContentText').textContent = state.contentMap[type]
  }
}
async function regenContentPage() {
  if(!state.assocName) return
  const t = state.cpTab || 'post'
  const labels = {post:'منشور سوشيال', story:'قصة إنسانية', donation:'نداء تبرع'}
  document.getElementById('cpContentText').textContent = 'جاري التوليد...'
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: \`اكتب \${labels[t]} جديد لـ\${state.assocName}\` }]
      })
    })
    const data = await res.json()
    const text = data.content?.map(i => i.text || '').join('')
    document.getElementById('cpContentText').textContent = text || '—'
    if(state.contentMap) state.contentMap[t] = text
  } catch(e) {
    document.getElementById('cpContentText').textContent = 'تعذر التوليد'
  }
}

// ========== SERVICES ==========
function toggleService(card, name) {
  if(card.classList.contains('selected')) {
    card.classList.remove('selected')
    state.selectedServices.delete(name)
  } else {
    card.classList.add('selected')
    state.selectedServices.add(name)
  }
  updateSelectedServices()
}
function updateSelectedServices() {
  const el = document.getElementById('selectedServices')
  const list = document.getElementById('selectedList')
  if(state.selectedServices.size > 0) {
    el.style.display = 'block'
    list.innerHTML = [...state.selectedServices].map(s => \`✓ \${s}\`).join('<br>')
  } else {
    el.style.display = 'none'
  }
}
function requestServices() {
  alert(\`✅ تم إرسال طلبكم!\\nالخدمات المطلوبة:\\n\${[...state.selectedServices].join('\\n')}\\n\\nسيتواصل معكم فريق ساعِد قريباً.\`)
}

// ========== HELPERS ==========
function updateAssocName(name) {
  document.getElementById('sbAssocName').textContent = name
  document.getElementById('sbav').textContent = name.charAt(0)
  document.getElementById('bannerName').textContent = \`أهلاً بـ\${name}\`
  document.getElementById('topAssocName').textContent = name
}


// ========== MANAGEMENT DATA ==========
const empColors = ['#2d7a52','#1e40af','#7c3aed','#b45309','#be185d','#0f766e','#b91c1c']

let employees = [
  {id:1, name:'سارة العمري',    role:'مدير تسويق',         status:'active', color:empColors[0]},
  {id:2, name:'محمد الزهراني', role:'منسق حملات',          status:'active', color:empColors[1]},
  {id:3, name:'نورة الغامدي',  role:'محتوى إبداعي',        status:'away',   color:empColors[2]},
  {id:4, name:'خالد السالم',   role:'تصميم جرافيك',        status:'active', color:empColors[3]},
  {id:5, name:'هيا المطيري',   role:'علاقات متبرعين',      status:'off',    color:empColors[4]},
  {id:6, name:'عبدالله الدوسري',role:'موارد بشرية',         status:'away',   color:empColors[5]},
  {id:7, name:'ريم القحطاني',  role:'محللة بيانات',        status:'active', color:empColors[6]},
]

let tasks = [
  {id:1, title:'إعداد محتوى حملة رمضان القادمة',        status:'doing', urgency:'urgent', assignee:2, deadline:'2025-05-10', category:'حملات',  notes:'حملة ضخمة تشمل X وإنستقرام'},
  {id:2, title:'مراجعة تقرير التبرعات الشهري',          status:'todo',  urgency:'high',   assignee:7, deadline:'2025-05-08', category:'تبرعات', notes:''},
  {id:3, title:'تحديث ملف الجمعية التعريفي بالـ AI',    status:'done',  urgency:'normal', assignee:1, deadline:'2025-05-05', category:'إدارة',  notes:'تم مراجعته وتحديثه'},
  {id:4, title:'التواصل مع المؤثرين الجدد',              status:'doing', urgency:'normal', assignee:2, deadline:'2025-05-15', category:'شراكات', notes:'3 مؤثرين مرشحين'},
  {id:5, title:'تصميم بوستر يوم التطوع الوطني',         status:'todo',  urgency:'low',    assignee:4, deadline:'2025-05-20', category:'تصميم',  notes:''},
  {id:6, title:'مراجعة اتفاقية الشراكة مع جمعية الأمل', status:'todo',  urgency:'urgent', assignee:6, deadline:'2025-05-07', category:'إدارة',  notes:'تحتاج توقيع قبل نهاية الأسبوع'},
  {id:7, title:'تحليل أداء منصة X هذا الشهر',          status:'done',  urgency:'normal', assignee:7, deadline:'2025-05-04', category:'محتوى',  notes:''},
  {id:8, title:'إعداد خطة المحتوى لشهر مايو',          status:'doing', urgency:'high',   assignee:1, deadline:'2025-05-09', category:'محتوى',  notes:''},
  {id:9, title:'تصوير ميداني للمشروع الجديد',           status:'todo',  urgency:'normal', assignee:3, deadline:'2025-05-18', category:'محتوى',  notes:'موقع: الرياض - حي السلام'},
  {id:10,title:'إطلاق صفحة التبرع الجديدة',             status:'todo',  urgency:'high',   assignee:5, deadline:'2025-05-12', category:'تبرعات', notes:''},
]

const donations = [
  {name:'عبدالرحمن الشمري',      amount:5000,  channel:'تحويل بنكي',   date:'7 مايو 2025',  status:'completed'},
  {name:'متبرع مجهول',           amount:1000,  channel:'موقع إلكتروني',date:'6 مايو 2025',  status:'completed'},
  {name:'شركة النماء للتجارة',   amount:15000, channel:'شيك',          date:'5 مايو 2025',  status:'completed'},
  {name:'فاطمة العنزي',          amount:500,   channel:'تطبيق',        date:'5 مايو 2025',  status:'completed'},
  {name:'أحمد بن سعد',           amount:2500,  channel:'تحويل بنكي',   date:'4 مايو 2025',  status:'pending'},
  {name:'مؤسسة الأمل الخيرية',   amount:20000, channel:'شيك',          date:'3 مايو 2025',  status:'pending'},
  {name:'سلطان المالكي',          amount:750,   channel:'تطبيق',        date:'3 مايو 2025',  status:'completed'},
  {name:'نهى الجبر',              amount:250,   channel:'موقع إلكتروني',date:'2 مايو 2025',  status:'completed'},
  {name:'عمر الحمدان',            amount:3000,  channel:'تحويل بنكي',   date:'1 مايو 2025',  status:'completed'},
]

let taskFilter = 'all'
let editingTaskId = null
let nextTaskId = 11

// ---- EMPLOYEES ----
function renderEmployees() {
  const el = document.getElementById('employeesList')
  if(!el) return
  el.innerHTML = employees.map(e => {
    const labels = {active:'نشط',away:'بعيد',off:'خارج'}
    const initials = e.name.split(' ').map(n=>n[0]).slice(0,2).join('')
    return \`<div class="emp-row">
      <div class="emp-av" style="background:\${e.color}">\${initials}</div>
      <div style="flex:1">
        <div class="emp-name">\${e.name}</div>
        <div class="emp-role">\${e.role}</div>
      </div>
      <span class="emp-badge \${e.status}">\${labels[e.status]}</span>
      <div class="emp-actions">
        <button class="emp-act-btn emp-act-edit" onclick="openEditEmployee(\${e.id})">تعديل</button>
        <button class="emp-act-btn emp-act-del" onclick="deleteEmployee(\${e.id})">حذف</button>
      </div>
    </div>\`
  }).join('')
  const sub = document.getElementById('emp-sub-count')
  const kpi = document.getElementById('kpi-emp')
  const badge = document.getElementById('active-emp-badge')
  if(sub) sub.textContent = employees.length + ' موظف'
  if(kpi) kpi.textContent = employees.length
  const activeCount = employees.filter(e=>e.status==='active').length
  if(badge) badge.textContent = activeCount + ' نشطين'
  populateAssigneeSelects()
}

function filterByEmployee(id) {
  const sel = document.getElementById('assigneeFilter')
  if(sel) { sel.value = id; renderBoard() }
}

function populateAssigneeSelects() {
  const opts = employees.map(e => \`<option value="\${e.id}">\${e.name}</option>\`).join('')
  const filterSel = document.getElementById('assigneeFilter')
  const modalSel  = document.getElementById('modalAssignee')
  if(filterSel) filterSel.innerHTML = '<option value="all">كل الموظفين</option>' + opts
  if(modalSel)  modalSel.innerHTML  = '<option value="">غير محدد</option>' + opts
}

// ---- TASK BOARD ----
function setTaskFilter(f, btn) {
  taskFilter = f
  document.querySelectorAll('.task-filter-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  renderBoard()
}

function getFilteredTasks() {
  const assigneeF = document.getElementById('assigneeFilter')?.value || 'all'
  const today = new Date().toISOString().slice(0,10)
  return tasks.filter(t => {
    if(taskFilter === 'urgent' && t.urgency !== 'urgent') return false
    if(taskFilter === 'overdue' && (t.status === 'done' || t.deadline >= today)) return false
    if(taskFilter === 'mine' && String(t.assignee) !== '1') return false
    if(assigneeF !== 'all' && String(t.assignee) !== String(assigneeF)) return false
    return true
  })
}

function renderBoard() {
  const filtered = getFilteredTasks()
  const cols = {todo:[], doing:[], done:[]}
  filtered.forEach(t => { if(cols[t.status]) cols[t.status].push(t) })
  const today = new Date().toISOString().slice(0,10)
  const urgencyLabels = {urgent:'عاجلة',high:'مرتفعة',normal:'عادية',low:'منخفضة'}

  ;['todo','doing','done'].forEach(col => {
    const el = document.getElementById(\`col-\${col}\`)
    const countEl = document.getElementById(\`col-count-\${col}\`)
    if(!el) return
    countEl.textContent = cols[col].length
    el.innerHTML = cols[col].map(t => {
      const emp = employees.find(e => e.id === t.assignee)
      const initials = emp ? emp.name.split(' ').map(n=>n[0]).slice(0,2).join('') : '؟'
      const empColor = emp ? emp.color : '#94a3b8'
      const isOverdue = t.status !== 'done' && t.deadline && t.deadline < today
      const deadlineText = t.deadline ? formatDeadline(t.deadline) : ''
      return \`<div class="task-card" onclick="openTaskModal(\${t.id})">
        <div class="task-card-title">\${t.title}</div>
        <div class="task-card-meta">
          <span class="task-urgency \${t.urgency}">\${urgencyLabels[t.urgency]}</span>
          \${t.category ? \`<span class="task-card-category">\${t.category}</span>\` : ''}
          \${deadlineText ? \`<span class="task-deadline \${isOverdue?'overdue':''}">\${isOverdue?'⏰':'📅'} \${deadlineText}</span>\` : ''}
          <div class="task-assignee" style="background:\${empColor}" title="\${emp?emp.name:'غير محدد'}">\${initials}</div>
        </div>
      </div>\`
    }).join('') || \`<div style="padding:20px;text-align:center;color:var(--th);font-size:.78rem">لا توجد مهام</div>\`
  })

  // Update KPI
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const urgentCount = activeTasks.filter(t => t.urgency === 'urgent').length
  document.getElementById('kpi-tasks-count').textContent = tasks.filter(t=>t.status==='doing').length
  document.getElementById('kpi-urgent-sub').textContent = urgentCount > 0 ? \`⚡ \${urgentCount} عاجلة\` : '✓ لا توجد عاجلة'
  const sbBadge = document.getElementById('sb-urgent-count')
  if(sbBadge) { sbBadge.textContent = urgentCount; sbBadge.style.display = urgentCount > 0 ? '' : 'none' }
}

function formatDeadline(d) {
  const date = new Date(d)
  const today = new Date()
  const diff = Math.round((date - today) / 86400000)
  if(diff < 0) return \`تأخر \${Math.abs(diff)} يوم\`
  if(diff === 0) return 'اليوم'
  if(diff === 1) return 'غداً'
  if(diff <= 7) return \`\${diff} أيام\`
  return date.toLocaleDateString('ar-SA',{month:'short',day:'numeric'})
}

// ---- TASK MODAL ----
function openTaskModal(id) {
  editingTaskId = id
  const overlay = document.getElementById('taskModalOverlay')
  const t = id ? tasks.find(x=>x.id===id) : null
  populateAssigneeSelects()
  document.getElementById('modalTitle').value    = t ? t.title    : ''
  document.getElementById('modalStatus').value   = t ? t.status   : 'todo'
  document.getElementById('modalUrgency').value  = t ? t.urgency  : 'normal'
  document.getElementById('modalAssignee').value = t ? (t.assignee || '') : ''
  document.getElementById('modalDeadline').value = t ? (t.deadline || '') : ''
  document.getElementById('modalCategory').value = t ? (t.category || 'محتوى') : 'محتوى'
  document.getElementById('modalNotes').value    = t ? (t.notes   || '') : ''
  document.getElementById('modalDeleteBtn').style.display = id ? 'block' : 'none'
  updateModalStatusBadge()
  overlay.classList.remove('hidden')
}

function updateModalStatusBadge() {
  const s = document.getElementById('modalStatus').value
  const badge = document.getElementById('modalStatusBadge')
  const labels = {todo:'لم تبدأ', doing:'قيد التنفيذ', done:'مكتملة'}
  badge.textContent = labels[s]
  badge.className = \`modal-status-badge \${s}\`
}

function saveTask() {
  const title = document.getElementById('modalTitle').value.trim()
  if(!title) { document.getElementById('modalTitle').focus(); return }
  const data = {
    title,
    status:    document.getElementById('modalStatus').value,
    urgency:   document.getElementById('modalUrgency').value,
    assignee:  parseInt(document.getElementById('modalAssignee').value) || null,
    deadline:  document.getElementById('modalDeadline').value,
    category:  document.getElementById('modalCategory').value,
    notes:     document.getElementById('modalNotes').value,
  }
  if(editingTaskId) {
    const idx = tasks.findIndex(t=>t.id===editingTaskId)
    if(idx !== -1) tasks[idx] = {...tasks[idx], ...data}
  } else {
    tasks.unshift({id: nextTaskId++, ...data})
  }
  closeTaskModal()
  renderBoard()
}

function deleteCurrentTask() {
  if(!editingTaskId) return
  if(confirm('حذف هذه المهمة؟')) {
    tasks = tasks.filter(t => t.id !== editingTaskId)
    closeTaskModal()
    renderBoard()
  }
}

function closeTaskModal() {
  document.getElementById('taskModalOverlay').classList.add('hidden')
}
function closeTaskModalIfOutside(e) {
  if(e.target === document.getElementById('taskModalOverlay')) closeTaskModal()
}

// ---- EMPLOYEE MODAL ----
function openAddEmployee() {
  editingEmpId = null
  document.getElementById('empNameInput').value = ''
  document.getElementById('empRoleInput').value = ''
  document.getElementById('empStatusInput').value = 'active'
  const badge = document.querySelector('#empModalOverlay .modal-status-badge')
  if(badge) badge.textContent = 'موظف جديد'
  document.getElementById('empModalOverlay').classList.remove('hidden')
}
function closeEmpModal() {
  document.getElementById('empModalOverlay').classList.add('hidden')
}
function closeEmpModalIfOutside(e) {
  if(e.target === document.getElementById('empModalOverlay')) closeEmpModal()
}
function saveEmployee() {
  const name = document.getElementById('empNameInput').value.trim()
  const role = document.getElementById('empRoleInput').value.trim()
  if(!name || !role) return
  const status = document.getElementById('empStatusInput').value
  if(editingEmpId) {
    const idx = employees.findIndex(e=>e.id===editingEmpId)
    if(idx>-1) employees[idx] = {...employees[idx], name, role, status}
    editingEmpId = null
  } else {
    const newId = employees.length > 0 ? Math.max(...employees.map(e=>e.id)) + 1 : 1
    employees.unshift({id:newId, name, role, status, color: empColors[newId % empColors.length]})
  }
  document.querySelector('#empModalOverlay .modal-status-badge').textContent = 'موظف جديد'
  closeEmpModal()
  renderEmployees()
  renderBoard()
}

let editingEmpId = null
function openEditEmployee(id) {
  const emp = employees.find(e=>e.id===id)
  if(!emp) return
  editingEmpId = id
  document.getElementById('empNameInput').value  = emp.name
  document.getElementById('empRoleInput').value  = emp.role
  document.getElementById('empStatusInput').value= emp.status
  const badge = document.querySelector('#empModalOverlay .modal-status-badge')
  if(badge) badge.textContent = 'تعديل بيانات'
  document.getElementById('empModalOverlay').classList.remove('hidden')
}

function deleteEmployee(id) {
  const emp = employees.find(e=>e.id===id)
  if(!emp) return
  if(!confirm('حذف ' + emp.name + ' من الفريق؟')) return
  employees = employees.filter(e=>e.id!==id)
  tasks.forEach(t=>{ if(t.assignee===id) t.assignee=null })
  renderEmployees()
  renderBoard()
}

// ---- DONATIONS ----
function renderDonations() {
  const el = document.getElementById('donationsTable')
  if(!el) return
  const filter  = document.getElementById('donFilter')?.value || 'all'
  const period  = document.getElementById('donPeriodFilter')?.value || 'all'
  const now = new Date()
  let list = donations

  // Period filter
  list = list.filter(d => {
    if(period === 'all') return true
    // parse date — format "7 مايو 2025"
    const arabicMonths = {يناير:0,فبراير:1,مارس:2,أبريل:3,مايو:4,يونيو:5,يوليو:6,أغسطس:7,سبتمبر:8,أكتوبر:9,نوفمبر:10,ديسمبر:11}
    const parts = d.date.split(' ')
    const dd = parseInt(parts[0])
    const mm = arabicMonths[parts[1]]
    const yy = parseInt(parts[2])
    const dDate = new Date(yy, mm, dd)
    if(period === 'week') {
      const weekAgo = new Date(now - 7*86400000)
      return dDate >= weekAgo
    }
    if(period === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth()-1, now.getDate())
      return dDate >= monthAgo
    }
    if(period.startsWith('month-')) {
      const m = parseInt(period.split('-')[1]) - 1
      return dDate.getMonth() === m
    }
    return true
  })

  // Type filter
  if(filter === 'large')     list = list.filter(d => d.amount >= 2500)
  if(filter === 'pending')   list = list.filter(d => d.status === 'pending')
  if(filter === 'completed') list = list.filter(d => d.status === 'completed')

  const icons = {'تحويل بنكي':'🏦','موقع إلكتروني':'🌐','تطبيق':'📱','شيك':'📄'}
  const total = list.reduce((s,d)=>s+d.amount, 0)
  const sub = document.getElementById('don-sub-count')
  if(sub) sub.textContent = list.length + ' تبرع — ' + total.toLocaleString() + ' ر.س'

  el.innerHTML = list.length ? list.map(d => \`<tr class="don-row">
    <td class="don-td" style="font-weight:600;color:var(--td)">\${d.name}</td>
    <td class="don-td" style="font-weight:700;color:var(--g2)">\${d.amount.toLocaleString()} ر.س</td>
    <td class="don-td"><span class="don-channel-icon">\${icons[d.channel]||'💳'}</span>\${d.channel}</td>
    <td class="don-td">\${d.date}</td>
    <td class="don-td"><span class="don-status \${d.status}">\${d.status==='completed'?'مكتمل':'معلق'}</span></td>
  </tr>\`).join('') :
  \`<tr><td colspan="5" style="padding:28px;text-align:center;color:var(--th);font-size:.85rem">لا توجد تبرعات في هذه الفترة</td></tr>\`
}

// ---- INIT ----
setTimeout(() => {
  // load user from session
  try {
    const u = JSON.parse(sessionStorage.getItem('saaid_user') || '{}')
    if(u.name) {
      const el = document.getElementById('sbAssocName')
      const av = document.getElementById('sbav')
      const top = document.getElementById('topAssocName')
      if(el) el.textContent = u.name
      if(av) av.textContent = u.av || u.name.charAt(0)
      if(top) top.textContent = u.name
    }
  } catch(e) {}
  populateAssigneeSelects()
  renderEmployees()
  renderBoard()
  renderDonations()
  refreshOverviewMgmt()
  if(window.__saaidGuard) window.__saaidGuard.loadUser()
}, 80)
`;

function Association() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
    if (!SCRIPT.trim() || !ref.current) return;
    const s = document.createElement("script");
    s.text = SCRIPT;
    ref.current.appendChild(s);
    return () => { try { ref.current?.removeChild(s); } catch {} };
  }, []);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}
