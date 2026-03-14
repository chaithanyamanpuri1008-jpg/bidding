import React, { useState, useEffect, useCallback } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, Sparkles, BarChart2, Trash2,
  Users, Gavel, ChevronDown, ChevronUp,
  ShieldAlert, CheckCircle, XCircle, Clock, Search, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  active:   { label: 'Active',   color: 'bg-emerald-100 text-emerald-700' },
  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
  ended:    { label: 'Ended',    color: 'bg-slate-100 text-slate-600' },
};

const TAB_ITEMS = ['Auctions', 'Create', 'Users'];

export default function AdminDashboard() {
  const { auctions, fetchAuctions } = useAuctionStore();
  const [activeTab, setActiveTab] = useState('Auctions');
  const [search, setSearch] = useState('');
  const [expandedAuction, setExpandedAuction] = useState(null);
  const [bidsByAuction, setBidsByAuction] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', image: '', startingPrice: '', startTime: '', endTime: ''
  });

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  // Fetch users when Users tab is opened
  useEffect(() => {
    if (activeTab === 'Users' && users.length === 0) fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/auctions/admin/users');
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBids = useCallback(async (auctionId) => {
    if (bidsByAuction[auctionId]) return; // already loaded
    setLoadingBids(true);
    try {
      const { data } = await api.get(`/auctions/${auctionId}/bids`);
      setBidsByAuction(prev => ({ ...prev, [auctionId]: data }));
    } catch {
      toast.error('Failed to load bids');
    } finally {
      setLoadingBids(false);
    }
  }, [bidsByAuction]);

  const toggleExpand = (auctionId) => {
    if (expandedAuction === auctionId) {
      setExpandedAuction(null);
    } else {
      setExpandedAuction(auctionId);
      fetchBids(auctionId);
    }
  };

  const refreshBids = async (auctionId) => {
    setLoadingBids(true);
    try {
      const { data } = await api.get(`/auctions/${auctionId}/bids`);
      setBidsByAuction(prev => ({ ...prev, [auctionId]: data }));
      await fetchAuctions();
      toast.success('Refreshed');
    } catch {
      toast.error('Failed to refresh bids');
    } finally {
      setLoadingBids(false);
    }
  };

  const handleDeleteBid = async (bidId, auctionId) => {
    if (!window.confirm('Overrule and remove this bid? The current price will be recalculated.')) return;
    try {
      await api.delete(`/auctions/bids/${bidId}`);
      toast.success('Bid overruled successfully');
      // Refresh both bids and auction list
      setBidsByAuction(prev => ({ ...prev, [auctionId]: undefined }));
      await fetchBids(auctionId);
      await fetchAuctions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove bid');
    }
  };

  const handleStatusChange = async (auctionId, status) => {
    try {
      await api.put(`/auctions/${auctionId}`, { status });
      toast.success(`Auction marked as ${status}`);
      fetchAuctions();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Delete this auction and ALL its bids? This cannot be undone.')) return;
    try {
      await api.delete(`/auctions/${auctionId}`);
      toast.success('Auction deleted');
      setExpandedAuction(null);
      fetchAuctions();
    } catch {
      toast.error('Failed to delete auction');
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) return toast.error('Enter a title first');
    setIsGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-description', {
        title: formData.title,
        keywords: 'premium, authentic, rare'
      });
      setFormData(f => ({ ...f, description: data.description }));
      toast.success('AI description generated!');
    } catch {
      toast.error('Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auctions', formData);
      toast.success('Auction created!');
      fetchAuctions();
      setFormData({ title: '', description: '', image: '', startingPrice: '', startTime: '', endTime: '' });
      setActiveTab('Auctions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating auction');
    }
  };

  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: auctions.length,
    active: auctions.filter(a => a.status === 'active').length,
    ended: auctions.filter(a => a.status === 'ended').length,
    totalBids: Object.values(bidsByAuction).reduce((sum, arr) => sum + (arr?.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Control Panel</h1>
              <p className="text-xs text-slate-400">Manage auctions, bids &amp; users</p>
            </div>
          </div>
          {/* Stats */}
          <div className="hidden md:flex gap-6 text-center">
            {[
              { label: 'Total Auctions', value: stats.total, icon: <Gavel size={14}/> },
              { label: 'Active',         value: stats.active, icon: <CheckCircle size={14}/> },
              { label: 'Ended',          value: stats.ended,  icon: <XCircle size={14}/> },
              { label: 'Users',          value: users.length || '—', icon: <Users size={14}/> },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl px-4 py-2">
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">{s.icon}{s.label}</div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          {TAB_ITEMS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── AUCTIONS TAB ─── */}
          {activeTab === 'Auctions' && (
            <motion.div key="auctions"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Search Bar */}
              <div className="relative mb-6 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search auctions..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-4">
                {filteredAuctions.length === 0 && (
                  <div className="text-center py-16 text-slate-500">No auctions found.</div>
                )}
                {filteredAuctions.map(auction => {
                  const isExpanded = expandedAuction === auction._id;
                  const bids = bidsByAuction[auction._id] || [];
                  const cfg = STATUS_CONFIG[auction.status] || STATUS_CONFIG.ended;

                  return (
                    <div key={auction._id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
                      {/* Auction Row */}
                      <div className="p-5 flex flex-wrap items-center gap-4">
                        {auction.image && (
                          <img src={auction.image} alt={auction.title}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="font-semibold text-white text-base truncate">{auction.title}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex gap-4">
                            <span>Current: <strong className="text-indigo-400">₹{auction.currentBid}</strong></span>
                            <span>Start: <strong className="text-white">₹{auction.startingPrice}</strong></span>
                            <span>Ends: {new Date(auction.endTime).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={auction.status}
                            onChange={e => handleStatusChange(auction._id, e.target.value)}
                            className="bg-white/10 border border-white/10 text-sm text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="upcoming" className="bg-slate-800">Upcoming</option>
                            <option value="active" className="bg-slate-800">Active</option>
                            <option value="ended" className="bg-slate-800">Ended</option>
                          </select>

                          <button
                            onClick={() => toggleExpand(auction._id)}
                            className="flex items-center gap-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-sm px-3 py-1.5 rounded-lg transition"
                          >
                            <Gavel size={14} />
                            Bids
                            {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                          </button>

                          <button
                            onClick={() => handleDeleteAuction(auction._id)}
                            className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm px-3 py-1.5 rounded-lg transition"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Expanded Bids Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/10 p-5">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                  <Users size={15}/> Bidders &amp; Bid History
                                </h3>
                                <button
                                  onClick={() => refreshBids(auction._id)}
                                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                                >
                                  <RefreshCw size={13}/> Refresh
                                </button>
                              </div>

                              {loadingBids ? (
                                <div className="text-center text-slate-500 py-6 text-sm">Loading bids…</div>
                              ) : bids.length === 0 ? (
                                <div className="text-center text-slate-500 py-6 text-sm flex flex-col items-center gap-2">
                                  <Clock size={28} className="opacity-30" />
                                  No bids placed yet
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-slate-500 text-xs border-b border-white/10">
                                        <th className="pb-2 pr-4">Rank</th>
                                        <th className="pb-2 pr-4">Bidder</th>
                                        <th className="pb-2 pr-4">Email</th>
                                        <th className="pb-2 pr-4">Amount</th>
                                        <th className="pb-2 pr-4">Time</th>
                                        <th className="pb-2">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {bids.map((bid, idx) => (
                                        <tr key={bid._id} className={`group ${idx === 0 ? 'bg-indigo-500/10' : ''}`}>
                                          <td className="py-2.5 pr-4">
                                            <span className={`text-xs font-bold ${idx === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                              #{idx + 1}
                                            </span>
                                          </td>
                                          <td className="py-2.5 pr-4">
                                            <div className="flex items-center gap-2">
                                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                                {bid.user?.name?.charAt(0).toUpperCase()}
                                              </div>
                                              <span className="text-white font-medium">{bid.user?.name || 'Unknown'}</span>
                                            </div>
                                          </td>
                                          <td className="py-2.5 pr-4 text-slate-400 text-xs">{bid.user?.email || '—'}</td>
                                          <td className="py-2.5 pr-4">
                                            <span className={`font-semibold ${idx === 0 ? 'text-indigo-400' : 'text-slate-300'}`}>
                                              ₹{bid.amount.toLocaleString()}
                                            </span>
                                          </td>
                                          <td className="py-2.5 pr-4 text-slate-500 text-xs">
                                            {new Date(bid.createdAt).toLocaleString()}
                                          </td>
                                          <td className="py-2.5">
                                            <button
                                              onClick={() => handleDeleteBid(bid._id, auction._id)}
                                              title="Overrule this bid"
                                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-red-400 hover:bg-red-500/20 px-2 py-1 rounded-lg transition"
                                            >
                                              <ShieldAlert size={13}/> Overrule
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── CREATE TAB ─── */}
          {activeTab === 'Create' && (
            <motion.div key="create"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-2xl">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                  <PlusCircle size={20} className="text-indigo-400" /> Create New Auction
                </h2>
                <form onSubmit={handleCreateAuction} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                    <input type="text" required value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Vintage Rolex Watch" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Description</span>
                      <button type="button" onClick={handleGenerateDescription} disabled={isGenerating}
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition">
                        <Sparkles size={12}/> {isGenerating ? 'Generating…' : 'AI Generate'}
                      </button>
                    </label>
                    <textarea required rows={4} value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Describe the item…" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Image URL (optional)</label>
                    <input type="text" value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..." />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Starting Price (₹)</label>
                      <input type="number" required min="1" value={formData.startingPrice}
                        onChange={e => setFormData({...formData, startingPrice: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="1000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Time</label>
                      <input type="datetime-local" required value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">End Time</label>
                      <input type="datetime-local" required value={formData.endTime}
                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/30">
                    🚀 Launch Auction
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── USERS TAB ─── */}
          {activeTab === 'Users' && (
            <motion.div key="users"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users size={20} className="text-indigo-400" /> Registered Users
                </h2>
                <button onClick={fetchUsers}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition">
                  <RefreshCw size={14}/> Refresh
                </button>
              </div>

              {loadingUsers ? (
                <div className="text-center text-slate-500 py-16 text-sm">Loading users…</div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 text-xs border-b border-white/10">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-white/5 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-400">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'Admin'
                                ? 'bg-indigo-500/30 text-indigo-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 text-xs">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
