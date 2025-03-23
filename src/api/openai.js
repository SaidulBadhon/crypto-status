import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions"; // For GPT-4 & GPT-3.5

export const fetchOpenAIResponse = async (message) => {
  console.log(API_KEY);
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "Error fetching response";
  }
};
