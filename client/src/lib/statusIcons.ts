import type { LucideIcon } from 'lucide-react';
import {
	Ban,
	CircleAlert,
	CircleCheck,
	CircleDashed,
	CirclePause,
	CircleQuestionMark,
	CircleX,
	LoaderCircle,
	Trash
} from 'lucide-react';
import type { ServerState, StackState } from './types';

export function serverStateIcon(state: ServerState): LucideIcon {
	switch (state) {
		case 'Ok':
			return CircleCheck;
		case 'NotOk':
			return CircleX;
		case 'Disabled':
			return Ban;
		default:
			return CircleQuestionMark;
	}
}

export function stackStateIcon(state: StackState): LucideIcon {
	switch (state) {
		case 'running':
			return CircleCheck;
		case 'deploying':
		case 'restarting':
			return LoaderCircle;
		case 'paused':
			return CirclePause;
		case 'created':
			return CircleDashed;
		case 'stopped':
		case 'down':
			return Ban;
		case 'removing':
			return Trash;
		case 'dead':
		case 'unhealthy':
			return CircleAlert;
		case 'unknown':
		default:
			return CircleQuestionMark;
	}
}
