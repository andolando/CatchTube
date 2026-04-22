import { tavily } from '@tavily/core';
import { organizeChannel } from './geminiService.js';
import dotenv from 'dotenv';
import { channelsStats } from './youtubeService.js';

dotenv.config();

const tavilyService = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchChannelsByTheme = async (theme) => {
  try {
    // const { theme } = req.body;
    console.log(theme);
    const response = await tavilyService.search(theme, {
      searchDepth: 'advanced',
      maxResults: 10,
      includeAnswer: true,
      includeDomains: [
        'reddit.com',
        'medium.com',
        'youtube.com',
        'towardsdatascience.com',
        'freecodecamp.org',
        'dev.to',
        'x.com',
        'stackoverflow.blog',
      ],
        timeRange: "year",
    });

    const organizedChannels = await organizeChannel(response);
    const channels = await channelsStats(organizedChannels);
    console.log(channels);
    return channels;
  } catch (error) {
    console.error('Error searching channels:', error);
    throw error;
  }
};
