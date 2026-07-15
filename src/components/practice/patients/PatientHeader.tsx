// Sticky patient header — used by every /patients/$pid/* sub-route.
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarPlus, MessageSquare, MoreVertical, Share2, LogOut, Download } from "lucide-react";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { useLivePatient, dischargePatient, updatePatient, RISK_META, STATUS_META, avatarUrl, type RiskLevel, type PatientStatus } from "@/lib/patients-store";
import { RiskBadge, StatusBadge, Button } from "./primitives";

const TABS: Array<{ key: string; label: string; path: (id: string) => string; match: (p: string, id: string) => boolean }> = [
  { key: "overview", label: "Overview", path: (id) => `/patients/${id}`, match: (p, id) => p === `/patients/${id}` },
  { key: "chart", label: "Chart", path: (id) => `/patients/${id}/chart`, match: (p, id) => p.startsWith(`/patients/${id}/chart`) },
  { key: "notes", label: "Notes", path: (id) => `/patients/${id}/notes`, match: (p, id) => p.startsWith(`/patients/${id}/notes`) },
  { key: "assessments", label: "Assessments", path: (id) => `/patients/${id}/assessments`, match: (p, id) => p.startsWith(`/patients/${id}/assessments`) },
  { key: "timeline", label: "Timeline", path: (id) => `/patients/${id}/timeline`, match: (p, id) => p.startsWith(`/patients/${id}/timeline`) },
  { key: "billing", label: "Billing", path: (id) => `/patients/${id}/billing`, match: (p, id) => p.startsWith(`/patients/${id}/billing`) },
  { key: "documents", label: "Documents", path: (id) => `/patients/${id}/documents`, match: (p, id) => p.startsWith(`/patients/${id}/documents`) },
];

export function PatientHeader({ id }: { id: string }) {
  const patient = useLivePatient(id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8">
        <p style={{ color: palette.muted }}>Patient not found.</p>
        <Link to="/patients" className="text-[12px] underline mt-2 inline-block" style={{ color: palette.primary }}>Back to patients</Link>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-20" style={{ background: palette.surface2, borderBottom: `1px solid ${palette.border}` }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-5 pb-0">
        <Link to="/patients" className="inline-flex items-center gap-1 text-[11.5px] hover:underline" style={{ color: palette.muted }}>
          <ArrowLeft className="w-3.5 h-3.5" /> All patients
        </Link>
        <div className="flex items-start justify-between gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <img src={avatarUrl(patient.id)} alt="" className="w-14 h-14 rounded-full" style={{ border: `1px solid ${palette.border}` }} />
            <div className="min-w-0">
              <h1 className="text-[clamp(1.4rem,2.2vw,1.8rem)] leading-tight tracking-tight truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
                {patient.preferredName ?? patient.fullName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-[11.5px]" style={{ color: palette.muted }}>
                <span>{patient.pronouns} · {patient.age}</span>
                <span>·</span>
                <span className="truncate">{patient.college}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="relative">
                  <button onClick={() => { setStatusOpen(!statusOpen); setRiskOpen(false); setMenuOpen(false); }} aria-label="Change status">
                    <StatusBadge status={patient.status} />
                  </button>
                  {statusOpen && (
                    <div className="absolute z-30 mt-1 rounded-xl overflow-hidden pc-fade-in" style={{ background: palette.surface, border: `1px solid ${palette.border}`, minWidth: 160 }}>
                      {(Object.keys(STATUS_META) as PatientStatus[]).map((s) => (
                        <button key={s} onClick={() => { updatePatient(patient.id, { status: s }); setStatusOpen(false); }}
                          className="block w-full text-left px-3 py-2 text-[12px] hover:bg-[color:var(--pc-surface2,#F6F1F2)]"
                          style={{ color: palette.ink }}>
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onClick={() => { setRiskOpen(!riskOpen); setStatusOpen(false); setMenuOpen(false); }} aria-label="Change risk level">
                    <RiskBadge level={patient.risk} />
                  </button>
                  {riskOpen && (
                    <div className="absolute z-30 mt-1 rounded-xl overflow-hidden pc-fade-in" style={{ background: palette.surface, border: `1px solid ${palette.border}`, minWidth: 160 }}>
                      {(Object.keys(RISK_META) as RiskLevel[]).map((r) => (
                        <button key={r} onClick={() => { updatePatient(patient.id, { risk: r }); setRiskOpen(false); }}
                          className="block w-full text-left px-3 py-2 text-[12px] hover:bg-[color:var(--pc-surface2,#F6F1F2)]"
                          style={{ color: palette.ink }}>
                          {RISK_META[r].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={() => alert("Sessions module arrives next.")}>
              <CalendarPlus className="w-4 h-4" /> Schedule session
            </Button>
            <Button variant="outline" onClick={() => alert("Messaging module coming soon.")}>
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
            <div className="relative">
              <button aria-label="More actions" onClick={() => { setMenuOpen(!menuOpen); setRiskOpen(false); setStatusOpen(false); }}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors duration-150"
                style={{ border: `1px solid ${palette.border}`, background: palette.surface, color: palette.ink }}>
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 z-30 rounded-xl overflow-hidden pc-fade-in" style={{ background: palette.surface, border: `1px solid ${palette.border}`, minWidth: 220 }}>
                  <MenuItem onClick={() => { alert("Chart export coming soon."); setMenuOpen(false); }} icon={<Download className="w-3.5 h-3.5" />}>Export chart</MenuItem>
                  {patient.consentSharing && <MenuItem onClick={() => { alert("Shared with college counsellor."); setMenuOpen(false); }} icon={<Share2 className="w-3.5 h-3.5" />}>Share with counsellor</MenuItem>}
                  <MenuItem danger onClick={() => {
                    if (confirm(`Discharge ${patient.fullName}? They will move to the discharged list.`)) {
                      dischargePatient(patient.id, "Manually discharged from patient chart");
                      navigate({ to: "/patients" });
                    }
                    setMenuOpen(false);
                  }} icon={<LogOut className="w-3.5 h-3.5" />}>Discharge patient</MenuItem>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs — segmented control */}
        <nav className="mt-5 -mb-px flex gap-1 overflow-x-auto scrollbar-none" aria-label="Patient sections">
          {TABS.map((t) => {
            const active = t.match(pathname, id);
            return (
              <Link
                key={t.key}
                to={t.path(id)}
                params={{ pid: id }}
                className="px-4 py-2.5 text-[12.5px] rounded-t-xl transition-colors duration-150 whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none"
                style={active
                  ? { background: palette.surface, color: palette.ink, borderTop: `1px solid ${palette.border}`, borderLeft: `1px solid ${palette.border}`, borderRight: `1px solid ${palette.border}`, borderBottom: `1px solid ${palette.surface}`, fontWeight: 500 }
                  : { color: palette.muted, borderBottom: `1px solid ${palette.border}` }}
              >
                {t.label}
              </Link>
            );
          })}
          <span className="flex-1" style={{ borderBottom: `1px solid ${palette.border}` }} />
        </nav>
      </div>
    </div>
  );
}

function MenuItem({ children, icon, onClick, danger }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-[color:var(--pc-surface2,#F6F1F2)] transition-colors duration-150"
      style={{ color: danger ? "var(--pc-risk-crisis)" : palette.ink }}>
      {icon}{children}
    </button>
  );
}
