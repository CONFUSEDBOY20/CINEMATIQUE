import { useState } from 'react';
import { Save, Shield, Database, Monitor, Globe, BellRing } from 'lucide-react';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    darkMode: true,
    publicRegistration: true,
    apiCaching: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <h2 className="text-2xl font-bold font-serif text-white mb-2">System Settings</h2>
        <p className="text-[#888] text-sm">Configure global platform behavior and security policies</p>
      </div>

      <div className="space-y-6">
        {/* General Config */}
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#1A1A1A] border-b border-[#222] flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brand-gold" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">General Configuration</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Maintenance Mode</p>
                <p className="text-xs text-[#888]">Disable public access during updates</p>
              </div>
              <button 
                onClick={() => toggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-brand-crimson' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Public Registration</p>
                <p className="text-xs text-[#888]">Allow new users to sign up</p>
              </div>
              <button 
                onClick={() => toggle('publicRegistration')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.publicRegistration ? 'bg-brand-crimson' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.publicRegistration ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Performance & Security */}
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#1A1A1A] border-b border-[#222] flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Performance & Security</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">API Response Caching</p>
                <p className="text-xs text-[#888]">Improve load times with edge caching</p>
              </div>
              <button 
                onClick={() => toggle('apiCaching')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.apiCaching ? 'bg-brand-crimson' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.apiCaching ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Backup Frequency</label>
              <select className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors">
                <option>Every 6 hours</option>
                <option>Every 24 hours</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex justify-end gap-4">
          <button className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Reset to Default
          </button>
          <button className="flex items-center gap-2 bg-brand-crimson text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-crimson/20 hover:scale-105 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
