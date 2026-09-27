import { notifications } from '@mantine/notifications';

export const toast = {
	success(message: string) {
		notifications.show({ message, color: 'green', autoClose: 3000 });
	},
	error(message: string) {
		notifications.show({ message, color: 'red', autoClose: 6000 });
	}
};
