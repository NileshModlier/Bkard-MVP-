// Re-exports the existing free-tier limit so services/ and utils/ have a
// single, documented import path — this is also the value that must match
// whatever a future server-side Edge Function enforces.
import { FREE_DOWNLOAD_LIMIT as LIMIT } from '../lib/constants.js'

export const FREE_DOWNLOAD_LIMIT = LIMIT
