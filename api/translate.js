// /api/translate.js

export default async function handler(request, response) {
  // Hanya izinkan metode POST untuk keamanan
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ambil Kunci API dari Environment Variables di Vercel (Sangat Aman)
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

    // PERBAIKAN: Cek status respons SEBELUM mencoba parsing JSON
    if (!geminiResponse.ok) {
      // Jika ada error, baca respons sebagai teks untuk menghindari JSON parse error
      const errorBody = await geminiResponse.text();
      console.error("Gemini API Error Body:", errorBody); // Log untuk debugging di Vercel
      return response.status(geminiResponse.status).json({ error: `Gemini API error: ${errorBody}` });
    }

    // Jika respons OK, baru parse sebagai JSON
    const geminiData = await geminiResponse.json();
    
    // Kirim kembali respons sukses dari Gemini ke frontend
    return response.status(200).json(geminiData);

  } catch (error) {
    // Tangani jika ada error jaringan atau lainnya
    console.error("Internal Server Error:", error);
    return response.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
