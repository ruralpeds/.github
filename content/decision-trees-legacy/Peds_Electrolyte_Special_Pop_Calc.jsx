import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LineChart, Line } from "recharts";

// ════════════════════════════════════════════════════════════
// CLINICAL CONSTANTS
// ════════════════════════════════════════════════════════════

const NA_NORMAL = [135, 145];
const K_NORMAL = [3.5, 5.0];
const CA_IONIZED_NORMAL = [1.1, 1.35]; // mmol/L
const CA_TOTAL_NORMAL = [8.5, 10.5]; // mg/dL
const MG_NORMAL = [1.5, 2.5]; // mg/dL
const PHOS_NORMAL_CHILD = [3.5, 5.5]; // mg/dL (varies by age)
const PHOS_NORMAL_INFANT = [4.5, 6.5];

function calcMaint(wt) {
  if (wt <= 0) return { hr: 0, day: 0 };
  let d = wt <= 10 ? wt*100 : wt <= 20 ? 1000+(wt-10)*50 : 1500+(wt-20)*20;
  return { hr: Math.round((d/24)*10)/10, day: Math.round(d) };
}

function statusOf(val, lo, hi) {
  if (val < lo) return "low";
  if (val > hi) return "high";
  return "normal";
}

const statusColors = { low: "#3b82f6", high: "#ef4444", normal: "#10b981", critical: "#ef4444", caution: "#f59e0b" };

export default function ElectrolyteCalc() {
  const [tab, setTab] = useState("sodium");
  const [wt, setWt] = useState(15);
  const [ht, setHt] = useState(100);
  const [age, setAge] = useState("child"); // infant, child, adolescent

  // Sodium
  const [serumNa, setSerumNa] = useState(128);
  const [targetNa, setTargetNa] = useState(140);
  const [albumin, setAlbumin] = useState(4.0);

  // Potassium
  const [serumK, setSerumK] = useState(2.8);

  // Calcium
  const [totalCa, setTotalCa] = useState(7.0);
  const [ionizedCa, setIonizedCa] = useState(0.9);

  // Magnesium
  const [serumMg, setSerumMg] = useState(1.0);

  // Phosphorus
  const [serumPhos, setSerumPhos] = useState(2.0);

  // DKA
  const [dkaPH, setDkaPH] = useState(7.15);
  const [dkaBG, setDkaBG] = useState(450);
  const [dkaK, setDkaK] = useState(4.5);

  // Burns
  const [burnTBSA, setBurnTBSA] = useState(25);
  const [burnHrs, setBurnHrs] = useState(2);

  const maint = useMemo(() => calcMaint(wt), [wt]);
  const bsa = useMemo(() => wt > 0 && ht > 0 ? Math.round(Math.sqrt(wt*ht/3600)*100)/100 : 0, [wt, ht]);

  const tabs = [
    { id: "sodium", label: "Na⁺", icon: "🧂", color: "#3b82f6" },
    { id: "potassium", label: "K⁺", icon: "⚡", color: "#f59e0b" },
    { id: "calcium", label: "Ca²⁺", icon: "🦴", color: "#10b981" },
    { id: "magnesium", label: "Mg²⁺", icon: "💎", color: "#8b5cf6" },
    { id: "phosphorus", label: "PO₄", icon: "🔋", color: "#06b6d4" },
    { id: "dka", label: "DKA", icon: "🩸", color: "#ef4444" },
    { id: "burns", label: "Burns", icon: "🔥", color: "#f97316" },
    { id: "special", label: "Special", icon: "⭐", color: "#ec4899" },
  ];

  // ═══ SODIUM CALCULATIONS ═══
  const naStatus = serumNa < 120 ? "critical" : serumNa < 130 ? "low" : serumNa > 150 ? "high" : serumNa > 155 ? "critical" : "normal";
  const naDeficit = Math.round(0.6 * wt * (targetNa - serumNa));
  const freeWaterDeficit = serumNa > 145 ? Math.round(0.6 * wt * ((serumNa / 140) - 1) * 1000) : 0;
  const hts3Dose = Math.round(wt * 3); // 3 mL/kg for seizures
  const hts3Raise = Math.round((hts3Dose * 513) / (0.6 * wt * 1000)); // Na rise estimate
  const nsToCorrect = naDeficit > 0 ? Math.round(naDeficit / 0.154) : 0; // mL of NS needed (154 mEq/L)
  const maxCorrection24h = serumNa < 130 ? 10 : 12; // mEq/L in 24h
  const correctionTime = serumNa > 150 ? "48–72 hours" : serumNa < 120 ? "Monitor q2h" : "24 hours";
  const correctedNaAlb = totalCa > 0 ? Math.round((totalCa + 0.8 * (4.0 - albumin))*10)/10 : totalCa;

  // ═══ POTASSIUM CALCULATIONS ═══
  const kStatus = serumK < 2.5 ? "critical" : serumK < 3.5 ? "low" : serumK > 6.0 ? "critical" : serumK > 5.0 ? "high" : "normal";
  const kDeficit = serumK < 3.5 ? Math.round((3.5 - serumK) * wt * 0.4 * 10) / 10 : 0; // rough estimate
  const kMaintenance = Math.round(wt * 2 * 10) / 10; // 2 mEq/kg/day
  const kMaxPeriphRate = 0.5; // mEq/kg/hr max
  const kMaxPeriphConc = 40; // mEq/L peripheral
  const kIVDose = serumK < 2.5 ? 1 : serumK < 3.0 ? 0.5 : 0.3; // mEq/kg bolus
  const kIVTotal = Math.round(kIVDose * wt * 10) / 10;

  // ═══ CALCIUM CALCULATIONS ═══
  const caStatus = ionizedCa < 0.9 ? "critical" : ionizedCa < 1.1 ? "low" : ionizedCa > 1.4 ? "high" : "normal";
  const correctedCa = Math.round((totalCa + 0.8 * (4.0 - albumin)) * 10) / 10;
  const caGlucDose = Math.round(wt * 100); // 100 mg/kg Ca gluconate (= ~9.3 mg/kg elemental Ca)
  const caGlucVol = Math.round(caGlucDose / 100 * 10) / 10; // mL of 10% Ca gluconate (100 mg/mL)
  const caClDose = Math.round(wt * 20); // 20 mg/kg CaCl2 (= ~6.8 mg/kg elemental Ca)
  const caClVol = Math.round(caClDose / 100 * 10) / 10; // mL of 10% CaCl2

  // ═══ MAGNESIUM CALCULATIONS ═══
  const mgStatus = serumMg < 1.0 ? "critical" : serumMg < 1.5 ? "low" : serumMg > 2.5 ? "high" : "normal";
  const mgDose = Math.round(wt * 25); // 25-50 mg/kg MgSO4
  const mgDoseHigh = Math.round(wt * 50);
  const mgVol = Math.round(mgDose / 500 * 10) / 10; // mL of 50% MgSO4 (500 mg/mL)
  const mgVolHigh = Math.round(mgDoseHigh / 500 * 10) / 10;
  const mgMaxRate = Math.round(wt * 0.15 * 10) / 10; // 150 mg/kg/hr max (0.15 mL/kg/hr of 50%)

  // ═══ PHOSPHORUS CALCULATIONS ═══
  const phosNormal = age === "infant" ? PHOS_NORMAL_INFANT : PHOS_NORMAL_CHILD;
  const phosStatus = serumPhos < 1.0 ? "critical" : serumPhos < phosNormal[0] ? "low" : serumPhos > phosNormal[1] ? "high" : "normal";
  const phosDose = serumPhos < 1.5 ? 0.36 : serumPhos < 2.3 ? 0.24 : 0.16; // mmol/kg
  const phosTotal = Math.round(phosDose * wt * 100) / 100;
  const naPhosVol = Math.round(phosTotal / 3 * 10) / 10; // Na-Phos = 3 mmol Phos/mL
  const kPhosVol = Math.round(phosTotal / 3 * 10) / 10; // K-Phos = 3 mmol Phos/mL (also 4.4 mEq K/mL)

  // ═══ DKA CALCULATIONS ═══
  const dkaSeverity = dkaPH < 7.1 ? "Severe" : dkaPH < 7.2 ? "Moderate" : "Mild";
  const dkaBolus = Math.round(wt * 10);
  const dkaFluidRate = Math.round(maint.hr * 1.5 * 10) / 10;
  const dkaInsulin = Math.round(wt * 0.1 * 10) / 10;
  const dkaKReplacement = dkaK < 3.5 ? "HOLD INSULIN. Replace K aggressively: 40 mEq/L in IVF" : dkaK < 5.5 ? "Add KCl 20 mEq/L + KPhos 20 mEq/L" : "Withhold K. Recheck in 2h.";
  const correctedNaDKA = Math.round((serumNa + 1.6 * ((dkaBG - 100) / 100)) * 10) / 10;

  // ═══ BURNS CALCULATIONS ═══
  const parkland24 = Math.round(4 * wt * burnTBSA);
  const alreadyGiven = Math.round(parkland24 / 2 * (burnHrs / 8));
  const remaining8h = Math.round(parkland24 / 2 - alreadyGiven);
  const remaining16h = Math.round(parkland24 / 2);
  const galveston = Math.round(5000 * (bsa * burnTBSA / 100) + 2000 * bsa);
  const uopGoal = `${Math.round(wt * 1)}–${Math.round(wt * 2)} mL/hr`;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #06090f 0%, #0c1220 50%, #080c16 100%)", color: "#d4dce8", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#e8edf5", margin: 0 }}>Electrolyte Corrections & Special Population IVF</h1>
        <p style={{ fontSize: 10, color: "#4b5a70", margin: "3px 0 0" }}>Interactive Calculators — Pediatric (1 mo – 18 yr) — Weight-Based Dosing</p>
      </div>

      {/* Patient Inputs */}
      <div style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
          <Inp label="Weight (kg)" val={wt} set={setWt} min={2} max={120} step={0.5} />
          <Inp label="Height (cm)" val={ht} set={setHt} min={40} max={200} step={1} />
          <div>
            <L>Age Group</L>
            <select value={age} onChange={e => setAge(e.target.value)} style={sel}>
              <option value="infant">Infant (1–12 mo)</option>
              <option value="child">Child (1–12 yr)</option>
              <option value="adolescent">Adolescent (13–18 yr)</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <P c="#10b981">Maint: {maint.hr} mL/hr ({maint.day} mL/day)</P>
          <P c="#3b82f6">BSA: {bsa} m²</P>
          <P c="#8b5cf6">{wt} kg</P>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "5px 10px", borderRadius: 6, border: `1px solid ${tab === t.id ? t.color : "#1a2236"}`,
            background: tab === t.id ? `${t.color}15` : "rgba(10,15,30,0.7)",
            color: tab === t.id ? t.color : "#4b5a70", fontSize: 10, fontWeight: 600, cursor: "pointer",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ═══ SODIUM ═══ */}
      {tab === "sodium" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            <Inp label="Serum Na (mEq/L)" val={serumNa} set={setSerumNa} min={100} max={180} step={1} />
            <Inp label="Target Na (mEq/L)" val={targetNa} set={setTargetNa} min={130} max={150} step={1} />
            <Inp label="Albumin (g/dL)" val={albumin} set={setAlbumin} min={1} max={5} step={0.1} />
          </div>

          <StatusBar label="Serum Na⁺" value={`${serumNa} mEq/L`} status={naStatus} normal="135–145 mEq/L" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {serumNa < 135 && (
              <Card title="Hyponatremia Correction" color="#3b82f6" rows={[
                ["Na deficit", `${naDeficit} mEq`, naDeficit > 0 ? "#3b82f6" : "#10b981"],
                ["NS to correct (154 mEq/L)", `${nsToCorrect} mL`, "#3b82f6"],
                ["3% NaCl to correct (513 mEq/L)", `${Math.round(naDeficit / 0.513)} mL`, "#8b5cf6"],
                ["Max correction/24h", `${maxCorrection24h} mEq/L`, "#ef4444"],
                ["Check Na every", correctionTime === "Monitor q2h" ? "2 hours" : "4–6 hours", "#f59e0b"],
              ]} note="Formula: Na deficit = 0.6 × Wt × (Target Na − Current Na)" />
            )}

            {serumNa <= 120 && (
              <Card title="⚠️ SYMPTOMATIC HYPONATREMIA — EMERGENCY" color="#ef4444" rows={[
                ["3% NaCl seizure dose (3 mL/kg)", `${hts3Dose} mL over 10–20 min`, "#ef4444"],
                ["Max dose (5 mL/kg)", `${Math.round(wt*5)} mL`, "#ef4444"],
                ["Expected Na rise", `~${hts3Raise} mEq/L per dose`, "#f59e0b"],
                ["May repeat ×1", "If seizures persist", "#f59e0b"],
                ["TOTAL correction ≤8–10 mEq/24h", "Risk: osmotic demyelination", "#ef4444"],
              ]} note="3% NaCl contains 513 mEq/L Na. Can give via PERIPHERAL IV for emergencies." />
            )}

            {serumNa > 150 && (
              <Card title="Hypernatremia Correction" color="#ef4444" rows={[
                ["Free water deficit", `${freeWaterDeficit} mL`, "#ef4444"],
                ["Correction rate", "≤0.5 mEq/L per HOUR", "#ef4444"],
                ["Max correction/24h", "10–12 mEq/L", "#ef4444"],
                ["Total correction time", "48–72 hours", "#f59e0b"],
                ["Fluid choice", "D5 0.45NS or D5 0.2NS", "#3b82f6"],
                ["Check Na", "Every 4–6 hours", "#f59e0b"],
              ]} note="Formula: FWD (mL) = 0.6 × Wt × [(Na/140) − 1] × 1000. Risk: cerebral edema with rapid correction." />
            )}

            <Card title="Na Correction Rate Tracker" color="#8b5cf6" rows={[
              ["Current Na", `${serumNa} mEq/L`, naStatus === "normal" ? "#10b981" : "#f59e0b"],
              ["Target Na", `${targetNa} mEq/L`, "#10b981"],
              ["Difference", `${Math.abs(targetNa - serumNa)} mEq/L`, "#3b82f6"],
              ["Safe 24h correction", `${serumNa < 135 ? "≤8–10" : serumNa > 150 ? "≤10–12" : "N/A"} mEq/L`, "#ef4444"],
              ["Safe hourly rate", `${serumNa > 150 ? "≤0.5" : serumNa < 120 ? "1–2 (acute)" : "≤0.5"} mEq/L/hr`, "#ef4444"],
            ]} note={serumNa < 130 ? "CHRONIC hyponatremia (>48h or unknown): correct SLOWLY. ACUTE (<48h): can correct faster initially." : serumNa > 150 ? "Brain generates idiogenic osmoles over 24–36h. These take DAYS to dissipate — rapid correction → cerebral edema." : "Na is within or near normal range."} />

            <EduPanel title="SIADH vs CSW Quick Reference" items={[
              "SIADH: Euvolemic + low Na → RESTRICT to 50–67% maintenance",
              `Restricted volume: ${Math.round(maint.day*0.5)}–${Math.round(maint.day*0.67)} mL/day`,
              "CSW: Hypovolemic + low Na → EXPAND with NS at 1.5–2× maint",
              `Expanded volume: ${Math.round(maint.day*1.5)}–${Math.round(maint.day*2)} mL/day`,
              "Best differentiator: FEurate normalizes in SIADH, stays elevated in CSW",
              "If uncertain → treat as CSW (safer to expand than restrict)",
            ]} />
          </div>

          {/* Na visualization */}
          <div style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 14 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: "#e8edf5", margin: "0 0 8px" }}>Serum Sodium Context</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={[
                { range: "<120", label: "Severe Hypo", color: "#ef4444" },
                { range: "120-129", label: "Moderate Hypo", color: "#f59e0b" },
                { range: "130-134", label: "Mild Hypo", color: "#3b82f6" },
                { range: "135-145", label: "Normal", color: "#10b981" },
                { range: "146-150", label: "Mild Hyper", color: "#f59e0b" },
                { range: "151-160", label: "Moderate Hyper", color: "#ef4444" },
                { range: ">160", label: "Severe Hyper", color: "#ef4444" },
              ].map(d => ({ ...d, val: 1 }))} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="range" tick={{ fontSize: 9, fill: "#6b7a94" }} width={55} />
                <Bar dataKey="val" radius={[0,4,4,0]}>
                  {[
                    { range: "<120", color: "#ef4444" },
                    { range: "120-129", color: "#f59e0b" },
                    { range: "130-134", color: "#3b82f6" },
                    { range: "135-145", color: "#10b981" },
                    { range: "146-150", color: "#f59e0b" },
                    { range: "151-160", color: "#ef4444" },
                    { range: ">160", color: "#ef4444" },
                  ].map((d, i) => <Cell key={i} fill={d.color} opacity={
                    (serumNa < 120 && d.range === "<120") || (serumNa >= 120 && serumNa <= 129 && d.range === "120-129") ||
                    (serumNa >= 130 && serumNa <= 134 && d.range === "130-134") || (serumNa >= 135 && serumNa <= 145 && d.range === "135-145") ||
                    (serumNa >= 146 && serumNa <= 150 && d.range === "146-150") || (serumNa >= 151 && serumNa <= 160 && d.range === "151-160") ||
                    (serumNa > 160 && d.range === ">160") ? 1 : 0.15
                  } />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ POTASSIUM ═══ */}
      {tab === "potassium" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp label="Serum K (mEq/L)" val={serumK} set={setSerumK} min={1} max={8} step={0.1} />
          <StatusBar label="Serum K⁺" value={`${serumK} mEq/L`} status={kStatus} normal="3.5–5.0 mEq/L" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {serumK < 3.5 && (
              <Card title="Hypokalemia Correction" color="#f59e0b" rows={[
                ["Estimated deficit", `${kDeficit} mEq (rough estimate)`, "#f59e0b"],
                ["IV KCl dose", `${kIVDose} mEq/kg = ${kIVTotal} mEq`, "#3b82f6"],
                ["Max peripheral conc", "40 mEq/L", "#ef4444"],
                ["Max central conc", "60–80 mEq/L (with monitoring)", "#ef4444"],
                ["Max infusion rate", `0.5 mEq/kg/hr = ${Math.round(wt*0.5*10)/10} mEq/hr`, "#ef4444"],
                ["Requires cardiac monitor", "YES — always for IV K⁺", "#ef4444"],
              ]} note="NEVER give K⁺ as IV push — cardiac arrest risk. Verify UOP before giving K⁺. Oral preferred when possible: 1–2 mEq/kg/dose PO." />
            )}

            {serumK > 5.5 && (
              <Card title="⚠️ Hyperkalemia Management" color="#ef4444" rows={[
                ["Calcium gluconate 10%", `${Math.round(wt*100)} mg = ${Math.round(wt)} mL over 3–5 min`, "#ef4444"],
                ["Purpose", "Cardiac membrane stabilization (does NOT lower K)", "#f59e0b"],
                ["Insulin + D25", `Regular insulin ${(wt*0.1).toFixed(1)} U + D25 ${Math.round(wt*2)} mL`, "#8b5cf6"],
                ["Albuterol nebulized", "2.5 mg (<25 kg) or 5 mg (>25 kg)", "#3b82f6"],
                ["Sodium bicarb (if acidotic)", `${Math.round(wt*1)} mEq (1 mEq/kg)`, "#3b82f6"],
                ["Kayexalate", `${Math.round(wt)} g/dose PO or PR`, "#f59e0b"],
              ]} note={`ECG changes by K⁺ level:\n>5.5: peaked T waves\n>6.5: prolonged PR, widened QRS\n>7.0: sine wave → V-fib risk\nGet ECG immediately if K⁺ >6.0`} />
            )}

            <Card title="K⁺ Maintenance & Safety" color="#10b981" rows={[
              ["Daily maintenance", `${kMaintenance} mEq/day (2 mEq/kg/day)`, "#10b981"],
              ["Standard IVF additive", "20 mEq/L KCl in maintenance fluids", "#10b981"],
              ["Max peripheral rate", `${Math.round(wt*0.5*10)/10} mEq/hr (0.5 mEq/kg/hr)`, "#f59e0b"],
              ["Oral replacement dose", `${Math.round(wt*1)}–${Math.round(wt*2)} mEq/dose (1–2 mEq/kg)`, "#3b82f6"],
            ]} note="Check Mg²⁺ with refractory hypokalemia — hypomagnesemia causes renal K wasting. Correct Mg first." />

            <EduPanel title="K⁺ Clinical Pearls" items={[
              "Each 0.3 mEq/L drop in serum K reflects ~100 mEq total body deficit (adults)",
              "Alkalosis shifts K intracellularly — correct pH before aggressively replacing K",
              "DKA: K appears normal/high but total body is depleted. Replace early.",
              "Renal failure: AVOID K in IVF. Recheck frequently.",
              "Never add K to a running IV bag — use a pre-mixed solution",
              "Oral KCl elixir: 20 mEq/15 mL. Tastes terrible — mix with juice.",
            ]} />
          </div>
        </div>
      )}

      {/* ═══ CALCIUM ═══ */}
      {tab === "calcium" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            <Inp label="Total Ca (mg/dL)" val={totalCa} set={setTotalCa} min={4} max={14} step={0.1} />
            <Inp label="Ionized Ca (mmol/L)" val={ionizedCa} set={setIonizedCa} min={0.5} max={2} step={0.01} />
            <Inp label="Albumin (g/dL)" val={albumin} set={setAlbumin} min={1} max={5} step={0.1} />
          </div>

          <StatusBar label="Ionized Ca²⁺" value={`${ionizedCa} mmol/L`} status={caStatus} normal="1.1–1.35 mmol/L" />
          <div style={{ fontSize: 10, color: "#6b7a94", padding: "4px 8px", background: "rgba(16,185,129,0.06)", borderRadius: 6 }}>
            Corrected Total Ca (for albumin): <strong style={{ color: "#e8edf5" }}>{correctedCa} mg/dL</strong> — Formula: Corrected Ca = Total Ca + 0.8 × (4.0 − Albumin)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {ionizedCa < 1.1 && (
              <Card title="Hypocalcemia Correction" color="#10b981" rows={[
                ["Ca Gluconate 10% (PREFERRED IV)", `${caGlucDose} mg (${caGlucVol} mL) over 10–30 min`, "#10b981"],
                ["  Elemental Ca from gluconate", `${Math.round(wt*9.3)} mg (9.3 mg/kg)`, "#10b981"],
                ["CaCl₂ 10% (CENTRAL only)", `${caClDose} mg (${caClVol} mL) over 10–30 min`, "#ef4444"],
                ["  Elemental Ca from CaCl₂", `${Math.round(wt*6.8)} mg (6.8 mg/kg)`, "#ef4444"],
                ["Continuous infusion", `Ca gluconate ${Math.round(wt*200)}–${Math.round(wt*800)} mg/day`, "#3b82f6"],
                ["Oral Ca supplement", `${Math.round(wt*50)}–${Math.round(wt*75)} mg elemental Ca/kg/day ÷ q6h`, "#3b82f6"],
              ]} note="Ca Gluconate: SAFE for peripheral IV. CaCl₂: 3× more elemental Ca but VESICANT — central line ONLY. Always check Mg (hypomagnesemia causes Ca resistance). Monitor for bradycardia during infusion." />
            )}

            <EduPanel title="Ca²⁺ Clinical Pearls" items={[
              "Ionized Ca is the physiologically active form — always prefer over total Ca",
              "Total Ca is affected by albumin, pH, and protein binding",
              "Correct total Ca for albumin: +0.8 mg/dL per 1 g/dL drop in albumin",
              "Hypocalcemia signs: Chvostek sign (facial twitch), Trousseau sign (carpopedal spasm), QTc prolongation, seizures",
              "Ca gluconate 10%: 100 mg/mL, 9.3 mg/mL elemental Ca",
              "CaCl₂ 10%: 100 mg/mL, 27.2 mg/mL elemental Ca (3× more potent)",
              "NEVER mix Ca with bicarbonate (precipitates) or ceftriaxone (contraindicated <28 days or with Ca-containing IVF)",
            ]} />
          </div>
        </div>
      )}

      {/* ═══ MAGNESIUM ═══ */}
      {tab === "magnesium" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp label="Serum Mg (mg/dL)" val={serumMg} set={setSerumMg} min={0.5} max={5} step={0.1} />
          <StatusBar label="Serum Mg²⁺" value={`${serumMg} mg/dL`} status={mgStatus} normal="1.5–2.5 mg/dL" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {serumMg < 1.5 && (
              <Card title="Hypomagnesemia Correction" color="#8b5cf6" rows={[
                ["MgSO₄ IV dose (25–50 mg/kg)", `${mgDose}–${mgDoseHigh} mg`, "#8b5cf6"],
                ["50% MgSO₄ volume", `${mgVol}–${mgVolHigh} mL`, "#8b5cf6"],
                ["Dilute to", "≤20 mg/mL (0.2 g/10 mL) in NS or D5W", "#3b82f6"],
                ["Infusion time", "15–30 minutes (1–2 hours if not emergent)", "#f59e0b"],
                ["Max rate", `150 mg/kg/hr = ${Math.round(wt*150)} mg/hr`, "#ef4444"],
                ["Torsades dose", `${Math.round(wt*25)}–${Math.round(wt*50)} mg over 1–2 min (emergent)`, "#ef4444"],
              ]} note="Monitor: HR, BP, respiratory status during infusion. Hold if HR drops. Rapid infusion → hypotension, bradycardia. Check Ca²⁺ — hypomagnesemia often coexists with hypocalcemia." />
            )}

            <Card title="Mg²⁺ Oral Replacement" color="#10b981" rows={[
              ["Mg oxide (oral)", `${Math.round(wt*5)}–${Math.round(wt*10)} mg/kg/day ÷ bid–tid`, "#10b981"],
              ["Mg citrate (better absorbed)", "Same dose range, less GI upset", "#10b981"],
            ]} note="Oral Mg often causes diarrhea. Mg oxide has lowest bioavailability (~4%). Mg citrate, glycinate, or lactate better absorbed." />

            <EduPanel title="Mg²⁺ Clinical Pearls" items={[
              "Mg is the 'forgotten electrolyte' — check with every K⁺ and Ca²⁺ abnormality",
              "Hypomagnesemia causes REFRACTORY hypokalemia (Mg-dependent Na-K-ATPase) and hypocalcemia (impaired PTH secretion)",
              "Always correct Mg BEFORE trying to correct K or Ca",
              "Mg is 60% bone-bound — serum levels underestimate total body depletion",
              "Causes: loop diuretics, aminoglycosides, amphotericin B, cisplatin, PPIs, diarrhea",
              "DKA patients are Mg-depleted (urinary losses) — replace empirically",
              "MgSO₄ 50%: 500 mg/mL = 4 mEq/mL Mg²⁺",
            ]} />
          </div>
        </div>
      )}

      {/* ═══ PHOSPHORUS ═══ */}
      {tab === "phosphorus" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp label="Serum Phos (mg/dL)" val={serumPhos} set={setSerumPhos} min={0.5} max={10} step={0.1} />
          <StatusBar label="Serum PO₄" value={`${serumPhos} mg/dL`} status={phosStatus} normal={`${phosNormal[0]}–${phosNormal[1]} mg/dL (${age})`} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {serumPhos < phosNormal[0] && (
              <Card title="Hypophosphatemia Correction" color="#06b6d4" rows={[
                ["Severity", serumPhos < 1.0 ? "SEVERE (<1.0)" : serumPhos < 2.3 ? "Moderate (1.0–2.3)" : "Mild (2.3–3.5)", serumPhos < 1.0 ? "#ef4444" : "#f59e0b"],
                ["IV dose (mmol/kg)", `${phosDose} mmol/kg = ${phosTotal} mmol`, "#06b6d4"],
                ["Na-Phos (3 mmol/mL)", `${naPhosVol} mL`, "#3b82f6"],
                ["K-Phos (3 mmol/mL)", `${kPhosVol} mL (also gives ${Math.round(phosTotal*4.4*10)/10} mEq K⁺)`, "#f59e0b"],
                ["Infusion time", "4–6 hours", "#3b82f6"],
                ["Max IV rate", "0.06–0.12 mmol/kg/hr", "#ef4444"],
                ["Recheck after", "6 hours post-infusion", "#f59e0b"],
              ]} note="Choose Na-Phos if K⁺ is normal/high. Choose K-Phos if also hypokalemic (dual correction). NEVER give IV phos as bolus — risk of hypocalcemia, cardiac arrhythmia, soft tissue calcification." />
            )}

            <Card title="PO₄ Oral Replacement" color="#10b981" rows={[
              ["Oral phos dose", `${Math.round(wt*1)}–${Math.round(wt*2)} mmol/kg/day ÷ q6–8h`, "#10b981"],
              ["Neutra-Phos (powder)", "250 mg (8 mmol) per packet", "#10b981"],
              ["K-Phos tablets", "250 mg (8 mmol) per tablet", "#10b981"],
            ]} note="GI side effects common (diarrhea, nausea). Oral preferred for mild-moderate hypophosphatemia." />

            <EduPanel title="PO₄ Clinical Pearls" items={[
              "Normal ranges are AGE-DEPENDENT: infants 4.5–6.5, children 3.5–5.5, adolescents 2.5–4.5 mg/dL",
              "Causes of low PO₄: DKA (intracellular shift with insulin), refeeding syndrome, respiratory alkalosis, TPN without phos, vitamin D deficiency",
              "Refeeding syndrome: PO₄ drops within 12–72h of refeeding malnourished patients — can be fatal (cardiac failure, rhabdomyolysis)",
              "DKA: PO₄ appears normal/high at presentation but drops precipitously with insulin. Use K-Phos for dual K/Phos correction.",
              "Severe hypophosphatemia (<1.0): respiratory muscle weakness, hemolytic anemia, WBC dysfunction, rhabdomyolysis, seizures",
              "IV phos + IV calcium → precipitation risk. Separate infusion lines. Never mix.",
            ]} />
          </div>
        </div>
      )}

      {/* ═══ DKA ═══ */}
      {tab === "dka" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
            <Inp label="pH" val={dkaPH} set={setDkaPH} min={6.8} max={7.4} step={0.01} />
            <Inp label="Blood Glucose (mg/dL)" val={dkaBG} set={setDkaBG} min={100} max={1000} step={10} />
            <Inp label="Serum Na (mEq/L)" val={serumNa} set={setSerumNa} min={110} max={170} step={1} />
            <Inp label="Serum K (mEq/L)" val={dkaK} set={setDkaK} min={1} max={8} step={0.1} />
          </div>

          <StatusBar label="DKA Severity" value={dkaSeverity} status={dkaSeverity === "Severe" ? "critical" : dkaSeverity === "Moderate" ? "caution" : "normal"} normal="pH >7.3, Bicarb >15" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <Card title="DKA Fluid Protocol (ISPAD 2022)" color="#ef4444" rows={[
              ["Initial bolus (if hemodynamically compromised)", `NS ${dkaBolus} mL (10 mL/kg) over 20–30 min`, "#ef4444"],
              ["Maintenance rate (1.5×)", `${dkaFluidRate} mL/hr (${Math.round(dkaFluidRate*24)} mL/day)`, "#8b5cf6"],
              ["Initial fluid", "0.9% NaCl (NS)", "#3b82f6"],
              ["Switch fluid when BG <250–300", "D5 or D10 + 0.45–0.9% NaCl", "#10b981"],
              ["Insulin drip", `0.1 U/kg/hr = ${dkaInsulin} U/hr regular insulin`, "#8b5cf6"],
              ["Do NOT bolus insulin", "Start drip 1h after fluid resuscitation begins", "#ef4444"],
            ]} note="PECARN FLUID Trial (NEJM 2018): Neither fluid RATE nor SODIUM CONTENT affected neurologic outcomes. Both rapid/slow and NS/0.45NS are safe." />

            <Card title="Corrected Na in DKA" color="#3b82f6" rows={[
              ["Measured Na", `${serumNa} mEq/L`, "#3b82f6"],
              ["Blood glucose", `${dkaBG} mg/dL`, "#f59e0b"],
              ["Corrected Na", `${correctedNaDKA} mEq/L`, correctedNaDKA < 135 ? "#ef4444" : "#10b981"],
              ["Correction factor", "+1.6 mEq/L Na per 100 mg/dL glucose above 100", "#8b5cf6"],
            ]} note="If corrected Na does NOT rise during treatment → concerning for cerebral edema risk. Corrected Na should increase as glucose falls." />

            <Card title="K⁺ in DKA" color="#f59e0b" rows={[
              ["Current K⁺", `${dkaK} mEq/L`, dkaK < 3.5 ? "#ef4444" : dkaK > 5.5 ? "#ef4444" : "#10b981"],
              ["Action", dkaKReplacement, dkaK < 3.5 ? "#ef4444" : "#f59e0b"],
              ["K⁺ form", "KCl 50% + KPhos 50% (dual correction)", "#3b82f6"],
              ["Max peripheral conc", "40 mEq/L total K⁺ in IVF", "#ef4444"],
            ]} note="Total body K is ALWAYS depleted in DKA (~5 mEq/kg) even if serum K is normal/high. Insulin drives K intracellularly → rapid drop. If K <3.5 → HOLD INSULIN until K >3.5." />

            <Card title="Two-Bag System" color="#8b5cf6" rows={[
              ["Bag 1", `NS + KCl 20 mEq/L + KPhos 20 mEq/L (NO dextrose)`, "#3b82f6"],
              ["Bag 2", `D10 + NS + KCl 20 mEq/L + KPhos 20 mEq/L`, "#10b981"],
              ["Total rate (constant)", `${dkaFluidRate} mL/hr`, "#8b5cf6"],
              ["Titrate ratio", "Adjust Bag1:Bag2 to keep BG 150–250", "#f59e0b"],
              ["Response time", "~1 min (vs ~42 min for traditional bag changes)", "#10b981"],
            ]} note="Both bags run through Y-connector at constant total rate. Change ONLY the ratio. Faster glucose control, fewer hypoglycemic episodes." />

            <EduPanel title="DKA Cerebral Edema — Muir Criteria" items={[
              "DIAGNOSTIC (any 1): abnormal motor/verbal response, decorticate/decerebrate posture, CN palsy, abnormal breathing pattern",
              "MAJOR (any 2): altered mentation, sustained HR deceleration, age-inappropriate incontinence",
              "MINOR (2 with 1 major): vomiting, headache, lethargy, DBP >90 mmHg, age <5 years",
              `TREATMENT: Mannitol ${(wt*0.5).toFixed(0)}–${wt} g IV over 15 min OR 3% NaCl ${Math.round(wt*5)} mL over 5 min`,
              "Elevate HOB 30°. Reduce fluid rate by 1/3. Avoid aggressive hyperventilation.",
              "Sensitivity 92%, Specificity 96%",
            ]} />
          </div>
        </div>
      )}

      {/* ═══ BURNS ═══ */}
      {tab === "burns" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
            <Inp label="% TBSA Burned" val={burnTBSA} set={setBurnTBSA} min={1} max={95} step={1} />
            <Inp label="Hours Since Burn" val={burnHrs} set={setBurnHrs} min={0} max={24} step={0.5} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <Card title="Parkland Formula" color="#f97316" rows={[
              ["Total 24h volume", `${parkland24} mL LR`, "#f97316"],
              ["First 8h (from burn time)", `${Math.round(parkland24/2)} mL = ${Math.round(parkland24/16)} mL/hr`, "#ef4444"],
              ["Next 16h", `${Math.round(parkland24/2)} mL = ${Math.round(parkland24/32)} mL/hr`, "#f59e0b"],
              ["Hours elapsed since burn", `${burnHrs}h`, "#3b82f6"],
              ["Already due by now (first 8h pace)", `~${alreadyGiven} mL`, "#8b5cf6"],
              ["Remaining for first 8h", `${Math.max(0,remaining8h)} mL over ${Math.max(0,8-burnHrs).toFixed(1)}h`, "#ef4444"],
            ]} note={`Parkland: 4 × ${wt} kg × ${burnTBSA}% TBSA = ${parkland24} mL LR. Calculate from TIME OF BURN, not arrival. ${wt <= 20 ? "⚠️ <20 kg: ADD maintenance D5LR alongside Parkland." : ""}`} />

            <Card title="Galveston Formula (Pediatric)" color="#06b6d4" rows={[
              ["Total 24h", `${galveston} mL`, "#06b6d4"],
              ["BSA burned", `${(bsa * burnTBSA / 100).toFixed(2)} m²`, "#f97316"],
              ["Total BSA", `${bsa} m²`, "#3b82f6"],
              ["Hourly rate", `${Math.round(galveston/24)} mL/hr`, "#06b6d4"],
            ]} note="Galveston: 5000 mL/m² burned + 2000 mL/m² total BSA. Accounts for both burn losses AND maintenance in one formula." />

            <Card title="Monitoring & Titration" color="#10b981" rows={[
              ["UOP goal", uopGoal, "#10b981"],
              ["If UOP too low", "↑ rate 25%", "#f59e0b"],
              ["If UOP too high", "↓ rate 25%", "#f59e0b"],
              ["Colloid timing", "Consider 5% albumin after 12–24h", "#8b5cf6"],
              ["Lyte checks", "BMP q4–6h for first 24h", "#3b82f6"],
            ]} note="UOP is the PRIMARY titration endpoint, not formula output. Avoid fluid creep (over-resuscitation → abdominal/extremity compartment syndrome, pulmonary edema)." />

            <EduPanel title="Pediatric Burns — Key Differences from Adults" items={[
              `Children <20 kg: MUST add maintenance D5LR (${maint.day} mL/day) alongside Parkland`,
              "Use Lund-Browder chart — NOT Rule of 9s (inaccurate in children <14 yr)",
              "Infant head = 19% TBSA (vs 7% adult). Legs = 14% (vs 18% adult).",
              "Higher UOP goal: 1–2 mL/kg/hr (adults: 0.5–1 mL/kg/hr)",
              "Hypoglycemia risk: limited glycogen stores → D5 in maintenance fluids",
              "Inhalation injury adds ~30–40% to fluid requirements",
              "Circumferential burns may need escharotomy regardless of fluid status",
            ]} />
          </div>
        </div>
      )}

      {/* ═══ SPECIAL POPULATIONS ═══ */}
      {tab === "special" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
          <Card title="SIADH" color="#3b82f6" rows={[
            ["Restrict to 50–67% maint", `${Math.round(maint.day*0.5)}–${Math.round(maint.day*0.67)} mL/day`, "#3b82f6"],
            ["Rate (50%)", `${(maint.hr*0.5).toFixed(1)} mL/hr`, "#3b82f6"],
            ["Rate (67%)", `${(maint.hr*0.67).toFixed(1)} mL/hr`, "#3b82f6"],
            ["Fluid type", "Concentrated: D10NS or D10 0.45NS", "#10b981"],
            ["Na correction limit", "≤8–10 mEq/L per 24h", "#ef4444"],
          ]} note="Monitor strict I&O, daily weights, Na q6–12h. If Na worsens with restriction → consider CSW instead." />

          <Card title="Cerebral Salt Wasting (CSW)" color="#10b981" rows={[
            ["EXPAND with NS at 1.5–2× maint", `${Math.round(maint.day*1.5)}–${Math.round(maint.day*2)} mL/day`, "#10b981"],
            ["Rate (1.5×)", `${(maint.hr*1.5).toFixed(1)} mL/hr`, "#10b981"],
            ["Rate (2×)", `${(maint.hr*2).toFixed(1)} mL/hr`, "#10b981"],
            ["May need 3% NaCl", `${Math.round(wt*1)}–${Math.round(wt*3)} mL/hr continuous`, "#f59e0b"],
            ["Fludrocortisone", "0.05–0.2 mg/day PO (mineralocorticoid)", "#8b5cf6"],
          ]} note="Key differentiator: FEurate stays >11% after Na correction (vs normalizes in SIADH). CVP is LOW in CSW. Restrict fluids → WORSENS CSW." />

          <Card title="Post-Cardiac Surgery" color="#ef4444" rows={[
            ["50% maintenance", `${Math.round(maint.day*0.5)} mL/day (${(maint.hr*0.5).toFixed(1)} mL/hr)`, "#ef4444"],
            ["75% maintenance", `${Math.round(maint.day*0.75)} mL/day (${(maint.hr*0.75).toFixed(1)} mL/hr)`, "#f59e0b"],
            ["Duration", "24–48h post-bypass", "#3b82f6"],
            ["Fluid type", "D10 0.45NS or D10NS", "#3b82f6"],
            ["Furosemide bolus", `${Math.round(wt*1)} mg (1 mg/kg) q6–12h`, "#8b5cf6"],
            ["Furosemide gtt", `${(wt*0.1).toFixed(1)}–${(wt*0.4).toFixed(1)} mg/hr`, "#8b5cf6"],
            ["Target", "Net negative balance by POD 2–3", "#10b981"],
          ]} note="Fluid overload >10% → increased mortality, longer ventilation, AKI. Daily weights and strict I&O critical." />

          <Card title="Nephrotic Syndrome" color="#06b6d4" rows={[
            ["25% Albumin (0.5–1 g/kg)", `${Math.round(wt*0.5)}–${Math.round(wt*1)} g`, "#06b6d4"],
            ["25% Albumin volume", `${Math.round(wt*0.5/0.25)}–${Math.round(wt*1/0.25)} mL over 2–4h`, "#06b6d4"],
            ["THEN Furosemide", `${Math.round(wt*1)}–${Math.round(wt*2)} mg IV (1–2 mg/kg)`, "#8b5cf6"],
            ["Give furosemide", "Immediately after albumin completes", "#ef4444"],
          ]} note="Albumin WITHOUT furosemide → risk of pulmonary edema (transiently expands intravascular volume). Check FeNa: <0.2% = volume depleted (needs albumin), ≥0.2% = safe for diuretics alone." />

          <Card title="Acute Kidney Injury (AKI)" color="#f59e0b" rows={[
            ["Insensible losses", `${Math.round(400*bsa)} mL/day (~400 mL/m²/day)`, "#f59e0b"],
            ["Total fluid", "Insensible + measured UOP", "#f59e0b"],
            ["Fluid type", "D10W or D10 0.2NS (low Na, no K)", "#3b82f6"],
            ["AVOID in IVF", "Potassium (until K⁺ known and UOP confirmed)", "#ef4444"],
          ]} note="Fluid overload >10% in AKI → 4.34× mortality increase. Consider early RRT/dialysis if fluid overload >10–15% and unresponsive to diuretics." />

          <Card title="Perioperative Quick Calc" color="#8b5cf6" rows={[
            ["NPO deficit (est 6h NPO)", `${Math.round(maint.hr*6)} mL`, "#8b5cf6"],
            ["Replace: 50% in 1st hour", `${Math.round(maint.hr*6*0.5)} mL`, "#8b5cf6"],
            ["25% in 2nd hour", `${Math.round(maint.hr*6*0.25)} mL`, "#8b5cf6"],
            ["25% in 3rd hour", `${Math.round(maint.hr*6*0.25)} mL`, "#8b5cf6"],
            ["Intraop rate", `${(maint.hr*0.67).toFixed(1)}–${maint.hr} mL/hr (2/3–full maint)`, "#10b981"],
            ["3rd space (major surgery)", `${Math.round(wt*6)}–${Math.round(wt*10)} mL/hr`, "#f59e0b"],
            ["EBV (child)", `${Math.round(wt*70)}–${Math.round(wt*75)} mL`, "#3b82f6"],
          ]} note="Post-op: D5NS + 20 mEq/L KCl at maintenance rate (ISOTONIC per AAP 2018). ADH elevation persists ≥3 days post-surgery — hypotonic fluids dangerous post-op." />
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 8, color: "#1a2236" }}>
        Electrolyte & Special Population Calculator v1.0 — For educational and clinical reference only — Always verify calculations independently
      </div>
    </div>
  );
}

// ════════ COMPONENTS ════════

const sel = { width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #1a2236", background: "#0a0f1e", color: "#d4dce8", fontSize: 11 };

function L({ children }) { return <label style={{ fontSize: 8, color: "#4b5a70", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 2 }}>{children}</label>; }

function Inp({ label, val, set, min, max, step }) {
  return <div><L>{label}</L><input type="number" value={val} min={min} max={max} step={step} onChange={e => set(Number(e.target.value))} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #1a2236", background: "#0a0f1e", color: "#e8edf5", fontSize: 13, fontWeight: 600, boxSizing: "border-box" }} /></div>;
}

function P({ children, c }) {
  return <span style={{ padding: "2px 8px", borderRadius: 4, border: `1px solid ${c}30`, background: `${c}0a`, color: c, fontSize: 9, fontWeight: 600 }}>{children}</span>;
}

function StatusBar({ label, value, status, normal }) {
  const c = statusColors[status] || "#10b981";
  const bg = `${c}0c`;
  const sLabel = status === "critical" ? "CRITICAL" : status === "low" ? "LOW" : status === "high" ? "HIGH" : status === "caution" ? "CAUTION" : "NORMAL";
  return (
    <div style={{ background: bg, border: `1px solid ${c}25`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#e8edf5" }}>{label}: </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: c }}>{value}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#6b7a94" }}>Normal: {normal}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: c, background: `${c}18`, padding: "2px 8px", borderRadius: 4 }}>{sLabel}</span>
      </div>
    </div>
  );
}

function Card({ title, color, rows, note }) {
  return (
    <div style={{ background: `${color}06`, border: `1px solid ${color}18`, borderRadius: 10, padding: 12 }}>
      <h4 style={{ fontSize: 12, fontWeight: 700, color, margin: "0 0 8px" }}>{title}</h4>
      {rows.map(([label, val, c], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: i < rows.length-1 ? "1px solid #111827" : "none", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#6b7a94", flex: 1 }}>{label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: c, textAlign: "right", flexShrink: 0, maxWidth: "55%" }}>{val}</span>
        </div>
      ))}
      {note && <div style={{ marginTop: 8, fontSize: 9, color: "#4b5a70", lineHeight: 1.5, whiteSpace: "pre-line", borderTop: "1px solid #141d2e", paddingTop: 6 }}>{note}</div>}
    </div>
  );
}

function EduPanel({ title, items }) {
  return (
    <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 10, padding: 12 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 14 }}>📚</span> {title}
      </h4>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 10, color: "#8892a8", lineHeight: 1.5, padding: "2px 0 2px 12px", borderLeft: "2px solid #1e2d4a", marginBottom: 3 }}>{item}</div>
      ))}
    </div>
  );
}
