<?php
// Mengatur header untuk mengizinkan permintaan dari domain mana pun.
// Untuk keamanan lebih, ganti '*' dengan alamat domain Anda saat sudah live.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

// 1. AMBIL KUNCI API ANDA
// PENTING: Ganti teks di bawah dengan Kunci API Gemini Anda yang sebenarnya.
$apiKey = "AIzaSyDUUV34TggOhKXbNdYfuVrlgpfUwjlLsJs";

// 2. Ambil data yang dikirim dari JavaScript
$input = json_decode(file_get_contents('php://input'), true);
$promptText = isset($input['prompt']) ? $input['prompt'] : null;

if (!$promptText) {
    http_response_code(400);
    echo json_encode(['error' => 'Error: No prompt text provided.']);
    exit;
}

// 3. Persiapkan data untuk dikirim ke API Gemini
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;
$data = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [['text' => $promptText]]
        ]
    ]
];

// 4. Gunakan cURL untuk membuat permintaan ke API Gemini
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Opsi ini terkadang diperlukan di hosting gratis
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    // Jika ada error cURL (misalnya, masalah jaringan)
    http_response_code(500);
    echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// 5. Kirim kembali respons dari Gemini ke JavaScript
http_response_code($httpcode);
echo $response;

?>
