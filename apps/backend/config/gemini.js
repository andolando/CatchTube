import { GoogleGenerativeAI } from '@google/generative-ai';

import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenerativeAI(
   process.env.GEMINI_API_KEY
);

export default ai;
