// /api/translate.js

export default async function handler(request, response) {
  // Hanya izinkan metode POST untuk keamanan
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ambil Kunci API dari Environment Variables di Vercel (Sangat Aman)
  // 'process.env.GEMINI_API_KEY' akan membaca variabel yang Anda atur di dashboard Vercel.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  // Ambil prompt yang dikirim dari file index.html
  const { prompt } = request.body;

  if (!prompt) {
    return response.status(400).json({ error: 'No prompt provided in the request.' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  try {
    // Teruskan permintaan ke API Gemini yang sebenarnya
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      }),
    });

    // Jika Gemini memberikan error, teruskan error tersebut
    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      return response.status(geminiResponse.status).json({ error: `Gemini API error: ${errorBody}` });
    }

    const data = await geminiResponse.json();
    
    // Kirim kembali respons sukses dari Gemini ke frontend
    return response.status(200).json(data);

  } catch (error) {
    // Tangani jika ada error jaringan atau lainnya
    return response.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
