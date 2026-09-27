// Minimal client-side mirror of the Komodo response shapes dashmodo's own /api/* routes
// pass through (plus the `link` field dashmodo adds). Not the full komodo_client type surface —
// only what the UI actually reads. Keep in sync with server/src/routes/*.ts.

export type ServerState = 'Ok' | 'NotOk' | 'Disabled';

export type StackState =
	| 'deploying'
	| 'running'
	| 'paused'
	| 'stopped'
	| 'created'
	| 'restarting'
	| 'dead'
	| 'removing'
	| 'unhealthy'
	| 'down'
	| 'unknown';

export interface SystemLoadAverage {
	one: number;
	five: number;
	fifteen: number;
}

export interface MinimalSystemStats {
	cpu_perc: number;
	load_average: SystemLoadAverage;
	mem_free_gb: number;
	mem_used_gb: number;
	mem_total_gb: number;
	disk_used_gb?: number;
	disk_total_gb?: number;
}

export interface ServerListItem {
	id: string;
	name: string;
	tags: string[];
	info: {
		state: ServerState;
		stats?: MinimalSystemStats;
		region: string;
		address?: string;
		external_address?: string;
	};
}

export interface SingleDiskUsage {
	mount: string;
	used_gb: number;
	total_gb: number;
}

export interface SystemStats {
	cpu_perc: number;
	load_average?: SystemLoadAverage;
	mem_used_gb: number;
	mem_total_gb: number;
	disks: SingleDiskUsage[];
	network_ingress_bytes?: number;
	network_egress_bytes?: number;
	refresh_ts: number;
}

export interface SystemStatsRecord {
	ts: number;
	cpu_perc: number;
	mem_used_gb: number;
	mem_total_gb: number;
	disk_used_gb: number;
	disk_total_gb: number;
	network_ingress_bytes?: number;
	network_egress_bytes?: number;
}

export interface ServerDetail {
	server: {
		id: string;
		name: string;
		config: { address?: string; external_address?: string };
	};
	stats?: SystemStats;
}

export interface ResolvedLink {
	url?: string;
	source: 'override' | 'komodo' | 'derived' | 'none';
}

export interface StackListItem {
	id: string;
	name: string;
	tags: string[];
	info: {
		server_id: string;
		server_name?: string;
		state: StackState;
		status?: string;
	};
	link: ResolvedLink;
}

export interface AdminSession {
	authenticated: boolean;
	passwordRequired: boolean;
}

export interface StackSettingsRow {
	id: string;
	name: string;
	server_name?: string;
	state: StackState;
	hidden: boolean;
	linkOverride: string | null;
}
