import express from 'express';
import {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuctionStatus,
  deleteAuction,
  getAdminBidsByAuction,
  deleteBid,
  getAllUsers,
} from '../controllers/auctionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / user routes
router.route('/').get(getAuctions).post(protect, admin, createAuction);
router.route('/:id')
  .get(getAuctionById)
  .put(protect, admin, updateAuctionStatus)
  .delete(protect, admin, deleteAuction);

// Admin-only: full bid list per auction and overrule a bid
router.get('/:auctionId/bids', protect, admin, getAdminBidsByAuction);
router.delete('/bids/:bidId', protect, admin, deleteBid);

// Admin-only: all users
router.get('/admin/users', protect, admin, getAllUsers);

export default router;
