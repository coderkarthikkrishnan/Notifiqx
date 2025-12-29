import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY, "v1");
}

export const rewriteText = async (text, tone) => {
    if (!genAI) throw new Error("Gemini API Key missing");

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Rewrite the following notice description to be more ${tone}. 
    
    CRITICAL RULES:
    1. Provide ONLY the rewritten text.
    2. USE MARKDOWN (bolding, bullet points, correctly spaced headers) to make the information prominent and readable.
    3. DO NOT provide multiple options.
    4. DO NOT include any introductory or concluding remarks (e.g., "Here is your rewrite").
    5. DO NOT use labels like 'Option 1'.
    6. Keep all original facts and details intact.
    
    Target Description:
    ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};
