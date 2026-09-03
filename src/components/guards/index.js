// Component-level (not route-level) guards. Route guards in routes/guards/
// decide whether a whole PAGE renders; these decide whether a single UI
// element (a button, a section) is enabled — same underlying rule
// (isPremium), different enforcement point. Kept separate deliberately so
// the premium check is never duplicated inline in a component the way
// PremiumContext and lib/downloadManager.js duplicated it (review §8).
export { default as PremiumGate } from '../billing/PremiumGate.jsx'
