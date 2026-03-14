import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import { getIO } from '../services/socketService.js';

export const createBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({ message: 'Bid amount must be greater than current bid' });
    }

    const bid = await Bid.create({
      auction: auctionId,
      user: req.user._id,
      amount
    });

    auction.currentBid = amount;
    await auction.save();

    const populatedBid = await Bid.findById(bid._id).populate('user', 'name');

    // Emit socket event for real-time update
    const io = getIO();
    io.to(auctionId).emit('new_bid', {
      auctionId,
      currentBid: amount,
      bid: populatedBid
    });

    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBidsByAuctionId = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('user', 'name')
      .sort({ createdAt: -1 }); // Sorting by createdAt is better safely than amount
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
