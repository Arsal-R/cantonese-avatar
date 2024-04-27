// import OpenAI from "openai";

// const openai = new OpenAI({
//     apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
// });

const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"];
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function GET(req) {
    const speech = req.nextUrl.searchParams.get("speech") || "answer";
    const system_prompt = req.nextUrl.searchParams.get("prompt");
    const prompt = `
GEMINI is an AI language model able to understand and remember conversations and respond accordingly. This single prompt contains all of the user conversation. Here is some system prompt instruction: "${system_prompt}"

Following is the conversation between GEMINI and USER:

USER: ${req.nextUrl.searchParams.get("question")}
`
    console.log(`\nPrompt: ${prompt}\n`)

    const answer = await getResponse(prompt)
    return Response.json({ answer: answer });
}

async function getResponse(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro"
    })

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();
    console.log(text)
    return text
}

// async function getResponse(user_message, instructions) {
//     const assistant = await openai.beta.assistants.create({
//         model: "gpt-3.5-turbo-0125",
//         name: "Relearn AI",
//         tools: [
//             { type: "retrieval" }
//         ],
//         instructions: instructions,
//         file_ids: [process.env.FILE_ID]
//     })
//     const assistant_id = assistant.id

//     const thread = await openai.beta.threads.create()
//     const thread_id = thread.id

//     await openai.beta.threads.messages.create(
//         thread_id,
//         {
//             role: "user",
//             content: user_message
//         }
//     )

//     const run = await openai.beta.threads.runs.create(
//         thread_id,
//         {
//             assistant_id: assistant_id
//         }
//     )

//     while (true) {
//         let run_status = await openai.beta.threads.runs.retrieve(
//             thread_id,
//             run.id
//         )

//         if (run_status.status == 'completed') {
//             const responseMessages = await openai.beta.threads.messages.list(
//                 thread_id
//             )

//             for (const message of responseMessages.data.reverse()) {
//                 console.log(`${message.role}: ${message.content[0].text.value}`)
//                 if (message.role === "assistant") {
//                     return message.content[0].text.value
//                 }
//             }
//         }

//         else {
//             console.log("Status : " + run_status.status)
//         }
//     }
// }