import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { socket } from '../services/socket';
import { useAuctionStore } from '../store/useAuctionStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { IndianRupee, Clock, TrendingUp, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuctionView() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { auction, bids, loading, fetchAuctionById, fetchBids, addBid, updateAuctionCurrentBid } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchAuctionById(id);
    fetchBids(id);

    // Initialise Socket connection for this room
    socket.connect();
    socket.emit('join_auction', id);

    socket.on('new_bid', (data) => {
      if (data.auctionId === id) {
        addBid(data.bid);
        updateAuctionCurrentBid(data.currentBid);
        toast.success(`New bid placed: ₹${data.currentBid} by ${data.bid.user.name}`, {
          icon: '🚀'
        });
      }
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.off('new_bid');
      socket.disconnect();
    };
  }, [id, fetchAuctionById, fetchBids, addBid, updateAuctionCurrentBid]);

  useEffect(() => {
    if (auction) {
      const interval = setInterval(() => {
        const end = new Date(auction.endTime);
        const now = new Date();
        const diff = end - now;
        
        if (diff <= 0) {
          setTimeLeft('Auction Ended');
          clearInterval(interval);
        } else {
          // Just simple DD:HH:MM:SS logic
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / 1000 / 60) % 60);
          const s = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [auction]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    const amount = Number(bidAmount);
    if (!amount || amount <= auction.currentBid) {
      toast.error('Bid must be higher than the current bid');
      return;
    }
    
    // Call API (Socket takes care of the real-time update once saved)
    try {
      // In store we used API directly or from component? Let's use api here.
      const { default: api } = await import('../services/api');
      await api.post('/bids', { auctionId: id, amount });
      setBidAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error placing bid');
    }
  };

  if (loading || !auction) {
    return <div className="min-h-[60vh] flex items-center justify-center animate-pulse text-xl text-indigo-600">Loading Auction Details...</div>;
  }

  const isEnded = new Date(auction.endTime) < new Date();
  const highestBidder = bids.length > 0 ? bids[0].user : null;
  const isWinner = isEnded && highestBidder?._id === user?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {isWinner && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-md"
        >
          <Trophy size={24} className="text-yellow-600"/>
          <strong className="text-lg">Congratulations! You won this auction!</strong>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col - Image & Details */}
        <div>
          <div className="glass-card rounded-3xl overflow-hidden mb-6 group relative">
            {isEnded && <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
              <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest shadow-xl">Auction Closed</span>
            </div>}
            <img 
              src={auction.image || "https://images.unsplash.com/photo-1584882103328-769018cffea4?auto=format&fit=crop&q=80&w=800"} 
              alt={auction.title}
              className="w-full h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{auction.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">{auction.description}</p>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Starting Price</p>
              <p className="text-2xl font-bold text-slate-900">₹{auction.startingPrice}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Bids</p>
              <p className="text-2xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={20} className="text-indigo-500"/> {bids.length}</p>
            </div>
          </div>
        </div>

        {/* Right Col - Bidding Panel */}
        <div className="flex flex-col">
          <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/40 mb-8 sticky top-24">
            <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Current Highest Bid</p>
                <motion.div 
                  key={auction.currentBid}
                  initial={{ scale: 1.1, color: '#4f46e5' }}
                  animate={{ scale: 1, color: '#0f172a' }}
                  className="text-5xl font-black flex items-center gap-1"
                >
                  <IndianRupee size={40} className="text-indigo-600" />
                  {auction.currentBid}
                </motion.div>
                {highestBidder && !isEnded && (
                  <p className="text-sm text-slate-500 mt-2">by <span className="font-semibold text-slate-800">{highestBidder.name}</span></p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Time Remaining</p>
                <div className={`text-xl font-bold flex items-center gap-2 justify-end ${isEnded ? 'text-red-500' : 'text-slate-800'}`}>
                  <Clock size={20} /> {timeLeft}
                </div>
              </div>
            </div>

            {!isEnded ? (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee size={24} className="text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min={auction.currentBid + 1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min. bid: ₹${auction.currentBid + 1}`}
                    className="block w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-900 bg-slate-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!bidAmount || Number(bidAmount) <= auction.currentBid}
                  className="w-full py-4 px-8 text-lg font-bold text-white bg-slate-900 rounded-xl shadow-xl hover:shadow-2xl hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all active:scale-[0.98]"
                >
                  Place Bid Now
                </button>
              </form>
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-center">
                <p className="font-bold text-slate-600">Bidding has concluded for this item.</p>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-indigo-600"/> Live Bid History
            </h3>
            <div className="glass-card rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
              {bids.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {bids.map((bid, index) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={bid._id} 
                      className={`p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors ${index === 0 ? 'bg-indigo-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shadow-sm">
                          {bid.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-semibold ${index === 0 ? 'text-indigo-900' : 'text-slate-800'}`}>{bid.user.name}</p>
                          <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold flex items-center gap-1 ${index === 0 ? 'text-indigo-600' : 'text-slate-700'}`}>
                        <IndianRupee size={16} />{bid.amount}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">No bids placed yet. Be the first!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
