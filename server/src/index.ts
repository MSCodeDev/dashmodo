import { app } from './app.js';
import { store } from './db/store.js';

const PORT = 44000;

app.listen(PORT, () => {
	console.log(`Dashmodo server listening on :${PORT}`);
	if (!store.isKomodoConfigured()) {
		console.log(`Setup token (required to complete onboarding): ${store.getSetupToken()}`);
	}
});
