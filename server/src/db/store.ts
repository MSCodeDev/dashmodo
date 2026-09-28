import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// Not env-configurable — this is where the store finds *all* other config (Komodo connection,
// admin password, etc), so its own location can't live inside itself. Fixed relative to the
// server's working directory: `server/` in dev, `/app` in the Docker image (matches the volume
// mount in docker-compose.yml).
export const DATA_FILE_PATH = './data/dashmodo.json';

export type ResourceType = 'server' | 'stack';
export type ColorScheme = 'system' | 'light' | 'dark';
export type IconStyle = 'default' | 'light' | 'dark';

export interface ResourceSettingsRow {
	resourceType: ResourceType;
	resourceId: string;
	hidden: boolean;
	linkOverride: string | null;
	iconOverride: string | null;
	updatedAt: string;
}

export interface AppSettingsData {
	siteName: string | null;
	colorScheme: ColorScheme;
	serversColumns: number;
	stacksColumns: number;
	defaultIconStyle: IconStyle;
	customCss: string | null;
	themeColor: string | null;
	/** Extra ports to skip when deriving a stack link, merged with links.ts's built-in defaults. */
	portDenylist: number[];
	// Set via onboarding on first run, editable later in Settings. Not in env anymore.
	komodoUrl: string | null;
	komodoApiKey: string | null;
	komodoApiSecret: string | null;
	adminPasswordHash: string | null;
	updatedAt: string;
}

interface StoreData {
	resourceSettings: ResourceSettingsRow[];
	appSettings: AppSettingsData;
	/**
	 * Signs the admin session cookie. Generated once on first boot and persisted here (never
	 * user-editable, never in `appSettings`) so it's stable across restarts but requires zero
	 * manual setup — the last thing that used to need a manually-set env var.
	 */
	sessionSecret: string;
	/**
	 * Required to complete onboarding — printed to the server console on boot, never exposed via
	 * any API. Without this, an instance reachable from the internet before its operator visits it
	 * is a "first request wins" race: anyone could onboard it with their own Komodo credentials and
	 * an admin password of their choosing, locking the real operator out.
	 */
	setupToken: string;
}

const DEFAULT_APP_SETTINGS: AppSettingsData = {
	siteName: null,
	colorScheme: 'dark',
	serversColumns: 2,
	stacksColumns: 3,
	defaultIconStyle: 'default',
	customCss: null,
	themeColor: null,
	portDenylist: [],
	komodoUrl: null,
	komodoApiKey: null,
	komodoApiSecret: null,
	adminPasswordHash: null,
	updatedAt: new Date(0).toISOString()
};

function load(): StoreData {
	mkdirSync(dirname(DATA_FILE_PATH), { recursive: true });
	if (!existsSync(DATA_FILE_PATH)) {
		return { resourceSettings: [], appSettings: { ...DEFAULT_APP_SETTINGS }, sessionSecret: '', setupToken: '' };
	}
	try {
		const raw = readFileSync(DATA_FILE_PATH, 'utf8');
		const parsed = JSON.parse(raw) as Partial<StoreData>;
		return {
			resourceSettings: parsed.resourceSettings ?? [],
			appSettings: { ...DEFAULT_APP_SETTINGS, ...parsed.appSettings },
			sessionSecret: parsed.sessionSecret ?? '',
			setupToken: parsed.setupToken ?? ''
		};
	} catch (err) {
		console.error(`Failed to read/parse ${DATA_FILE_PATH}, starting with defaults:`, err);
		return { resourceSettings: [], appSettings: { ...DEFAULT_APP_SETTINGS }, sessionSecret: '', setupToken: '' };
	}
}

const data = load();

/** Write-to-temp-then-rename so a crash mid-write can't corrupt the file (rename is atomic on POSIX). */
function persist() {
	const tmpPath = `${DATA_FILE_PATH}.tmp`;
	writeFileSync(tmpPath, JSON.stringify(data, null, 2));
	renameSync(tmpPath, DATA_FILE_PATH);
}

// First boot (or upgrading from before this field existed) — generate once and persist immediately
// so it's stable across restarts; regenerating it on every boot would silently log everyone out.
if (!data.sessionSecret) {
	data.sessionSecret = randomBytes(32).toString('hex');
	persist();
}

// Short and copy-paste friendly (printed to the console for the operator to type into the
// onboarding form) — 72 bits is plenty given login/onboarding attempts are rate-limited.
if (!data.setupToken) {
	data.setupToken = randomBytes(9).toString('base64url');
	persist();
}

export const store = {
	listResourceSettings(resourceType: ResourceType): ResourceSettingsRow[] {
		return data.resourceSettings.filter((r) => r.resourceType === resourceType);
	},

	getResourceSettings(resourceType: ResourceType, resourceId: string): ResourceSettingsRow | undefined {
		return data.resourceSettings.find((r) => r.resourceType === resourceType && r.resourceId === resourceId);
	},

	upsertResourceSettings(
		resourceType: ResourceType,
		resourceId: string,
		patch: Partial<Pick<ResourceSettingsRow, 'hidden' | 'linkOverride' | 'iconOverride'>>
	): void {
		const existing = data.resourceSettings.find(
			(r) => r.resourceType === resourceType && r.resourceId === resourceId
		);
		if (existing) {
			Object.assign(existing, patch, { updatedAt: new Date().toISOString() });
		} else {
			data.resourceSettings.push({
				resourceType,
				resourceId,
				hidden: false,
				linkOverride: null,
				iconOverride: null,
				...patch,
				updatedAt: new Date().toISOString()
			});
		}
		persist();
	},

	getAppSettings(): AppSettingsData {
		return data.appSettings;
	},

	updateAppSettings(patch: Partial<Omit<AppSettingsData, 'updatedAt'>>): void {
		data.appSettings = { ...data.appSettings, ...patch, updatedAt: new Date().toISOString() };
		persist();
	},

	isKomodoConfigured(): boolean {
		const s = data.appSettings;
		return Boolean(s.komodoUrl && s.komodoApiKey && s.komodoApiSecret);
	},

	getSessionSecret(): string {
		return data.sessionSecret;
	},

	getSetupToken(): string {
		return data.setupToken;
	}
};
