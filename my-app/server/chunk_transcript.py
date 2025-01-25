#!/usr/bin/env python3

import argparse
import sys
import os

# For semantic chunking
try:
    from sentence_transformers import SentenceTransformer, util
    _HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    _HAS_SENTENCE_TRANSFORMERS = False
    print("Note: 'sentence-transformers' is not installed. Semantic chunking will not work.")

def parse_transcript_no_colon(file_path, speakers_of_interest):
    """
    Parse a transcript where each speaker has their own line (e.g., "Austin Kennedy")
    followed by one or more lines of text, until the next speaker line appears.

    Parameters:
      - file_path: path to the .txt transcript
      - speakers_of_interest: list of possible speaker labels (in lower-case)

    Returns:
      A list of (speaker, text) tuples, where `speaker` is exactly the line read
      from the file, and `text` is the accumulated text until the next speaker line.
    """

    transcript_data = []
    current_speaker = None
    current_text = []

    with open(file_path, 'r', encoding='utf-8-sig') as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line:
                # Skip empty lines
                continue

            # Check if this line is a speaker line by seeing if it matches one of the known labels
            if line.lower() in speakers_of_interest:
                # We have encountered a new speaker
                if current_speaker is not None and current_text:
                    # Store the previous speaker's text
                    transcript_data.append((current_speaker, " ".join(current_text)))
                    current_text = []
                current_speaker = line  # keep the exact capitalization
            else:
                # This line is text for the current speaker
                current_text.append(line)

    # After the loop, if there's any leftover text, append it
    if current_speaker is not None and current_text:
        transcript_data.append((current_speaker, " ".join(current_text)))

    return transcript_data

def chunk_by_qa(transcript_data, target_label="austin kennedy", interviewer_label="speaker a"):
    """
    Simple Q&A chunking for Austin Kennedy:
      - Each time the Interviewer speaks, we consider that the end of Austin Kennedy's current chunk.
      - Returns a list of text chunks (strings) for Austin Kennedy.
    """
    chunks = []
    current_chunk = []

    for (speaker, text) in transcript_data:
        spk_lower = speaker.lower()

        if interviewer_label in spk_lower:
            # Interviewer just started speaking => end the current Austin chunk
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
        elif target_label in spk_lower:
            # This is Austin Kennedy => accumulate his text
            current_chunk.append(text)

    # If there's any leftover Austin Kennedy text
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def chunk_by_semantic(transcript_data, target_label="austin kennedy", threshold=0.6):
    """
    Semantic chunking using embeddings:
      - Collect only Austin Kennedy lines as separate 'units'.
      - Compute embeddings and compare consecutive lines.
      - Split whenever similarity < threshold.
    Returns a list of text chunks for Austin Kennedy.
    """
    if not _HAS_SENTENCE_TRANSFORMERS:
        print("Error: 'sentence-transformers' not installed. Cannot do semantic chunking.")
        sys.exit(1)

    # Extract only Austin Kennedy lines
    target_lines = [txt for (spk, txt) in transcript_data if target_label in spk.lower()]
    if not target_lines:
        print("No Austin Kennedy lines found. Check transcript format or speaker label.")
        return []

    # Create embeddings
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    embeddings = model.encode(target_lines, convert_to_tensor=True)

    chunks = []
    current_chunk = [target_lines[0]]

    for i in range(len(embeddings) - 1):
        sim = util.cos_sim(embeddings[i], embeddings[i+1]).item()
        if sim < threshold:
            # Big topic shift => start new chunk
            chunks.append(" ".join(current_chunk))
            current_chunk = [target_lines[i+1]]
        else:
            # Continue
            current_chunk.append(target_lines[i+1])

    # Final chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def main():
    parser = argparse.ArgumentParser(description="Chunk transcript for specified speaker lines (no colon format).")
    parser.add_argument("--file", "-f", type=str, required=True,
                        help="Path to the transcript text file.")
    parser.add_argument("--method", "-m", type=str, default="qa",
                        choices=["qa", "semantic"],
                        help="Chunking method: 'qa' or 'semantic' (uses embeddings).")
    parser.add_argument("--target_label", type=str, default="Austin Kennedy",
                        help="Label to identify target speaker lines. Case-insensitive match.")
    parser.add_argument("--interviewer_label", type=str, default="Speaker A",
                        help="Label to identify Interviewer lines. Case-insensitive match.")
    parser.add_argument("--threshold", type=float, default=0.6,
                        help="Similarity threshold for semantic chunking (0 to 1).")
    parser.add_argument("--output", "-o", type=str, default="",
                        help="Optional output file to save chunks. If omitted, prints to console.")
    args = parser.parse_args()

    # Define what lines count as a speaker.
    speakers_of_interest = {args.target_label.lower(), args.interviewer_label.lower()}

    # Parse the transcript
    transcript_data = parse_transcript_no_colon(args.file, speakers_of_interest)

    # Chunk
    if args.method == "qa":
        chunks = chunk_by_qa(
            transcript_data,
            target_label=args.target_label.lower(),
            interviewer_label=args.interviewer_label.lower()
        )
    else:
        chunks = chunk_by_semantic(
            transcript_data,
            target_label=args.target_label.lower(),
            threshold=args.threshold
        )

    # Output
    if not chunks:
        print(f"No chunks found for {args.target_label}. Check the transcript or speaker labels.")
        sys.exit(0)

    for i, c in enumerate(chunks, start=1):
        print(f"[CHUNK {i}]\n{c}\n{'-'*60}\n")

    if args.output:
        # Specify your desired directory:
        # If args.output is provided, use it; otherwise, default to 'output.txt' in the specified directory
        directory_path = r'C:\Users\akenn\OneDrive\Desktop\Coding\local_functions\Podcast_Chunking'
        output_file = os.path.join(directory_path, args.output if args.output else 'output.txt')

        try:
            with open(output_file, 'w', encoding='utf-8') as out_f:
                # Write the header with the number of chunks
                out_f.write(f"=== Generated {len(chunks)} chunk(s) using method '{args.method}' ===\n\n")
                # Write each chunk to the file
                for i, c in enumerate(chunks, start=1):
                    out_f.write(f"[CHUNK {i}]\n{c}\n{'-'*60}\n\n")
            print(f"Chunks written to '{output_file}'.")
        except Exception as e:
            print(f"Error writing to file: {e}")

if __name__ == "__main__":
    main()
