import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const resourceSettings = sqliteTable(
	'resource_settings',
	{
		resourceType: text('resource_type', { enum: ['server', 'stack'] }).notNull(),
		resourceId: text('resource_id').notNull(),
		hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
		linkOverride: text('link_override'),
		iconOverride: text('icon_override'),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [primaryKey({ columns: [t.resourceType, t.resourceId] })]
);
