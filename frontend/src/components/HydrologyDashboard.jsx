import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const HydrologyDashboard = ({ forecast = [], avgFlow, maxFlow, soil, temperature, location }) => {
  // Transform API forecast [{date, flow_m3s}, ...] → chart format [{day, discharge}, ...]
  const flowData = forecast.map((item, index) => ({
    day: `Day ${index + 1}`,
    discharge: Math.round(item.flow_m3s)
  }));

  const hasData = flowData.length > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-4">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-[#0f3d24]">Jhelum River Discharge Forecast</h2>
          <p className="text-sm text-gray-500">PINN Model Predictions (m³/s)</p>
          {location && (
            <p className="text-xs text-gray-400 mt-1">{location.name} • Lat {location.lat}, Lon {location.lon}</p>
          )}
        </div>
        {hasData && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Avg: <span className="font-bold text-gray-700">{Math.round(avgFlow)}</span> m³/s</p>
            <p className="text-xs text-gray-500">Max: <span className="font-bold text-gray-700">{Math.round(maxFlow)}</span> m³/s</p>
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDischarge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} m³/s`, 'Discharge']}
              />
              <Area 
                type="monotone" 
                dataKey="discharge" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDischarge)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No forecast data available
          </div>
        )}
      </div>

      {/* Soil & Weather Summary */}
      {(soil || temperature) && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          {soil?.texture && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Soil Texture</p>
              <p className="font-bold text-gray-800">{soil.texture}</p>
            </div>
          )}
          {soil?.ph && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">pH Level</p>
              <p className="font-bold text-gray-800">{soil.ph}</p>
            </div>
          )}
          {temperature && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Avg Temp</p>
              <p className="font-bold text-gray-800">{temperature}°C</p>
            </div>
          )}
          {soil?.organic_carbon && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Organic Carbon</p>
              <p className="font-bold text-gray-800">{soil.organic_carbon}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HydrologyDashboard;