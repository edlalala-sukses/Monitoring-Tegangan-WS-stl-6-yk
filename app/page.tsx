"use client";

import { useEffect, useState } from "react";

type Reading = {
  voltageAtas: number;
  voltageBawah: number;
  frequency: number;
  receivedAt: Date;
};

export default function Home() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/voltage", { cache: "no-store" });
        if (!res.ok) throw new Error("request failed");
        
        const data = await res.json();
        if (cancelled) return;
        
        setReading({ 
          voltageAtas: data.voltageAtas, 
          voltageBawah: data.voltageBawah,
          frequency: data.frequency, 
          receivedAt: new Date() 
        });
        setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    }

    poll();
    // Diatur ke 1000ms (1 detik) menyesuaikan permintaan sebelumnya
    const id = setInterval(poll, 500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center min-h-screen bg-[#f4f5f7] p-6">
      <section className="w-full max-w-sm rounded-[22px] bg-white px-8 py-10 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-12px_rgba(16,24,40,0.12)]">
        
        {/* Tegangan Atas */}
        <div>
          <h1 className="text-sm font-medium tracking-[0.14em] text-neutral-500 uppercase">
            Tegangan F/U Atas
          </h1>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {reading && reading.voltageAtas !== undefined ? reading.voltageAtas.toFixed(2) : "--.--"}
            <span className="ml-2 text-xl font-medium text-neutral-400">V</span>
          </p>
        </div>

        <hr className="my-6 border-neutral-100" />

        {/* Tegangan Bawah */}
        <div>
          <h1 className="text-sm font-medium tracking-[0.14em] text-neutral-500 uppercase">
            Tegangan F/U Bawah
          </h1>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {reading && reading.voltageBawah !== undefined ? reading.voltageBawah.toFixed(2) : "--.--"}
            <span className="ml-2 text-xl font-medium text-neutral-400">V</span>
          </p>
        </div>

        <hr className="my-6 border-neutral-100" />

        {/* Frekuensi */}
        <div>
          <h1 className="text-sm font-medium tracking-[0.14em] text-neutral-500 uppercase">
            Frequency
          </h1>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {reading && reading.frequency !== undefined ? reading.frequency.toFixed(2) : "--.--"}
            <span className="ml-2 text-xl font-medium text-neutral-400">Hz</span>
          </p>
        </div>

        {/* Status & Waktu */}
        <div className="mt-10">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-700">
            <span
              className={`h-2 w-2 rounded-full ${
                online ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {online ? "Monitoring aktif" : "Koneksi terputus"}
          </p>
          <p className="mt-3 text-xs text-neutral-400 tabular-nums">
            Last Update:{" "}
            {reading ? reading.receivedAt.toLocaleTimeString("id-ID", { hour12: false }) : "--:--:--"}
          </p>
        </div>

      </section>
    </main>
  );
}