import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAuctionStore } from '../store/useAuctionStore';
import AuctionCard from '../components/AuctionCard';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { auctions, fetchAuctions, loading } = useAuctionStore();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'won'

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Derive logic for user auctions
  // Active auctions involves user's bids vs won ones. Time constraints apply.
  const activeAuctions = auctions.filter(a => new Date(a.endTime) > new Date());
  const wonAuctions = auctions.filter(a => new Date(a.endTime) < new Date() && a.winner?._id === user?._id);

  const displayAuctions = activeTab === 'active' ? activeAuctions : wonAuctions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 p-8 glass-card rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border-white/50 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.name || 'User'}! Track your bids and winnings.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/80 p-4 rounded-xl shadow-sm text-center min-w-[120px]">
              <p className="text-sm text-slate-500 font-medium">Active Bids</p>
              <p className="text-2xl font-bold text-indigo-600">{activeAuctions.length}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl shadow-sm text-center min-w-[120px]">
              <p className="text-sm text-slate-500 font-medium">Auctions Won</p>
              <p className="text-2xl font-bold text-green-600">{wonAuctions.length}</p>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-100 opacity-50 blur-3xl"></div>
      </motion.div>

      <div className="mb-8 border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'active' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Live Auctions
          </button>
          <button
            onClick={() => setActiveTab('won')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'won' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Winnings
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-indigo-600 font-medium">Loading dashboard data...</div>
      ) : displayAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayAuctions.map(auction => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
          <p className="text-slate-500 font-medium text-lg">No auctions found in this category.</p>
        </div>
      )}
    </div>
  );
}
