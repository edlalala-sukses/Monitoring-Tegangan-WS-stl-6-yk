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

    // 2. Jika ESP32 menyala, lanjutkan mengambil data tegangan dari V0
    const res = await fetch(
      `https://${server}/external/api/get?token=${token}&v0`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return Response.json(
        { error: "Gagal mengambil data tegangan" },
        { status: 502 }
      );
    }

    const voltage = Number(await res.text());

    if (!Number.isFinite(voltage)) {
      return Response.json(
        { error: "Data tegangan tidak valid" },
        { status: 502 }
      );
    }

    // 3. Kirim data yang sukses terbaca ke dashboard
    return Response.json({
      voltage,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Gagal menghubungi server Blynk" },
      { status: 502 }
    );
  }
}