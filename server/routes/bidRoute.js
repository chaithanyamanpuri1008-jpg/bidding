import express from 'express';
import { createBid, getBidsByAuctionId } from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBid);
router.route('/:auctionId').get(getBidsByAuctionId);

export default router;
