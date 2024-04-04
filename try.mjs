import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function getResponse(user_message, instructions) {
    const assistant = await openai.beta.assistants.create({
        model: "gpt-3.5-turbo-0125",
        name: "Relearn AI",
        tools: [
            { type: "retrieval" }
        ],
        instructions: instructions
    })
    const assistant_id = assistant.id

    const thread = await openai.beta.threads.create()
    const thread_id = thread.id

    const messages = await openai.beta.threads.messages.create(
        thread_id,
        {
            role: "user",
            content: user_message
        }
    )

    const run = await openai.beta.threads.runs.create(
        thread_id,
        {
            assistant_id: assistant_id
        }
    )

    while (true) {
        // console.log("Iteration...")
        let run_status = await openai.beta.threads.runs.retrieve(
            thread_id,
            run.id
        )

        if (run_status.status == 'completed') {
            const responseMessages = await openai.beta.threads.messages.list(
                thread_id
            )

            for (const message of responseMessages.data.reverse()) {
                console.log(`${message.role}: ${message.content[0].text.value}`)
                if (message.role === "assistant") {
                    return message.content[0].text.value
                }
            }
            break
        }

        else {
            console.log("Status : " + run_status.status)
        }
    }
}

getResponse("Hello", "You are an AI Assistant").then((response) => {
    console.log(response)
})