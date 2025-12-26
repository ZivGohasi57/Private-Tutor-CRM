import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Loader2 } from 'lucide-react';

const DEFAULT_RATES = {
  elementary: 100,
  middle_school: 140,
  high_school: 160,
  academic: 200,
  academic_extra: 150 // New field for the "after first hour" logic
};

export const PricingManager = ({ onClose, onUpdate }) => {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedRates = localStorage.getItem('user_rates');
    if (savedRates) {
      setRates(JSON.parse(savedRates));
    }
  }, []);

  const handleChange = (key, value) => {
    setRates(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  const handleSave = () => {
    setLoading(true);
    localStorage.setItem('user_rates', JSON.stringify(rates));
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      if (onUpdate) onUpdate(rates); // Pass updated rates back
      onClose();
    }, 500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default rates?')) {
      setRates(DEFAULT_RATES);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Edit Rates</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          
          {/* Elementary */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Elementary</label>
            <div className="relative">
              <input type="number" value={rates.elementary} onChange={(e) => handleChange('elementary', e.target.value)} className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
              <span className="absolute left-3 top-3 text-gray-400 font-bold">₪</span>
            </div>
          </div>

          {/* Middle School */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Middle School</label>
            <div className="relative">
              <input type="number" value={rates.middle_school} onChange={(e) => handleChange('middle_school', e.target.value)} className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
              <span className="absolute left-3 top-3 text-gray-400 font-bold">₪</span>
            </div>
          </div>

          {/* High School */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">High School</label>
            <div className="relative">
              <input type="number" value={rates.high_school} onChange={(e) => handleChange('high_school', e.target.value)} className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
              <span className="absolute left-3 top-3 text-gray-400 font-bold">₪</span>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2"></div>

          {/* Academic Logic */}
          <div className="bg-blue-50 p-3 rounded-xl space-y-3">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Academic Pricing</p>
            
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">First Hour (Base)</label>
              <div className="relative">
                <input type="number" value={rates.academic} onChange={(e) => handleChange('academic', e.target.value)} className="w-full p-3 pl-10 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
                <span className="absolute left-3 top-3 text-gray-400 font-bold">₪</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Extra Hours (After 1st)</label>
              <div className="relative">
                <input type="number" value={rates.academic_extra} onChange={(e) => handleChange('academic_extra', e.target.value)} className="w-full p-3 pl-10 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
                <span className="absolute left-3 top-3 text-gray-400 font-bold">₪</span>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
          <button onClick={handleReset} className="p-3 text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"><RotateCcw size={20} /></button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Rates</>}
          </button>
        </div>

      </div>
    </div>
  );
};