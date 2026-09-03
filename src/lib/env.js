// Validates required env vars at app boot. Missing Supabase config is a
// legitimate, supported state in development (the app is designed to run
// standalone on localStorage) — but it must NEVER be the silent, accidental
// state of a production deployment, since the localStorage auth fallback
// in AuthContext accepts any password for any email. See architecture
// review §10 (Critical) for the finding this fixes.

const REQUIRED_IN_PROD = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

export function assertEnv() {
  const missing = REQUIRED_IN_PROD.filter((key) => !import.meta.env[key])

  if (missing.length === 0) return { ok: true, missing: [] }

  if (import.meta.env.PROD) {
    // Hard fail in production — do not let the app silently degrade into
    // the no-password localStorage auth fallback for real users.
    throw new Error(
      `Bkard is misconfigured: missing required environment variable(s) ${missing.join(
        ', '
      )}. Supabase-backed auth cannot run without these in production.`
    )
  }

  // Development: allowed, but loud about it.
  console.warn(
    `[Bkard] Running WITHOUT Supabase configured (missing ${missing.join(
      ', '
    )}). Using localStorage-only demo mode. This is expected in local dev, ` +
      'but must never happen in a production build.'
  )
  return { ok: false, missing }
}
