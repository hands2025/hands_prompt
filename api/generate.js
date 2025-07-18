// File: api/generate.js

export default async function handler(req, res) {
  // 1. Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Ambil Kunci API dari Environment Variables Vercel (Aman)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'API key not configured on the server.' });
  }

  // 3. Ambil prompt dan data gambar dari body permintaan
  const { prompt, imageData } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided in the request.' });
  }

  // 4. Siapkan URL API Gemini
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  let payload;

  // 5. Logika untuk membedakan permintaan teks-saja atau multimodal (teks+gambar)
  if (imageData) {
    // Ini adalah permintaan multimodal (gambar dan teks)
    try {
      // Memisahkan Data URL untuk mendapatkan tipe MIME dan data base64
      const parts = imageData.split(';');
      const mimeType = parts[0].split(':')[1];
      const base64Data = parts[1].split(',')[1];

      // Membuat payload untuk permintaan multimodal
      payload = {
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      };
    } catch (e) {
      console.error("Error parsing image data URL:", e);
      return res.status(400).json({ error: "Invalid image data format." });
    }
  } else {
    // Ini adalah permintaan teks-saja
    payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };
  }

  try {
    // 6. Teruskan permintaan ke API Gemini yang sebenarnya
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const geminiData = await geminiResponse.json();

    // 7. Jika Gemini memberikan error, teruskan error tersebut
    if (!geminiResponse.ok) {
      const errorMessage = geminiData.error?.message || 'Unknown Gemini API error';
      console.error("Gemini API Error:", errorMessage, geminiData);
      return res.status(geminiResponse.status).json({ error: `Gemini API error: ${errorMessage}` });
    }
    
    // 8. Kirim kembali respons sukses dari Gemini ke frontend
    res.status(200).json(geminiData);

  } catch (error) {
    // Tangani jika ada error jaringan atau lainnya
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
