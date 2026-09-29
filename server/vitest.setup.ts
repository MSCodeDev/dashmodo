import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// store.ts opens ./data/dashmodo.json relative to the cwd at import time. Run every test file
// from a throwaway directory so nothing can ever read or write the real data file (which holds
// the Komodo credentials and admin password hash).
process.chdir(mkdtempSync(join(tmpdir(), 'dashmodo-test-')));
