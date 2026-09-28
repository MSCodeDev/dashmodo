import { Tooltip } from '@mantine/core';
import { Info } from 'lucide-react';

// Mantine's required asterisk renders as a sibling <span> right after this node inside an
// inline-block label wrapper — a block-level flex container (e.g. Group) here would push it onto
// its own line, so this stays a plain inline-flex span instead.
export function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
	return (
		<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
			{label}
			<Tooltip label={tooltip} multiline w={280}>
				<Info size={14} style={{ opacity: 0.6, cursor: 'help' }} />
			</Tooltip>
		</span>
	);
}
