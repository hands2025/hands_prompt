// File: api/generate.js
// This is a Vercel Serverless Function that acts as a secure proxy.

export default async function handler(request, response) {
  // Set CORS headers to allow requests from any origin
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  // Handle OPTIONS request for preflight (sent by browser before POST)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST method for actual requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable not set.');
    return response.status(500).json({ error: 'Kunci API tidak dikonfigurasi di server.' });
  }
  if (!prompt) {
    return response.status(400).json({ error: 'Prompt dibutuhkan.' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }]
  };

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API Error:', data);
      const errorMessage = data?.error?.message || 'Gagal mengambil data dari Gemini API.';
      return response.status(geminiResponse.status).json({ 
        error: errorMessage
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        console.error('Invalid response structure from Gemini:', data);
        return response.status(500).json({ error: 'Struktur respons dari Gemini tidak valid.' });
    }
    
    return response.status(200).json({ text: text });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: 'Terjadi kesalahan internal pada server.', details: error.message });
  }
}
