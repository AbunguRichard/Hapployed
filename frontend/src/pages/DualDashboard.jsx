import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BellRing,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  DollarSign,
  Flame,
  MapPin,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users2,
} from "lucide-react";

// --- Types (using JSDoc) ---
/**
 * @typedef {Object} Gig
 * @property {string} id
 * @property {string} title
 * @property {number} distanceMi
 * @property {number} payUSD
 * @property {number} durationHrs
 * @property {number} [startInHrs]
 * @property {boolean} [trending]
 * @property {string} category
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} client
 * @property {number} budgetUSD
 * @property {number} spentUSD
 * @property {"On Track" | "At Risk" | "Delayed"} health
 * @property {number} progressPct
 * @property {string} nextMilestone
 */

// --- Mock Data ---
const mockGigs = [
  {
    id: "g1",
    title: "Office Furniture Assembly",
    distanceMi: 0.8,
    payUSD: 180,
    durationHrs: 3,
    startInHrs: 4,
    category: "Handyman",
  },
  {
    id: "g2",
    title: "EV Charger Install (Helper)",
    distanceMi: 2.1,
    payUSD: 320,
    durationHrs: 5,
    trending: true,
    category: "Electrical",
  },
  {
    id: "g3",
    title: "Data Entry – Inventory Sheet",
    distanceMi: 5.4,
    payUSD: 250,
    durationHrs: 8,
    startInHrs: 24,
    category: "Admin",
  },
  {
    id: "g4",
    title: "Evening Delivery Driver",
    distanceMi: 1.2,
    payUSD: 95,
    durationHrs: 2,
    category: "Delivery",
  },
];

const forecastedGigs = [
  {
    id: "f1",
    title: "[Starts in 4h] Office Furniture Assembly",
    distanceMi: 0.9,
    payUSD: 200,
    durationHrs: 3,
    startInHrs: 4,
    category: "Handyman",
  },
  {
    id: "f2",
    title: "[Trending] EV Charger Installations",
    distanceMi: 3.2,
    payUSD: 400,
    durationHrs: 5,
    trending: true,
    category: "Electrical",
  },
  {
    id: "f3",
    title: "[Your Skill Match] Data Entry Project (3 days)",
    distanceMi: 6.1,
    payUSD: 600,
    durationHrs: 24,
    startInHrs: 24,
    category: "Admin",
  },
];

const mockProjects = [
  {
    id: "p1",
    title: "Website Redesign",
    client: "Acme Co.",
    budgetUSD: 18000,
    spentUSD: 8200,
    health: "On Track",
    progressPct: 62,
    nextMilestone: "Client feedback on wireframes (Thu)",
  },
  {
    id: "p2",
    title: "Mobile App QA Sprint",
    client: "BrightApps",
    budgetUSD: 12500,
    spentUSD: 9800,
    health: "At Risk",
    progressPct: 48,
    nextMilestone: "Stabilize flaky tests (Fri)",
  },
  {
    id: "p3",
    title: "Corp Data Migration",
    client: "BlueStone Ltd.",
    budgetUSD: 42000,
    spentUSD: 17000,
    health: "On Track",
    progressPct: 35,
    nextMilestone: "Schema mapping sign-off (Mon)",
  },
  {
    id: "p4",
    title: "Analytics Dashboard",
    client: "Finlytics",
    budgetUSD: 28500,
    spentUSD: 22000,
    health: "Delayed",
    progressPct: 41,
    nextMilestone: "Unblock data access (Today)",
  },
];

// Earnings Score helper for gigs
function computeEarningsScore(g) {
  const rate = g.payUSD / g.durationHrs; // $/hr
  const proximityScore = Math.max(0, 10 - g.distanceMi) * 10; // closer is better
  const payScore = Math.min(10, rate / 10) * 10; // normalize
  const trendBonus = g.trending ? 15 : 0;
  return Math.round(proximityScore * 0.4 + payScore * 0.5 + trendBonus);
}

// Heat/Pulse mock zones
function HeatZone({ x, y, size, color, pulse = false }) {
  return (
    <div
      className={"absolute rounded-full opacity-70 " + (pulse ? "animate-ping-slow" : "")}
      style={{ left: x, top: y, width: size, height: size, background: color }}
    />
  );
}

// --- Styles ---
const styles = `
  @keyframes ping-slow { 0% { transform: scale(0.9); opacity: .7 } 70% { transform: scale(1.2); opacity: 0.2 } 100% { transform: scale(1.25); opacity: 0 } }
  .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
`;

// --- UI Helpers ---
function KPI({ label, value, icon: Icon }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-muted"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold leading-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthBadge({ status }) {
  const colorDot = {
    "On Track": "bg-emerald-500",
    "At Risk": "bg-amber-500",
    Delayed: "bg-red-500",
  };
  const pill = {
    "On Track": "bg-emerald-100 text-emerald-700",
    "At Risk": "bg-amber-100 text-amber-700",
    Delayed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded ${pill[status]}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${colorDot[status]}`} />
      {status}
    </span>
  );
}

// --- Gig Mode ---
function GigMode() {
  const [view, setView] = useState("live");
  const [segment, setSegment] = useState("match");

  const sortedGigs = useMemo(() => {
    const list = [...mockGigs];
    if (segment === "match") return list.sort((a, b) => computeEarningsScore(b) - computeEarningsScore(a));
    if (segment === "pay") return list.sort((a, b) => b.payUSD - a.payUSD);
    return list.sort((a, b) => a.durationHrs - b.durationHrs);
  }, [segment]);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Map Panel */}
      <Card className="lg:col-span-2 overflow-hidden">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Hyper‑Local Opportunity Engine
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <span className={`font-medium ${view === "live" ? "" : "text-muted-foreground"}`}>Live Heat</span>
            <Switch checked={view === "predictive"} onCheckedChange={(c) => setView(c ? "predictive" : "live")} />
            <span className={`font-medium ${view === "predictive" ? "" : "text-muted-foreground"}`}>Predictive Pulse</span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Mock */}
          <div className="relative h-[360px] w-full rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden">
            <style>{styles}</style>
            {/* grid/backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_40%)]" />
            {/* Live Heat Zones */}
            {view === "live" && (
              <>
                <HeatZone x={80} y={60} size={160} color="rgba(255,80,0,0.35)" />
                <HeatZone x={220} y={180} size={210} color="rgba(255,140,0,0.35)" />
                <HeatZone x={420} y={120} size={150} color="rgba(255,200,0,0.35)" />
                <div className="absolute bottom-3 left-3 text-xs bg-white/80 rounded px-2 py-1 shadow">15 gigs in 1‑mile radius</div>
              </>
            )}
            {/* Predictive Pulse Zones */}
            {view === "predictive" && (
              <>
                <HeatZone x={120} y={80} size={180} color="rgba(59,130,246,0.25)" pulse />
                <HeatZone x={360} y={200} size={240} color="rgba(59,130,246,0.25)" pulse />
                <HeatZone x={260} y={40} size={140} color="rgba(59,130,246,0.25)" pulse />
                <div className="absolute bottom-3 left-3 text-xs bg-white/80 rounded px-2 py-1 shadow flex items-center gap-1"><Radar className="h-3 w-3" /> spikes expected in 2‑6h</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel: Radar + Forecasted */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" /> Gig Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={segment} onValueChange={(v) => setSegment(v)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="match">Best Match</TabsTrigger>
                <TabsTrigger value="pay">Highest Pay</TabsTrigger>
                <TabsTrigger value="quick">Quickest</TabsTrigger>
              </TabsList>
              <TabsContent value="match" className="mt-4" />
              <TabsContent value="pay" className="mt-4" />
              <TabsContent value="quick" className="mt-4" />
            </Tabs>

            <div className="mt-3 flex flex-col gap-3">
              {sortedGigs.map((g) => (
                <Card key={g.id} className="shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {g.trending && <Badge variant="secondary" className="text-[10px]">Trending</Badge>}
                        {g.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {g.distanceMi.toFixed(1)} mi • <Clock3 className="h-3 w-3" /> {g.durationHrs}h • <DollarSign className="h-3 w-3" /> ${g.payUSD}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-900">Score {computeEarningsScore(g)}</Badge>
                      <Button size="sm">View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Forecasted Gigs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {forecastedGigs.map((f) => (
              <div key={f.id} className="flex items-start justify-between rounded-xl border p-3">
                <div>
                  <div className="font-medium">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {f.distanceMi.toFixed(1)} mi • <Clock3 className="h-3 w-3" /> {f.durationHrs}h • <DollarSign className="h-3 w-3" /> ${f.payUSD}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary">Notify me</Button>
                  <Button size="sm" variant="ghost" className="gap-1">Details <ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Project Mode ---
function ProjectMode() {
  const active = mockProjects.length;
  const overdue = mockProjects.filter((p) => p.health !== "On Track").length;
  const pipelineUSD = 18500; // demo

  return (
    <div className="grid xl:grid-cols-3 gap-4">
      {/* Overview */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Project Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border overflow-hidden">
              <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
                <div className="p-4"><KPI label="Active Projects" value={String(active)} icon={Users2} /></div>
                <div className="p-4"><KPI label="At Risk / Overdue" value={String(overdue)} icon={BellRing} /></div>
                <div className="p-4"><KPI label="Total Pipeline" value={`$${(pipelineUSD / 1000).toFixed(1)}k`} icon={TrendingUp} /></div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border p-3 bg-muted/30">
              <div className="text-sm font-medium flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Alerts</div>
              <div className="mt-2 grid gap-2">
                <div className="rounded-lg border p-3 bg-white/60">
                  <div className="text-sm">"Website Redesign" is waiting on client feedback.</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="gap-1"><BellRing className="h-4 w-4" /> Send Nudge</Button>
                    <Button size="sm" variant="secondary">Snooze</Button>
                  </div>
                </div>
                <div className="rounded-lg border p-3 bg-white/60">
                  <div className="text-sm">Budget for "Mobile App QA" is being consumed 20% faster than planned.</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="gap-1"><TrendingUp className="h-4 w-4" /> Open Budget</Button>
                    <Button size="sm" variant="secondary">Create Alert</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {mockProjects.map((p) => (
              <div key={p.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">{p.title} <HealthBadge status={p.health} /></div>
                    <div className="text-xs text-muted-foreground mt-1">Client: {p.client}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="font-medium">${p.budgetUSD.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={p.progressPct} />
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">Progress {p.progressPct}% • Next: {p.nextMilestone}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Spent ${p.spentUSD.toLocaleString()}</div>
                  <Button variant="secondary" size="sm" className="gap-1">Open <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Predictive Resource Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">AI Recruitment Predictor</div>
              <p className="text-sm text-muted-foreground mt-1">Based on the next phase, you'll likely need a <span className="font-medium text-foreground">UX Designer</span> in 2 weeks.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="gap-1"><UserPlus className="h-4 w-4" /> Search Talent</Button>
                <Button size="sm" variant="secondary">Post to Gig Network</Button>
              </div>
            </div>
            

            <Separator className="my-4" />

            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">Skill Gap Analysis</div>
              <p className="text-sm text-muted-foreground mt-1">To win more projects like <em>Corp Data Migration</em>, consider adding <span className="font-medium">Google Cloud Platform</span> to your team's skillset.</p>
              <Button size="sm" variant="ghost" className="mt-2">View Courses <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Financials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">This Month's Forecast</div>
                <div className="text-lg font-semibold">$12,400 <span className="text-xs text-muted-foreground">/ $15,000</span></div>
                <div className="text-xs text-muted-foreground">83% of goal</div>
              </div>
              <div className="rounded-xl border p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground">Profit Margin</div>
                <div className="text-lg font-semibold">34% <span className="text-xs text-emerald-600">▲ 2% MoM</span></div>
              </div>
              <div className="rounded-xl border p-3 bg-muted/30 col-span-2">
                <div className="text-xs text-muted-foreground">Upcoming Milestone Payments</div>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 rounded-full bg-emerald-500 text-white items-center justify-center text-[10px]">✓</span> Website Redesign – $4,000 (Due Thu)</li>
                  <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 rounded-full bg-amber-500 text-white items-center justify-center text-[10px]">…</span> Analytics Dashboard – $6,500 (Pending)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Unified AI Brain prompts ---
function CrossModeInsights() {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4" /> Unified AI Insights</div>
        <div className="rounded-xl border p-3 text-sm bg-muted/30">
          <div className="font-medium">Skill Synergy</div>
          <p className="text-muted-foreground">Your strong performance in <span className="font-medium">Data Analysis</span> gigs suggests readiness for larger <span className="font-medium">Business Intelligence</span> projects. Explore opportunities in Project Mode.</p>
          <Button variant="link" className="px-0">Open Project Mode <ArrowRight className="h-4 w-4" /></Button>
        </div>
        <div className="rounded-xl border p-3 text-sm bg-muted/30">
          <div className="font-medium">Squad Building</div>
          <p className="text-muted-foreground">Need an electrician for your upcoming build? Here are top‑rated, vetted pros from Gig Mode with excellent trust scores.</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm">View Recommendations</Button>
            <Button size="sm" variant="secondary">Post Requirement</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Root Component ---
export default function DualDashboard() {
  const [mode, setMode] = useState("gig");

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-slate-900 text-white grid place-items-center font-semibold">H</div>
            <div className="font-semibold">Hapployed OS</div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Input placeholder="Search gigs, projects, clients…" className="w-[320px]" />
            <Button variant="secondary">Search</Button>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1"><DollarSign className="h-3 w-3" /> Earnings</Badge>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Card>
          <CardContent className="p-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-slate-900">Dual Dashboard</Badge>
              <span className="text-muted-foreground">Switch between specialized environments</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={mode === "gig" ? "default" : "secondary"} onClick={() => setMode("gig")} className="rounded-full">Gig Mode</Button>
              <Button variant={mode === "project" ? "default" : "secondary"} onClick={() => setMode("project")} className="rounded-full">Project Mode</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 mt-4 pb-10 space-y-4">
        {mode === "gig" ? <GigMode /> : <ProjectMode />}
        <CrossModeInsights />
      </div>

      {/* Footer */}
      <div className="border-t py-8 mt-6">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-medium">About</div>
            <p className="text-muted-foreground mt-1">An AI‑powered operating system for modern independent work — built for speed, foresight, and trust.</p>
          </div>
          <div>
            <div className="font-medium">Trust Layer</div>
            <ul className="text-muted-foreground mt-1 space-y-1 list-disc pl-4">
              <li>Verified Identity & Licensing</li>
              <li>Insurance & Safety Checks</li>
              <li>Crowdsourced Reputation Graph</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Coming Soon</div>
            <ul className="text-muted-foreground mt-1 space-y-1 list-disc pl-4">
              <li>Real‑time Event & Weather feeds</li>
              <li>Dynamic surge pricing recommendations</li>
              <li>Automated milestone invoices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
