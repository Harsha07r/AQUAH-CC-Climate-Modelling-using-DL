import { MessageSquare, Droplet, Leaf, Mic, Send, Activity, Award, ChevronRight } from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const FORECAST = [412, 387, 445, 520, 480, 395];

const CROPS = [
  { name: 'Rice',    score: 87, rating: 'Excellent', top: true,  note: 'Ideal for loamy soil at 412 m³/s flow' },
  { name: 'Wheat',   score: 73, rating: 'Good',      top: false, note: 'Strong Rabi season candidate' },
  { name: 'Maize',   score: 65, rating: 'Good',      top: false, note: 'Tolerates moderate flood risk' },
  { name: 'Soybean', score: 48, rating: 'Fair',      top: false, note: 'Monitor water levels closely' },
];

const RATING = {
  Excellent: { badge: '#059669', bar: '#10b981', text: '#065f46' },
  Good:      { badge: '#2563eb', bar: '#3b82f6', text: '#1e40af' },
  Fair:      { badge: '#d97706', bar: '#f59e0b', text: '#92400e' },
};

const PIPELINE = [
  { prefix: '[User]',     line: 'POST /api/chat  { message: "Which crop this Kharif?", language: "en-IN", uid: "..." }',  color: '#86efac' },
  { prefix: '[Node.js]',  line: 'MongoDB → user profile loaded  soilType: "Loamy Soil"',                                   color: '#67e8f9' },
  { prefix: '[Node.js]',  line: 'Chat history: 3 messages loaded → Gemini session initialised',                            color: '#67e8f9' },
  { prefix: '[Gemini]',   line: 'Function call triggered → get_crop_advisory({ soilType: "Loamy Soil" })',                 color: '#c4b5fd' },
  { prefix: '[Node.js]',  line: 'GET jhelum-forecast-api.onrender.com/full_report',                                        color: '#67e8f9' },
  { prefix: '[PINN]',     line: 'flood_risk: MODERATE  avg_flow: 412 m³/s  recommended_crops: [Rice, Maize, Wheat]',      color: '#7dd3fc' },
  { prefix: '[Node.js]',  line: 'Function response sent to Gemini  →  generating reply in English…',                       color: '#67e8f9' },
  { prefix: '[Gemini]',   line: '"Based on your Loamy Soil profile and current basin data, Rice is your #1 pick…"',        color: '#c4b5fd' },
  { prefix: '[Node.js]',  line: 'MongoDB → session saved  { role: model, widgetData: {flood_risk, crops, forecast} }',    color: '#67e8f9' },
  { prefix: '[Frontend]', line: 'Render: AI bubble + Flood Risk card + Top Crop card + Recharts forecast chart  ✓',        color: '#fde68a' },
];

const TECH = [
  { name: 'React 19',           cat: 'Frontend' },
  { name: 'Vite 8',             cat: 'Build' },
  { name: 'Tailwind CSS 4',     cat: 'Frontend' },
  { name: 'Node.js / Express 5',cat: 'Backend' },
  { name: 'Gemini 2.5 Flash',   cat: 'AI' },
  { name: 'Function Calling',   cat: 'AI' },
  { name: 'Python / FastAPI',   cat: 'ML' },
  { name: 'PINN Model',         cat: 'ML' },
  { name: 'MongoDB Atlas',      cat: 'Database' },
  { name: 'Firebase Auth',      cat: 'Auth' },
  { name: 'Web Speech API',     cat: 'Voice' },
  { name: 'Recharts',           cat: 'Frontend' },
];

const CAT_COLOR = {
  Frontend: '#d1fae5', AI: '#ede9fe', ML: '#dbeafe',
  Backend:  '#fce7f3', Database: '#fef3c7', Auth: '#f3f4f6',
  Build:    '#f0fdf4', Voice: '#ecfdf5',
};

// ── Hydrology SVG Chart ───────────────────────────────────────────────────────

function SparkChart() {
  const min = Math.min(...FORECAST);
  const max = Math.max(...FORECAST);
  const W = 400, H = 96, P = 10;
  const px = (i) => P + (i / (FORECAST.length - 1)) * (W - P * 2);
  const py = (v) => H - P - ((v - min) / (max - min)) * (H - P * 2);
  const pts = FORECAST.map((v, i) => [px(i), py(v)]);

  // cubic bezier through points
  let linePath = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cpx = (pts[i][0] + pts[i + 1][0]) / 2;
    linePath += ` C ${cpx},${pts[i][1]} ${cpx},${pts[i + 1][1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${H} L ${pts[0][0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 96 }}>
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#hg)" />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y}
          r={i === 3 ? 5 : 3.5}
          fill={i === 3 ? '#1d4ed8' : '#3b82f6'}
          stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ── Chat Mockup ───────────────────────────────────────────────────────────────

function ChatMockup() {
  return (
    <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(15,61,36,0.22)', overflow: 'hidden', maxWidth: 360 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ width: 30, height: 30, background: '#0f3d24', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MessageSquare size={14} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>AQUAH Assistant</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 20 }}>LIVE</span>
      </div>

      {/* feed */}
      <div style={{ background: '#f8faf7', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 240 }}>
        {/* user */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#e5e7eb', color: '#111', fontSize: 12, padding: '10px 14px', borderRadius: '16px 16px 4px 16px', maxWidth: '80%', lineHeight: 1.5 }}>
            Which crop should I grow this Kharif season?
          </div>
        </div>

        {/* AI */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, background: '#0f3d24', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <MessageSquare size={12} color="white" />
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', fontSize: 11.5, color: '#374151', padding: '10px 12px', borderRadius: '4px 16px 16px 16px', maxWidth: '82%', lineHeight: 1.6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            Based on your <strong>Loamy Soil</strong> profile and current basin data — <strong>Rice</strong> is the #1 match at 87/100. Moderate flood risk noted; plant on raised beds.
          </div>
        </div>

        {/* widgets */}
        <div style={{ marginLeft: 34, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Flood Risk</span>
              <Activity size={11} color="#16a34a" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#111' }}>MODERATE</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>Basin sensors</div>
          </div>
          <div style={{ background: '#0f3d24', borderRadius: 14, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#86efac', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top Crop</span>
              <Leaf size={11} color="#4ade80" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Rice</div>
            <div style={{ fontSize: 9, color: '#86efac', marginTop: 2 }}>Score 87 · Excellent</div>
          </div>
        </div>
      </div>

      {/* input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 20, padding: '7px 12px', fontSize: 11, color: '#9ca3af' }}>
          Ask in any language…
        </div>
        <div style={{ width: 28, height: 28, background: '#0f3d24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mic size={13} color="white" />
        </div>
        <div style={{ width: 28, height: 28, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={13} color="white" />
        </div>
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f7f9f7', color: '#0d1f14', lineHeight: 1.6 }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(247,249,247,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #dde8df',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 60,
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: '#0f3d24', letterSpacing: '-0.02em' }}>
          AQUAH-CC
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#4a6356' }}>Jhelum Basin · Kashmir Valley</span>
          <button onClick={onGetStarted}
            style={{ background: '#0f3d24', color: '#fff', border: 'none', borderRadius: 24, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Sign In <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f3d24 0%, #1a5c38 50%, #0f3d24 100%)',
        padding: '80px 32px 72px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
        maxWidth: 1140, margin: '0 auto',
      }}
        className="hero-grid">
        {/* Left */}
        <div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: '#86efac', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 20, marginBottom: 24 }}>
            Final Year Project · AI &amp; Climate Modelling
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', textWrap: 'balance', marginBottom: 20 }}>
            Agricultural Intelligence<br />for the Jhelum Basin
          </h1>
          <p style={{ color: '#a7d4b8', fontSize: 16, lineHeight: 1.7, maxWidth: 440, marginBottom: 32 }}>
            A full-stack AI system combining a Physics-Informed Neural Network for real-time hydrology forecasting with Gemini 2.5 Flash for multilingual crop advisory — tailored for farmers in the Kashmir valley.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <button onClick={onGetStarted}
              style={{ background: '#fff', color: '#0f3d24', border: 'none', borderRadius: 28, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Try the App <ChevronRight size={16} />
            </button>
            <a href="#features"
              style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 28, padding: '13px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: 'transparent' }}>
              See Features
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Gemini 2.5 Flash', 'PINN Hydrology', 'Function Calling', '4 Languages', 'MongoDB', 'Firebase Auth'].map(tag => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.09)', color: '#c4ead0', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Chat mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ChatMockup />
        </div>
      </section>

      {/* ── Stat strip ── */}
      <div style={{ background: '#0d1f14', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
        {[
          { label: 'AI Model',       value: 'Gemini 2.5 Flash' },
          { label: 'ML Engine',      value: 'PINN (Physics-Informed NN)' },
          { label: 'Languages',      value: 'EN · HI · UR · KS' },
          { label: 'Data Source',    value: 'Jhelum Basin Sensors' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            padding: '18px 40px', textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#4a6356', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6356', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>What it does</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#0d1f14', letterSpacing: '-0.02em', textWrap: 'balance', maxWidth: 520, lineHeight: 1.15 }}>
            Three modules, one platform
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              icon: <MessageSquare size={22} color="#0f3d24" />,
              bg: '#ecfdf5',
              title: 'AI Assistant',
              body: 'Powered by Gemini 2.5 Flash with function calling. Type or speak your query — the AI fetches live hydrology data and delivers crop advice in your language. Persistent chat history stored in MongoDB.',
              tag: '4 Languages · Voice Input',
            },
            {
              icon: <Droplet size={22} color="#1d4ed8" />,
              bg: '#eff6ff',
              title: 'Hydrology Forecast',
              body: 'A PINN trained on Jhelum basin data delivers multi-day river discharge predictions. Shows average flow, peak flow, flood risk level, and an interactive area chart powered by Recharts.',
              tag: 'PINN · Real-time · m³/s',
            },
            {
              icon: <Leaf size={22} color="#059669" />,
              bg: '#f0fdf4',
              title: 'Crop Advisory',
              body: 'Season-wise crop rankings scored 0–100 by suitability. The AI cross-references your soil profile (saved in your Farm Digital Twin) against live hydrology data to surface the best picks.',
              tag: 'Kharif & Rabi · Suitability Score',
            },
          ].map(f => (
            <div key={f.title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ede9', padding: 28, boxShadow: '0 1px 6px rgba(15,61,36,0.05)' }}>
              <div style={{ width: 44, height: 44, background: f.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#0d1f14', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#4a6356', lineHeight: 1.7, marginBottom: 14 }}>{f.body}</p>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pipeline / Terminal ── */}
      <section style={{ background: '#0d1f14', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56, alignItems: 'flex-start' }}>
          {/* left */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6356', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>How the AI Agent works</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', textWrap: 'balance', lineHeight: 1.15, marginBottom: 20 }}>
              From query to multilingual response in &lt;5 seconds
            </h2>
            <p style={{ fontSize: 14, color: '#6b8f78', lineHeight: 1.7, marginBottom: 28 }}>
              Each chat message triggers an agentic pipeline: Gemini decides whether to call the hydrology API, fetches live Jhelum basin data, then generates a response directly in the user's chosen script.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { step: 'User', desc: 'Voice or text, any language' },
                { step: 'Node.js', desc: 'Injects soil profile from MongoDB' },
                { step: 'Gemini', desc: 'Decides to call get_crop_advisory()' },
                { step: 'PINN API', desc: 'Returns flood risk + crop scores' },
                { step: 'Gemini', desc: 'Generates reply in user\'s script' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 7, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#86efac', fontFamily: "'Courier New', monospace" }}>[{s.step}]</span>
                    <span style={{ fontSize: 12, color: '#6b8f78', marginLeft: 8 }}>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right — terminal card */}
          <div style={{ background: '#040f07', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            {/* terminal chrome */}
            <div style={{ background: '#0a1f0f', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 11, color: '#4a6356', fontFamily: "'Courier New', monospace" }}>aquah-cc-backend — request trace</span>
            </div>
            {/* log lines */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 7, overflowX: 'auto' }}>
              {PIPELINE.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, fontSize: 11.5, fontFamily: "'Courier New', monospace", lineHeight: 1.5, whiteSpace: 'nowrap' }}>
                  <span style={{ color: row.color, fontWeight: 700, minWidth: 90, flexShrink: 0 }}>{row.prefix}</span>
                  <span style={{ color: '#a3b8a8' }}>{row.line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hydrology ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 56, alignItems: 'center' }}>
          {/* left */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Hydrology Module</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#0d1f14', letterSpacing: '-0.02em', textWrap: 'balance', lineHeight: 1.15, marginBottom: 18 }}>
              Live Jhelum River Discharge Forecast
            </h2>
            <p style={{ fontSize: 14, color: '#4a6356', lineHeight: 1.7, marginBottom: 28 }}>
              A Physics-Informed Neural Network enforces fluid dynamics equations during training — giving predictions that respect the physical laws of the Jhelum basin, not just historical correlations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Avg Flow',   value: '412 m³/s', color: '#1d4ed8' },
                { label: 'Peak Flow',  value: '520 m³/s', color: '#4f46e5' },
                { label: 'Flood Risk', value: 'MODERATE', color: '#d97706' },
                { label: 'Soil pH',    value: '6.8',      color: '#059669' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #e8ede9', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right — chart */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8ede9', padding: 28, boxShadow: '0 4px 20px rgba(15,61,36,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#0d1f14', marginBottom: 3 }}>Discharge Forecast</h3>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>River flow in m³/s · PINN model output</p>
              </div>
              <Droplet size={18} color="#3b82f6" />
            </div>
            <SparkChart />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {FORECAST.map((_, i) => (
                <span key={i} style={{ fontSize: 10, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>D{i + 1}</span>
              ))}
            </div>
            <div style={{ marginTop: 16, background: '#fef9ee', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                Flood risk: <strong>MODERATE</strong> — peak discharge expected Day 4 (520 m³/s)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Crop Advisory ── */}
      <section style={{ background: '#f0f5f1', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6356', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Crop Advisory Module</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#0d1f14', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10, textWrap: 'balance' }}>
              Season-wise crop rankings
            </h2>
            <p style={{ fontSize: 14, color: '#4a6356', maxWidth: 520 }}>
              Every crop scored 0–100 by the PINN model against soil type, water availability, and real-time flood risk. The AI cross-references your saved Farm Digital Twin profile.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {CROPS.map(c => {
              const s = RATING[c.rating];
              return (
                <div key={c.name} style={{
                  position: 'relative', background: '#fff',
                  borderRadius: 16, padding: '22px 20px',
                  border: c.top ? '1.5px solid #10b981' : '1px solid #e8ede9',
                  boxShadow: c.top ? '0 4px 20px rgba(16,185,129,0.12)' : '0 1px 6px rgba(15,61,36,0.04)',
                }}>
                  {c.top && (
                    <div style={{ position: 'absolute', top: -12, left: 20, background: '#0f3d24', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={9} /> #1 Pick · Kharif
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: c.top ? 8 : 0 }}>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#0d1f14' }}>{c.name}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: s.badge, padding: '3px 9px', borderRadius: 20 }}>{c.rating}</span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>Suitability</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.text, fontVariantNumeric: 'tabular-nums' }}>{c.score}/100</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${c.score}%`, background: s.bar, borderRadius: 3 }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.5 }}>{c.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Multilingual ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4a6356', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Multilingual Support</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: '#0d1f14', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 18, textWrap: 'balance' }}>
              Speak or type in four languages
            </h2>
            <p style={{ fontSize: 14, color: '#4a6356', lineHeight: 1.7, marginBottom: 20 }}>
              Three independent layers: browser-native Speech-to-Text (Web Speech API) for voice input, a static translation dictionary for all UI labels, and a Gemini language directive that generates the AI's reply directly in the chosen script.
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
              Kashmiri voice input uses <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>ur-PK</code> as a fallback since no browser ships a Kashmiri ASR model — an intentional engineering workaround, not a gap.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { flag: '🇬🇧', lang: 'English',  code: 'en-IN', sample: 'Which crop this season?',               support: 'Full STT · Full AI',     level: 3 },
              { flag: '🇮🇳', lang: 'हिंदी',    code: 'hi-IN', sample: 'इस मौसम में कौन सी फसल?',               support: 'Full STT · Full AI',     level: 3 },
              { flag: '🇵🇰', lang: 'اردو',     code: 'ur-IN', sample: 'اس موسم میں کون سی فصل بوئیں؟',          support: 'STT via ur-PK · Good AI', level: 2 },
              { flag: '🇮🇳', lang: 'كٲشُر',   code: 'ks-IN', sample: 'یَتھ موسمس مَنٛز کُس فصل واوُن؟',        support: 'STT fallback · Best-effort',level: 1 },
            ].map(l => (
              <div key={l.code} style={{ background: '#fff', border: '1px solid #e8ede9', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(15,61,36,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{l.flag}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1f14' }}>{l.lang}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'Courier New', monospace" }}>{l.code}</div>
                  </div>
                </div>
                <p style={{ fontSize: 11.5, color: '#4a6356', marginBottom: 10, lineHeight: 1.5, direction: l.code === 'ur-IN' || l.code === 'ks-IN' ? 'rtl' : 'ltr' }}>{l.sample}</p>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1, 2, 3].map(d => (
                    <div key={d} style={{ flex: 1, height: 4, borderRadius: 2, background: d <= l.level ? '#0f3d24' : '#e8ede9' }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 5 }}>{l.support}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ background: '#f0f5f1', padding: '60px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#0d1f14', marginBottom: 8, letterSpacing: '-0.02em' }}>Built with</h2>
          <p style={{ fontSize: 13, color: '#4a6356', marginBottom: 32 }}>A production-grade stack from database to AI model.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {TECH.map(t => (
              <span key={t.name} style={{
                background: CAT_COLOR[t.cat] || '#f3f4f6',
                border: '1px solid rgba(0,0,0,0.06)',
                fontSize: 12, fontWeight: 600, color: '#374151',
                padding: '6px 14px', borderRadius: 20,
              }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#0f3d24', padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 14, textWrap: 'balance' }}>
          Ready to explore the full system?
        </h2>
        <p style={{ color: '#86efac', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          Sign in with Google or create an account to access AI advisory, live hydrology forecasts, and crop recommendations.
        </p>
        <button onClick={onGetStarted}
          style={{ background: '#fff', color: '#0f3d24', border: 'none', borderRadius: 32, padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Get Started <ChevronRight size={18} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e8ede9' }}>
        AQUAH-CC · Jhelum Basin Agricultural Intelligence · Gemini 2.5 Flash + PINN Hydrology Model
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none; }
        }
      `}</style>
    </div>
  );
}
