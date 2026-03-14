import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import { getIO } from '../services/socketService.js';

export const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('winner', 'name');
    
    if (auction) {
      res.json(auction);
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAuction = async (req, res) => {
  try {
    const { title, description, image, startingPrice, startTime, endTime } = req.body;

    const auction = new Auction({
      title,
      description,
      image,
      startingPrice,
      currentBid: startingPrice,
      startTime,
      endTime,
      createdBy: req.user._id,
      status: 'active'
    });

    const createdAuction = await auction.save();
    res.status(201).json(createdAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAuctionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (auction) {
      auction.status = status;
      const updatedAuction = await auction.save();
      const io = getIO();
      io.to(req.params.id).emit('auction_status_changed', { auctionId: req.params.id, status });
      res.json(updatedAuction);
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    await Bid.deleteMany({ auction: req.params.id });
    await Auction.findByIdAndDelete(req.params.id);

    const io = getIO();
    io.emit('auction_deleted', { auctionId: req.params.id });

    res.json({ message: 'Auction and all its bids deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all bids for a specific auction with full user details
export const getAdminBidsByAuction = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('user', 'name email')
      .sort({ amount: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: overrule/delete a specific bid and recalculate highest bid
export const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const auctionId = bid.auction;
    const auction = await Auction.findById(auctionId);

    await Bid.findByIdAndDelete(req.params.bidId);

    if (auction) {
      const highestBid = await Bid.findOne({ auction: auctionId }).sort({ amount: -1 });
      auction.currentBid = highestBid ? highestBid.amount : auction.startingPrice;
      await auction.save();

      const io = getIO();
      io.to(auctionId.toString()).emit('bid_removed', {
        auctionId,
        currentBid: auction.currentBid,
      });
    }

    res.json({ message: 'Bid removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all registered users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
