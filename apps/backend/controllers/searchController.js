import { searchChannelsByTheme } from '../services/tavilyService.js';

export const searchChannels = async (req, res) => {
  const { theme } = req.body;
    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }
    try {
      const results = await searchChannelsByTheme(theme);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };