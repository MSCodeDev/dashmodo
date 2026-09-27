export function BackgroundGlow({ color }: { color?: string | null }) {
	if (!color) return null;

	return (
		<div
			aria-hidden
			style={{
				position: 'fixed',
				top: '-15%',
				left: '-10%',
				width: '75vw',
				height: '55vh',
				maxWidth: 1200,
				minWidth: 500,
				background: color,
				opacity: 0.14,
				filter: 'blur(120px)',
				pointerEvents: 'none',
				zIndex: 0
			}}
		/>
	);
}
