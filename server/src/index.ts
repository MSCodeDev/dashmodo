import { app } from './app.js';

const PORT = 44000;

app.listen(PORT, () => {
	console.log(`Dashmodo server listening on :${PORT}`);
});
