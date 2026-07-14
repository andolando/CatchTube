import ai from '../config/gemini.js';
import { channelsStats } from './youtubeService.js';

export const organizeChannel = async (searchResponse,theme) => {
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Using the following data, extract all existing YouTube channel names. Then, organize the results into a clean and well-structured format. Make sure the output is properly formatted, easy to read, and only includes valid channel names that actually exist in the provided data.
    The data is: ${JSON.stringify(searchResponse)}`;

//     const prompt = `
//     You are an expert technical curator. I am providing you with raw search data related to the theme: "${theme}".

//     Your mission:
//     1. **Strict Filtering**: Analyze the data below and extract ONLY the names of YouTube channels that are directly relevant to the theme. 
//     2. **Noise Removal**: Exclude any channels related to gaming, general tech news, marketing, or entertainment. They must be coding/programming channels.
//     3. **Expert Suggestions**: If the provided data has fewer than 5 high-quality results, supplement the list with well-known, high-quality French YouTube channels that fit the theme based on your own knowledge.
//     4. **Language Check**: Ensure the channels primarily produce content in French.

//     Raw Data: ${JSON.stringify(searchResponse)}

//     Output Format:
//     Return a clean JSON array of objects with this structure:
//     [
//       { "name": "Channel Name", "reason": "Why it fits the theme", "is_from_data": true/false }
//     ]
// `;

    const result = await model.generateContent(prompt);

    const structuredData = JSON.parse(result.response.text());
    return structuredData;
  } catch (error) {
    console.error('Error structuring channel:', error);
    throw error;
  }
};
