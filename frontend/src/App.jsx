import { useState } from "react";
import { Building2, MapPin, Ruler, BedDouble, Bath, CarFront, Waves, CalendarDays, ArrowUpRight, Sparkles, LoaderCircle, House, CheckCircle2, AlertCircle } from "lucide-react";
import PriceChart from "./components/PriceChart";

const LOCATIONS = ["DHA", "Gulberg", "Bahria Town", "Clifton", "Johar Town", "Model Town"];
const PRESETS = [
  { name: "Modern family home", values: { location: "DHA", area_sqft: 2500, bedrooms: 4, bathrooms: 3, parking: true, pool: false, year_built: 2018 } },
  { name: "Urban apartment", values: { location: "Gulberg", area_sqft: 1100, bedrooms: 2, bathrooms: 2, parking: true, pool: false, year_built: 2022 } },
  { name: "Luxury property", values: { location: "Clifton", area_sqft: 4200, bedrooms: 5, bathrooms: 5, parking: true, pool: true, year_built: 2024 } },
];
const INITIAL = PRESETS[0].values;
const formatPKR = (n) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);

function Field({ label, icon: Icon, children }) {
  return <div><label className="field-label"><span className="flex items-center gap-2"><Icon size={15} />{label}</span></label>{children}</div>;
}
function Counter({ value, onChange, max = 20 }) {
  return <div className="field flex items-center justify-between">
    <button type="button" aria-label="Decrease" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))} className="h-8 w-8 rounded-lg bg-slate-800 text-lg disabled:opacity-30">−</button>
    <span className="font-semibold">{value}</span>
    <button type="button" aria-label="Increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="h-8 w-8 rounded-lg bg-slate-800 text-lg disabled:opacity-30">+</button>
  </div>;
}
function Amenity({ checked, onChange, icon: Icon, label }) {
  return <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/50 p-3 transition hover:border-blue-500/50">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-blue-500" />
    <Icon size={17} className="text-blue-400" /><span className="text-sm">{label}</span>
  </label>;
}

export default function App() {
  const [values, setValues] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setValues((old) => ({ ...old, [key]: value }));
  const applyPreset = (preset) => { setValues({ ...preset.values }); setResult(null); setError(""); };

  async function predict(event) {
    event.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, area_sqft: Number(values.area_sqft), bedrooms: Number(values.bedrooms), bathrooms: Number(values.bathrooms), year_built: Number(values.year_built) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Unable to estimate this property.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not connect to the server. Please try again.");
    } finally { setLoading(false); }
  }

  return <div className="min-h-screen overflow-hidden">
    <div className="pointer-events-none fixed inset-0 -z-10"><div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" /><div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" /></div>
    <header className="border-b border-slate-800/80"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
      <a href="/" className="flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2.5"><Building2 size={22} /></div><div><div className="font-bold tracking-tight">Estate<span className="text-blue-400">IQ</span></div><div className="text-xs text-slate-500">SMART PROPERTY VALUATION</div></div></a>
      <div className="hidden items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-400 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400" />ML-powered estimator</div>
    </div></header>
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <section className="mb-10 max-w-3xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300"><Sparkles size={14} />Intelligent property insights</div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Know what your<br />property is <span className="text-blue-400">worth.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Get an estimated property valuation in seconds. Enter your property details and let our machine learning model calculate its estimated value.</p>
      </section>
      <div className="grid items-start gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <section className="panel rounded-2xl p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Property details</h2><p className="mt-1 text-sm text-slate-500">Customize your property profile</p></div><div className="rounded-xl bg-blue-500/10 p-3 text-blue-400"><House size={21} /></div></div>
          <div className="mb-6"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Try a demo</p><div className="flex flex-wrap gap-2">{PRESETS.map((p) => <button key={p.name} type="button" onClick={() => applyPreset(p)} className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10">{p.name}</button>)}</div></div>
          <form onSubmit={predict} className="space-y-5">
            <Field label="Location" icon={MapPin}><select className="field" value={values.location} onChange={(e) => update("location", e.target.value)}>{LOCATIONS.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Area (square feet)" icon={Ruler}><input className="field" type="number" min="100" max="50000" required value={values.area_sqft} onChange={(e) => update("area_sqft", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4"><Field label="Bedrooms" icon={BedDouble}><Counter value={Number(values.bedrooms)} onChange={(v) => update("bedrooms", v)} /></Field><Field label="Bathrooms" icon={Bath}><Counter value={Number(values.bathrooms)} onChange={(v) => update("bathrooms", v)} /></Field></div>
            <Field label="Year built" icon={CalendarDays}><input className="field" type="number" min="1800" max="2026" required value={values.year_built} onChange={(e) => update("year_built", e.target.value)} /></Field>
            <div><p className="field-label">Property amenities</p><div className="grid grid-cols-2 gap-3"><Amenity label="Parking" icon={CarFront} checked={values.parking} onChange={(v) => update("parking", v)} /><Amenity label="Swimming pool" icon={Waves} checked={values.pool} onChange={(v) => update("pool", v)} /></div></div>
            {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"><AlertCircle size={18} className="shrink-0" />{error}</div>}
            <button type="submit" disabled={loading} className="primary-button w-full">{loading ? <><LoaderCircle size={18} className="animate-spin" />Calculating estimate...</> : <><Sparkles size={17} />Predict property price<ArrowUpRight size={17} /></>}</button>
            <p className="text-center text-xs leading-5 text-slate-500">Estimates are generated by a machine learning model trained on synthetic data.</p>
          </form>
        </section>
        <section className="space-y-6">
          <div className="panel relative overflow-hidden rounded-2xl p-6 sm:p-8"><div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" /><div className="relative">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Estimated property value</span><div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2.5 text-blue-400"><Building2 size={20} /></div></div>
            {result ? <><div className="mt-5 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{formatPKR(result.estimated_price)}</div><div className="mt-3 flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 size={16} />Estimate generated successfully</div><div className="mt-5 flex items-center gap-2 text-sm text-slate-400"><MapPin size={15} />{result.location}</div></> : <><div className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">PKR ——</div><p className="mt-3 text-sm leading-6 text-slate-500">Your valuation will appear here after you submit your property details.</p></>}
          </div></div>
          <div className="panel rounded-2xl p-5 sm:p-7"><div className="mb-7 flex items-start justify-between gap-3"><div><h2 className="font-bold text-white">Price trend</h2><p className="mt-1 text-sm text-slate-500">Illustrative 12-month valuation trend</p></div><span className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400">12 months</span></div>
            {result ? <PriceChart trend={result.trend} /> : <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 text-center"><div className="mb-3 rounded-xl bg-slate-800 p-3 text-slate-400"><ArrowUpRight size={22} /></div><p className="text-sm font-medium text-slate-300">Your chart will appear here</p><p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">Submit a property to visualize its estimated monthly price trend.</p></div>}
            {result && <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">{result.disclaimer}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">{[["01", "Enter details"], ["02", "Run prediction"], ["03", "View estimate"]].map(([n, label]) => <div key={n} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3"><div className="text-xs font-bold text-blue-400">{n}</div><div className="mt-2 text-xs leading-5 text-slate-400">{label}</div></div>)}</div>
        </section>
      </div>
      <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-xs leading-6 text-slate-500">EstateIQ · Smart Real Estate Price Estimator<br />Demonstration project. Not a professional appraisal or a substitute for verified market data.</footer>
    </main>
  </div>;
}
