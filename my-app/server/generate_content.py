import os
import anthropic
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')


if not ANTHROPIC_API_KEY:
    raise ValueError("Anthropic API key is missing. Please check your .env file.")

# Initialize Anthropic client
anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def read_file_content(file_path):
    """Read content from a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return None

def generate_content(style_file: str, transcript_file: str) -> str:
    """
    Generate content using Anthropic Claude based on a fixed prompt.

    Args:
        style_file (str): Path to the writing style sheet.
        transcript_file (str): Path to the transcript content.

    Returns:
        str: The generated LinkedIn post or an error message.
    """

    # Read the style and transcript content files
    style_content = read_file_content(style_file)
    transcript_content = read_file_content(transcript_file)

    if not style_content or not transcript_content:
        return "Failed to read style or transcript files."

    # Fixed prompt
    full_prompt = f"""
    Attached is a style sheet that I want you to use to create this post.  
    Now, taking the content from this transcript, turn it into a post that takes specific details and words from this quote and turns it into a LinkedIn post. 
    It should be packaged for LinkedIn, while still fitting the stylesheet. Use good copywriting tactics. 
    Attached are the stylesheet and the transcription of a recent Instagram reel he posted. Don't use emojis and only output the post. Keep it between 500 and 1000 characters.

    Writing style:
    {style_content}

    Transcript content:
    {transcript_content}
    """

    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.7,
            system="You are a helpful assistant that helps me turn a transcript into LinkedIn posts.",
            messages=[
                {
                    "role": "user",
                    "content": full_prompt
                }
            ]
        )

        # Debug: Print the type and content of the response to understand its structure
        print("Response type:", type(response))
        print("Response content:", response)

        # Accessing the content attribute directly
        if hasattr(response, 'content'):
            text_blocks = response.content
            text_response = ''.join(
                block.text for block in text_blocks if hasattr(block, 'text')
            )
        else:
            text_response = "No 'content' attribute in response."

        if text_response:
            return text_response.strip()
        else:
            return "No valid text response found in API response."

    except Exception as e:
        print(f"Error generating content: {e}")
        return "Failed to generate content."



