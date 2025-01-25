// pages/api/chunk-transcript.js
import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { transcriptPath, outputPath } = req.body;

    // Construct the absolute path to the Python script
    const scriptPath = path.join(process.cwd(), 'python_scripts', 'chunking_transcript.py');

    // Execute the Python script
    exec(`python3 ${scriptPath} -f ${transcriptPath} -o ${outputPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        res.status(500).json({ error: 'Failed to process transcript.' });
        return;
      }

      res.status(200).json({ message: 'Transcript processed successfully.', output: stdout });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
