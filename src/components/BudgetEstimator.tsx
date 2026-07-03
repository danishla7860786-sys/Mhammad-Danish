import { useState } from 'react';
import { DollarSign, Clock, LayoutGrid, CheckCircle, Shield, AlertCircle, Sparkles, Sliders, ChevronRight, FileText, Smartphone, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureItem {
  id: string;
  name: string;
  category: 'core' | 'voice' | 'monetization' | 'games' | 'management' | 'security';
  description: string;
  minCost: number;
  maxCost: number;
  days: number;
  checked: boolean;
}

export default function BudgetEstimator() {
  const [features, setFeatures] = useState<FeatureItem[]>([
    {
      id: 'auth_profiles',
      name: 'Smart Authentication & VIP Profiles',
      category: 'core',
      description: 'Google, Facebook, mobile & guest login with custom profile frames, unique 4-digit premium IDs, and level-based profile badges.',
      minCost: 1500,
      maxCost: 2500,
      days: 12,
      checked: true,
    },
    {
      id: 'moments_feed',
      name: 'Moments Feed & Guild System',
      category: 'core',
      description: 'Social timeline where users post pictures/text/voice notes, and joint "Families" with separate leaderboard rankings.',
      minCost: 1200,
      maxCost: 2000,
      days: 10,
      checked: true,
    },
    {
      id: 'voice_room',
      name: 'Multi-Guest Audio Seats (Agora/Zego)',
      category: 'voice',
      description: 'Low-latency multi-guest voice room (4/8/9 seat mic setup) with admin controls (Lock, Mute, Kick, Ban) and public/private modes.',
      minCost: 4000,
      maxCost: 6500,
      days: 20,
      checked: true,
    },
    {
      id: 'store_gifting',
      name: 'Virtual Store & 3D Gifting Engine',
      category: 'monetization',
      description: 'In-app coins purchase gateway (Google Billing, Local EasyPaisa/JazzCash) and dynamic gift panels with 3D animation triggers.',
      minCost: 3000,
      maxCost: 5000,
      days: 15,
      checked: true,
    },
    {
      id: 'lucky_bags',
      name: 'Lucky Bags & Coin Red Packet Drops',
      category: 'monetization',
      description: 'Interactive coin drops in live rooms for random audience distribution to boost room traffic and retention.',
      minCost: 1000,
      maxCost: 1600,
      days: 7,
      checked: true,
    },
    {
      id: 'reseller_system',
      name: 'Official Coin Seller (Reseller) Portal',
      category: 'monetization',
      description: 'Admin reseller approval panel, discounted bulk purchases, verified badges, and instantaneous coin direct ID transfers.',
      minCost: 2500,
      maxCost: 4000,
      days: 12,
      checked: true,
    },
    {
      id: 'pk_battle',
      name: 'Live Room PK Battle System',
      category: 'games',
      description: 'Room-vs-room live competition with real-time 5-minute progress bars, visual timers, and high-giver leaderboards.',
      minCost: 2000,
      maxCost: 3200,
      days: 10,
      checked: true,
    },
    {
      id: 'voice_games',
      name: 'Voice-Integrated Games (Greedy, Ludo)',
      category: 'games',
      description: 'Live casual multiplayer/betting games inside the voice room (Ludo, Greedy, Wheel of Fortune) integrated with coin wallet.',
      minCost: 3500,
      maxCost: 5500,
      days: 18,
      checked: true,
    },
    {
      id: 'multi_management',
      name: 'Multi-level Moderation & Activity Logs',
      category: 'management',
      description: 'Hired App Managers, Room Sub-admins, ban dashboards, and granular log tracking of all moderator actions and reseller transfers.',
      minCost: 2000,
      maxCost: 3000,
      days: 10,
      checked: true,
    },
    {
      id: 'agency_host',
      name: 'Talent Agency Management Portal',
      category: 'management',
      description: 'Onboarding system, tracking dashboard for host targets (hours and diamonds), agency rankings, and integrated payouts.',
      minCost: 2500,
      maxCost: 3800,
      days: 12,
      checked: true,
    },
    {
      id: 'ai_safety',
      name: 'AI Text/Voice Filter & Device ID Ban',
      category: 'security',
      description: 'Real-time AI voice/text moderation for toxic Roman Urdu/Hindi/English words, and permanent device hardware ID banning.',
      minCost: 1800,
      maxCost: 2800,
      days: 10,
      checked: true,
    },
  ]);

  const [provider, setProvider] = useState<'agora' | 'zegocloud'>('agora');
  const [activeUsersCount, setActiveUsersCount] = useState<number>(5000); // Monthly active users
  const [dailyStreamingHours, setDailyStreamingHours] = useState<number>(4); // average streaming per day per seat

  const toggleFeature = (id: string) => {
    setFeatures(
      features.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f))
    );
  };

  const setAllFeatures = (checked: boolean) => {
    setFeatures(features.map((f) => ({ ...f, checked })));
  };

  // Calculations
  const selectedFeatures = features.filter((f) => f.checked);
  const minDevCost = selectedFeatures.reduce((acc, f) => acc + f.minCost, 0);
  const maxDevCost = selectedFeatures.reduce((acc, f) => acc + f.maxCost, 0);
  const totalDevDays = Math.ceil(selectedFeatures.reduce((acc, f) => acc + f.days, 0) * 0.75); // Overlapping phases reduction (some built in parallel)

  // Monthly Agora/Zegocloud cost estimate
  // Agora Voice is ~$0.99 - $1.40 per 1,000 subscriber-minutes
  // Assume on average activeUsersCount users stream or listen. Let's do a realistic active usage minutes calculation:
  // e.g. 50 active rooms simultaneously, each with 8 people on stage and 15 listeners.
  // 50 rooms * 23 users/room = 1150 concurrent users.
  // If active 4 hours daily: 1150 * 240 mins * 30 days = 8,280,000 user-minutes.
  // Cost: 8.28M mins * ($1.00 / 1000 mins) = $8,280 per month.
  const estimatedUserMinutes = activeUsersCount * dailyStreamingHours * 60 * 30 * 0.15; // 15% concurrent active ratio
  const subscriptionCostPerMinute = provider === 'agora' ? 0.0012 : 0.0010; // Agora is slightly more premium
  const estimatedStreamingMonthlyCost = Math.round(estimatedUserMinutes * subscriptionCostPerMinute);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8" id="vocolive-budget-estimator">
      {/* Top Header Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 font-sans">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono mb-4 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic Price & Timeline Estimator
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">VocoLive App Proposal</h1>
            <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
              Customize your Android Live Voice Chat Application scope. Toggle features to recalculate the developmental budget, timeline roadmap, and live server consumption costs.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setAllFeatures(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold border border-white/10 transition duration-300"
            >
              Select All
            </button>
            <button
              onClick={() => setAllFeatures(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold border border-white/10 transition duration-300"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Scope Customization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Sliders className="w-5 h-5 text-purple-400" />
              Select & Customize Features
            </h3>

            <div className="space-y-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex gap-4 items-start select-none ${
                    feature.checked
                      ? 'bg-purple-600/10 border-purple-500/40 hover:border-purple-500/60 shadow-inner'
                      : 'bg-black/25 border-white/5 hover:border-white/10 text-slate-500'
                  }`}
                >
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-300 ${
                        feature.checked
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-indigo-400 text-white'
                          : 'border-white/20 text-transparent'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-sans">
                      <span className={`font-bold text-sm ${feature.checked ? 'text-white' : 'text-slate-500'}`}>
                        {feature.name}
                      </span>
                      <span className={`font-mono text-xs font-bold ${feature.checked ? 'text-purple-300' : 'text-slate-500'}`}>
                        {formatCurrency(feature.minCost)} - {formatCurrency(feature.maxCost)}
                      </span>
                    </div>
                    <p className={`text-xs ${feature.checked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-3 pt-1.5 font-mono text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full capitalize font-bold ${
                        feature.category === 'voice' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' :
                        feature.category === 'monetization' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                        feature.category === 'games' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' :
                        feature.category === 'security' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' :
                        'bg-white/5 text-slate-300 border border-white/5'
                      }`}>
                        {feature.category}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-purple-400" /> {feature.days} Days Dev
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Setup */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Smartphone className="w-5 h-5 text-purple-400" />
              Infrastructure & Voice Protocol Configurations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Audio Streaming Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProvider('agora')}
                    className={`p-3 rounded-xl border text-sm font-bold transition duration-300 text-center flex flex-col items-center justify-center ${
                      provider === 'agora'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    Agora.io
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Premium Voice (Global)</span>
                  </button>
                  <button
                    onClick={() => setProvider('zegocloud')}
                    className={`p-3 rounded-xl border text-sm font-bold transition duration-300 text-center flex flex-col items-center justify-center ${
                      provider === 'zegocloud'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    ZEGOCLOUD
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Optimized Asia/Pacific</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target Monthly Active Users (MAU)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={activeUsersCount}
                    onChange={(e) => setActiveUsersCount(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="font-mono text-sm text-white font-bold whitespace-nowrap bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10 shadow-inner">
                    {activeUsersCount.toLocaleString()} MAU
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4 items-start text-xs text-slate-300">
              <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-200">Cost-Saving Tip (Serverless & Free Tier)</p>
                <p className="text-slate-400 leading-relaxed">
                  Agora and ZEGOCLOUD provide <strong className="text-white">10,000 free streaming minutes</strong> every month. For startup operations, your streaming charges will be practically $0. Scaling limits kick in as traffic increases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Financial Summary */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-6 space-y-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-base font-semibold text-white tracking-tight">Proposal Estimates</h3>

            {/* Total Budget Price Tag */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl text-center space-y-1.5 relative overflow-hidden shadow-inner font-sans">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Estimated Dev Budget
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(minDevCost)} - {formatCurrency(maxDevCost)}
              </div>
              <p className="text-[10px] text-slate-500">One-time standard cost for native Android build</p>
            </div>

            {/* Total Timeline Price Tag */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl text-center space-y-1.5 relative overflow-hidden shadow-inner font-sans">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl" />
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Development Timeline
              </span>
              <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight flex items-center justify-center gap-2">
                <Clock className="w-6 h-6 stroke-[2] text-purple-400 animate-pulse" />
                {totalDevDays} Days
              </div>
              <p className="text-[10px] text-slate-500">~{Math.ceil(totalDevDays / 7)} Weeks with parallel milestones</p>
            </div>

            {/* Sub-costs analysis */}
            <div className="space-y-3 pt-2 font-sans">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                Estimate Breakdowns
              </span>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Features:</span>
                  <span className="text-white font-bold">{selectedFeatures.length} / {features.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Agora SDK Cost (Est.):</span>
                  <span className="text-white font-bold">{formatCurrency(estimatedStreamingMonthlyCost)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Server & DB Hosting:</span>
                  <span className="text-white font-bold">$35 - $60/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Play Store Fee:</span>
                  <span className="text-white font-bold">$25 (One-time)</span>
                </div>
              </div>
            </div>

            {/* Mini Roadmap / Milestone Plan */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                Milestone Roadmap
              </span>
              <div className="space-y-4">
                <div className="flex gap-3 text-xs font-sans">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-400 text-[10px] font-bold mt-0.5 shrink-0">1</div>
                  <div>
                    <p className="text-white font-bold">UI/UX Design (10 Days)</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">Wireframes, customized profile frames, & asset design.</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs font-sans">
                  <div className="w-5 h-5 bg-purple-500/20 rounded-full border border-purple-400 flex items-center justify-center text-purple-300 text-[10px] font-bold mt-0.5 shrink-0">2</div>
                  <div>
                    <p className="text-white font-bold">Core Engine & Voice Integration (20 Days)</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">Google Login, standard multi-guest mic seats, & SDK channels.</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs font-sans">
                  <div className="w-5 h-5 bg-amber-500/20 rounded-full border border-amber-500 flex items-center justify-center text-amber-400 text-[10px] font-bold mt-0.5 shrink-0">3</div>
                  <div>
                    <p className="text-white font-bold">Monetization & Reseller (15 Days)</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">JazzCash/EasyPaisa, 3D gifts, and Direct ID coin transfers.</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs font-sans">
                  <div className="w-5 h-5 bg-rose-500/20 rounded-full border border-rose-500 flex items-center justify-center text-rose-300 text-[10px] font-bold mt-0.5 shrink-0">4</div>
                  <div>
                    <p className="text-white font-bold">Games & Safety (15 Days)</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">PK Battles, Ludo/Greedy games, AI toxic filter, & Device ID Ban.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2 font-sans">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  *Disclaimer: This is an interactive architectural estimate based on standard industry rates in Pakistan and globally. Actual deployment depends on exact asset designs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
