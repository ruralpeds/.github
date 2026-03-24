import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar, ReferenceArea, BarChart, Cell } from "recharts";

// ════════════════════════════════════════════════════════════
// CLINICAL DATA — AAP 2018, Surviving Sepsis 2020, ISPAD 2022
// ════════════════════════════════════════════════════════════

const IV_FLUIDS = {
  NS: { name: "0.9% NaCl (NS)", na: 154, cl: 154, k: 0, ca: 0, lactate: 0, osm: 308, ph: "5.0", dex: 0, tonic: "Isotonic" },
  LR: { name: "Lactated Ringer's", na: 130, cl: 109, k: 4, ca: 2.7, lactate: 28, osm: 273, ph: "6.5", dex: 0, tonic: "Isotonic" },
  D5NS: { name: "D5 0.9% NaCl", na: 154, cl: 154, k: 0, ca: 0, lactate: 0, osm: 560, ph: "4.0", dex: 5, tonic: "Isotonic+Dex" },
  D5halfNS: { name: "D5 0.45% NaCl", na: 77, cl: 77, k: 0, ca: 0, lactate: 0, osm: 406, ph: "4.0", dex: 5, tonic: "Hypotonic" },
  D5quarterNS: { name: "D5 0.2% NaCl", na: 34, cl: 34, k: 0, ca: 0, lactate: 0, osm: 321, ph: "4.0", dex: 5, tonic: "Hypotonic" },
  PlasmaLyte: { name: "Plasma-Lyte 148", na: 140, cl: 98, k: 5, ca: 0, lactate: 0, osm: 294, ph: "7.4", dex: 0, tonic: "Isotonic" },
  HTS3: { name: "3% NaCl (Hypertonic)", na: 513, cl: 513, k: 0, ca: 0, lactate: 0, osm: 1026, ph: "5.0", dex: 0, tonic: "Hypertonic" },
};

function calcMaintenance(wt) {
  if (wt <= 0) return { hourly: 0, daily: 0 };
  let daily = 0;
  if (wt <= 10) daily = wt * 100;
  else if (wt <= 20) daily = 1000 + (wt - 10) * 50;
  else daily = 1500 + (wt - 20) * 20;
  return { hourly: Math.round((daily / 24) * 10) / 10, daily: Math.round(daily) };
}

function calcBSA(wt, ht) {
  if (wt <= 0 || ht <= 0) return 0;
  return Math.round(Math.sqrt((wt * ht) / 3600) * 100) / 100;
}

const DEHYDRATION = {
  mild: { pct: [3, 5], signs: "Slightly dry mucous membranes, mild thirst, normal HR, normal cap refill, tears present" },
  moderate: { pct: [6, 9], signs: "Dry mucous membranes, tachycardia, decreased skin turgor, sunken eyes, decreased tears, delayed cap refill (2-3s), irritability" },
  severe: { pct: [10, 15], signs: "Very dry membranes, marked tachycardia, mottled/cool skin, sunken fontanelle, absent tears, cap refill >3s, lethargy/obtundation, hypotension (LATE)" },
};

// ════════════════════════════════════════════════════════════

export default function PediatricIVFDecisionTree() {
  const [tab, setTab] = useState("pathway");
  const [weight, setWeight] = useState(15);
  const [height, setHeight] = useState(100);
  const [age, setAge] = useState("1-5yr");
  const [scenario, setScenario] = useState("maintenance");
  const [dehydPct, setDehydPct] = useState(5);
  const [burnPct, setBurnPct] = useState(20);
  const [naLevel, setNaLevel] = useState(140);
  const [fluidRestrict, setFluidRestrict] = useState(100);

  const maint = useMemo(() => calcMaintenance(weight), [weight]);
  const bsa = useMemo(() => calcBSA(weight, height), [weight, height]);
  const deficit = Math.round(dehydPct * weight * 10);
  const parkland = Math.round(4 * weight * burnPct);
  const parklandMaint = maint.daily;
  const restrictedVol = Math.round(maint.daily * fluidRestrict / 100);
  const restrictedRate = Math.round((restrictedVol / 24) * 10) / 10;

  const tabs = [
    { id: "pathway", label: "Decision Pathway" },
    { id: "calc", label: "Calculator" },
    { id: "dehydration", label: "Dehydration" },
    { id: "special", label: "Special Pops" },
    { id: "fluids", label: "Fluid Comp" },
    { id: "ref", label: "Reference" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #06090f 0%, #0c1220 40%, #0a0f1a 100%)", color: "#d4dce8", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e8edf5", margin: 0, letterSpacing: "-0.02em" }}>Pediatric IVF Management Decision Tree</h1>
        <p style={{ fontSize: 11, color: "#5a6b82", margin: "4px 0 0" }}>AAP 2018 Guideline-Based — Ages 1 Month to 18 Years — Interactive Clinical Decision Support</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${tab === t.id ? "#3b82f6" : "#1a2236"}`,
            background: tab === t.id ? "rgba(59,130,246,0.15)" : "rgba(10,16,30,0.7)",
            color: tab === t.id ? "#60a5fa" : "#5a6b82", fontSize: 10, fontWeight: 600, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          <NumInput label="Weight (kg)" value={weight} set={setWeight} min={2} max={120} step={0.5} />
          <NumInput label="Height (cm)" value={height} set={setHeight} min={40} max={200} step={1} />
          <div>
            <Lbl>Age Group</Lbl>
            <select value={age} onChange={e => setAge(e.target.value)} style={selStyle}>
              {["1-6mo","6-12mo","1-5yr","6-12yr","13-18yr"].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <Lbl>Clinical Scenario</Lbl>
            <select value={scenario} onChange={e => setScenario(e.target.value)} style={selStyle}>
              <option value="maintenance">Maintenance IVF</option>
              <option value="resuscitation">Bolus / Resuscitation</option>
              <option value="dehydration">Dehydration Correction</option>
              <option value="periop">Perioperative</option>
              <option value="dka">DKA</option>
              <option value="neuro">Neurosurgical</option>
              <option value="cardiac">Post-Cardiac Surgery</option>
              <option value="burns">Burns</option>
              <option value="renal">Renal / Nephrotic</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Pill color="#10b981">Maint: {maint.hourly} mL/hr ({maint.daily} mL/day)</Pill>
          <Pill color="#3b82f6">BSA: {bsa} m²</Pill>
          <Pill color="#8b5cf6">{weight} kg</Pill>
        </div>
      </div>

      {/* ═══ PATHWAY TAB ═══ */}
      {tab === "pathway" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* ROOT NODE */}
          <PathNode type="assess" title="Child Requires IV Fluids" sub="Age 1 month – 18 years" detail="Assess: hemodynamic status, hydration, NPO status, underlying condition, serum Na/K/Glucose/Cr, urine output. Is the patient in SHOCK or severely dehydrated?" />
          
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
              <PathNode type="decide" title="YES — Hemodynamically Unstable" sub="Shock, severe dehydration, or hemodynamic compromise" />
              <PathNode type="escalate" title="Bolus Resuscitation" sub="10–20 mL/kg isotonic crystalloid" detail={`NS or LR over 5–20 min. Reassess after each bolus. May repeat ×3 (total 40–60 mL/kg). If no response after 40 mL/kg → fluid-refractory shock → vasopressors.\n\nFor ${weight} kg: Bolus = ${Math.round(weight*20)} mL (20 mL/kg)\nMax before pressors: ${Math.round(weight*60)} mL (60 mL/kg)\n\nFEAST Trial caveat: In resource-limited settings without ICU access, aggressive bolus >20 mL/kg may increase mortality. Use clinical judgment.`} />
              <PathNode type="treat" title="Post-Resuscitation" sub="Transition to scenario-specific IVF" detail="After hemodynamic stabilization, transition to maintenance IVF (isotonic per AAP 2018) or scenario-specific protocol. Reassess volume status q1–4h. Monitor UOP goal 1–2 mL/kg/hr." />
            </div>
            <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
              <PathNode type="decide" title="NO — Hemodynamically Stable" sub="Assess reason for IVF" />
              <PathNode type="decide" title="Is there a special condition?" sub="DKA, neurosurgical, cardiac, burns, renal?" detail="Special populations have MODIFIED fluid protocols that differ significantly from standard maintenance. Identify the condition BEFORE selecting fluids." />
              
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <MiniNode type="adjunct" title="DKA" sub="1–1.5× maint, 2-bag" />
                <MiniNode type="adjunct" title="Neuro" sub="SIADH vs CSW" />
                <MiniNode type="adjunct" title="Cardiac" sub="50–75% maint" />
                <MiniNode type="adjunct" title="Burns" sub="Parkland formula" />
                <MiniNode type="adjunct" title="Renal" sub="IWL + UOP" />
              </div>

              <PathNode type="treat" title="Standard Maintenance IVF" sub="AAP 2018 KAS 1-3" detail={`KAS 1: Use ISOTONIC fluids (0.9% NaCl or LR/balanced) — NOT hypotonic\nKAS 2: Monitor Na, K, glucose, Cr, UOP\nKAS 3: Add 5% dextrose (D5NS or D5LR)\n\nFor ${weight} kg:\n• Rate: ${maint.hourly} mL/hr (${maint.daily} mL/day)\n• Fluid: D5 0.9% NaCl + 20 mEq/L KCl\n• Or: D5 LR (already contains K 4 mEq/L)\n\nWHY isotonic? Hypotonic fluids caused hospital-acquired hyponatremia in ~30% of hospitalized children. Mortality from symptomatic hyponatremia: 8–25%. AAP Grade B recommendation.`} />
            </div>
          </div>

          {/* Dehydration Branch */}
          <PathNode type="assess" title="Dehydration Assessment" sub="Classify severity: mild (3–5%), moderate (6–9%), severe (≥10%)" detail="Use clinical signs: skin turgor, cap refill, mucous membranes, tears, mental status, HR, fontanelle (infants). Gorelick scale: ≥3 of 4 items (dry MM, decreased tears, ill appearance, cap refill >2s) = ≥5% dehydrated." />
          
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PathNode type="wean" title="Mild (3–5%)" sub="ORT first line" detail={`Oral Rehydration Therapy (WHO ORS): 50 mL/kg over 4 hours + ongoing losses.\nComposition: Na 75, K 20, glucose 75 mmol/L, osmolarity 245.\nIf vomiting: small frequent sips (5 mL q1–2 min).\nOndansetron 0.15 mg/kg PO/IV may reduce vomiting and IV need.\n\nFor ${weight} kg: ORT = ${Math.round(weight*50)} mL over 4 hours (${Math.round(weight*50/4)} mL/hr)`} />
            <PathNode type="treat" title="Moderate (6–9%)" sub="ORT preferred; IV if fails" detail={`ORT: 75–100 mL/kg over 4 hours.\nIf ORT fails or patient cannot drink:\nIV: NS 20 mL/kg bolus, then deficit replacement.\nDeficit = ${dehydPct}% × ${weight} kg × 10 = ${deficit} mL\nReplace 50% in first 8h, 50% over next 16h + maintenance.\n\nFirst 8h rate: ${Math.round((deficit/2 + maint.daily/3) / 8)} mL/hr\nNext 16h rate: ${Math.round((deficit/2 + maint.daily*2/3) / 16)} mL/hr`} />
            <PathNode type="escalate" title="Severe (≥10%)" sub="IV resuscitation required" detail={`EMERGENCY: NS or LR 20 mL/kg bolus over 20 min.\nRepeat if still hemodynamically compromised.\nThen: deficit + maintenance replacement.\n\nFor ${weight} kg at 10%:\nDeficit: ${Math.round(10*weight*10)} mL\nBolus: ${Math.round(weight*20)} mL\nRemaining deficit after bolus: ${Math.round(10*weight*10 - weight*20)} mL\nReplace over 24–48h (isonatremic) or 48–72h (hypernatremic).`} />
          </div>

          {/* Na-specific */}
          <PathNode type="decide" title="Check Serum Sodium" sub="Correction rate depends on Na type" detail={`ISONATREMIC (Na 130–150): Replace deficit over 24h with isotonic fluids.\n\nHYPONATREMIC (Na <130): \n• Correct Na ≤8–10 mEq/L per 24h (risk: osmotic demyelination)\n• Use isotonic or mildly hypertonic fluids\n• If seizures: 3% NaCl 3–5 mL/kg over 10–20 min\n\nHYPERNATREMIC (Na >150):\n• Correct ≤0.5 mEq/L per hour (≤10–12 mEq/L per 24h)\n• Risk: cerebral edema with rapid correction\n• Use hypotonic fluids (D5 0.45NS or D5 0.2NS)\n• Target 48–72h correction\n• Current Na: ${naLevel} mEq/L → ${naLevel > 150 ? "HYPERNATREMIC — slow correction" : naLevel < 130 ? "HYPONATREMIC — careful correction" : "Isonatremic — standard"}`} />
        </div>
      )}

      {/* ═══ CALCULATOR TAB ═══ */}
      {tab === "calc" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <CalcCard title="Maintenance (Holliday-Segar)" results={[
            { label: "Hourly Rate", value: `${maint.hourly} mL/hr`, color: "#10b981" },
            { label: "Daily Volume", value: `${maint.daily} mL/day`, color: "#10b981" },
            { label: "2/3 Maintenance", value: `${Math.round(maint.daily*2/3)} mL/day (${(maint.hourly*2/3).toFixed(1)} mL/hr)`, color: "#f59e0b" },
            { label: "1/2 Maintenance", value: `${Math.round(maint.daily/2)} mL/day (${(maint.hourly/2).toFixed(1)} mL/hr)`, color: "#f59e0b" },
            { label: "1.5× Maintenance", value: `${Math.round(maint.daily*1.5)} mL/day (${(maint.hourly*1.5).toFixed(1)} mL/hr)`, color: "#3b82f6" },
          ]} formula="4 mL/kg/hr (first 10 kg) + 2 mL/kg/hr (next 10 kg) + 1 mL/kg/hr (>20 kg)" />

          <CalcCard title="Bolus Resuscitation" results={[
            { label: "10 mL/kg bolus", value: `${Math.round(weight*10)} mL`, color: "#f59e0b" },
            { label: "20 mL/kg bolus", value: `${Math.round(weight*20)} mL`, color: "#ef4444" },
            { label: "Max before pressors (60)", value: `${Math.round(weight*60)} mL`, color: "#ef4444" },
          ]} formula="Isotonic crystalloid (NS or LR) over 5–20 min. Reassess after each bolus." />

          <CalcCard title="Dehydration Deficit" results={[
            { label: `${dehydPct}% deficit`, value: `${deficit} mL`, color: "#3b82f6" },
            { label: "First 8h (50% deficit + 1/3 maint)", value: `${Math.round((deficit/2 + maint.daily/3)/8)} mL/hr`, color: "#3b82f6" },
            { label: "Next 16h (50% deficit + 2/3 maint)", value: `${Math.round((deficit/2 + maint.daily*2/3)/16)} mL/hr`, color: "#3b82f6" },
          ]} formula={`Deficit (mL) = % dehydration × weight (kg) × 10`}>
            <NumInput label="Dehydration %" value={dehydPct} set={setDehydPct} min={1} max={15} step={1} />
          </CalcCard>

          <CalcCard title="DKA Protocol" results={[
            { label: "Initial bolus (10 mL/kg)", value: `${Math.round(weight*10)} mL NS`, color: "#f59e0b" },
            { label: "1.5× maintenance", value: `${Math.round(maint.daily*1.5)} mL/day (${(maint.hourly*1.5).toFixed(1)} mL/hr)`, color: "#8b5cf6" },
            { label: "Insulin (0.1 U/kg/hr)", value: `${(weight*0.1).toFixed(1)} units/hr`, color: "#8b5cf6" },
            { label: "Switch to dextrose when BG <300", value: "D5 or D10 + 0.45–0.9% NaCl", color: "#10b981" },
          ]} formula="Avoid >1.5× maint total (PECARN FLUID trial). Add K 20–40 mEq/L when K<5.5 and voiding." />

          <CalcCard title="Burns (Parkland)" results={[
            { label: `Total 24h (${burnPct}% TBSA)`, value: `${parkland} mL LR`, color: "#ef4444" },
            { label: "First 8h (50%)", value: `${Math.round(parkland/2)} mL (${Math.round(parkland/16)} mL/hr)`, color: "#ef4444" },
            { label: "Next 16h (50%)", value: `${Math.round(parkland/2)} mL (${Math.round(parkland/32)} mL/hr)`, color: "#f59e0b" },
            { label: "If <20 kg, add maintenance", value: `+${maint.daily} mL/day D5LR`, color: "#10b981" },
            { label: "UOP goal", value: "1–2 mL/kg/hr", color: "#3b82f6" },
          ]} formula="Parkland: 4 mL/kg × %TBSA. Half in first 8h FROM TIME OF BURN.">
            <NumInput label="% TBSA Burned" value={burnPct} set={setBurnPct} min={1} max={90} step={1} />
          </CalcCard>

          <CalcCard title="Fluid Restriction" results={[
            { label: `${fluidRestrict}% maintenance`, value: `${restrictedVol} mL/day`, color: "#f59e0b" },
            { label: "Hourly rate", value: `${restrictedRate} mL/hr`, color: "#f59e0b" },
          ]} formula="SIADH: 50–67%. Cardiac post-op: 50–75%. Renal: IWL + UOP.">
            <NumInput label="% of Maintenance" value={fluidRestrict} set={setFluidRestrict} min={25} max={200} step={5} />
          </CalcCard>

          <CalcCard title="Hypertonic Saline (3% NaCl)" results={[
            { label: "Seizure dose (3 mL/kg)", value: `${Math.round(weight*3)} mL over 10–20 min`, color: "#ef4444" },
            { label: "Slow correction (1 mL/kg/hr)", value: `${Math.round(weight)} mL/hr`, color: "#f59e0b" },
            { label: "Na in 3% NaCl", value: "513 mEq/L", color: "#8b5cf6" },
            { label: "Na rise per mL/kg", value: "~1 mEq/L per 1 mL/kg", color: "#8b5cf6" },
          ]} formula="Use ONLY for symptomatic hyponatremia (seizures, AMS). Max correction ≤8–10 mEq/L/24h." />

          <CalcCard title="Na Deficit / Free Water Deficit" results={[
            { label: "Na deficit (if hyponatremic)", value: `${Math.round(0.6 * weight * (140 - naLevel))} mEq`, color: "#3b82f6" },
            { label: "Free water deficit (if hypernatremic)", value: `${Math.round(0.6 * weight * ((naLevel/140) - 1) * 1000)} mL`, color: "#ef4444" },
          ]} formula="Na deficit = 0.6 × Wt × (140 − current Na). Free water deficit = 0.6 × Wt × [(Na/140) − 1]">
            <NumInput label="Serum Na (mEq/L)" value={naLevel} set={setNaLevel} min={110} max={180} step={1} />
          </CalcCard>
        </div>
      )}

      {/* ═══ DEHYDRATION TAB ═══ */}
      {tab === "dehydration" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {Object.entries(DEHYDRATION).map(([sev, d]) => (
              <div key={sev} style={{ background: sev === "severe" ? "rgba(239,68,68,0.06)" : sev === "moderate" ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.04)", border: `1px solid ${sev === "severe" ? "#ef444422" : sev === "moderate" ? "#f59e0b22" : "#10b98122"}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: sev === "severe" ? "#ef4444" : sev === "moderate" ? "#f59e0b" : "#10b981", textTransform: "capitalize", marginBottom: 4 }}>{sev} ({d.pct[0]}–{d.pct[1]}%)</div>
                <div style={{ fontSize: 10, color: "#8892a8", lineHeight: 1.6, marginBottom: 8 }}>{d.signs}</div>
                <div style={{ fontSize: 10, color: "#d4dce8", fontWeight: 600 }}>
                  Deficit: {d.pct[0]*weight*10}–{d.pct[1]*weight*10} mL
                </div>
              </div>
            ))}
          </div>

          <Panel title="WHO Rehydration Plans">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <PlanCard name="Plan A — Home" color="#10b981" text={`No dehydration / prevention.\n• Continue feeding\n• Extra fluids after each loose stool:\n  <2yr: 50–100 mL\n  2–10yr: 100–200 mL\n  >10yr: ad lib\n• ORS or home fluids`} />
              <PlanCard name="Plan B — ORT Clinic" color="#f59e0b" text={`Some dehydration (mild-moderate).\n• ORS 75 mL/kg over 4 hours\n• For ${weight} kg: ${Math.round(weight*75)} mL over 4h\n  = ${Math.round(weight*75/4)} mL/hr\n• Small frequent sips\n• Reassess at 4 hours\n• If improved → Plan A\n• If worse → Plan C`} />
              <PlanCard name="Plan C — IV Rehydration" color="#ef4444" text={`Severe dehydration.\n• NS or LR 20 mL/kg bolus → reassess\n• Then: 70 mL/kg over 5h (infants) or 3h (>12mo)\n• For ${weight} kg:\n  Bolus: ${Math.round(weight*20)} mL\n  Deficit: ${Math.round(weight*70)} mL over ${age.includes("mo") ? "5" : "3"}h\n  = ${Math.round(weight*70/(age.includes("mo") ? 5 : 3))} mL/hr\n• Add maintenance + ongoing losses`} />
            </div>
          </Panel>

          <Panel title="Correction by Sodium Type">
            <Row icon="Na =" label="Isonatremic (130–150)" text="Replace deficit over 24h with isotonic (D5NS). Standard protocol." color="#10b981" />
            <Row icon="Na ↓" label="Hyponatremic (<130)" text="Correct ≤8–10 mEq/L per 24h. Use isotonic fluids. If seizures → 3% NaCl 3–5 mL/kg over 10–20 min. Risk: osmotic demyelination with over-correction." color="#3b82f6" />
            <Row icon="Na ↑" label="Hypernatremic (>150)" text="Correct ≤0.5 mEq/L per hour (≤10–12 per 24h). Use D5 0.45NS or D5 0.2NS. Target 48–72h total correction. Risk: cerebral edema with rapid correction. Check Na q4–6h." color="#ef4444" />
          </Panel>

          {/* Maintenance chart by weight */}
          <Panel title="Holliday-Segar Maintenance Rate by Weight">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={Array.from({length: 25}, (_, i) => { const w = (i+1)*2; const m = calcMaintenance(w); return { weight: w, rate: m.hourly, daily: m.daily }; })} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" />
                <XAxis dataKey="weight" stroke="#3b4a63" tick={{ fontSize: 10, fill: "#5a6b82" }} label={{ value: "Weight (kg)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#5a6b82" }} />
                <YAxis stroke="#3b4a63" tick={{ fontSize: 10, fill: "#5a6b82" }} label={{ value: "mL/hr", angle: -90, position: "insideLeft", fontSize: 10, fill: "#5a6b82" }} />
                <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid #1a2236", borderRadius: 8, fontSize: 10, color: "#d4dce8" }} formatter={(v,n) => [n === "rate" ? `${v} mL/hr` : `${v} mL/day`, n === "rate" ? "Hourly" : "Daily"]} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <ReferenceLine x={weight} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: `${weight}kg`, fontSize: 9, fill: "#f59e0b" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      )}

      {/* ═══ SPECIAL POPULATIONS TAB ═══ */}
      {tab === "special" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SpecialCard title="DKA (Diabetic Ketoacidosis)" color="#8b5cf6" sections={[
            { h: "Initial Resuscitation", t: `NS 10–20 mL/kg bolus (${Math.round(weight*10)}–${Math.round(weight*20)} mL) ONLY if hemodynamically compromised. Avoid >40 mL/kg total bolus.` },
            { h: "Maintenance + Deficit", t: `1–1.5× maintenance = ${Math.round(maint.daily)}–${Math.round(maint.daily*1.5)} mL/day. Replace deficit evenly over 24–48h. Use NS initially; switch to 0.45–0.9% NaCl + dextrose when BG <250–300 mg/dL.` },
            { h: "Two-Bag System", t: "Bag 1: NS + KCl (no dextrose). Bag 2: D10 + NS + KCl. Titrate ratio to maintain BG 150–250 while continuing insulin." },
            { h: "Potassium", t: "Add K 20–40 mEq/L when K<5.5 and urinating. Use KCl + KPhos (half/half). If K<3.5, hold insulin until K repleted." },
            { h: "Cerebral Edema Red Flags", t: "Altered mental status, headache, bradycardia, hypertension, pupil changes, posturing. Treat with: Mannitol 0.5–1 g/kg IV OR 3% NaCl 5 mL/kg over 5 min. Elevate HOB 30°." },
            { h: "PECARN FLUID Trial (2018)", t: "No difference in neurologic outcomes between 0.45% vs 0.9% NaCl or rapid vs slow rehydration in pediatric DKA. Supports either approach. PMID: 29897851." },
          ]} />

          <SpecialCard title="Neurosurgical: SIADH vs CSW" color="#3b82f6" sections={[
            { h: "SIADH (Syndrome of Inappropriate ADH)", t: `RESTRICT fluids to 50–67% maintenance = ${Math.round(maint.daily*0.5)}–${Math.round(maint.daily*0.67)} mL/day. Use concentrated fluids (D10NS). Labs: low serum osm (<280), high urine osm (>100), high urine Na (>40), euvolemic.` },
            { h: "Cerebral Salt Wasting (CSW)", t: `EXPAND volume with NS — DO NOT restrict. Labs similar to SIADH but patient is HYPOVOLEMIC. Distinguish by: volume status (CVP low), uric acid (low in CSW, normal in SIADH), fluid balance (negative in CSW).` },
            { h: "Key Difference", t: "SIADH = euvolemic → RESTRICT. CSW = hypovolemic → REPLACE. Getting this wrong is dangerous. If uncertain, start with cautious NS and monitor." },
            { h: "3% NaCl for Seizures", t: `${Math.round(weight*3)}–${Math.round(weight*5)} mL (3–5 mL/kg) over 10–20 min. May repeat once. Max correction ≤8–10 mEq/L per 24h.` },
          ]} />

          <SpecialCard title="Post-Cardiac Surgery" color="#ef4444" sections={[
            { h: "Fluid Restriction", t: `50–75% maintenance for first 24–48h post-bypass = ${Math.round(maint.daily*0.5)}–${Math.round(maint.daily*0.75)} mL/day (${(maint.hourly*0.5).toFixed(1)}–${(maint.hourly*0.75).toFixed(1)} mL/hr).` },
            { h: "Rationale", t: "Capillary leak syndrome post-cardiopulmonary bypass → fluid shifts to interstitium → edema. Excessive fluid worsens pulmonary edema, myocardial edema, and organ function." },
            { h: "Monitoring", t: "Strict I&O, daily weights, CVP, echocardiographic assessment. Diuretics (furosemide 1 mg/kg q6–12h) when hemodynamically stable. Target net negative fluid balance by Day 2–3." },
            { h: "Fluid Choice", t: "D10 0.45NS or D10NS (concentrated dextrose for caloric support in restricted volume). Colloid (5% albumin) for persistent hypotension unresponsive to crystalloid." },
          ]} />

          <SpecialCard title="Burns" color="#f97316" sections={[
            { h: "Parkland Formula", t: `4 mL/kg × %TBSA = 4 × ${weight} × ${burnPct} = ${parkland} mL LR over 24h.\nFirst 8h (from burn time): ${Math.round(parkland/2)} mL (${Math.round(parkland/16)} mL/hr)\nNext 16h: ${Math.round(parkland/2)} mL (${Math.round(parkland/32)} mL/hr)` },
            { h: "Pediatric Modification", t: `Children <20 kg: Add maintenance D5LR alongside Parkland.\nTotal = Parkland ${parkland} mL + Maintenance ${maint.daily} mL = ${parkland + maint.daily} mL/day` },
            { h: "Galveston Alternative", t: `5000 mL/m² burned + 2000 mL/m² total BSA. BSA = ${bsa} m². Burned BSA = ${(bsa * burnPct / 100).toFixed(2)} m².\nTotal = ${Math.round(5000*(bsa*burnPct/100) + 2000*bsa)} mL/day` },
            { h: "Titrate to UOP", t: "Goal: 1–2 mL/kg/hr (higher than adults). Avoid fluid creep (over-resuscitation → compartment syndrome, pulmonary edema). Consider albumin after 12–24h if large burns." },
          ]} />

          <SpecialCard title="Renal Disease / Nephrotic Syndrome" color="#06b6d4" sections={[
            { h: "Nephrotic Syndrome", t: "AVOID aggressive IVF — third-spacing worsens edema. For symptomatic edema: 25% albumin 0.5–1 g/kg IV over 2–4h THEN furosemide 1–2 mg/kg IV. Albumin without diuretic risks pulmonary edema." },
            { h: "Acute Kidney Injury (AKI)", t: `Restrict to insensible losses + UOP replacement. Insensible = ~400 mL/m²/day = ${Math.round(400*bsa)} mL/day. Add measured UOP. Avoid K⁺ in fluids. Use D10W or D10 0.2NS.` },
            { h: "CKD (Chronic)", t: "Individualize based on GFR, volume status, and electrolytes. Avoid NS in hyperchloremic acidosis (use LR or bicarb). Restrict K⁺, phosphorus in advanced CKD." },
            { h: "Dialysis Patients", t: "Peritoneal dialysis: account for dwell volumes. Hemodialysis: restrict interdialytic fluid gain to <3–5% dry weight." },
          ]} />
        </div>
      )}

      {/* ═══ FLUID COMPOSITION TAB ═══ */}
      {tab === "fluids" && (
        <div>
          <Panel title="IV Fluid Composition Comparison">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr>{["Fluid","Na⁺","Cl⁻","K⁺","Ca²⁺","Lactate","Osm","pH","Dex%","Tonicity"].map((h,i) => (
                    <th key={i} style={{ padding: "6px 6px", background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontWeight: 600, textAlign: "left", borderBottom: "1px solid #1a2236", whiteSpace: "nowrap" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {Object.values(IV_FLUIDS).map((f, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(15,23,42,0.3)" }}>
                      <td style={{ padding: "5px 6px", color: "#d4dce8", fontWeight: 600, borderBottom: "1px solid #111827", whiteSpace: "nowrap" }}>{f.name}</td>
                      {[f.na, f.cl, f.k, f.ca, f.lactate, f.osm, f.ph, f.dex, f.tonic].map((v, j) => (
                        <td key={j} style={{ padding: "5px 6px", color: "#8892a8", borderBottom: "1px solid #111827" }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 9, color: "#3b4a63", marginTop: 8 }}>All concentrations in mEq/L except osmolarity (mOsm/L) and dextrose (%). Units: Na⁺, Cl⁻, K⁺ in mEq/L; Ca²⁺ in mEq/L.</div>
          </Panel>

          {/* Sodium content bar chart */}
          <Panel title="Sodium Content by Fluid Type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Object.entries(IV_FLUIDS).map(([k,v]) => ({ name: k, na: v.na }))} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" />
                <XAxis dataKey="name" stroke="#3b4a63" tick={{ fontSize: 8, fill: "#5a6b82", angle: -30, textAnchor: "end" }} height={50} />
                <YAxis stroke="#3b4a63" tick={{ fontSize: 10, fill: "#5a6b82" }} label={{ value: "Na⁺ (mEq/L)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#5a6b82" }} />
                <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid #1a2236", borderRadius: 8, fontSize: 10, color: "#d4dce8" }} />
                <ReferenceLine y={154} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Isotonic (154)", fontSize: 9, fill: "#10b981" }} />
                <Bar dataKey="na" radius={[4,4,0,0]}>
                  {Object.values(IV_FLUIDS).map((f, i) => (
                    <Cell key={i} fill={f.na > 200 ? "#ef4444" : f.na >= 130 ? "#10b981" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="AAP 2018 Key Action Statements">
            <KAS num="1" grade="B" rec="Patients 28 days to 18 years requiring maintenance IVF should receive ISOTONIC solutions with appropriate KCl and dextrose." detail="Strong recommendation. Isotonic = 0.9% NaCl (NS) or balanced crystalloid (LR, Plasma-Lyte). Prevents hospital-acquired hyponatremia." />
            <KAS num="2" grade="X" rec="Clinicians should MONITOR serum sodium, potassium, glucose, creatinine, and urine output for patients on maintenance IVF." detail="Moderate recommendation. Check BMP within 24h of starting IVF. More frequent if risk factors for electrolyte disturbance." />
            <KAS num="3" grade="B" rec="Add 5% DEXTROSE to isotonic maintenance fluids." detail="Recommendation. D5NS or D5LR provides ~170 kcal/L (prevents catabolism and ketosis). Infants <6 months and malnourished children at higher risk for hypoglycemia." />
          </Panel>
        </div>
      )}

      {/* ═══ REFERENCE TAB ═══ */}
      {tab === "ref" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="Perioperative Fluid Protocol">
            <div style={{ fontSize: 11, color: "#8892a8", lineHeight: 1.8 }}>
              <div><strong style={{ color: "#d4dce8" }}>NPO Deficit:</strong> Maintenance rate × hours NPO = {maint.hourly} × ___ hrs = ___ mL</div>
              <div><strong style={{ color: "#d4dce8" }}>Replacement:</strong> 50% deficit in 1st hour, 25% in 2nd, 25% in 3rd</div>
              <div><strong style={{ color: "#d4dce8" }}>Intraop maintenance:</strong> D5LR or LR at 2/3–full maintenance ({(maint.hourly*2/3).toFixed(1)}–{maint.hourly} mL/hr)</div>
              <div><strong style={{ color: "#d4dce8" }}>Third-space losses:</strong> Minor surgery 2–4 mL/kg/hr, moderate 4–6, major 6–10</div>
              <div><strong style={{ color: "#d4dce8" }}>Blood loss replacement:</strong> Crystalloid 3:1 or colloid 1:1 ratio to estimated blood loss</div>
              <div><strong style={{ color: "#d4dce8" }}>Post-op:</strong> D5NS + KCl 20 mEq/L at maintenance rate. Monitor glucose, Na q6–12h</div>
            </div>
          </Panel>

          <Panel title="Key Evidence & References">
            <Ref n={1} t="Feld LG et al. Clinical Practice Guideline: Maintenance Intravenous Fluids in Children. Pediatrics 2018;142(6):e20183083. PMID: 30478247" />
            <Ref n={2} t="Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics 1957;19:823-832. PMID: 13431307" />
            <Ref n={3} t="Weiss SL et al. Surviving Sepsis Campaign International Guidelines for Management of Septic Shock in Children. Pediatr Crit Care Med 2020;21(2):e52-e106. PMID: 32032273" />
            <Ref n={4} t="Maitland K et al. Mortality after Fluid Bolus in African Children with Severe Infection (FEAST). NEJM 2011;364(26):2483-95. PMID: 21615299" />
            <Ref n={5} t="Kuppermann N et al. Clinical Trial of Fluid Infusion Rates for Pediatric DKA (PECARN FLUID). NEJM 2018;378(24):2275-2287. PMID: 29897851" />
            <Ref n={6} t="Wolfsdorf JI et al. ISPAD 2022 Consensus Guidelines for DKA Management. Pediatr Diabetes 2022;23:1109-1131. PMID: 36537527" />
            <Ref n={7} t="McNab S et al. 140 mmol/L of sodium versus 77 mmol/L of sodium in maintenance IVF (PIMS). Lancet 2015;385:1190-7. PMID: 25472865" />
            <Ref n={8} t="Choong K et al. Hypotonic versus isotonic saline in hospitalized children (HALFPINT). Lancet 2011;378:1132-8. PMID: 21921926" />
            <Ref n={9} t="Self WH et al. Balanced Crystalloids vs Saline in Noncritically Ill Adults (SALT-ED). NEJM 2018;378:819-828. PMID: 29485926" />
            <Ref n={10} t="Moritz ML, Ayus JC. Prevention of hospital-acquired hyponatremia: a case for using isotonic saline. Pediatrics 2003;111(2):227-30. PMID: 12563043" />
            <Ref n={11} t="American Burn Association. Practice Guidelines for Burn Care. J Burn Care Res 2019." />
            <Ref n={12} t="Greenbaum LA. Maintenance and Replacement Therapy. In: Nelson Textbook of Pediatrics, 21st ed. Ch 68." />
          </Panel>

          <Panel title="Monitoring Checklist">
            <div style={{ fontSize: 11, color: "#8892a8", lineHeight: 1.8 }}>
              <div>☐ BMP (Na, K, Cl, CO₂, BUN, Cr, Glucose) within 24h of starting IVF</div>
              <div>☐ Repeat BMP q12–24h while on IVF (q4–6h for DKA, hyper/hyponatremia)</div>
              <div>☐ Strict I&O documented q shift</div>
              <div>☐ Daily weight (same scale, same time, minimal clothing)</div>
              <div>☐ UOP goal: 1–2 mL/kg/hr (0.5 mL/kg/hr minimum)</div>
              <div>☐ Urine specific gravity if available</div>
              <div>☐ Reassess fluid plan with every clinical change</div>
              <div>☐ Transition to PO as soon as clinically appropriate</div>
              <div>☐ Signs of overload: weight gain &gt;5%, edema, rales, hepatomegaly, JVD</div>
              <div>☐ Signs of dehydration: weight loss, decreased UOP, dry MM, tachycardia</div>
            </div>
          </Panel>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 9, color: "#2a3548" }}>
        Pediatric IVF Decision Tree v1.0 — AAP 2018 Guideline-Based — For educational and clinical reference only — Not a substitute for clinical judgment
      </div>
    </div>
  );
}

// ════════ SUB-COMPONENTS ════════

const selStyle = { width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid #1a2236", background: "#0a0f1e", color: "#d4dce8", fontSize: 12 };

function Lbl({ children }) { return <label style={{ fontSize: 9, color: "#5a6b82", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 3 }}>{children}</label>; }

function NumInput({ label, value, set, min, max, step }) {
  return (<div><Lbl>{label}</Lbl><input type="number" value={value} min={min} max={max} step={step} onChange={e => set(Number(e.target.value))} style={{ width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid #1a2236", background: "#0a0f1e", color: "#d4dce8", fontSize: 13, fontWeight: 500, boxSizing: "border-box" }} /></div>);
}

function Pill({ children, color }) {
  return <span style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${color}33`, background: `${color}10`, color, fontSize: 10, fontWeight: 600 }}>{children}</span>;
}

function Panel({ title, children }) {
  return (<div style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 14 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: "#e8edf5", margin: "0 0 10px" }}>{title}</h3>{children}</div>);
}

const typeColors = { assess: "#3b82f6", decide: "#8b5cf6", treat: "#10b981", escalate: "#f59e0b", wean: "#06b6d4", adjunct: "#f97316" };

function PathNode({ type, title, sub, detail }) {
  const c = typeColors[type] || "#3b82f6";
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => detail && setOpen(!open)} style={{ background: `${c}08`, border: `1px solid ${c}22`, borderRadius: 8, padding: "10px 12px", cursor: detail ? "pointer" : "default", transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 8, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.08em", background: `${c}18`, padding: "1px 6px", borderRadius: 3, marginRight: 8 }}>{type}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e8edf5" }}>{title}</span>
        </div>
        {detail && <span style={{ fontSize: 10, color: "#5a6b82" }}>{open ? "▾" : "▸"}</span>}
      </div>
      <div style={{ fontSize: 10, color: "#6b7a94", marginTop: 3 }}>{sub}</div>
      {open && detail && <div style={{ marginTop: 8, padding: 10, background: "rgba(0,0,0,0.2)", borderRadius: 6, fontSize: 10, color: "#8892a8", lineHeight: 1.7, whiteSpace: "pre-line" }}>{detail}</div>}
    </div>
  );
}

function MiniNode({ type, title, sub }) {
  const c = typeColors[type] || "#f97316";
  return (<div style={{ background: `${c}08`, border: `1px solid ${c}22`, borderRadius: 6, padding: "6px 10px", flex: "1 1 80px", minWidth: 80 }}><div style={{ fontSize: 10, fontWeight: 600, color: c }}>{title}</div><div style={{ fontSize: 8, color: "#5a6b82" }}>{sub}</div></div>);
}

function CalcCard({ title, results, formula, children }) {
  return (
    <div style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 14 }}>
      <h4 style={{ fontSize: 12, fontWeight: 600, color: "#e8edf5", margin: "0 0 8px" }}>{title}</h4>
      {children && <div style={{ marginBottom: 8 }}>{children}</div>}
      {results.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < results.length - 1 ? "1px solid #111827" : "none" }}>
          <span style={{ fontSize: 10, color: "#6b7a94" }}>{r.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.value}</span>
        </div>
      ))}
      {formula && <div style={{ marginTop: 8, fontSize: 9, color: "#3b4a63", fontStyle: "italic" }}>{formula}</div>}
    </div>
  );
}

function SpecialCard({ title, color, sections }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: `${color}06`, border: `1px solid ${color}22`, borderRadius: 10, padding: 14 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color, margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 12, color: "#5a6b82" }}>{open ? "▾" : "▸"}</span>
      </div>
      {open && sections.map((s, i) => (
        <div key={i} style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#d4dce8", marginBottom: 3 }}>{s.h}</div>
          <div style={{ fontSize: 10, color: "#8892a8", lineHeight: 1.6, whiteSpace: "pre-line" }}>{s.t}</div>
        </div>
      ))}
      {!open && <div style={{ fontSize: 10, color: "#5a6b82", marginTop: 4 }}>Click to expand {sections.length} protocols</div>}
    </div>
  );
}

function PlanCard({ name, color, text }) {
  return (<div style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, padding: 12 }}><div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{name}</div><div style={{ fontSize: 10, color: "#8892a8", lineHeight: 1.6, whiteSpace: "pre-line" }}>{text}</div></div>);
}

function Row({ icon, label, text, color }) {
  return (<div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #141d2e" }}><div style={{ width: 32, height: 32, borderRadius: 6, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>{icon}</div><div><div style={{ fontSize: 11, fontWeight: 600, color: "#d4dce8" }}>{label}</div><div style={{ fontSize: 10, color: "#8892a8", marginTop: 2, lineHeight: 1.5 }}>{text}</div></div></div>);
}

function KAS({ num, grade, rec, detail }) {
  return (<div style={{ padding: "10px 0", borderBottom: "1px solid #141d2e" }}><div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa", background: "rgba(59,130,246,0.15)", padding: "1px 6px", borderRadius: 3 }}>KAS {num}</span><span style={{ fontSize: 9, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "1px 6px", borderRadius: 3 }}>Grade {grade}</span></div><div style={{ fontSize: 11, fontWeight: 600, color: "#d4dce8", marginBottom: 3 }}>{rec}</div><div style={{ fontSize: 10, color: "#6b7a94" }}>{detail}</div></div>);
}

function Ref({ n, t }) {
  return <div style={{ fontSize: 10, color: "#6b7a94", padding: "3px 0", lineHeight: 1.5 }}><span style={{ color: "#60a5fa", fontWeight: 600 }}>[{n}]</span> {t}</div>;
}
