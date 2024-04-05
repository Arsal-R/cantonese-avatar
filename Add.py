from openai import OpenAI
from dotenv import load_dotenv, dotenv_values
import os

# Function to update or add FILE_ID in .env file
def update_env_file(file_id):
    # Load current .env file into a dictionary
    env_path = '.env'
    env_dict = dotenv_values(env_path)

    # Update FILE_ID value
    env_dict['FILE_ID'] = file_id

    # Write updated values back to .env file
    with open(env_path, 'w') as env_file:
        for key, value in env_dict.items():
            env_file.write(f'{key}={value}\n')

# Initialize OpenAI with API key from .env
load_dotenv()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def upload_file(file_path):
    print("Uploading the file...")
    with open(file_path, "rb") as file_obj:
        up_file = openai.files.create(
            file=file_obj,
            purpose="assistants"
        )

    print(up_file.id)
    update_env_file(up_file.id)
    return up_file.id

# Example usage
file_path = input("FILE PATH : ")
upload_file(file_path)
