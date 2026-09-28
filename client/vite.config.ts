import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		// Non-standard, well above the common 3000/8080/8000 range dev tooling tends to squat on,
		// so it doesn't collide with other services on the LAN.
		port: 54173,
		strictPort: true,
		proxy: {
			'/api': {
				target: 'http://localhost:44000',
				changeOrigin: true
			}
		}
	}
});
