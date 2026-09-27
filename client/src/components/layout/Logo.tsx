import { useEffect, useState } from 'react';

const DEFAULT_FILL = '#456959';

let cachedSvg: string | null = null;
let fetchPromise: Promise<string> | null = null;

function loadLogoSvg(): Promise<string> {
	if (cachedSvg) return Promise.resolve(cachedSvg);
	fetchPromise ??= fetch('/logo.svg')
		.then((r) => r.text())
		.then((text) => {
			cachedSvg = text;
			return text;
		});
	return fetchPromise;
}

export function Logo({ color, size = 28 }: { color?: string; size?: number }) {
	const [svg, setSvg] = useState(cachedSvg);

	useEffect(() => {
		if (!svg) loadLogoSvg().then(setSvg);
	}, [svg]);

	if (!svg) return <div style={{ width: size, height: size, flexShrink: 0 }} />;

	// The source file hardcodes width="400" height="400" on the root <svg> — a wrapper div's
	// CSS size can't override those, so the logo was rendering at 400x400 and spilling over the
	// rest of the page. Strip them (and the original fill) and force the svg to fill its wrapper.
	const prepared = svg.replace(/<svg([^>]*)>/, (_match, attrs: string) => {
		const cleanedAttrs = attrs
			.replace(/\s*width="[^"]*"/, '')
			.replace(/\s*height="[^"]*"/, '')
			.replace(/\s*fill="[^"]*"/, '');
		return `<svg${cleanedAttrs} width="100%" height="100%" fill="${color || DEFAULT_FILL}">`;
	});

	return (
		<div
			style={{ width: size, height: size, flexShrink: 0, display: 'inline-flex' }}
			// Safe: sourced from our own static asset, not user input.
			dangerouslySetInnerHTML={{ __html: prepared }}
		/>
	);
}
