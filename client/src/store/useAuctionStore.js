import { create } from 'zustand';
import api from '../services/api';

export const useAuctionStore = create((set, get) => ({
  auctions: [],
  auction: null,
  bids: [],
  loading: false,

  fetchAuctions: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/auctions');
      set({ auctions: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  fetchAuctionById: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/auctions/${id}`);
      set({ auction: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  fetchBids: async (auctionId) => {
    try {
      const { data } = await api.get(`/bids/${auctionId}`);
      set({ bids: data });
    } catch (error) {
      console.error(error);
    }
  },

  addBid: (newBid) => {
    set((state) => ({ bids: [newBid, ...state.bids] }));
  },

  updateAuctionCurrentBid: (amount) => {
    set((state) => ({
      auction: state.auction ? { ...state.auction, currentBid: amount } : null
    }));
  }
}));
