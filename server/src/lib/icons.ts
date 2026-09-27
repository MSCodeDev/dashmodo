/**
 * Auto-derives a selfh.st/icons reference from a stack name, following their own
 * convention: lowercase, non-alphanumeric runs collapsed to a single hyphen.
 * https://selfh.st/icons-about/
 */
export function slugifyIconRef(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
