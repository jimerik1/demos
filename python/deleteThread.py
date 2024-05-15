import requests

def delete_thread(api_key, thread_id):
    url = f"https://api.openai.com/v1/threads/{thread_id}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "OpenAI-Beta": "assistants=v2"
    }

    response = requests.delete(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()

if __name__ == "__main__":
    # Replace with your actual API key
    OPENAI_API_KEY = "sk-proj-wG6pRejlT651motJfEL6T3BlbkFJITCAkD8NECQPuYIvm1Sf"
    THREAD_ID = "thread_D4SwoHbLRG6GgpMLTd6rb9Ze"

    try:
        result = delete_thread(OPENAI_API_KEY, THREAD_ID)
        print(f"Thread deleted successfully: {result}")
    except requests.exceptions.HTTPError as err:
        print(f"Failed to delete thread: {err}")
