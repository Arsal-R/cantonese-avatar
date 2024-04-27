const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = ""
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generate_response(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro"
    })

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text().replace('GOOGLE GEMINI: ', '').replace('GEMINI: ', '');
    console.log(text)
    return text
}

const prompt = `
GEMINI is an AI language model able to understand and remember conversations and respond accordingly. This single prompt contains all of the user conversation. Here is some system prompt instruction: "You are an AI assistant to assist users in learning english."

Following is the conversation between GEMINI and USER:

`

generate_response(prompt)