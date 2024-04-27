import google.generativeai as genai

def generate_response(prompt):
    GEMINI_API_KEY = "AIzaSyD4B0ftl6gEkuUuifk0SWQjeCZ3EY07gkg"
    genai.configure(api_key=GEMINI_API_KEY)

    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)

    text = f"GEMINI: {response.text.replace('GOOGLE GEMINI: ', '').replace('GEMINI: ', '')}"
    return text

prompt = """
GEMINI is an AI language model able to understand and remember conversations and respond accordingly. This single prompt contains all of the user conversation. Here is some system prompt instruction: "You are an AI assistant to assist users in learning english."

Following is the conversation between GEMINI and USER:

"""

while True:
    user_input = input("USER: ")
    prompt += f"USER: {user_input}\n"

    response = generate_response(prompt)
    prompt += response + "\n"
    print(f"{response}")
    # print(prompt).
