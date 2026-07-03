import { useState, FormEvent } from 'react';
import { User, Agency, AgencyHost } from '../types';
import { Award, Wallet, Coins, Landmark, Landmark as BankIcon, Smartphone, ArrowDownLeft, ShieldCheck, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

interface AgencyPortalProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  addAdminLog: (log: string) => void;
}

export default function AgencyPortal({ currentUser, setCurrentUser, addAdminLog }: AgencyPortalProps) {
  const [agency, setAgency] = useState<Agency>({
    id: 'ag_882',
    name: 'Red Rose Talent Agency 🌹',
    ownerName: 'Sarah Recruiter',
    totalHosts: 4,
    monthlyRevenueDiamonds: 45000,
    status: 'Verified'
  });

  const [hosts, setHosts] = useState<AgencyHost[]>([
    { id: 'h_1', name: 'Aliza Khan', agencyId: 'ag_882', targetHours: 40, hoursCompleted: 32, diamondsEarned: 24000, level: 14, status: 'Active' },
    { id: 'h_2', name: 'Zara Shah', agencyId: 'ag_882', targetHours: 40, hoursCompleted: 15, diamondsEarned: 8500, level: 9, status: 'Active' },
    { id: 'h_3', name: 'Mehak Malik', agencyId: 'ag_882', targetHours: 40, hoursCompleted: 42, diamondsEarned: 18000, level: 16, status: 'Active' },
    { id: 'h_4', name: 'Dua G', agencyId: 'ag_882', targetHours: 40, hoursCompleted: 5, diamondsEarned: 1200, level: 6, status: 'Pending' }
  ]);

  // Dual Currency withdrawal form
  const [withdrawHostId, setWithdrawHostId] = useState<string>('h_1');
  const [withdrawAmountDiamonds, setWithdrawAmountDiamonds] = useState<number>(10000);
  const [payoutMethod, setPayoutMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Local Bank' | 'USDT'>('JazzCash');
  const [accountDetails, setAccountDetails] = useState<string>('0300-1122334');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [payoutLogs, setPayoutLogs] = useState<any[]>([
    { id: 'pay_1', hostName: 'Mehak Malik', diamonds: 10000, usd: 50, method: 'EasyPaisa', timestamp: 'Yesterday' }
  ]);

  // Conversion rate calculations (e.g., 200 diamonds = $1.00)
  const diamondsToUsdRate = 200; 
  const calculatedUsd = Math.round(withdrawAmountDiamonds / diamondsToUsdRate);

  const handleWithdrawal = (e: FormEvent) => {
    e.preventDefault();
    const targetedHost = hosts.find(h => h.id === withdrawHostId);
    if (!targetedHost) return;

    if (targetedHost.diamondsEarned < withdrawAmountDiamonds) {
      alert(`Insufficient Host Earned Diamonds! ${targetedHost.name} only has ${targetedHost.diamondsEarned} diamonds.`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Deduct diamonds from host
      setHosts(prev => prev.map(h => h.id === withdrawHostId ? { ...h, diamondsEarned: h.diamondsEarned - withdrawAmountDiamonds } : h));
      
      const newPayout = {
        id: 'pay_' + Date.now(),
        hostName: targetedHost.name,
        diamonds: withdrawAmountDiamonds,
        usd: calculatedUsd,
        method: payoutMethod,
        timestamp: 'Just now'
      };

      setPayoutLogs(prev => [newPayout, ...prev]);
      addAdminLog(`Agency Host "${targetedHost.name}" withdrew ${withdrawAmountDiamonds} diamonds ($${calculatedUsd} USD) via ${payoutMethod}`);
      
      setIsProcessing(false);
      alert(`Withdrawal Approved! Cashout of $${calculatedUsd} USD was successfully queued to ${payoutMethod} (${accountDetails}).`);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="vocolive-agency-portal">
      {/* Top Banner and Metrics */}
      <div className="bg-gradient-to-r from-violet-950/60 to-slate-900/80 border border-violet-500/20 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full text-xs text-violet-400 font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Talent Agency Portal
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{agency.name}</h2>
            <p className="text-xs text-slate-400">
              Onboard premium female creators, track monthly targets, and facilitate high-contrast payout withdrawals dynamically.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 shrink-0">
            <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Hosts</span>
              <span className="text-lg font-black text-white font-mono">{agency.totalHosts}</span>
            </div>
            <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Month Revenue</span>
              <span className="text-lg font-black text-violet-400 font-mono">45k 💎</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Onboarded Hosts tracker */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Host Performance Targets (Current Month)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400 font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[9px]">
                  <th className="py-2.5">Host Name</th>
                  <th>Level</th>
                  <th>Streaming target</th>
                  <th>Completed hours</th>
                  <th>Diamonds Earned</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {hosts.map((host) => {
                  const percent = Math.min(100, Math.round((host.hoursCompleted / host.targetHours) * 100));
                  return (
                    <tr key={host.id} className="hover:bg-slate-900/30 transition">
                      <td className="py-3 font-semibold text-white flex items-center gap-1">
                        👩 {host.name}
                      </td>
                      <td>
                        <span className="bg-amber-500/10 text-amber-500 px-1 py-0.2 rounded border border-amber-500/20 font-bold scale-90">
                          Lv.{host.level}
                        </span>
                      </td>
                      <td>{host.targetHours} Hrs</td>
                      <td>
                        <div className="space-y-1">
                          <span>{host.hoursCompleted} Hrs ({percent}%)</span>
                          <div className="w-24 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div className="bg-violet-500 h-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="text-violet-400 font-bold">{host.diamondsEarned.toLocaleString()} 💎</td>
                      <td className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                          host.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {host.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal payout engine */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Wallet className="w-4 h-4 text-violet-400" /> Host Cashout Withdrawal
          </h3>

          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Host Creator</label>
              <select
                value={withdrawHostId}
                onChange={(e) => setWithdrawHostId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {hosts.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.diamondsEarned.toLocaleString()} 💎)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Diamonds To Cashout</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={withdrawAmountDiamonds}
                  onChange={(e) => setWithdrawAmountDiamonds(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Payout Value</label>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold">
                  ${calculatedUsd} USD
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Payment Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="JazzCash">JazzCash Mobile Wallet (PK)</option>
                <option value="EasyPaisa">EasyPaisa Mobile Wallet (PK)</option>
                <option value="Local Bank">Habib Bank (HBL) / Allied Bank</option>
                <option value="USDT">Crypto Tether (USDT-TRC20)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Account Address / Mobile Number</label>
              <input
                type="text"
                required
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder="0300-xxxxxxx or Bank Account IBAN"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              {isProcessing ? 'PROCESSING APPROVAL...' : 'SUBMIT CASHOUT REQUEST'}
            </button>
          </form>
        </div>

      </div>

      {/* Payout Logs */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
          <ArrowDownLeft className="w-4 h-4 text-violet-400" /> Recent Withdrawal Settlement logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400 font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[9px]">
                <th className="py-2.5">Settlement ID</th>
                <th>Host Name</th>
                <th>Exchanged Beans/Diamonds</th>
                <th>Payout Value</th>
                <th>Transfer Gateway</th>
                <th className="text-right">Processed Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {payoutLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30 transition">
                  <td className="py-3 text-slate-500">{log.id}</td>
                  <td className="font-bold text-white">{log.hostName}</td>
                  <td className="text-violet-400">-{log.diamonds.toLocaleString()} 💎</td>
                  <td className="text-emerald-400 font-bold">+${log.usd} USD</td>
                  <td>{log.method}</td>
                  <td className="text-right text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
