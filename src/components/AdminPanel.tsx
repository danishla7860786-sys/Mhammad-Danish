import React, { useState, FormEvent, useEffect } from 'react';
import { Shield, Eye, ShieldAlert, Award, AlertOctagon, History, Terminal, Info, Users, Coins, UserCheck, PlusCircle, CheckCircle2, ChevronRight, Server } from 'lucide-react';

interface AdminPanelProps {
  logs: string[];
  clearLogs: () => void;
  addAdminLog: (log: string) => void;
  banUser: (userId: string) => void;
  bannedUsers: string[];
  mockUsers: any[];
  setMockUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

interface DBQueryLog {
  title: string;
  timestamp: string;
  queries: string[];
}

export default function AdminPanel({
  logs,
  clearLogs,
  addAdminLog,
  banUser,
  bannedUsers,
  mockUsers,
  setMockUsers
}: AdminPanelProps) {
  // Device ID Ban State
  const [banInput, setBanInput] = useState<string>('');
  const [banReason, setBanReason] = useState<string>('Violation of community standards - Roman Urdu Vulgar language');

  // Reseller System States
  const [promoteUserId, setPromoteUserId] = useState<string>('');
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferCoinsAmt, setTransferCoinsAmt] = useState<number>(25000);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [executedQueries, setExecutedQueries] = useState<DBQueryLog[]>([]);
  const [isPromoting, setIsPromoting] = useState<boolean>(false);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  // Load existing resellers from backend on mount
  useEffect(() => {
    fetch('/api/vocolive/resellers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Synchronize local states with backend resellers
          const backendIds = data.resellers.map((r: any) => r.userId);
          setMockUsers(prev => prev.map(u => {
            if (backendIds.includes(u.id)) {
              return { ...u, badge: 'Reseller', role: 'Merchant Reseller' };
            }
            return u;
          }));
        }
      })
      .catch(err => console.error("Error fetching reseller data:", err));
  }, []);

  const handleDeviceBan = (e: FormEvent) => {
    e.preventDefault();
    if (!banInput.trim()) return;

    banUser(banInput.trim());
    addAdminLog(`Super Admin permanently hardware banned Device ID / Username: "${banInput.trim()}" (Reason: ${banReason})`);
    alert(`Device ID Ban Executed!\nDevice Signature "${banInput}" has been hardware blacklisted. They can no longer connect or register from this phone.`);
    setBanInput('');
  };

  // 1. Promote a user to reseller status
  const handlePromoteReseller = async (e: FormEvent) => {
    e.preventDefault();
    const targetId = promoteUserId.trim();
    if (!targetId) return;

    const matchedUser = mockUsers.find(u => u.id === targetId);
    if (!matchedUser) {
      alert(`User ID "${targetId}" not found in local user database! Provide a valid ID (e.g. 1001, 1003, or 2022).`);
      return;
    }

    setIsPromoting(true);
    try {
      const response = await fetch('/api/vocolive/resellers/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetId, name: matchedUser.name })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to promote user to reseller.");
      }

      // Update frontend state
      setMockUsers(prev => prev.map(u => u.id === targetId ? { ...u, badge: 'Reseller', role: 'Merchant Reseller' } : u));
      
      // Update logging panels
      addAdminLog(`[PROMOTION] Promoted User "${matchedUser.name}" (ID: ${targetId}) to approved Coin Reseller status.`);
      setApiLogs(prev => [`[API SUCCESS] POST /api/vocolive/resellers/promote -> ${data.message}`, ...prev]);
      
      // Append executed database queries for SQL terminal
      setExecutedQueries(prev => [{
        title: `Promote Reseller (ID: ${targetId})`,
        timestamp: new Date().toLocaleTimeString(),
        queries: data.queriesRun || []
      }, ...prev]);

      alert(`Success: User "${matchedUser.name}" is now an official VocoLive Coin Reseller!`);
      setPromoteUserId('');
    } catch (error: any) {
      alert(`API Error: ${error.message}`);
      setApiLogs(prev => [`[API ERROR] POST /api/vocolive/resellers/promote -> ${error.message}`, ...prev]);
    } finally {
      setIsPromoting(false);
    }
  };

  // 2. Send / Transfer Coins to Approved Resellers
  const handleTransferCoinsToReseller = async (e: FormEvent) => {
    e.preventDefault();
    const targetId = transferTargetId.trim();
    if (!targetId) return;

    const matchedUser = mockUsers.find(u => u.id === targetId);
    if (!matchedUser) {
      alert(`User ID "${targetId}" not found in local database.`);
      return;
    }

    if (matchedUser.badge !== 'Reseller') {
      alert(`User "${matchedUser.name}" (ID: ${targetId}) is not an approved reseller yet. You must promote them first!`);
      return;
    }

    setIsTransferring(true);
    try {
      const response = await fetch('/api/vocolive/resellers/transfer-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetId, amount: transferCoinsAmt })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to transfer coins to reseller.");
      }

      // Update frontend reseller's coins in mock list (simulate dispatching coins to them)
      setMockUsers(prev => prev.map(u => u.id === targetId ? { ...u, coins: (u.coins || 0) + transferCoinsAmt } : u));

      // Log success details
      addAdminLog(`[COIN TRANSFERRED] Dispatched ${transferCoinsAmt.toLocaleString()} gold coins to approved reseller ${matchedUser.name} (ID: ${targetId}).`);
      setApiLogs(prev => [`[API SUCCESS] POST /api/vocolive/resellers/transfer-coins -> ${data.message}`, ...prev]);

      // Append executed SQL transactions to visual console
      setExecutedQueries(prev => [{
        title: `Coin Transfer (+${transferCoinsAmt.toLocaleString()} Coins to Reseller ID: ${targetId})`,
        timestamp: new Date().toLocaleTimeString(),
        queries: data.queriesRun || []
      }, ...prev]);

      alert(`Successfully credited ${transferCoinsAmt.toLocaleString()} coins to Reseller ${matchedUser.name}!`);
      setTransferTargetId('');
    } catch (error: any) {
      alert(`API Error: ${error.message}`);
      setApiLogs(prev => [`[API ERROR] POST /api/vocolive/resellers/transfer-coins -> ${error.message}`, ...prev]);
    } finally {
      setIsTransferring(false);
    }
  };

  // Helper to extract approved resellers for dropdowns
  const approvedResellersList = mockUsers.filter(u => u.badge === 'Reseller');


  return (
    <div className="space-y-6" id="vocolive-admin-panel">
      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Coin Sale Rev</span>
          <span className="text-xl font-black text-white font-mono">$18,450 USD</span>
          <span className="text-[9px] text-emerald-400 font-mono block mt-1">+12% this week</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Reseller Volume</span>
          <span className="text-xl font-black text-white font-mono">1.2M Coins</span>
          <span className="text-[9px] text-indigo-400 font-mono block mt-1">8 verified reseller sellers</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Rooms</span>
          <span className="text-xl font-black text-teal-400 font-mono">48 Live Channels</span>
          <span className="text-[9px] text-slate-500 font-mono block mt-1">320 concurrent streams</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Device Hardware Bans</span>
          <span className="text-xl font-black text-rose-500 font-mono">{bannedUsers.length} Devices Banned</span>
          <span className="text-[9px] text-rose-400/60 font-mono block mt-1">Hardware ID blacklisted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Device ID Hard Ban Console */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" /> Device ID & Hardware Ban Console
          </h3>

          <form onSubmit={handleDeviceBan} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Target Device ID / User Handle</label>
              <input
                type="text"
                required
                placeholder="e.g., Device_ID_9921 or toxic_user"
                value={banInput}
                onChange={(e) => setBanInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Ban Reason Signature</label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Violation of community standards - Roman Urdu Vulgar language">Abusive Text/Voice filter flag</option>
                <option value="Official reseller coin fraud bypass attempts">Bulk Coin Scams / Chargebacks</option>
                <option value="Room stream disturbance trolls hijacking mic seat">Room troll behavior</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              Permanent Hardware Device Ban
            </button>
          </form>

          {bannedUsers.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase text-slate-500 block">Active Blacklisted Hardware Devices</span>
              <div className="max-h-24 overflow-y-auto border border-slate-800 rounded-lg p-2 divide-y divide-slate-900 bg-slate-900/40 text-[10px] font-mono">
                {bannedUsers.map((bUser, idx) => (
                  <div key={idx} className="py-1 text-rose-400 flex justify-between">
                    <span>🚫 {bUser}</span>
                    <span className="text-slate-600">Banned</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-time platform Activity Logs */}
        <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col h-[320px] md:h-auto overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Platform Multi-Level Activity Logs
            </h3>
            <button
              onClick={clearLogs}
              className="text-[10px] text-slate-500 hover:text-white transition font-mono"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] pr-1">
            {logs.length === 0 ? (
              <div className="text-center text-slate-600 py-12">
                No active session logs compiled yet. Perform actions like Gifting, Reselling, joining Seats, or Banning to see them append live!
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="p-2 bg-slate-900 border border-slate-800/60 rounded text-slate-300">
                  <span className="text-emerald-500">⚡ LOG:</span> {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* MERCHANT COIN RESELLER SYSTEM PANEL */}
      {/* ========================================== */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-6 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500 animate-pulse" /> Merchant Coin Reseller Manager
            </h3>
            <p className="text-xs text-slate-400">
              Authorized portal for Super Admins to verify official resellers and transfer bulk coins to their vaults securely.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-slate-300">SYSTEM LEDGER ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Promote any User to Reseller Status */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Promote User to Reseller Status</span>
            </div>

            <form onSubmit={handlePromoteReseller} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Select User from Platform</label>
                <select
                  value={promoteUserId}
                  onChange={(e) => setPromoteUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose target user to promote --</option>
                  {mockUsers.filter(u => u.badge !== 'Reseller').map(u => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} (ID: {u.id}) - Balance: {u.coins.toLocaleString()} Coins
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">OR</span>
                <span>Enter manual User ID if not in list:</span>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Enter custom User ID (e.g. 2022)"
                  value={promoteUserId}
                  onChange={(e) => setPromoteUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isPromoting || !promoteUserId}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPromoting ? 'Running Queries...' : 'Promote to Coin Reseller ⚡'}
              </button>
            </form>
          </div>

          {/* Section 2: Send/Transfer Coins to Approved Resellers */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>2. Transfer Coins to Resellers</span>
            </div>

            <form onSubmit={handleTransferCoinsToReseller} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Select Approved Reseller</label>
                {approvedResellersList.length === 0 ? (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg font-mono">
                    ⚠️ No approved resellers registered. Promote a user in Step 1 first!
                  </div>
                ) : (
                  <select
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose approved reseller --</option>
                    {approvedResellersList.map(u => (
                      <option key={u.id} value={u.id}>
                        🪙 {u.name} (Reseller ID: #{u.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Coins Amount to Dispatch</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTransferCoinsAmt(amt)}
                      className={`p-1.5 rounded text-[10px] border font-mono font-bold transition ${
                        transferCoinsAmt === amt
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <input
                  type="number"
                  min="100"
                  required
                  value={transferCoinsAmt}
                  onChange={(e) => setTransferCoinsAmt(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Custom coins amount"
                />
              </div>

              <button
                type="submit"
                disabled={isTransferring || !transferTargetId}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTransferring ? 'Processing Transaction...' : 'Transfer Bulk Coins to Reseller 🪙'}
              </button>
            </form>
          </div>
        </div>

        {/* Real-time DB Queries Stream & SQL Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* HTTP REST/API Calls logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" /> Rest API Request Logs
            </span>
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] text-slate-400 pr-1">
              {apiLogs.length === 0 ? (
                <div className="text-center text-slate-600 py-12">
                  No active API logs registered. Submit promotion or coin dispatch forms above to invoke Express routes.
                </div>
              ) : (
                apiLogs.map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/60 border border-slate-800/40 rounded">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Executed SQL Queries Console */}
          <div className="lg:col-span-2 bg-[#090b16] border border-indigo-500/20 rounded-xl p-4 flex flex-col h-[220px] shadow-lg shadow-indigo-500/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Database Query Console (PostgreSQL / Drizzle Queries)
            </span>
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[9px] text-slate-300 pr-1">
              {executedQueries.length === 0 ? (
                <div className="text-center text-slate-600 py-12">
                  Query pipeline idle. Form triggers generate fully transactional SQL updates with ACID safeguards here.
                </div>
              ) : (
                executedQueries.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-indigo-400 border-b border-white/5 pb-1 text-[10px]">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {log.title}
                      </span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-300 space-y-1">
                      {log.queries.map((q, qidx) => (
                        <div key={qidx} className={q.startsWith('--') ? 'text-slate-500 italic' : 'text-emerald-400'}>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
