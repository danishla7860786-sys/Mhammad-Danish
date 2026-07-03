import { useState, FormEvent } from 'react';
import { User, ResellerLog, Reseller } from '../types';
import { Send, CheckCircle, ShieldAlert, BadgePercent, Coins, UserCheck, Smartphone, History, Search } from 'lucide-react';

interface ResellerPanelProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  addAdminLog: (log: string) => void;
  onCoinsTransferred: (targetId: string, amount: number) => void;
  mockUsers: { id: string; name: string; coins: number }[];
}

export default function ResellerPanel({
  currentUser,
  setCurrentUser,
  addAdminLog,
  onCoinsTransferred,
  mockUsers
}: ResellerPanelProps) {
  // Reseller state
  const [targetId, setTargetId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(1000);
  const [paymentGateway, setPaymentGateway] = useState<'JazzCash' | 'EasyPaisa' | 'Bank'>('JazzCash');
  const [bulkCoinsAmount, setBulkCoinsAmount] = useState<number>(10000);
  const [logs, setLogs] = useState<ResellerLog[]>([
    { id: 'tx_1', resellerId: 'r_001', resellerName: 'Danish (Verified Seller)', targetUserId: '1001', targetUserName: 'Kamran (Host)', amount: 5000, timestamp: '10m ago' },
    { id: 'tx_2', resellerId: 'r_001', resellerName: 'Danish (Verified Seller)', targetUserId: '1003', targetUserName: 'Zain', amount: 2500, timestamp: '1h ago' }
  ]);

  const [resellerStats, setResellerStats] = useState<Reseller>({
    id: 'r_001',
    name: 'Danish (Verified)',
    jazzcashNumber: '0300-1234567',
    easypaisaNumber: '0345-9876543',
    availableCoinsBulk: 45000,
    discountRate: 20 // 20% discount on bulk purchases from App Owner
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Direct ID transfer action
  const handleTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) return;

    const userToFind = mockUsers.find(u => u.id === targetId) || (targetId === currentUser.id ? currentUser : null);
    if (!userToFind) {
      alert(`User ID "${targetId}" not found in local mock simulation database. Try ID: 1001, 1003, or your own ID: ${currentUser.id}`);
      return;
    }

    if (resellerStats.availableCoinsBulk < transferAmount) {
      alert('Insufficient available bulk coins! Purchase bulk coins first.');
      return;
    }

    // Deduct coins from Reseller's bulk stock
    setResellerStats(prev => ({ ...prev, availableCoinsBulk: prev.availableCoinsBulk - transferAmount }));

    // Trigger parent callback to update targeted user's wallet
    onCoinsTransferred(targetId, transferAmount);

    // Write transfer logs
    const newLog: ResellerLog = {
      id: 'tx_' + Date.now(),
      resellerId: resellerStats.id,
      resellerName: resellerStats.name,
      targetUserId: targetId,
      targetUserName: userToFind.name,
      amount: transferAmount,
      timestamp: 'Just now'
    };

    setLogs(prev => [newLog, ...prev]);
    addAdminLog(`Reseller "${resellerStats.name}" transferred ${transferAmount} coins directly to User ID ${targetId} (${userToFind.name}) via ${paymentGateway}`);
    
    setNotification(`Successfully transferred ${transferAmount} coins to ${userToFind.name} (ID: ${targetId}). Reseller payout settled via ${paymentGateway}.`);
    setTargetId('');
    setTimeout(() => setNotification(null), 5000);
  };

  // Buy in bulk from App Owner
  const handleBulkPurchase = () => {
    const costAfterDiscount = Math.round(bulkCoinsAmount * (1 - resellerStats.discountRate / 100) * 0.01); // 1 coin = $0.01 base
    
    if (confirm(`Simulate Purchase: Bulk purchase ${bulkCoinsAmount.toLocaleString()} Coins at a ${resellerStats.discountRate}% reseller discount for $${costAfterDiscount}?`)) {
      setResellerStats(prev => ({
        ...prev,
        availableCoinsBulk: prev.availableCoinsBulk + bulkCoinsAmount
      }));
      addAdminLog(`Reseller bought bulk ${bulkCoinsAmount} coins from App Owner. Settlement: $${costAfterDiscount}.`);
      alert(`Bulk coins added to reseller vault! Total bulk balance: ${resellerStats.availableCoinsBulk + bulkCoinsAmount}`);
    }
  };

  return (
    <div className="space-y-6" id="vocolive-reseller-panel">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 to-slate-900/80 border border-teal-500/20 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full text-xs text-teal-400 font-mono font-bold">
              <UserCheck className="w-3.5 h-3.5" /> Official Reseller Workspace
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Verified Coin Seller Dashboard</h2>
            <p className="text-xs text-slate-400">
              Approved Resellers purchase coins in bulk at a 20% discount and resell directly to end-users via local JazzCash, EasyPaisa, or Bank transfers.
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Available Bulk Coins</span>
            <span className="text-2xl font-black text-teal-400 font-mono">
              {resellerStats.availableCoinsBulk.toLocaleString()} 🪙
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Direct Coin ID Transfer Portal */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Send className="w-4 h-4 text-teal-400" /> Instant Coin ID Transfer
          </h3>

          {notification && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-xs text-teal-400">
              {notification}
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">User Target ID (4-digit premium ID)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., 1001, 1003 or your ID"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                  Press Check ID
                </span>
              </div>
              <p className="text-[10px] text-slate-600">Simulate transfer to active mock users like Kamran (1001), Zain (1003).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Coins Amount</label>
                <input
                  type="number"
                  required
                  min="500"
                  max="20000"
                  step="500"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Payout Settled Via</label>
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="JazzCash">JazzCash (Local PK)</option>
                  <option value="EasyPaisa">EasyPaisa (Local PK)</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition"
            >
              Transfer Coins Directly to ID
            </button>
          </form>
        </div>

        {/* Reseller Buy Coins in Bulk stock panel */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <BadgePercent className="w-4 h-4 text-teal-400" /> Buy Stock in Bulk
          </h3>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Reseller Discount Margin</span>
              <p className="text-[10px] text-slate-500">Bulk discount authorized by App Owner</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-500 font-mono">20% OFF</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">Select Bulk Coins Package</label>
            <div className="grid grid-cols-3 gap-2">
              {[10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBulkCoinsAmount(amt)}
                  className={`p-2 rounded-lg border text-center transition ${
                    bulkCoinsAmount === amt
                      ? 'bg-teal-500/10 border-teal-500 text-white'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="block font-mono text-xs font-bold">{amt.toLocaleString()}</span>
                  <span className="text-[8px] text-slate-500">${amt * 0.008}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBulkPurchase}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold rounded-lg text-xs uppercase tracking-wider transition"
          >
            Buy {bulkCoinsAmount.toLocaleString()} Bulk Coins (${bulkCoinsAmount * 0.008} Net)
          </button>
        </div>

      </div>

      {/* Transaction Records */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
          <History className="w-4 h-4 text-teal-400" /> Direct ID transfer History logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400 font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Tx ID</th>
                <th>Recipient ID</th>
                <th>Recipient Name</th>
                <th>Transfer Coins</th>
                <th>Payment Status</th>
                <th className="text-right">Settled Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 text-slate-500">{log.id}</td>
                  <td className="font-bold text-white">{log.targetUserId}</td>
                  <td>{log.targetUserName}</td>
                  <td className="text-teal-400 font-bold">+{log.amount.toLocaleString()}</td>
                  <td>
                    <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20 uppercase">
                      Settled
                    </span>
                  </td>
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
