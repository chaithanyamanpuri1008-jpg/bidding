import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuctionStore } from '../store/useAuctionStore';
import AuctionCard from '../components/AuctionCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const { auctions, fetchAuctions, loading } = useAuctionStore();

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Just picking first 6 active for display
  const activeAuctions = auctions.filter(a => new Date(a.endTime) > new Date()).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-white/90 to-purple-50/90 backdrop-blur-sm"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8 shadow-sm">
              <Sparkles size={16} /> Premium Online Bidding Experience
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
              Discover, Bid & Win <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Exclusive Items
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Join the most secure and real-time bidding platform. High-end auctions with a seamless bidding experience driven by advanced WebSockets and AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('featured').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Start Bidding <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section id="featured" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Live Auctions</h2>
              <p className="text-slate-500">Bid on exclusive items before the timer runs out.</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-96"></div>
              ))}
            </div>
          ) : activeAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeAuctions.map(auction => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-2xl">
              <p className="text-slate-500 text-lg">No active auctions found right now.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
