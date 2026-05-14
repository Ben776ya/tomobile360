# Curated Vehicle Images Migration

One-shot migration: replace every `vehicles_new.images` URL with assets from
the workspace `curated/{Brand}/{Model}/` folder. Run order:

1. `node scripts/curated-images/audit-mapping.mjs` — produces `output/mapping.csv` and `output/unmapped.csv`. Review unmapped.csv before going further.
2. `node scripts/curated-images/snapshot-images.mjs` — saves `output/snapshot-vehicles_new-images.json` (pre-wipe backup, restore script in this README).
3. Wipe step (run via Supabase MCP `execute_sql`, see plan Task B2).
4. Wipe step (run via Supabase MCP `execute_sql` for storage, see plan Task B3).
5. `node scripts/curated-images/upload-curated.mjs` — uploads files + repopulates `vehicles_new.images`. Writes `output/upload-log.json`.

## Restore from snapshot

```js
// node restore-from-snapshot.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const snap = JSON.parse(fs.readFileSync('output/snapshot-vehicles_new-images.json'))
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
for (const row of snap) {
  await supabase.from('vehicles_new').update({ images: row.images }).eq('id', row.id)
}
```
