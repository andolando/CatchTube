import ai from '../config/gemini.js';

export const organizeChannel = async (searchResponse) => {
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Using the following data, extract all existing YouTube channel names. Then, organize the results into a clean and well-structured format. Make sure the output is properly formatted, easy to read, and only includes valid channel names that actually exist in the provided data.
    The data is: ${JSON.stringify(searchResponse)}`;

    const result = await model.generateContent(prompt);

    const structuredData = JSON.parse(result.response.text());
    // console.log(structuredData);
    return structuredData;
    s;
  } catch (error) {
    console.error('Error structuring channel:', error);
    throw error;
  }
};
