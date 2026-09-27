import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SystemStatsRecord } from '../../lib/types';

function formatTime(ts: number) {
	return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function HistoricalChart({ records }: { records: SystemStatsRecord[] }) {
	const data = [...records]
		.reverse()
		.map((r) => ({
			ts: r.ts,
			cpu: r.cpu_perc,
			mem: r.mem_total_gb > 0 ? (r.mem_used_gb / r.mem_total_gb) * 100 : 0
		}));

	if (data.length === 0) {
		return null;
	}

	return (
		<ResponsiveContainer width="100%" height={220}>
			<AreaChart data={data}>
				<defs>
					<linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0.4} />
						<stop offset="95%" stopColor="var(--mantine-color-blue-6)" stopOpacity={0} />
					</linearGradient>
					<linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--mantine-color-grape-6)" stopOpacity={0.4} />
						<stop offset="95%" stopColor="var(--mantine-color-grape-6)" stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
				<XAxis dataKey="ts" tickFormatter={formatTime} minTickGap={40} fontSize={11} />
				<YAxis domain={[0, 100]} fontSize={11} width={32} />
				<Tooltip
					labelFormatter={(ts) => formatTime(Number(ts))}
					formatter={(v) => `${Number(v).toFixed(1)}%`}
				/>
				<Area
					type="monotone"
					dataKey="cpu"
					name="CPU"
					stroke="var(--mantine-color-blue-6)"
					fill="url(#cpuGradient)"
					strokeWidth={2}
				/>
				<Area
					type="monotone"
					dataKey="mem"
					name="Memory"
					stroke="var(--mantine-color-grape-6)"
					fill="url(#memGradient)"
					strokeWidth={2}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
