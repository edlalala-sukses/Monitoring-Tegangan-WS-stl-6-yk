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
    const statusRes = await fetch(
      `https://${server}/external/api/isHardwareConnected?token=${token}`,
      { cache: "no-store" }
    );
    const isOnline = await statusRes.text();

    if (isOnline !== "true") {
      return Response.json({ error: "Perangkat ESP32 Offline" }, { status: 502 });
    }

    // Mengambil data V0 (Atas), V1 (Frekuensi), dan V2 (Bawah) BERSAMAAN
    const [resV0, resV1, resV2] = await Promise.all([
      fetch(`https://${server}/external/api/get?token=${token}&v0`, { cache: "no-store" }),
      fetch(`https://${server}/external/api/get?token=${token}&v1`, { cache: "no-store" }),
      fetch(`https://${server}/external/api/get?token=${token}&v2`, { cache: "no-store" })
    ]);

    if (!resV0.ok || !resV1.ok || !resV2.ok) {
      return Response.json({ error: "Gagal mengambil data sensor" }, { status: 502 });
    }

    const voltageAtas = Number(await resV0.text());
    const frequency = Number(await resV1.text());
    const voltageBawah = Number(await resV2.text());

    if (!Number.isFinite(voltageAtas) || !Number.isFinite(frequency) || !Number.isFinite(voltageBawah)) {
      return Response.json({ error: "Data sensor tidak valid" }, { status: 502 });
    }

    // Mengirim 3 data sekaligus
    return Response.json({
      voltageAtas,
      voltageBawah,
      frequency,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json({ error: "Gagal menghubungi server Blynk" }, { status: 502 });
  }
}