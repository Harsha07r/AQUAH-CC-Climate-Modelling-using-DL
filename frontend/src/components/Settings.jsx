// src/components/Settings.jsx
import { useState } from 'react';
import { Save, Map, Leaf, Droplets } from 'lucide-react';
import { auth } from "../firebase";
import { translations } from '../translations';

export default function Settings({ currentLanguage = 'en-IN' }) {
  const t = (key) => translations[currentLanguage]?.[key] || translations['en-IN'][key];
  const [soilType, setSoilType] = useState("");
  const [waterLevel, setWaterLevel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    // Get the currently logged-in Firebase user
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Send the data to your new Node.js /api/user route
      const response = await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          soilType: soilType,
          waterLevel: waterLevel
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setSaveMessage(t('profileSaved'));
      } else {
        setIsSuccess(false);
        setSaveMessage(t('profileError'));
      }
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      setSaveMessage(t('serverUnreachable'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0f3d24] p-6 text-white">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Map size={24} /> {t('farmProfile')}
          </h2>
          <p className="text-green-200 text-sm mt-1">{t('configureProfile')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="p-6 md:p-8 flex flex-col gap-6">

          {/* Soil Type Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Leaf size={16} className="text-green-600" /> {t('soilTypeLabel')}
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-colors"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              required
            >
              <option value="" disabled>{t('selectSoilType')}</option>
              <option value="Karewa Soil">{t('Karewa Soil')}</option>
              <option value="Alluvial Soil">{t('Alluvial Soil')}</option>
              <option value="Loamy Soil">{t('Loamy Soil')}</option>
              <option value="Sandy Loam">{t('Sandy Loam')}</option>
              <option value="Clay Loam">{t('Clay Loam')}</option>
              <option value="Glacial Soil">{t('Glacial Soil')}</option>
              <option value="Peaty Soil">{t('Peaty Soil')}</option>
            </select>
          </div>

          {/* Water Level Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Droplets size={16} className="text-blue-500" /> {t('waterLevelLabel')}
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-colors"
              value={waterLevel}
              onChange={(e) => setWaterLevel(e.target.value)}
              required
            >
              <option value="" disabled>{t('selectWaterLevel')}</option>
              <option value="High">{t('HIGH')}</option>
              <option value="Moderate">{t('MODERATE')}</option>
              <option value="Low">{t('LOW')}</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400 shadow-md"
          >
            {isSaving ? t('saving') : <><Save size={20} /> {t('saveProfile')}</>}
          </button>

          {/* Success/Error Message */}
          {saveMessage && (
            <p className={`text-center font-bold text-sm ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
              {saveMessage}
            </p>
          )}

        </form>
      </div>
    </div>
  );
}