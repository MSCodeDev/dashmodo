import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '../env.js';

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
	updatedAt: new Date(0).toISOString()
};

function load(): StoreData {
	mkdirSync(dirname(env.DASHMODO_DATA_FILE), { recursive: true });
	if (!existsSync(env.DASHMODO_DATA_FILE)) {
		return { resourceSettings: [], appSettings: { ...DEFAULT_APP_SETTINGS } };
	}
	try {
		const raw = readFileSync(env.DASHMODO_DATA_FILE, 'utf8');
		const parsed = JSON.parse(raw) as Partial<StoreData>;
		return {
			resourceSettings: parsed.resourceSettings ?? [],
			appSettings: { ...DEFAULT_APP_SETTINGS, ...parsed.appSettings }
		};
	} catch (err) {
		console.error(`Failed to read/parse ${env.DASHMODO_DATA_FILE}, starting with defaults:`, err);
		return { resourceSettings: [], appSettings: { ...DEFAULT_APP_SETTINGS } };
	}
}

const data = load();

/** Write-to-temp-then-rename so a crash mid-write can't corrupt the file (rename is atomic on POSIX). */
function persist() {
	const tmpPath = `${env.DASHMODO_DATA_FILE}.tmp`;
	writeFileSync(tmpPath, JSON.stringify(data, null, 2));
	renameSync(tmpPath, env.DASHMODO_DATA_FILE);
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
	}
};
