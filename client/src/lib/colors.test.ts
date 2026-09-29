import { describe, expect, it } from 'vitest';
import { serverStateColor, stackStateColor, statColor } from './colors';

describe('serverStateColor', () => {
	it('maps server states to status colors', () => {
		expect(serverStateColor('Ok')).toBe('green');
		expect(serverStateColor('NotOk')).toBe('red');
		expect(serverStateColor('Disabled')).toBe('gray');
	});
});

describe('stackStateColor', () => {
	it.each([
		['running', 'green'],
		['deploying', 'blue'],
		['restarting', 'blue'],
		['paused', 'yellow'],
		['stopped', 'gray'],
		['down', 'gray'],
		['created', 'gray'],
		['dead', 'red'],
		['removing', 'red'],
		['unhealthy', 'red'],
		['unknown', 'gray']
	] as const)('%s -> %s', (state, color) => {
		expect(stackStateColor(state)).toBe(color);
	});
});

describe('statColor', () => {
	it('is green below 70%, yellow from 70%, red from 90%', () => {
		expect(statColor(0)).toBe('green');
		expect(statColor(69.9)).toBe('green');
		expect(statColor(70)).toBe('yellow');
		expect(statColor(89.9)).toBe('yellow');
		expect(statColor(90)).toBe('red');
		expect(statColor(100)).toBe('red');
	});
});
