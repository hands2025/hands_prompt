// File: api/generate.js
// This is a Vercel Serverless Function that acts as a secure proxy.

export default async function handler(request, response) {
  // Hanya izinkan metode POST
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

    // PERBAIKAN: Selalu coba baca respons sebagai JSON untuk mendapatkan detail error
    const data = await geminiResponse.json();

    // Periksa apakah respons dari Gemini tidak berhasil
    if (!geminiResponse.ok) {
      console.error('Gemini API Error:', data);
      const errorMessage = data?.error?.message || 'Gagal mengambil data dari Gemini API.';
      return response.status(geminiResponse.status).json({ 
        error: errorMessage
      });
    }

    // Ekstrak teks jika berhasil
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        console.error('Invalid response structure from Gemini:', data);
        return response.status(500).json({ error: 'Struktur respons dari Gemini tidak valid.' });
    }
    
    // Kirim teks kembali ke frontend
    return response.status(200).json({ text: text });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: 'Terjadi kesalahan internal pada server.', details: error.message });
  }
}
