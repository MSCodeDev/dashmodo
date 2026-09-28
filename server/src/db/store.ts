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
		return { resourceSettings: [], appSettings: { ...DEFAULT_APP_SETTINGS } };
	}
	try {
		const raw = readFileSync(DATA_FILE_PATH, 'utf8');
		const parsed = JSON.parse(raw) as Partial<StoreData>;
		return {
			resourceSettings: parsed.resourceSettings ?? [],
			appSettings: { ...DEFAULT_APP_SETTINGS, ...parsed.appSettings }
		};
	} catch (err) {
		console.error(`Failed to read/parse ${DATA_FILE_PATH}, starting with defaults:`, err);
		return { resourceSettings: [], appSettings: { ...DEFAULT_APP_SETTINGS } };
	}
}

const data = load();

/** Write-to-temp-then-rename so a crash mid-write can't corrupt the file (rename is atomic on POSIX). */
function persist() {
	const tmpPath = `${DATA_FILE_PATH}.tmp`;
	writeFileSync(tmpPath, JSON.stringify(data, null, 2));
	renameSync(tmpPath, DATA_FILE_PATH);
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
	}
};
