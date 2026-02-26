import React, { useEffect, useState } from "react";
import { trackingService } from "@/services/trackingService";

export default function Heatmap({ entityId, days = 90 }: { entityId: string; days?: number }) {
  const [map, setMap] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    trackingService.heatmap(entityId, from, to).then((m) => setMap(m)).finally(() => setLoaded(true));
  }, [entityId, days]);

  if (!loaded) return <div className="flex gap-0.5">{Array.from({ length: Math.min(30, days) }).map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm bg-white/5" />)}</div>;

  const cells = [] as { d: string; v: number }[];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    cells.push({ d, v: map[d] || 0 });
  }

  return (
    <div className="flex flex-wrap gap-0.5">
      {cells.map((c) => (
        <div
          key={c.d}
          title={`${c.d}: ${c.v}`}
          className={`w-2.5 h-2.5 rounded-sm transition-colors ${
            c.v === 0 ? "bg-white/5" : c.v === 1 ? "bg-[#3ecf8e]/40" : c.v <= 3 ? "bg-[#3ecf8e]/70" : "bg-[#3ecf8e]"
          }`}
        />
      ))}
    </div>
  );
}
