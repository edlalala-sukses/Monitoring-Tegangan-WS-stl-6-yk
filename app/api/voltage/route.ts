export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.BLYNK_AUTH_TOKEN;
  const server = process.env.BLYNK_SERVER;

  if (!token || !server) {
    return Response.json(
      { error: "Server error: Token belum diatur" },
      { status: 500 }
    );
  }

  try {
    // 1. Pengecekan Status ESP32 (Menyala/Mati)
    const statusRes = await fetch(
      `https://${server}/external/api/isHardwareConnected?token=${token}`,
      { cache: "no-store" }
    );
    const isOnline = await statusRes.text();

    // Jika ESP32 mati, paksa kembalikan error 502 agar indikator web menjadi merah
    if (isOnline !== "true") {
      return Response.json(
        { error: "Perangkat ESP32 Offline" },
        { status: 502 }
      );
    }

    // 2. Jika ESP32 menyala, ambil data tegangan (V0) dan frekuensi (V1) BERSAMAAN
    const [resV0, resV1] = await Promise.all([
      fetch(`https://${server}/external/api/get?token=${token}&v0`, { cache: "no-store" }),
      fetch(`https://${server}/external/api/get?token=${token}&v1`, { cache: "no-store" })
    ]);

    if (!resV0.ok || !resV1.ok) {
      return Response.json(
        { error: "Gagal mengambil data sensor" },
        { status: 502 }
      );
    }

    // Mengonversi teks dari Blynk menjadi angka
    const voltage = Number(await resV0.text());
    const frequency = Number(await resV1.text());

    if (!Number.isFinite(voltage) || !Number.isFinite(frequency)) {
      return Response.json(
        { error: "Data sensor tidak valid" },
        { status: 502 }
      );
    }

    // 3. Kirim data yang sukses terbaca ke dashboard frontend
    return Response.json({
      voltage,
      frequency, // Data frekuensi ditambahkan di sini
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Gagal menghubungi server Blynk" },
      { status: 502 }
    );
  }
}