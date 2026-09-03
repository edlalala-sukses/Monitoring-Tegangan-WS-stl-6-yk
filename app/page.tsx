"use client";

import { useEffect, useState } from "react";

type Reading = {
  voltage: number;
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
        setReading({ voltage: data.voltage, receivedAt: new Date() });
        setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    }

    poll();
    const id = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center bg-[#f4f5f7] p-6">
      <section className="w-full max-w-sm rounded-[22px] bg-white px-8 py-12 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-12px_rgba(16,24,40,0.12)]">
        <h1 className="text-sm font-medium tracking-[0.14em] text-neutral-500 uppercase">
          Output Voltage
        </h1>

        <p className="mt-8 text-6xl font-semibold tracking-tight text-neutral-900 tabular-nums">
          {reading ? reading.voltage.toFixed(2) : "--.--"}
          <span className="ml-2 text-2xl font-medium text-neutral-400">V</span>
        </p>

        <p className="mt-10 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700">
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
      </section>
    </main>
  );
}