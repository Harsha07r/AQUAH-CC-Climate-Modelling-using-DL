import { useState, useEffect } from 'react';
import { Droplets, Thermometer, Wind, MapPin } from 'lucide-react';
import HydrologyDashboard from './HydrologyDashboard';
import { API_BASE_URL } from '../config';

const RISK_CONFIG = {
  HIGH:     { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    dot: 'bg-red-500'    },
  MODERATE: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-600',  dot: 'bg-amber-500'  },
  LOW:      { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-600',  dot: 'bg-green-500'  },
};

export default function HydrologyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/report`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => {
        setError('The AQUAH hydrology engine is currently unreachable.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Fetching live basin data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const hydrology = data?.hydrology ?? {};
  const risk = hydrology.flood_risk ?? 'UNKNOWN';
  const riskStyle = RISK_CONFIG[risk] ?? RISK_CONFIG.LOW;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0f3d24]">Hydrology Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Live Jhelum Basin sensor readings &amp; PINN model predictions
          </p>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          {/* Flood Risk */}
          <div className={`rounded-2xl p-4 border ${riskStyle.bg} ${riskStyle.border} col-span-2 md:col-span-1`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${riskStyle.dot} animate-pulse`} />
              <p className="text-xs font-bold text-gray-400 uppercase">Flood Risk</p>
            </div>
            <p className={`text-2xl font-black ${riskStyle.text}`}>{risk}</p>
            <p className="text-xs text-gray-500 mt-1">Real-time assessment</p>
          </div>

          {/* Avg Flow */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={14} className="text-blue-500" />
              <p className="text-xs font-bold text-gray-400 uppercase">Avg Flow</p>
            </div>
            <p className="text-2xl font-black text-gray-800">
              {hydrology.avg_flow_m3s != null ? Math.round(hydrology.avg_flow_m3s) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">m³/s</p>
          </div>

          {/* Max Flow */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wind size={14} className="text-indigo-500" />
              <p className="text-xs font-bold text-gray-400 uppercase">Peak Flow</p>
            </div>
            <p className="text-2xl font-black text-gray-800">
              {hydrology.max_flow_m3s != null ? Math.round(hydrology.max_flow_m3s) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">m³/s forecast peak</p>
          </div>

          {/* Temperature */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer size={14} className="text-orange-400" />
              <p className="text-xs font-bold text-gray-400 uppercase">Avg Temp</p>
            </div>
            <p className="text-2xl font-black text-gray-800">
              {data?.meteorology?.avg_temp_c != null ? `${data.meteorology.avg_temp_c}°` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Celsius</p>
          </div>
        </div>

        {/* Location pill */}
        {data?.location && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
            <MapPin size={13} />
            <span>
              {data.location.name} &nbsp;·&nbsp; {data.location.lat}°N, {data.location.lon}°E
            </span>
          </div>
        )}

        {/* The discharge forecast chart */}
        <HydrologyDashboard
          forecast={hydrology.forecast ?? []}
          avgFlow={hydrology.avg_flow_m3s}
          maxFlow={hydrology.max_flow_m3s}
          soil={data?.soil}
          temperature={data?.meteorology?.avg_temp_c}
          location={data?.location}
        />
      </div>
    </div>
  );
}
