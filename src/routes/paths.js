// Single source of truth for every URL string in the app. Required as a
// dependency for the new route guards below — fixes the inconsistent-
// route-naming finding in the review (§5) by making it structurally
// awkward to hardcode a route string anywhere else.
//
// NOTE: existing src/router/AppRouter.jsx still uses inline string literals
// and is left untouched per instructions ("do not regenerate existing
// files") — wiring AppRouter.jsx to import from here is a follow-up edit
// to an existing file, not a new-file gap, so it isn't done in this pass.

export const PATHS = {
  HOME: '/',
  ONBOARDING: {
    EXCLUSIVITY: '/onboarding/exclusivity',
    CARDS: '/onboarding/cards',
    VERIFICATION: '/onboarding/verification'
  },
  AUTH: {
    LOGIN: '/auth/login',
    GST_VERIFICATION: '/auth/gst-verification'
  },
  DASHBOARD: '/dashboard',
  CREATE: {
    ROOT: '/create',
    DETAILS: '/create/details',
    TEMPLATES: '/create/templates'
  },
  CARDS: {
    LIST: '/cards',
    SHARE: (id) => `/cards/share/${id}`,
    EDIT: (id) => `/cards/${id}/edit`
  },
  PAYMENT: '/payment',
  SETTINGS: '/settings'
}
