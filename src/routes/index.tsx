import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plane,
  Hotel,
  AlertTriangle,
  MessageCircle,
  Phone,
  Search,
  Wrench,
  Wifi,
  WifiOff,
  Compass,
  ArrowRight,
  Check,
  Printer,
  Download,
  Plus,
  X,
  RefreshCw,
  Heart,
  Coffee,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Travel Survival Guide — Calm answers for the road" },
      {
        name: "description",
        content:
          "An offline pocket companion for airports, hotels, and the unexpected. Phrases, checklists, currency, time zones and emergency contacts in one calm interface.",
      },
      { property: "og:title", content: "The Travel Survival Guide" },
      {
        property: "og:description",
        content:
          "Phrases, checklists, currency, time zones and emergency contacts — designed for calm decisions on the road.",
      },
    ],
  }),
  component: Index,
});

const tabs = [
  { id: "airport", label: "Airport", Icon: Plane },
  { id: "hotel", label: "Hotel", Icon: Hotel },
  { id: "problems", label: "Problems", Icon: AlertTriangle },
  { id: "phrases", label: "Phrases", Icon: MessageCircle },
  { id: "toolkit", label: "Toolkit", Icon: Wrench },
  { id: "emergency", label: "Emergency", Icon: Phone },
  { id: "support", label: "Support", Icon: Heart },
] as const;

type TabId = (typeof tabs)[number]["id"];

const phrases: { en: string; es: string; fr: string; de: string; tags: string }[] = [
  { en: "Excuse me, could you help me?", es: "Disculpe, ¿podría ayudarme?", fr: "Excusez-moi, pourriez-vous m'aider ?", de: "Entschuldigung, könnten Sie mir helfen?", tags: "help ask polite" },
  { en: "Where can I find the gate?", es: "¿Dónde está la puerta de embarque?", fr: "Où se trouve la porte d'embarquement ?", de: "Wo finde ich das Gate?", tags: "location gate directions airport" },
  { en: "My flight has been delayed.", es: "Mi vuelo está retrasado.", fr: "Mon vol a été retardé.", de: "Mein Flug hat Verspätung.", tags: "flight delay problem airport" },
  { en: "There is a problem with my booking.", es: "Hay un problema con mi reserva.", fr: "Il y a un problème avec ma réservation.", de: "Es gibt ein Problem mit meiner Buchung.", tags: "booking hotel reservation problem" },
  { en: "Could you repeat that more slowly?", es: "¿Podría repetirlo más despacio?", fr: "Pourriez-vous répéter plus lentement ?", de: "Könnten Sie das bitte langsamer wiederholen?", tags: "repeat slow language understand" },
  { en: "Thank you very much for your help.", es: "Muchas gracias por su ayuda.", fr: "Merci beaucoup pour votre aide.", de: "Vielen Dank für Ihre Hilfe.", tags: "thanks polite gratitude" },
  { en: "How much does this cost?", es: "¿Cuánto cuesta esto?", fr: "Combien ça coûte ?", de: "Wie viel kostet das?", tags: "price money buy shopping" },
  { en: "My luggage hasn't arrived.", es: "Mi equipaje no ha llegado.", fr: "Mes bagages ne sont pas arrivés.", de: "Mein Gepäck ist nicht angekommen.", tags: "luggage lost airport problem baggage" },
  { en: "Where is the nearest pharmacy?", es: "¿Dónde está la farmacia más cercana?", fr: "Où est la pharmacie la plus proche ?", de: "Wo ist die nächste Apotheke?", tags: "pharmacy medicine health" },
  { en: "I need a doctor, please.", es: "Necesito un médico, por favor.", fr: "J'ai besoin d'un médecin, s'il vous plaît.", de: "Ich brauche einen Arzt, bitte.", tags: "doctor medical emergency help" },
  { en: "What is the Wi-Fi password?", es: "¿Cuál es la contraseña del Wi-Fi?", fr: "Quel est le mot de passe du Wi-Fi ?", de: "Wie lautet das WLAN-Passwort?", tags: "wifi internet hotel" },
  { en: "What time is check-out?", es: "¿A qué hora es la salida?", fr: "À quelle heure est le départ ?", de: "Wann ist der Check-out?", tags: "hotel check-out time" },
];

const packingList = [
  "Passport / ID",
  "Printed booking confirmations",
  "Power bank and charger",
  "Universal travel adapter",
  "Refillable water bottle",
  "Small first-aid pouch",
  "Spare change of clothes in carry-on",
  "Offline maps downloaded",
];

const FALLBACK_RATES: Record<string, number> = {
  EUR: 1, USD: 1.08, GBP: 0.85, CHF: 0.96, JPY: 168, TRY: 36.5,
  CAD: 1.47, AUD: 1.64, CNY: 7.85, INR: 90.2, SEK: 11.4, NOK: 11.6,
  DKK: 7.46, PLN: 4.32, CZK: 25.2, HUF: 395, MXN: 19.8, BRL: 5.45,
  ZAR: 19.9, AED: 3.97, THB: 38.5, SGD: 1.46, HKD: 8.45, KRW: 1480, NZD: 1.78,
};

const DEFAULT_CITIES: { name: string; tz: string }[] = [
  { name: "Berlin", tz: "Europe/Berlin" },
  { name: "London", tz: "Europe/London" },
  { name: "New York", tz: "America/New_York" },
  { name: "Tokyo", tz: "Asia/Tokyo" },
  { name: "Sydney", tz: "Australia/Sydney" },
];

function getAllTimeZones(): string[] {
  try {
    const intlAny = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
    if (typeof intlAny.supportedValuesOf === "function") {
      return intlAny.supportedValuesOf("timeZone");
    }
  } catch {
    /* ignore */
  }
  return [
    "Europe/Berlin", "Europe/London", "Europe/Paris", "Europe/Madrid",
    "Europe/Rome", "Europe/Lisbon", "Europe/Athens", "Europe/Istanbul",
    "America/New_York", "America/Los_Angeles", "America/Chicago",
    "America/Toronto", "America/Mexico_City", "America/Sao_Paulo",
    "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Asia/Dubai",
    "Asia/Bangkok", "Asia/Hong_Kong", "Asia/Seoul", "Asia/Kolkata",
    "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
    "Africa/Cairo", "Africa/Johannesburg",
  ];
}

function formatZone(now: Date, tz: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return "--:--";
  }
}

function cityLabel(tz: string) {
  const last = tz.split("/").pop() ?? tz;
  return last.replace(/_/g, " ");
}

type RateCache = {
  base: string;
  rates: Record<string, number>;
  updated: number; // ms epoch
  source: "live" | "fallback";
};

function useCurrencyRates() {
  const [cache, setCache] = useState<RateCache>(() => ({
    base: "EUR",
    rates: FALLBACK_RATES,
    updated: 0,
    source: "fallback",
  }));
  const [loading, setLoading] = useState(false);

  // Load cached on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tsg.rates");
      if (raw) {
        const parsed = JSON.parse(raw) as RateCache;
        if (parsed?.rates && parsed.base) setCache(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR");
      const data = await res.json();
      if (data && data.rates) {
        const next: RateCache = {
          base: "EUR",
          rates: { EUR: 1, ...data.rates },
          updated: Date.now(),
          source: "live",
        };
        setCache(next);
        try {
          localStorage.setItem("tsg.rates", JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* offline / failed — keep cache */
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh once a day if online
  useEffect(() => {
    const stale = Date.now() - cache.updated > 24 * 60 * 60 * 1000;
    if (stale && typeof navigator !== "undefined" && navigator.onLine) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { cache, loading, refresh };
}

function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

function useLocalSet(key: string) {
  const [set, setSet] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setSet(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(set));
    } catch {
      /* ignore */
    }
  }, [key, set]);
  const toggle = (v: string) =>
    setSet((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  return { set, toggle, clear: () => setSet([]) };
}

function SectionHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-3 max-w-2xl text-base text-muted-foreground">{lead}</p>}
    </div>
  );
}

function Index() {
  const [active, setActive] = useState<TabId>("airport");
  const online = useOnlineStatus();

  // Phrases
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"en" | "es" | "fr" | "de">("en");
  const { set: selected, toggle: togglePhrase, clear: clearPhrases } = useLocalSet(
    "tsg.phrases.selected",
  );
  const filteredPhrases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phrases;
    return phrases.filter((p) =>
      [p.en, p.es, p.fr, p.de, p.tags].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);
  const qrPayload = selected.length
    ? selected
        .map((en) => {
          const p = phrases.find((x) => x.en === en);
          if (!p) return en;
          return `${p.en}\n${p.es}\n${p.fr}\n${p.de}`;
        })
        .join("\n\n")
    : "";

  // Packing
  const { set: packed, toggle: togglePacked } = useLocalSet("tsg.packing");

  // Currency (with offline cache)
  const { cache: rateCache, loading: ratesLoading, refresh: refreshRates } =
    useCurrencyRates();
  const currencyCodes = useMemo(
    () => Object.keys(rateCache.rates).sort(),
    [rateCache.rates],
  );
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("100");
  const converted = useMemo(() => {
    const n = parseFloat(amount);
    const fr = rateCache.rates[from];
    const tr = rateCache.rates[to];
    if (!isFinite(n) || !fr || !tr) return "—";
    const inBase = n / fr;
    return (inBase * tr).toFixed(2);
  }, [amount, from, to, rateCache.rates]);

  // Time zones
  const { set: customZones, toggle: toggleZone } = useLocalSet("tsg.zones");
  const [zoneQuery, setZoneQuery] = useState("");
  const allZones = useMemo(() => getAllTimeZones(), []);
  const zoneMatches = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    if (!q) return [];
    return allZones
      .filter((z) => z.toLowerCase().includes(q))
      .slice(0, 6);
  }, [zoneQuery, allZones]);
  const cities = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; tz: string }[] = [];
    for (const d of DEFAULT_CITIES) {
      if (!seen.has(d.tz)) {
        seen.add(d.tz);
        list.push(d);
      }
    }
    for (const tz of customZones) {
      if (!seen.has(tz)) {
        seen.add(tz);
        list.push({ name: cityLabel(tz), tz });
      }
    }
    return list;
  }, [customZones]);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Ko-fi widget: load only when Support tab is active
  useEffect(() => {
    if (active !== "support") {
      // Remove any existing Ko-fi widget
      const existing = document.getElementById("kofi-widget-overlay");
      if (existing) existing.remove();
      return;
    }

    let script: HTMLScriptElement | null = null;
    const loadWidget = () => {
      const win = window as unknown as {
        kofiWidgetOverlay?: {
          draw: (username: string, config: Record<string, string>) => void;
        };
      };
      if (win.kofiWidgetOverlay) {
        win.kofiWidgetOverlay.draw("uejosef_sp107", {
          type: "floating-chat",
          "floating-chat.donateButton.text": "Support Me",
          "floating-chat.donateButton.background-color": "#f45d22",
          "floating-chat.donateButton.text-color": "#fff",
        });
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"]'
    );
    if (existingScript) {
      loadWidget();
    } else {
      script = document.createElement("script");
      script.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";
      script.async = true;
      script.onload = loadWidget;
      document.body.appendChild(script);
    }

    return () => {
      const widget = document.getElementById("kofi-widget-overlay");
      if (widget) widget.remove();
    };
  }, [active]);

  // Packing list export
  const packingHtml = () => {
    const rows = packingList
      .map(
        (item) =>
          `<li><label><input type="checkbox" ${packed.includes(item) ? "checked" : ""} /> ${item}</label></li>`,
      )
      .join("");
    return `<!doctype html><html><head><meta charset="utf-8"><title>Packing list — Travel Survival Guide</title>
<style>
  body { font-family: ui-serif, Georgia, serif; max-width: 640px; margin: 40px auto; padding: 0 24px; color: #1c1917; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  p.meta { color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 24px; }
  ul { list-style: none; padding: 0; }
  li { padding: 10px 0; border-bottom: 1px solid #e7e5e4; font-size: 16px; }
  input[type=checkbox] { transform: scale(1.2); margin-right: 12px; }
  footer { margin-top: 32px; font-size: 11px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.15em; }
  @media print { body { margin: 16mm; } }
</style></head><body>
<h1>Packing list</h1>
<p class="meta">The Travel Survival Guide · ${new Date().toLocaleDateString()}</p>
<ul>${rows}</ul>
<footer>${packed.length} of ${packingList.length} packed</footer>
</body></html>`;
  };

  const handlePrintPacking = () => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(packingHtml());
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  const handleDownloadPacking = () => {
    const blob = new Blob([packingHtml()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packing-list.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      {/* Top bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-accent" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-foreground">
              Survival Guide
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
              online
                ? "border-border text-muted-foreground"
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
            title={online ? "Online — fresh content" : "Offline — cached and ready"}
          >
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? "Online" : "Offline mode"}
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="px-6 pt-14 pb-10 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
            A pocket companion · No. 01
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-7xl">
            The Travel
            <br />
            <span className="italic text-accent">Survival Guide.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Calm answers for the small disasters and quiet moments of travel —
            from a delayed gate in Madrid to a closed reception desk in Lisbon.
            Works offline.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Edition 2026</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Offline ready</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Seven chapters</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-10 border-y border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-3">
          <div className="flex min-w-max gap-1 py-2">
            {tabs.map(({ id, label, Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="mx-auto mt-12 max-w-5xl px-6">
        {active === "airport" && (
          <div>
            <SectionHeader
              eyebrow="Chapter I"
              title="At the airport"
              lead="The four moments that matter, and a short list to glance at while you wait in line."
            />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              {[
                { t: "Check-in", d: "Arrive 2 hours before short-haul, 3 before international. Have your passport open to the photo page." },
                { t: "Security", d: "Liquids under 100 ml in a clear bag. Laptops and large electronics out unless you have priority lanes." },
                { t: "Boarding", d: "Gates close 15–20 minutes before departure. Listen for gate changes — they happen more than airlines admit." },
                { t: "Disruption", d: "Delays over 3 hours on EU flights usually entitle you to meals, calls, and sometimes compensation. Keep the boarding pass." },
              ].map((x, i) => (
                <div key={x.t} className="bg-card p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-2xl italic text-accent">0{i + 1}</span>
                    <h3 className="text-base font-semibold">{x.t}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
                </div>
              ))}
            </div>

            <Card className="mt-8 border-border bg-card p-8 shadow-none">
              <h3 className="font-serif text-2xl">Before you leave the house</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Boarding pass downloaded to wallet",
                  "Passport valid 6+ months",
                  "Power bank charged",
                  "Cash for the destination airport",
                  "Card provider notified of travel",
                  "Offline map of arrival city",
                ].map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 border-t border-border pt-3 text-sm"
                  >
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-accent" strokeWidth={2} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {active === "hotel" && (
          <div>
            <SectionHeader
              eyebrow="Chapter II"
              title="At the hotel"
              lead="Ten quiet minutes at check-in save an evening of negotiation later."
            />
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <Card className="border-border bg-card p-8 shadow-none">
                <h3 className="font-serif text-2xl">On arrival</h3>
                <ol className="mt-5 space-y-4 text-sm leading-relaxed">
                  {[
                    "Confirm the spelling of your name and the room rate on the printout.",
                    "Ask which charges you have already pre-paid online versus what is settled at the desk.",
                    "Photograph the room on entry — the carpet, the minibar, the bathroom.",
                    "Test the door card, hot water, Wi-Fi, and air conditioning before unpacking.",
                    "Note the breakfast hours, the late check-out fee, and where the fire exit is.",
                  ].map((s, i) => (
                    <li key={s} className="flex gap-4 border-t border-border pt-4 first:border-0 first:pt-0">
                      <span className="font-serif text-xl italic text-accent">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </Card>
              <Card className="border-border bg-card p-8 shadow-none">
                <h3 className="font-serif text-2xl">If something is wrong</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Tell reception calmly and in writing — a quick email from the
                  lobby creates a record. Ask for a different room before you
                  ask for a discount; most hotels can move you faster than they
                  can refund you.
                </p>
              </Card>
            </div>
          </div>
        )}

        {active === "problems" && (
          <div>
            <SectionHeader
              eyebrow="Chapter III"
              title="When things go sideways"
              lead="A field guide for the five problems that arrive without warning."
            />
            <div className="space-y-3">
              {[
                {
                  t: "Lost luggage",
                  d: "Go to the airline's baggage desk before leaving the arrivals hall. Keep the file reference and a photo of the bag. Most airlines reimburse essentials after 24 hours.",
                },
                {
                  t: "Delayed flight",
                  d: "Ask the gate agent in person — they have more authority than the app. Request a rebooking on the next available flight, not just the next of the same airline.",
                },
                {
                  t: "Wrong gate",
                  d: "Recheck the departure board, not the gate screen. Walk, don't run. If the gate has closed, return to the original check-in desk.",
                },
                {
                  t: "No ticket on file",
                  d: "Open your booking confirmation email, then the airline app, then the original payment receipt. Show all three to staff.",
                },
                {
                  t: "Overbooked flight",
                  d: "Volunteer to be bumped only if you have time. Insist on a written commitment for the new flight, meals, and any compensation.",
                },
              ].map((x, i) => (
                <details
                  key={x.t}
                  className="group rounded-2xl border border-border bg-card p-6 open:bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-xl italic text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-semibold">{x.t}</h3>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground group-open:text-accent">
                      Read
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                    {x.d}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {active === "phrases" && (
          <div>
            <SectionHeader
              eyebrow="Chapter IV"
              title="Phrases worth knowing"
              lead="Select the lines you might need. Generate a QR code to keep them on your lock screen."
            />
            <Card className="border-border bg-card p-8 shadow-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by word or topic — luggage, hotel, doctor…"
                    className="border-border bg-background pl-9"
                  />
                </div>
                <div className="flex gap-1 rounded-full border border-border p-1">
                  {(["en", "es", "fr", "de"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider transition ${
                        lang === l
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-6 divide-y divide-border">
                {filteredPhrases.map((p) => {
                  const isSel = selected.includes(p.en);
                  return (
                    <li key={p.en}>
                      <button
                        type="button"
                        onClick={() => togglePhrase(p.en)}
                        className="group flex w-full items-start gap-4 py-4 text-left"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition ${
                            isSel
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border bg-background group-hover:border-accent"
                          }`}
                        >
                          {isSel && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="flex-1">
                          <span className="block font-serif text-lg leading-snug">
                            {p[lang]}
                          </span>
                          <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                            {p.tags.split(" ").slice(0, 3).join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                {filteredPhrases.length === 0 && (
                  <li className="py-10 text-center text-sm text-muted-foreground">
                    Nothing matches “{query}”.
                  </li>
                )}
              </ul>
            </Card>

            <Card className="mt-6 border-border bg-card p-8 shadow-none">
              <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Pocket card
                  </p>
                  <h3 className="mt-2 font-serif text-2xl">
                    {selected.length
                      ? `${selected.length} phrase${selected.length === 1 ? "" : "s"} ready to scan`
                      : "Select phrases to build your card"}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Scan the code with another phone to open the same phrases.
                    Works offline once cached.
                  </p>
                  {selected.length > 0 && (
                    <button
                      onClick={clearPhrases}
                      className="mt-4 text-xs font-medium uppercase tracking-wider text-accent hover:underline"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
                <div className="justify-self-center sm:justify-self-end">
                  {qrPayload ? (
                    <div className="rounded-xl border border-border bg-white p-4">
                      <QRCodeSVG value={qrPayload} size={160} level="M" />
                    </div>
                  ) : (
                    <div className="flex h-[192px] w-[192px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {active === "toolkit" && (
          <div>
            <SectionHeader
              eyebrow="Chapter V"
              title="The traveller's toolkit"
              lead="Currency, time zones, and a packing list that remembers itself."
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card p-8 shadow-none">
                <h3 className="font-serif text-2xl">Currency</h3>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {rateCache.source === "live" && rateCache.updated
                      ? `Live rates · cached ${new Date(rateCache.updated).toLocaleDateString()}`
                      : "Offline reference rates"}
                  </p>
                  <button
                    onClick={refreshRates}
                    disabled={ratesLoading || !online}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                    title={online ? "Refresh exchange rates" : "Offline — using cache"}
                  >
                    <RefreshCw className={`h-3 w-3 ${ratesLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                  <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      From
                    </span>
                    <div className="mt-2 flex rounded-md border border-border bg-background">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                      />
                      <select
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="border-l border-border bg-transparent px-2 text-sm outline-none"
                      >
                        {currencyCodes.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <ArrowRight className="mb-3 h-4 w-4 text-accent" strokeWidth={2} />
                  <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      To
                    </span>
                    <div className="mt-2 flex rounded-md border border-border bg-background">
                      <div className="w-full px-3 py-2 text-sm font-medium">{converted}</div>
                      <select
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="border-l border-border bg-transparent px-2 text-sm outline-none"
                      >
                        {currencyCodes.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>
              </Card>

              <Card className="border-border bg-card p-8 shadow-none">
                <h3 className="font-serif text-2xl">World clock</h3>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Local time · add any time zone
                </p>
                <div className="relative mt-5">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={zoneQuery}
                    onChange={(e) => setZoneQuery(e.target.value)}
                    placeholder="Search a city or time zone — Lisbon, Asia/Bangkok…"
                    className="border-border bg-background pl-9"
                  />
                  {zoneMatches.length > 0 && (
                    <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-card shadow-lg">
                      {zoneMatches.map((tz) => {
                        const already = cities.some((c) => c.tz === tz);
                        return (
                          <li key={tz}>
                            <button
                              type="button"
                              disabled={already}
                              onClick={() => {
                                toggleZone(tz);
                                setZoneQuery("");
                              }}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-40"
                            >
                              <span>
                                <span className="font-medium">{cityLabel(tz)}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{tz}</span>
                              </span>
                              {already ? (
                                <Check className="h-3.5 w-3.5 text-accent" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 text-accent" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <ul className="mt-4 divide-y divide-border">
                  {cities.map((c) => {
                    const isCustom = customZones.includes(c.tz);
                    return (
                      <li key={c.tz} className="flex items-baseline justify-between gap-3 py-3">
                        <span className="text-sm">
                          {c.name}
                          <span className="ml-2 text-xs text-muted-foreground">{c.tz}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="font-serif text-xl tabular-nums">
                            {formatZone(now, c.tz)}
                          </span>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => toggleZone(c.tz)}
                              className="text-muted-foreground transition hover:text-accent"
                              aria-label={`Remove ${c.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className="border-border bg-card p-8 shadow-none lg:col-span-2">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">Packing list</h3>
                    <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {packed.length} of {packingList.length} packed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-32 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${(packed.length / packingList.length) * 100}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintPacking}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-foreground transition hover:bg-muted"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPacking}
                      className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-background transition hover:bg-foreground/90"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                </div>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {packingList.map((item) => {
                    const done = packed.includes(item);
                    return (
                      <li key={item}>
                        <button
                          onClick={() => togglePacked(item)}
                          className="flex w-full items-center gap-3 border-b border-border py-3 text-left text-sm"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-sm border transition ${
                              done
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border"
                            }`}
                          >
                            {done && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className={done ? "text-muted-foreground line-through" : ""}>
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {active === "emergency" && (
          <div>
            <SectionHeader
              eyebrow="Chapter VI"
              title="In an emergency"
              lead="Tap to call. Hold steady — the right number reaches help in seconds."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Pan-European emergency", number: "112", note: "Police, ambulance, fire — across the EU." },
                { label: "United Kingdom", number: "999", note: "Standard emergency line." },
                { label: "United States & Canada", number: "911", note: "Police, fire, medical." },
                { label: "Non-emergency help", number: "111", note: "Health advice in the UK; varies elsewhere." },
              ].map((n) => (
                <Card
                  key={n.label}
                  className="border-border bg-card p-6 shadow-none"
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {n.label}
                  </p>
                  <p className="mt-2 font-serif text-5xl tracking-tight">{n.number}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{n.note}</p>
                  <div className="mt-5 flex gap-2">
                    <a
                      href={`tel:${n.number}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/90"
                    >
                      <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                      Call
                    </a>
                    <a
                      href={`sms:${n.number}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                      SMS
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6 border-accent/30 bg-accent/5 p-8 shadow-none">
              <h3 className="font-serif text-2xl">If you've lost your passport</h3>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed">
                <li>1. Report it to local police and keep the report number.</li>
                <li>2. Contact your country's nearest embassy or consulate.</li>
                <li>3. Bring any photo of the passport, a second ID, and the police report.</li>
                <li>4. An emergency travel document is usually issued within 24–72 hours.</li>
              </ol>
            </Card>
          </div>
        )}

        {active === "support" && (
          <div>
            <SectionHeader
              eyebrow="Chapter VII"
              title="Support the journey"
              lead="If this guide saved you a headache at the gate, a warm coffee keeps the next version brewing."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border bg-card p-6 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Coffee className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg">Buy a coffee</h3>
                    <p className="text-sm text-muted-foreground">One-time, no subscription.</p>
                  </div>
                </div>
                <a
                  href="https://ko-fi.com/uejosef_sp107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#f45d22" }}
                >
                  <Heart className="h-3.5 w-3.5" strokeWidth={2} />
                  Support on Ko-fi
                </a>
              </Card>

              <Card className="border-border bg-card p-6 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <MessageCircle className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg">Say hello</h3>
                    <p className="text-sm text-muted-foreground">Feedback, ideas, or just a note.</p>
                  </div>
                </div>
                <a
                  href="https://ko-fi.com/uejosef_sp107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Open chat
                </a>
              </Card>
            </div>

            <Card className="mt-6 border-accent/30 bg-accent/5 p-8 shadow-none">
              <h3 className="font-serif text-2xl">What your support means</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Every contribution goes directly into keeping the Travel Survival Guide free,
                offline-ready, and up to date. New phrases, better currency data, and calmer
                designs — all fueled by travelers like you.
              </p>
            </Card>
          </div>
        )}
      </section>

      <footer className="mx-auto mt-20 max-w-5xl border-t border-border px-6 pt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>The Travel Survival Guide</span>
          <div className="flex items-center gap-3">
            <Link
              to="/josef"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Ue@Josef_sp107
            </Link>
            <Link
              to="/best-teacher-ever"
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              x Ms. Meyer
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
