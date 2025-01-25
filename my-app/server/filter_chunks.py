import re
import os
import sys
from dotenv import load_dotenv
import openai

# Ensure the OpenAI library is available
try:
    import openai
    _HAS_OPENAI = True
except ImportError:
    _HAS_OPENAI = False
    print("OpenAI library not installed. Exiting.")
    sys.exit(1)

# Load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

def word_count(text):
    return len(text.split())

def passes_minimum_length(chunk_text, min_words=50):
    return word_count(chunk_text) >= min_words

def llm_filter_chunk(chunk_text, threshold=2.5):
    """
    Use OpenAI to analyze a chunk and decide if it's meaningful enough based on substance, statistics, and storytelling.
    If the chunk meets the criteria, the entire original chunk is returned; otherwise, None is returned.
    """

    if not _HAS_OPENAI:
        raise ImportError("OpenAI library is required but not installed.")

    prompt = f""" 
    You are an expert content analyst specializing in social media engagement. Analyze the following text chunk and evaluate it based on these criteria:

    ---
    {chunk_text}
    ---

    **Evaluation Criteria (Rate 1-5):**
    - **Substance:** Does the chunk provide valuable insights, meaningful information, or unique perspectives? 
    - **Use of Statistics:** Does the chunk include relevant statistics, quantifiable data, or credible references?
    - **Storytelling:** Are there compelling personal anecdotes, case studies, or real-world examples that make it engaging?
    - **Clarity:** Is the content clear, concise, and easily understandable by a broad audience?

    **Instructions:**
    1. Provide a score (1-5) for each evaluation criterion listed above.
    2. Conclude by stating 'YES' if the chunk meets the threshold of {threshold} or more in at least one category; otherwise, state 'NO'.
    3. If the chunk contains elements that might be useful for social media engagement or sparks interest, respond with 'YES'.
    """

    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert social media strategist. Your goal is to identify content chunks with strong substance, "
                "credible statistics, and compelling storytelling to ensure high engagement and impact. "
                "Consider including content that could be relatable, thought-provoking, or educational."
            )
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=200,
            temperature=0.0
        )
        answer = response.choices[0].message.content
        print(f"Analysis result:\n{answer}")

        if "YES" in answer:
            return chunk_text  # Return the original chunk if criteria are met
        else:
            return None  # Return None if criteria are not met

    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return False

def filter_chunks(chunks):
    """
    Process an array of chunks and return only the relevant ones.
    """

    if not chunks:
        print("No chunks to process.")
        return []

    print(f"Total chunks received: {len(chunks)}")

    # Step 1: Apply minimum word count filter
    filtered_chunks = [chunk for chunk in chunks if passes_minimum_length(chunk, 50)]
    print(f"After length filter, {len(filtered_chunks)} chunks remain.")

    # Step 2: Apply OpenAI filtering
    final_chunks = []
    for chunk in filtered_chunks:
        if llm_filter_chunk(chunk):
            final_chunks.append(chunk)

    print(f"After LLM filtering, {len(final_chunks)} chunks selected.")
    return final_chunks
