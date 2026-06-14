import { useState, useEffect } from 'react';
import { Leaf, Activity, Droplets, ChevronDown, ChevronUp, Award } from 'lucide-react';

const RATING_CONFIG = {
  Excellent: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  Good:      { bg: 'bg-blue-50',    border: 'border-blue-200',    badge: 'bg-blue-500',    bar: 'bg-blue-400',    text: 'text-blue-700'    },
  Fair:      { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-500',   bar: 'bg-amber-400',   text: 'text-amber-700'   },
  Poor:      { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-500',     bar: 'bg-red-400',     text: 'text-red-700'     },
};

const RISK_TEXT = {
  HIGH:     'text-red-600',
  MODERATE: 'text-amber-600',
  LOW:      'text-green-600',
};

function CropCard({ name, data, isTop }) {
  const style = RATING_CONFIG[data.rating] ?? RATING_CONFIG.Fair;
  return (
    <div className={`relative rounded-2xl p-5 border ${style.bg} ${style.border}`}>
      {isTop && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#0f3d24] text-white text-xs font-bold px-2 py-1 rounded-full">
          <Award size={11} /> #1 Pick
        </div>
      )}
      <div className="flex justify-between items-start mb-3 pr-16">
        <h3 className="font-bold text-gray-800 text-base leading-tight">{name}</h3>
        <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ml-2 shrink-0 ${style.badge}`}>
          {data.rating}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Suitability Score</span>
          <span className={`font-bold ${style.text}`}>{data.score}/100</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
            style={{ width: `${data.score}%` }}
          />
        </div>
      </div>

      {data.note && (
        <p className="text-xs text-gray-600 leading-relaxed">{data.note}</p>
      )}
    </div>
  );
}

function SeasonSection({ season, crops, topCropName }) {
  const [open, setOpen] = useState(true);
  const sorted = Object.entries(crops).sort((a, b) => b[1].score - a[1].score);

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center mb-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-6 bg-[#0f3d24] rounded-full" />
          <h2 className="text-lg font-black text-gray-700 group-hover:text-[#0f3d24] transition-colors">
            {season} Season
          </h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
            {sorted.length} crops
          </span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(([name, cropData]) => (
            <CropCard
              key={name}
              name={name}
              data={cropData}
              isTop={name === topCropName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CropsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/report')
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => {
        setError('The AQUAH crop engine is currently unreachable.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading crop advisory data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const agriculture = data?.agriculture ?? {};
  const seasons = Object.keys(agriculture);
  const hydrology = data?.hydrology ?? {};
  const risk = hydrology.flood_risk ?? 'UNKNOWN';

  // Find single best crop across all seasons
  let topCropName = null;
  let topCropScore = -1;
  seasons.forEach((season) => {
    Object.entries(agriculture[season]).forEach(([name, crop]) => {
      if (crop.score > topCropScore) {
        topCropScore = crop.score;
        topCropName = name;
      }
    });
  });

  const totalCrops = seasons.reduce((sum, s) => sum + Object.keys(agriculture[s]).length, 0);
  const excellentCount = seasons.reduce((sum, s) =>
    sum + Object.values(agriculture[s]).filter((c) => c.rating === 'Excellent').length, 0);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0f3d24]">Crop Advisory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Physics-guided recommendations for current Jhelum Basin conditions
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className={RISK_TEXT[risk] ?? 'text-gray-500'} />
              <p className="text-xs font-bold text-gray-400 uppercase">Flood Risk</p>
            </div>
            <p className={`text-2xl font-black ${RISK_TEXT[risk] ?? 'text-gray-600'}`}>{risk}</p>
            <p className="text-xs text-gray-400 mt-1">Basin sensors</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={14} className="text-green-600" />
              <p className="text-xs font-bold text-gray-400 uppercase">Top Pick</p>
            </div>
            <p className="text-xl font-black text-gray-800 truncate">{topCropName ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">Score: {topCropScore > -1 ? topCropScore : '—'}/100</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={14} className="text-emerald-600" />
              <p className="text-xs font-bold text-gray-400 uppercase">Excellent</p>
            </div>
            <p className="text-2xl font-black text-gray-800">{excellentCount}</p>
            <p className="text-xs text-gray-400 mt-1">of {totalCrops} crops rated</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={14} className="text-blue-500" />
              <p className="text-xs font-bold text-gray-400 uppercase">Soil pH</p>
            </div>
            <p className="text-2xl font-black text-gray-800">{data?.soil?.ph ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{data?.soil?.texture ?? 'Soil type'}</p>
          </div>
        </div>

        {/* Top pick hero banner */}
        {topCropName && (
          <div className="bg-[#0f3d24] rounded-2xl p-6 mb-8 text-white flex items-center gap-5 shadow-md relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-green-500 rounded-full opacity-10 blur-2xl" />
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Award size={28} className="text-green-300" />
            </div>
            <div>
              <p className="text-green-300 text-xs font-bold uppercase mb-1">Season's Top Recommended Crop</p>
              <h2 className="text-3xl font-black">{topCropName}</h2>
              <p className="text-green-200 text-sm mt-1">
                Suitability score: <span className="font-bold text-white">{topCropScore}/100</span>
                &nbsp;·&nbsp; Rating: <span className="font-bold text-white">
                  {seasons.map((s) => agriculture[s][topCropName]?.rating).find(Boolean) ?? '—'}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Per-season sections */}
        {seasons.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No crop data available for current conditions.</p>
          </div>
        ) : (
          seasons.map((season) => (
            <SeasonSection
              key={season}
              season={season}
              crops={agriculture[season]}
              topCropName={topCropName}
            />
          ))
        )}
      </div>
    </div>
  );
}
