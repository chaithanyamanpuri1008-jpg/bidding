import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AuctionCard({ auction }) {
  const isExpired = new Date(auction.endTime) < new Date();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group"
    >
      <div className="h-48 overflow-hidden relative bg-slate-200">
        <img 
          src={auction.image || "https://images.unsplash.com/photo-1584882103328-769018cffea4?auto=format&fit=crop&q=80&w=600"} 
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
          <Clock size={14} className={isExpired ? "text-red-500" : "text-green-500"} />
          {isExpired ? "Ended" : formatDistanceToNow(new Date(auction.endTime), { addSuffix: true })}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{auction.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{auction.description}</p>
        
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Bid</p>
            <p className="text-xl font-bold text-indigo-600 flex items-center">
              <IndianRupee size={20} />
              {auction.currentBid}
            </p>
          </div>
          <Link 
            to={`/auction/${auction._id}`}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {isExpired ? "View Details" : "Place Bid"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
