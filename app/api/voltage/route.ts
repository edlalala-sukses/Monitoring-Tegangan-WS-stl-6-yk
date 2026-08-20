export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.BLYNK_AUTH_TOKEN;
  const server = process.env.BLYNK_SERVER;

  if (!token || !server) {
    return Response.json(
      { error: "Gagal mengambil data tegangan" },
      { status: 500 }
    );
  }

  try {
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
        { error: "Gagal mengambil data tegangan" },
        { status: 502 }
      );
    }

    return Response.json({
      voltage,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Gagal mengambil data tegangan" },
      { status: 502 }
    );
  }
}
