export const config = {   
  api: {
    bodyParser: false,  // Disable body parsing to handle raw binary
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    console.log("Sending to Flask backend...");

    const flaskResponse = await fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
      },
      body: buffer,
    });

    if (!flaskResponse.ok) {
      throw new Error(`Failed to upload to Flask: ${flaskResponse.status} - ${flaskResponse.statusText}`);
    }

    console.log("ZIP file received from Flask backend.");

    // Read the ZIP file buffer correctly
    const zipBuffer = await flaskResponse.arrayBuffer();

    // Send the ZIP response correctly to the frontend
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="filtered_chunks.zip"');

    console.log("Sending ZIP file to client...");
    res.status(200).end(Buffer.from(zipBuffer));

  } catch (error) {
    console.error('Error processing file:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
}
