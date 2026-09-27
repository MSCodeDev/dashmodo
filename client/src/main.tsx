import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './index.css';
import { theme } from './theme.ts';
import App from './App.tsx';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1
		}
	}
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<Notifications />
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</MantineProvider>
	</StrictMode>
);
