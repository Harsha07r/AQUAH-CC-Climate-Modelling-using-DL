import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  MessageSquare, Droplet, Leaf, Mic, Send, Activity, Award,
  ChevronRight, Brain, Globe, Zap, GitBranch,
  Play, BarChart2, Clock, Shield,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const FORECAST = [
  { day: 'Day 1', flow: 412 }, { day: 'Day 2', flow: 387 },
  { day: 'Day 3', flow: 445 }, { day: 'Day 4', flow: 520 },
  { day: 'Day 5', flow: 480 }, { day: 'Day 6', flow: 395 },
];

const CROPS = [
  { name: 'Rice',    score: 87, rating: 'Excellent', top: true,  note: 'Optimal at 412 m³/s · Loamy soil match' },
  { name: 'Wheat',   score: 73, rating: 'Good',      top: false, note: 'Rabi season candidate · Excellent drainage' },
  { name: 'Maize',   score: 65, rating: 'Good',      top: false, note: 'Moderate flood tolerance · High yield' },
  { name: 'Soybean', score: 48, rating: 'Fair',      top: false, note: 'Monitor water table closely' },
];

const PIPELINE = [
  { prefix: '[User]',     line: 'POST /api/chat  { message, language: "en-IN", uid }',                   color: '#86efac' },
  { prefix: '[Node.js]',  line: 'MongoDB → user profile loaded  soilType: "Loamy Soil"',                  color: '#67e8f9' },
  { prefix: '[Node.js]',  line: 'Chat history: 3 messages → Gemini session initialised',                  color: '#67e8f9' },
  { prefix: '[Gemini]',   line: 'Function call → get_crop_advisory({ soilType: "Loamy Soil" })',           color: '#c4b5fd' },
  { prefix: '[Node.js]',  line: 'GET jhelum-forecast-api.onrender.com/full_report',                       color: '#67e8f9' },
  { prefix: '[PINN]',     line: 'flood_risk: MODERATE  avg_flow: 412 m³/s  crops: [Rice, Maize, Wheat]', color: '#7dd3fc' },
  { prefix: '[Node.js]',  line: 'Function response → Gemini generating reply in English…',                color: '#67e8f9' },
  { prefix: '[Gemini]',   line: '"Based on your Loamy Soil profile… Rice is your #1 pick…"',              color: '#c4b5fd' },
  { prefix: '[Node.js]',  line: 'MongoDB → session.messages.push({ role: model, widgetData })',           color: '#67e8f9' },
  { prefix: '[Frontend]', line: 'Render: AI bubble + Flood Risk + Top Crop + forecast chart  ✓',          color: '#fde68a' },
];

const METRICS = [
  { value: 30,  suffix: ' yrs', label: 'Historical Climate Data', sub: '1995–2025',         icon: Clock },
  { value: 6,   suffix: '-Day', label: 'River Discharge Forecast', sub: 'Jhelum Basin',     icon: BarChart2 },
  { value: 4,   suffix: '',     label: 'Supported Languages',      sub: 'EN · HI · UR · KS', icon: Globe },
  { value: 14,  suffix: '',     label: 'Engineered ML Features',   sub: 'Physics-derived',  icon: Brain },
  { value: 99,  suffix: '%',    label: 'API Uptime',               sub: 'Render hosted',    icon: Shield },
];

const ARCH_NODES = [
  { label: 'React Frontend',      sub: 'Vite · Tailwind · Recharts', color: '#3b82f6', bg: '#eff6ff', emoji: '⚛️' },
  { label: 'Node.js API Gateway', sub: 'Express 5 · Auth · CORS',    color: '#16a34a', bg: '#f0fdf4', emoji: '🔀' },
  { label: 'Gemini 2.5 Flash',    sub: 'Function Calling · Agentic', color: '#a855f7', bg: '#faf5ff', emoji: '✨' },
  { label: 'FastAPI Service',     sub: 'Python · PINN Inference',    color: '#f59e0b', bg: '#fffbeb', emoji: '🐍' },
  { label: 'PINN Model',          sub: 'TensorFlow · Physics Laws',  color: '#06b6d4', bg: '#ecfeff', emoji: '🧠' },
  { label: 'MongoDB Atlas',       sub: 'Chat History · Profiles',    color: '#15803d', bg: '#f0fdf4', emoji: '🗄️' },
];

const TECH_STACK = [
  { cat: 'Frontend',  color: '#dbeafe', text: '#1e40af', items: ['React 19', 'Vite 8', 'Tailwind CSS 4', 'Recharts', 'Framer Motion'] },
  { cat: 'Backend',   color: '#dcfce7', text: '#166534', items: ['Node.js', 'Express 5', 'Python 3.11', 'FastAPI'] },
  { cat: 'AI & ML',   color: '#ede9fe', text: '#6d28d9', items: ['Gemini 2.5 Flash', 'Function Calling', 'PINN', 'TensorFlow'] },
  { cat: 'Data',      color: '#cffafe', text: '#0e7490', items: ['NASA POWER', 'GloFAS', 'SoilGrids', 'IMD Rain Data'] },
  { cat: 'Infra',     color: '#fef3c7', text: '#92400e', items: ['MongoDB Atlas', 'Firebase Auth', 'Vercel', 'Render'] },
];

const RATING_STYLE = {
  Excellent: { badge: '#059669', bar: '#10b981', text: '#065f46' },
  Good:      { badge: '#2563eb', bar: '#3b82f6', text: '#1e40af' },
  Fair:      { badge: '#d97706', bar: '#f59e0b', text: '#92400e' },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1];
const fadeUp    = { hidden: { opacity: 0, y: 28 },     visible: { opacity: 1, y: 0 } };
const fadeIn    = { hidden: { opacity: 0 },            visible: { opacity: 1 } };
const scaleIn   = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };
const slideLeft = { hidden: { opacity: 0, x: -30 },   visible: { opacity: 1, x: 0 } };
const slideRight= { hidden: { opacity: 0, x: 30 },    visible: { opacity: 1, x: 0 } };
const stagger   = { visible: { transition: { staggerChildren: 0.09 } } };

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function InView({ children, variant = fadeUp, delay = 0, style, once = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-70px' });
  return (
    <motion.div ref={ref} variants={variant} initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.55, delay, ease }}
      style={style}>
      {children}
    </motion.div>
  );
}

function StaggerInView({ children, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={style}>
      {children}
    </motion.div>
  );
}

function EyebrowLabel({ children, color = '#4a6356' }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </p>
  );
}

function Counter({ target, suffix = '', active }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1500;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return <>{n}{suffix}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT MOCKUP — animated state machine
// ─────────────────────────────────────────────────────────────────────────────

function ChatMockup() {
  // 0=user visible, 1=typing, 2=response, 3=cards
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seq = [
      [0, 600], [1, 1800], [2, 3800], [3, 4800], [0, 8000],
    ];
    let timers = [];
    function run(offset = 0) {
      timers = seq.map(([s, delay]) => setTimeout(() => setStep(s), delay + offset));
    }
    run();
    const loop = setInterval(() => { timers.forEach(clearTimeout); run(0); }, 9000);
    return () => { timers.forEach(clearTimeout); clearInterval(loop); };
  }, []);

  return (
    <div className="chat-mockup-shell">
      {/* chrome bar */}
      <div className="chat-chrome">
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>AQUAH Assistant</span>
        </div>
        <span style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>aquah-cc.vercel.app</span>
      </div>

      {/* feed */}
      <div style={{ padding: '16px 16px 12px', background: '#f8faf8', minHeight: 280, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>

        {/* user message */}
        <AnimatePresence>
          {step >= 0 && (
            <motion.div key="user" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
              style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="bubble-user">Which crop should I grow this Kharif season?</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* typing indicator */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="ai-avatar"><MessageSquare size={12} color="white" /></div>
              <div className="bubble-typing">
                <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                <div className="typing-dot" style={{ animationDelay: '160ms' }} />
                <div className="typing-dot" style={{ animationDelay: '320ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI response */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div key="response" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div className="ai-avatar"><MessageSquare size={12} color="white" /></div>
              <div className="bubble-ai">
                Based on your <strong>Loamy Soil</strong> profile and live basin data — <strong>Rice</strong> is the #1 match at 87/100. Moderate flood risk; plant on raised beds.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* widget cards */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div key="cards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              style={{ marginLeft: 34, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="widget-card-light">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span className="widget-label">FLOOD RISK</span>
                  <Activity size={11} color="#16a34a" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>MODERATE</div>
                <div className="widget-sub">Basin sensors</div>
              </div>
              <div className="widget-card-dark">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#86efac', letterSpacing: '0.08em', textTransform: 'uppercase' }}>TOP CROP</span>
                  <Leaf size={11} color="#4ade80" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Rice</div>
                <div style={{ fontSize: 9, color: '#86efac', marginTop: 2 }}>Score 87 · Excellent</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* input bar */}
      <div className="chat-input-bar">
        <div className="chat-input-pill">Ask in any language…</div>
        <div className="mic-btn"><Mic size={13} color="white" /></div>
        <div className="send-btn"><Send size={13} color="white" /></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED TERMINAL
// ─────────────────────────────────────────────────────────────────────────────

function Terminal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= PIPELINE.length) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={ref} className="terminal-shell">
      <div className="terminal-chrome">
        {['#ef4444','#f59e0b','#22c55e'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontSize: 11, color: '#4a6356', fontFamily: 'monospace', marginLeft: 8 }}>
          aquah-cc — request trace
        </span>
      </div>
      <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
        {PIPELINE.map((row, i) => (
          <AnimatePresence key={i}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', gap: 12, marginBottom: 6, whiteSpace: 'nowrap' }}>
                <span style={{ color: row.color, fontWeight: 700, minWidth: 88, fontFamily: 'monospace', fontSize: 12 }}>
                  {row.prefix}
                </span>
                <span style={{ color: '#a3b8a8', fontSize: 12, fontFamily: 'monospace' }}>{row.line}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
        {visibleCount >= PIPELINE.length && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: 12 }}>
            █
          </motion.span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────

function ArchNode({ node, index, isInView }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.45, delay: index * 0.08, ease }}
      className="arch-node"
      style={{ borderLeft: `3px solid ${node.color}` }}>
      <div style={{ width: 36, height: 36, background: node.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
        {node.emoji}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0d1f14' }}>{node.label}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{node.sub}</div>
      </div>
      <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
    </motion.div>
  );
}

function Connection({ color, index }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 36, position: 'relative', justifyContent: 'center' }}>
      <div style={{ width: 1.5, height: '100%', background: 'rgba(15,61,36,0.1)', position: 'absolute' }} />
      <motion.div
        style={{ width: 8, height: 8, borderRadius: '50%', background: color, position: 'absolute', top: 0, boxShadow: `0 0 6px ${color}` }}
        animate={{ top: ['-4px', 'calc(100% - 4px)'], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, delay: index * 0.25, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function ArchDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-100px' });

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
      {ARCH_NODES.map((node, i) => (
        <div key={node.label}>
          <ArchNode node={node} index={i} isInView={isInView} />
          {i < ARCH_NODES.length - 1 && <Connection color={node.color} index={i} />}
        </div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHARTS TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

function HydroTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: '#86efac', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{payload[0].value} <span style={{ fontSize: 11, color: '#9ca3af' }}>m³/s</span></p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage({ onGetStarted }) {
  const metricsRef = useRef(null);
  const metricsInView = useInView(metricsRef, { once: true, margin: '-60px' });

  const navLinks = ['Features', 'Architecture', 'Technology', 'Demo'];

  return (
    <div className="lp-root">

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <a href="#top" className="lp-nav-brand">AQUAH-CC</a>
        <div className="lp-nav-links">
          {navLinks.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="lp-nav-link">{l}</a>
          ))}
          <a href="https://github.com/Harsha07r/AQUAH-CC-Climate-Modelling-using-DL" target="_blank" rel="noreferrer" className="lp-nav-link" aria-label="GitHub">
            <GitBranch size={16} />
          </a>
        </div>
        <button onClick={onGetStarted} className="lp-cta-btn lp-cta-btn--sm">
          Sign In <ChevronRight size={14} />
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section id="top" className="lp-hero">
        <div className="lp-hero-inner">
          {/* left */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="lp-hero-copy">
            <motion.h1 variants={fadeUp} transition={{ duration: 0.6, ease }}
              className="lp-headline">
              AI-Powered Climate<br />Intelligence for<br />Smarter Farming
            </motion.h1>
            <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.1, ease }}
              className="lp-sub">
              Predict floods, receive multilingual AI assistance, and discover the best crops for your land — using real-time hydrology data from the Jhelum Basin.
            </motion.p>
            <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.15, ease }}
              style={{ fontSize: 12, color: 'rgba(167,212,184,0.8)', marginBottom: 32, lineHeight: 1.6 }}>
              Powered by Gemini 2.5&nbsp;Flash · Physics-Informed Neural Network · Live Basin Sensors
            </motion.p>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.2, ease }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={onGetStarted} className="lp-cta-btn lp-cta-btn--hero">
                Get Started <ChevronRight size={16} />
              </button>
              <a href="#architecture" className="lp-ghost-btn">See Architecture</a>
            </motion.div>
          </motion.div>

          {/* right — animated chat */}
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="lp-hero-mockup">
            <ChatMockup />
          </motion.div>
        </div>
      </section>

      {/* ── TECH STRIP ──────────────────────────────────────────────────── */}
      <div className="lp-tech-strip">
        {[
          { icon: <Zap size={18} />,    label: 'Gemini 2.5 Flash',             sub: 'Function Calling AI' },
          { icon: <Brain size={18} />,  label: 'Physics-Informed Neural Net',  sub: 'PINN Hydrology Engine' },
          { icon: <Droplet size={18}/>, label: 'Live Basin Sensors',            sub: 'Real-Time Jhelum Data' },
          { icon: <Globe size={18} />,  label: 'Multilingual AI',              sub: 'English · Hindi · Urdu · Kashmiri' },
        ].map(item => (
          <div key={item.label} className="lp-tech-card">
            <div className="lp-tech-icon">{item.icon}</div>
            <div>
              <div className="lp-tech-name">{item.label}</div>
              <div className="lp-tech-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── WHY AQUAH-CC ────────────────────────────────────────────────── */}
      <section className="lp-why">
        <div className="lp-container">
          <InView>
            <EyebrowLabel color="#86efac">Why it exists</EyebrowLabel>
            <h2 className="lp-section-title" style={{ color: '#fff', maxWidth: 540 }}>
              Agriculture is the first casualty of a changing climate
            </h2>
          </InView>
          <StaggerInView style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { emoji: '🌡️', title: 'Unpredictable weather', body: 'Climate change is disrupting growing seasons across the Kashmir valley. Farmers relying on generational knowledge find it increasingly unreliable.' },
              { emoji: '💬', title: 'Advice in your language', body: 'Agricultural guidance shouldn\'t require English literacy. AQUAH-CC delivers AI-powered advice in the farmer\'s native language — voice or text.' },
              { emoji: '🔬', title: 'Physics, not just patterns', body: 'Pure ML models can fail on unseen events. Our PINN enforces hydrological equations during training — making flood forecasts trustworthy even in rare scenarios.' },
            ].map(c => (
              <motion.div key={c.title} variants={fadeUp} transition={{ duration: 0.5, ease }} className="lp-why-card">
                <div className="lp-why-emoji">{c.emoji}</div>
                <h3 className="lp-why-title">{c.title}</h3>
                <p className="lp-why-body">{c.body}</p>
              </motion.div>
            ))}
          </StaggerInView>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="lp-section" style={{ paddingTop: 80 }}>
        <div className="lp-container">
          <InView>
            <EyebrowLabel>Platform</EyebrowLabel>
            <h2 className="lp-section-title">Three modules. One platform.</h2>
            <p className="lp-section-body" style={{ maxWidth: 520 }}>
              Every module is driven by real-time data from the Jhelum basin and designed around actual farmer workflows.
            </p>
          </InView>
          <StaggerInView style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { icon: <MessageSquare size={22} color="#0f3d24" />, bg: '#ecfdf5', accent: '#0f3d24', title: 'AI Assistant', body: 'Converse with Gemini 2.5 Flash in English or Hindi using voice or text. Persistent chat history, soil profile injection, and real-time crop advisory — all in one place.', tag: '4 Languages · Voice Input' },
              { icon: <Droplet size={22} color="#1d4ed8" />,       bg: '#eff6ff', accent: '#1d4ed8', title: 'Hydrology Forecast', body: 'A PINN trained on Jhelum basin sensor data delivers a multi-day river discharge forecast with live flood risk classification — updated on every request.', tag: 'PINN · m³/s · Real-Time' },
              { icon: <Leaf size={22} color="#059669" />,          bg: '#f0fdf4', accent: '#059669', title: 'Crop Advisory', body: 'Per-season crop rankings scored 0–100 against your soil profile, live hydrology data, and climatological models. Your Farm Digital Twin is the source of truth.', tag: 'Kharif & Rabi · Score 0–100' },
            ].map(f => (
              <motion.div key={f.title} variants={scaleIn} transition={{ duration: 0.45, ease }}
                className="lp-feature-card" style={{ '--accent': f.accent }}>
                <div style={{ width: 48, height: 48, background: f.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-body">{f.body}</p>
                <p className="lp-feature-tag">{f.tag}</p>
              </motion.div>
            ))}
          </StaggerInView>
        </div>
      </section>

      {/* ── METRICS ─────────────────────────────────────────────────────── */}
      <section className="lp-metrics-section" ref={metricsRef}>
        <div className="lp-container">
          <InView>
            <EyebrowLabel color="#86efac">By the numbers</EyebrowLabel>
            <h2 className="lp-section-title" style={{ color: '#fff' }}>Built on real data</h2>
          </InView>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 40 }}>
            {METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <InView key={m.label} delay={i * 0.08}>
                  <div className="lp-metric-card">
                    <Icon size={18} color="#4ade80" style={{ marginBottom: 10 }} />
                    <div className="lp-metric-value">
                      <Counter target={m.value} suffix={m.suffix} active={metricsInView} />
                    </div>
                    <div className="lp-metric-label">{m.label}</div>
                    <div className="lp-metric-sub">{m.sub}</div>
                  </div>
                </InView>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ────────────────────────────────────────────────── */}
      <section id="architecture" className="lp-section" style={{ background: '#f7f9f7' }}>
        <div className="lp-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'flex-start' }}>
            <div>
              <InView>
                <EyebrowLabel>System Design</EyebrowLabel>
                <h2 className="lp-section-title">End-to-end architecture</h2>
                <p className="lp-section-body">
                  A full-stack agentic system: the React frontend speaks to an Express API gateway that orchestrates Gemini function calls, fetches live hydrology data from the PINN model, stores everything in MongoDB, and returns a structured response — all within a single user message.
                </p>
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Agentic function-calling pipeline', 'Persistent per-user chat sessions', 'Physics-constrained ML inference', 'Real-time flood risk + crop scoring'].map(pt => (
                    <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f3d24', flexShrink: 0 }} />
                      {pt}
                    </div>
                  ))}
                </div>
              </InView>
            </div>
            <ArchDiagram />
          </div>
        </div>
      </section>

      {/* ── PIPELINE ────────────────────────────────────────────────────── */}
      <section className="lp-pipeline-section">
        <div className="lp-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 56, alignItems: 'flex-start' }}>
          <InView variant={slideLeft}>
            <EyebrowLabel color="#86efac">Request trace</EyebrowLabel>
            <h2 className="lp-section-title" style={{ color: '#fff' }}>Watch the AI agent work</h2>
            <p style={{ fontSize: 14, color: '#6b8f78', lineHeight: 1.75 }}>
              Every query triggers a 10-step pipeline. Gemini autonomously decides to call the hydrology API, fetches live basin data, generates a multilingual response, and persists the conversation — all in a single round-trip.
            </p>
          </InView>
          <InView variant={slideRight}>
            <Terminal />
          </InView>
        </div>
      </section>

      {/* ── HYDROLOGY ───────────────────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 64, alignItems: 'center' }}>
            <InView variant={slideLeft}>
              <EyebrowLabel color="#1d4ed8">Hydrology Module</EyebrowLabel>
              <h2 className="lp-section-title">Live Jhelum River Discharge Forecast</h2>
              <p className="lp-section-body">
                A Physics-Informed Neural Network trained on historical Jhelum basin sensor data enforces fluid dynamics equations during training — delivering reliable discharge forecasts even for high-impact flood events.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
                {[
                  { label: 'Avg Flow',   value: '412 m³/s', color: '#1d4ed8' },
                  { label: 'Peak Flow',  value: '520 m³/s', color: '#4f46e5' },
                  { label: 'Flood Risk', value: 'MODERATE', color: '#d97706' },
                  { label: 'Soil pH',    value: '6.8',      color: '#059669' },
                ].map(s => (
                  <div key={s.label} className="lp-stat-tile">
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </InView>

            <InView variant={slideRight}>
              <div className="lp-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#0d1f14', marginBottom: 2 }}>Discharge Forecast</h3>
                    <p style={{ fontSize: 11, color: '#9ca3af' }}>River flow · m³/s · PINN model</p>
                  </div>
                  <Droplet size={18} color="#3b82f6" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={FORECAST} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hydroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<HydroTooltip />} />
                    <Area type="monotone" dataKey="flow" stroke="#3b82f6" strokeWidth={2.5}
                      fill="url(#hydroGrad)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                    Flood risk: <strong>MODERATE</strong> — Peak discharge on Day 4 (520 m³/s)
                  </p>
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* ── CROPS ───────────────────────────────────────────────────────── */}
      <section className="lp-section" style={{ background: '#f0f5f1' }}>
        <div className="lp-container">
          <InView>
            <EyebrowLabel>Crop Advisory</EyebrowLabel>
            <h2 className="lp-section-title">Season-wise crop rankings</h2>
            <p className="lp-section-body" style={{ maxWidth: 520 }}>
              Every crop scored 0–100 against soil profile, water availability, and real-time flood risk. The AI cross-references your saved Farm Digital Twin on every query.
            </p>
          </InView>
          <StaggerInView style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 40 }}>
            {CROPS.map(c => {
              const s = RATING_STYLE[c.rating];
              return (
                <motion.div key={c.name} variants={scaleIn} transition={{ duration: 0.4, ease }}
                  className="lp-crop-card" style={{ '--card-accent': s.badge }}>
                  {c.top && (
                    <div className="lp-crop-badge">
                      <Award size={9} /> #1 Pick · Kharif
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: c.top ? 10 : 0 }}>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#0d1f14' }}>{c.name}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: s.badge, padding: '3px 10px', borderRadius: 20 }}>{c.rating}</span>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>Suitability</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.text, fontVariantNumeric: 'tabular-nums' }}>{c.score}/100</span>
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: `${c.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease }}
                        style={{ height: '100%', background: s.bar, borderRadius: 3 }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{c.note}</p>
                </motion.div>
              );
            })}
          </StaggerInView>
        </div>
      </section>

      {/* ── LANGUAGES ───────────────────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <InView variant={slideLeft}>
              <EyebrowLabel>Multilingual</EyebrowLabel>
              <h2 className="lp-section-title">Speak or type in your language</h2>
              <p className="lp-section-body">
                Three independent translation layers work in concert: browser-native Web Speech API for voice input, a static UI dictionary for labels, and a Gemini language directive that generates the AI's reply directly in the target script — no separate translation step.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { flag: '🇬🇧', lang: 'English', code: 'en-IN', sample: 'Which crop this Kharif?', full: true },
                  { flag: '🇮🇳', lang: 'हिंदी',   code: 'hi-IN', sample: 'इस मौसम में कौन सी फसल?', full: true },
                ].map(l => (
                  <div key={l.code} className="lp-lang-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{l.flag}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1f14' }}>{l.lang}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>{l.code}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#4a6356', marginBottom: 10, lineHeight: 1.5 }}>{l.sample}</p>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1,2,3].map(d => <div key={d} style={{ flex: 1, height: 4, borderRadius: 2, background: d <= 3 ? '#0f3d24' : '#e8ede9' }} />)}
                    </div>
                    <div style={{ fontSize: 10, color: '#16a34a', marginTop: 5, fontWeight: 600 }}>Full STT · Full AI</div>
                  </div>
                ))}
              </div>
            </InView>

            <InView variant={slideRight}>
              <div className="lp-lang-explainer">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1f14', marginBottom: 16 }}>Three-layer multilingual pipeline</h3>
                {[
                  { n: '01', title: 'Voice Input (STT)', body: 'Browser-native Web Speech API. The recognition language tag is updated live when the user switches — no re-initialisation needed.' },
                  { n: '02', title: 'UI Translation', body: 'A flat JS dictionary keyed by BCP-47 code serves all 26+ UI strings. Widgets snapshot the language at render-time to prevent re-translation on switch.' },
                  { n: '03', title: 'AI Response Language', body: 'A language directive embedded in the Gemini prompt instructs the model to generate its conversational reply directly in the target script.' },
                ].map(layer => (
                  <div key={layer.n} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f0f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0f3d24', flexShrink: 0, marginTop: 2 }}>{layer.n}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1f14', marginBottom: 3 }}>{layer.title}</div>
                      <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6 }}>{layer.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────────────────── */}
      <section id="technology" className="lp-section" style={{ background: '#f0f5f1' }}>
        <div className="lp-container">
          <InView>
            <EyebrowLabel>Stack</EyebrowLabel>
            <h2 className="lp-section-title">Built with</h2>
            <p className="lp-section-body" style={{ maxWidth: 500 }}>A production-grade stack from browser to ML model, designed for real-world deployment.</p>
          </InView>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 40 }}>
            {TECH_STACK.map((cat, ci) => (
              <InView key={cat.cat} delay={ci * 0.06}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: 90, fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 6, flexShrink: 0 }}>
                    {cat.cat}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cat.items.map(item => (
                      <span key={item} style={{ background: cat.color, color: cat.text, fontSize: 12.5, fontWeight: 600, padding: '5px 14px', borderRadius: 20, border: `1px solid ${cat.color}` }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO ────────────────────────────────────────────────────────── */}
      <section id="demo" className="lp-section">
        <div className="lp-container">
          <InView>
            <EyebrowLabel>Demo</EyebrowLabel>
            <h2 className="lp-section-title">See AQUAH-CC in action</h2>
            <p className="lp-section-body" style={{ maxWidth: 500 }}>A 60-second walkthrough of the AI assistant, hydrology dashboard, and crop advisory in action.</p>
          </InView>
          <InView delay={0.1}>
            <div className="lp-demo-card">
              <div className="lp-demo-inner">
                <div className="lp-demo-play">
                  <Play size={28} color="white" fill="white" />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 16 }}>Product walkthrough · 60 seconds</p>
              </div>
              <div className="lp-demo-overlay" />
            </div>
          </InView>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="lp-cta-section">
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
          <InView>
            <h2 className="lp-cta-headline">Ready to explore the full system?</h2>
            <p style={{ color: '#86efac', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Sign in with Google or create an account to access AI crop advisory, live hydrology forecasts, and multilingual voice input.
            </p>
            <button onClick={onGetStarted} className="lp-cta-btn lp-cta-btn--hero">
              Get Started <ChevronRight size={18} />
            </button>
          </InView>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#0f3d24', fontSize: 16 }}>AQUAH-CC</span>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'GitHub',        href: 'https://github.com/Harsha07r/AQUAH-CC-Climate-Modelling-using-DL' },
              { label: 'Architecture',  href: '#architecture' },
              { label: 'Technology',    href: '#technology' },
              { label: 'Demo',          href: '#demo' },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
                className="lp-footer-link">
                {l.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            Gemini 2.5 Flash · PINN · Jhelum Basin
          </p>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ───────────────────────────────────────────────── */}
      <style>{`
        /* Root */
        .lp-root { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #0d1f14; line-height: 1.6; scroll-behavior: smooth; }
        .lp-container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }
        .lp-section { padding: 88px 0; }

        /* Nav */
        .lp-nav { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(15,61,36,0.08); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 62px; }
        .lp-nav-brand { font-family: Georgia, serif; font-weight: 700; font-size: 18px; color: #0f3d24; letter-spacing: -0.02em; text-decoration: none; }
        .lp-nav-links { display: flex; align-items: center; gap: 28px; }
        .lp-nav-link { font-size: 13.5px; font-weight: 500; color: #4a6356; text-decoration: none; display: flex; align-items: center; transition: color 0.2s; }
        .lp-nav-link:hover { color: #0f3d24; }

        /* CTA buttons */
        .lp-cta-btn { display: inline-flex; align-items: center; gap: 6px; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; border-radius: 28px; }
        .lp-cta-btn--sm { background: #0f3d24; color: #fff; padding: 8px 20px; font-size: 13px; }
        .lp-cta-btn--sm:hover { background: #1a5c38; }
        .lp-cta-btn--hero { background: #fff; color: #0f3d24; padding: 14px 32px; font-size: 15px; box-shadow: 0 4px 20px rgba(255,255,255,0.2); }
        .lp-cta-btn--hero:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,255,255,0.3); }
        .lp-ghost-btn { border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.9); border-radius: 28px; padding: 14px 28px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; transition: all 0.2s; }
        .lp-ghost-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }

        /* Hero */
        .lp-hero { background: linear-gradient(140deg, #0f3d24 0%, #1e5c38 45%, #0c2f1b 100%); padding: 80px 32px 88px; }
        .lp-hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .lp-hero-copy { display: flex; flex-direction: column; }
        .lp-headline { font-family: Georgia, serif; font-size: clamp(36px, 5vw, 58px); font-weight: 700; color: #fff; line-height: 1.07; letter-spacing: -0.03em; margin-bottom: 22px; text-wrap: balance; }
        .lp-sub { color: #a7d4b8; font-size: 16px; line-height: 1.72; max-width: 440px; margin-bottom: 14px; }
        .lp-hero-mockup { display: flex; justify-content: center; }

        /* Chat mockup */
        .chat-mockup-shell { background: #fff; border-radius: 20px; box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06); overflow: hidden; width: 100%; max-width: 360px; }
        .chat-chrome { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
        .bubble-user { background: #e5e7eb; color: #111; font-size: 13px; padding: 10px 16px; border-radius: 16px 16px 4px 16px; max-width: 78%; line-height: 1.5; }
        .ai-avatar { width: 28px; height: 28px; background: #0f3d24; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .bubble-typing { background: #fff; border: 1px solid #eee; padding: 12px 16px; border-radius: 4px 16px 16px 16px; display: flex; gap: 5px; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #9ca3af; animation: typing-bounce 1s ease-in-out infinite; }
        @keyframes typing-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        .bubble-ai { background: #fff; border: 1px solid #eee; font-size: 13px; color: #374151; padding: 12px 14px; border-radius: 4px 16px 16px 16px; max-width: 82%; line-height: 1.6; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .widget-card-light { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 10px 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .widget-card-dark { background: #0f3d24; border-radius: 14px; padding: 10px 12px; }
        .widget-label { font-size: 8px; font-weight: 700; color: #9ca3af; letter-spacing: 0.08em; text-transform: uppercase; }
        .widget-sub { font-size: 9px; color: #9ca3af; margin-top: 2px; }
        .chat-input-bar { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-top: 1px solid #f0f0f0; background: #fff; }
        .chat-input-pill { flex: 1; background: #f3f4f6; border-radius: 20px; padding: 7px 12px; font-size: 11px; color: #9ca3af; }
        .mic-btn { width: 30px; height: 30px; background: #0f3d24; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .send-btn { width: 30px; height: 30px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        /* Tech strip */
        .lp-tech-strip { background: #0d1f14; display: flex; justify-content: center; flex-wrap: wrap; gap: 0; }
        .lp-tech-card { display: flex; align-items: center; gap: 12px; padding: 20px 32px; border-right: 1px solid rgba(255,255,255,0.06); transition: background 0.2s; cursor: default; }
        .lp-tech-card:last-child { border-right: none; }
        .lp-tech-card:hover { background: rgba(255,255,255,0.03); }
        .lp-tech-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.07); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #4ade80; flex-shrink: 0; }
        .lp-tech-name { font-size: 13px; font-weight: 700; color: #fff; }
        .lp-tech-sub { font-size: 11px; color: #4a6356; margin-top: 1px; }

        /* Section typography */
        .lp-section-title { font-family: Georgia, serif; font-size: clamp(26px, 3.5vw, 40px); font-weight: 700; color: #0d1f14; letter-spacing: -0.02em; line-height: 1.13; margin-bottom: 14px; text-wrap: balance; }
        .lp-section-body { font-size: 15px; color: #4a6356; line-height: 1.72; margin-bottom: 0; }

        /* Why */
        .lp-why { background: linear-gradient(140deg, #0d1f14 0%, #0f3d24 100%); padding: 88px 32px; }
        .lp-why-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; backdrop-filter: blur(8px); transition: background 0.25s, transform 0.25s; cursor: default; }
        .lp-why-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-3px); }
        .lp-why-emoji { font-size: 28px; margin-bottom: 14px; }
        .lp-why-title { font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .lp-why-body { font-size: 14px; color: #6b8f78; line-height: 1.72; }

        /* Feature cards */
        .lp-feature-card { background: #fff; border-radius: 18px; border: 1px solid #e8ede9; padding: 30px 26px; box-shadow: 0 1px 6px rgba(15,61,36,0.05); transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; cursor: default; }
        .lp-feature-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(15,61,36,0.12); border-color: var(--accent, #0f3d24); }
        .lp-feature-title { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #0d1f14; margin-bottom: 10px; }
        .lp-feature-body { font-size: 14px; color: #4a6356; line-height: 1.7; margin-bottom: 16px; }
        .lp-feature-tag { font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 0.07em; text-transform: uppercase; }

        /* Metrics */
        .lp-metrics-section { background: linear-gradient(140deg, #0d1f14, #0f3d24); padding: 80px 32px; }
        .lp-metric-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px 20px; text-align: center; transition: background 0.2s; }
        .lp-metric-card:hover { background: rgba(255,255,255,0.08); }
        .lp-metric-value { font-family: Georgia, serif; font-size: 36px; font-weight: 700; color: #fff; letter-spacing: -0.03em; line-height: 1; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
        .lp-metric-label { font-size: 13px; font-weight: 600; color: #a7d4b8; margin-bottom: 4px; }
        .lp-metric-sub { font-size: 10px; color: #4a6356; }

        /* Architecture */
        .arch-node { display: flex; align-items: center; gap: 14px; background: #fff; border-radius: 14px; border: 1px solid #e8ede9; padding: 16px 18px; box-shadow: 0 2px 8px rgba(15,61,36,0.06); transition: box-shadow 0.2s, transform 0.2s; cursor: default; }
        .arch-node:hover { box-shadow: 0 8px 24px rgba(15,61,36,0.1); transform: translateX(4px); }

        /* Pipeline */
        .lp-pipeline-section { background: #040f07; padding: 88px 32px; }
        .terminal-shell { background: #040f07; border-radius: 14px; border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 24px 60px rgba(0,0,0,0.5); overflow: hidden; }
        .terminal-chrome { background: #0a1f0f; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 10px 16px; display: flex; align-items: center; gap: 6px; }

        /* Hydrology */
        .lp-stat-tile { background: #fff; border: 1px solid #e8ede9; border-radius: 12px; padding: 14px 16px; }
        .lp-chart-card { background: #fff; border-radius: 20px; border: 1px solid #e8ede9; padding: 28px; box-shadow: 0 4px 24px rgba(15,61,36,0.07); }

        /* Crop cards */
        .lp-crop-card { position: relative; background: #fff; border-radius: 16px; padding: 22px 20px; border: 1px solid #e8ede9; box-shadow: 0 1px 6px rgba(15,61,36,0.04); transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; cursor: default; }
        .lp-crop-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(15,61,36,0.1); border-color: var(--card-accent, #059669); }
        .lp-crop-badge { position: absolute; top: -12px; left: 18px; background: #0f3d24; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }

        /* Languages */
        .lp-lang-card { background: #fff; border: 1px solid #e8ede9; border-radius: 14px; padding: 16px 18px; box-shadow: 0 1px 4px rgba(15,61,36,0.05); }
        .lp-lang-explainer { background: #f7f9f7; border-radius: 18px; padding: 28px; border: 1px solid #e8ede9; }

        /* Demo */
        .lp-demo-card { position: relative; height: 340px; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #0f3d24, #0d1f14); border: 1px solid rgba(255,255,255,0.08); margin-top: 40px; cursor: pointer; }
        .lp-demo-inner { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .lp-demo-play { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: all 0.25s; }
        .lp-demo-card:hover .lp-demo-play { background: rgba(255,255,255,0.25); transform: scale(1.08); }
        .lp-demo-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.12) 0%, transparent 70%); }

        /* CTA section */
        .lp-cta-section { background: linear-gradient(140deg, #0f3d24, #0d1f14); padding: 96px 24px; text-align: center; }
        .lp-cta-headline { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 16px; text-wrap: balance; }

        /* Footer */
        .lp-footer { padding: 28px 32px; border-top: 1px solid #e8ede9; max-width: 1100px; margin: 0 auto; }
        .lp-footer-link { font-size: 13px; color: #9ca3af; text-decoration: none; transition: color 0.2s; }
        .lp-footer-link:hover { color: #0f3d24; }

        /* Responsive */
        @media (max-width: 900px) {
          .lp-hero-inner { grid-template-columns: 1fr; }
          .lp-hero-mockup { display: none; }
          .lp-pipeline-section .lp-container,
          .lp-why .lp-container { display: block !important; }
          .lp-section .lp-container > div[style*="grid-template-columns: 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .lp-nav-links { display: none; }
          .lp-hero { padding: 56px 20px 64px; }
          .lp-container { padding: 0 20px; }
          .lp-section { padding: 64px 0; }
          .lp-tech-strip { flex-direction: column; }
          .lp-tech-card { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .lp-tech-card:last-child { border-bottom: none; }
        }

        /* Focus / accessibility */
        button:focus-visible, a:focus-visible { outline: 2px solid #22c55e; outline-offset: 3px; }
      `}</style>
    </div>
  );
}
