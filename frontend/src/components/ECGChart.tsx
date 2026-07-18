import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ECGChartProps = {
  data: Array<{ t: number; v: number }>;
  tall?: boolean;
};

export default function ECGChart({ data, tall = false }: ECGChartProps) {
  return (
    <div className={`panel ecg-grid p-4 ${tall ? "h-[360px]" : "h-[260px]"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">ECG Graph</h3>
          <p className="text-sm text-hospital-muted">Dummy waveform ready for simulator data</p>
        </div>
        <span className="rounded-md border border-status-stable/35 bg-status-stable/10 px-2 py-1 text-xs font-semibold text-status-stable">
          25 mm/s
        </span>
      </div>
      <div className="h-[calc(100%-64px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8, top: 12, bottom: 0 }}>
            <XAxis dataKey="t" hide />
            <YAxis hide domain={[-0.35, 1.25]} />
            <Tooltip
              contentStyle={{
                background: "#172235",
                border: "1px solid #24344A",
                borderRadius: 8,
                color: "#fff"
              }}
              labelFormatter={(label) => `${label}s`}
              formatter={(value) => [Number(value).toFixed(3), "mV"]}
            />
            <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
