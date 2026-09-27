import type { ServerState, StackState } from './types';

export function serverStateColor(state: ServerState): string {
	switch (state) {
		case 'Ok':
			return 'green';
		case 'NotOk':
			return 'red';
		case 'Disabled':
			return 'gray';
		default:
			return 'gray';
	}
}

export function stackStateColor(state: StackState): string {
	switch (state) {
		case 'running':
			return 'green';
		case 'deploying':
		case 'restarting':
			return 'blue';
		case 'paused':
			return 'yellow';
		case 'stopped':
		case 'down':
		case 'created':
			return 'gray';
		case 'dead':
		case 'removing':
		case 'unhealthy':
			return 'red';
		case 'unknown':
		default:
			return 'gray';
	}
}

export function statColor(percent: number): string {
	if (percent >= 90) return 'red';
	if (percent >= 70) return 'yellow';
	return 'green';
}
