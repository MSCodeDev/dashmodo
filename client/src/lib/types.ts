// Minimal client-side mirror of the Komodo response shapes Dashmodo's own /api/* routes
// pass through (plus the `link` field Dashmodo adds). Not the full komodo_client type surface —
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

export interface ResolvedLink {
	url?: string;
	source: 'komodo' | 'derived' | 'none';
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
	/** selfh.st/icons reference — override if set, else auto-derived from the stack name. */
	icon: string;
}

export interface AdminSession {
	authenticated: boolean;
	passwordRequired: boolean;
}

export type ColorScheme = 'system' | 'light' | 'dark';
export type IconStyle = 'default' | 'light' | 'dark';

export interface AppSettings {
	siteName: string | null;
	colorScheme: ColorScheme;
	serversColumns: number;
	stacksColumns: number;
	defaultIconStyle: IconStyle;
	customCss: string | null;
	themeColor: string | null;
	/** Custom logo + favicon as an `upload:<file>` reference; null = the built-in logo. */
	logoRef: string | null;
	portDenylist: number[];
	komodoUrl: string | null;
}

export interface AppConfig {
	komodoUrl: string | null;
	needsOnboarding: boolean;
	appSettings: AppSettings;
}

/** Admin-only, non-secret view of the Komodo connection + admin password — "is it set" booleans. */
export interface ConnectionSettings {
	komodoUrl: string | null;
	komodoApiKeySet: boolean;
	komodoApiSecretSet: boolean;
	adminPasswordSet: boolean;
	portDenylist: number[];
}

export interface StackSettingsRow {
	id: string;
	name: string;
	state: StackState;
	hidden: boolean;
	iconOverride: string | null;
	/** Manual position from dragging; null = default alphabetical. */
	sortOrder: number | null;
	defaultIcon: string;
}

export interface ServerSettingsRow {
	id: string;
	name: string;
	state: ServerState;
	detectedAddress: string | null;
	linkOverride: string | null;
	sortOrder: number | null;
}
