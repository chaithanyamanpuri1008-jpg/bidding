import { generateAuctionDescription } from '../services/aiService.js';

export const generateDescription = async (req, res) => {
  try {
    const { title, keywords } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const description = await generateAuctionDescription(title, keywords || '');
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
