import type { Icon } from '@tabler/icons-react';
import {
	IconAlertCircle,
	IconBan,
	IconCircleCheck,
	IconCircleDashed,
	IconCircleX,
	IconHelpCircle,
	IconLoader2,
	IconPlayerPause,
	IconTrash
} from '@tabler/icons-react';
import type { ServerState, StackState } from './types';

export function serverStateIcon(state: ServerState): Icon {
	switch (state) {
		case 'Ok':
			return IconCircleCheck;
		case 'NotOk':
			return IconCircleX;
		case 'Disabled':
			return IconBan;
		default:
			return IconHelpCircle;
	}
}

export function stackStateIcon(state: StackState): Icon {
	switch (state) {
		case 'running':
			return IconCircleCheck;
		case 'deploying':
		case 'restarting':
			return IconLoader2;
		case 'paused':
			return IconPlayerPause;
		case 'created':
			return IconCircleDashed;
		case 'stopped':
		case 'down':
			return IconBan;
		case 'removing':
			return IconTrash;
		case 'dead':
		case 'unhealthy':
			return IconAlertCircle;
		case 'unknown':
		default:
			return IconHelpCircle;
	}
}
