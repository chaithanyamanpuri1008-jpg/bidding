import Groq from "groq-sdk";

export const generateAuctionDescription = async (title, keywords) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const prompt = `Write a smart, engaging, and premium auction description for an item titled "${title}". 
    Use the following keywords/hints: ${keywords}. 
    Make it sound appealing to bidders. Keep it under 150 words.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw new Error("Failed to generate description");
  }
};
