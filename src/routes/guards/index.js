// Barrel export for all route guards. Re-exports the EXISTING
// ProtectedRoute (src/components/common/ProtectedRoute.jsx, untouched)
// alongside the three new guards, so routes/routeConfig.js (and any future
// route table) has one consistent import path for every guard rather than
// reaching into components/common/ for one and routes/guards/ for others.
export { default as ProtectedRoute } from '../../components/common/ProtectedRoute.jsx'
export { default as PublicOnlyRoute } from './PublicOnlyRoute.jsx'
export { default as RequireOnboarded } from './RequireOnboarded.jsx'
export { default as RequirePremium } from './RequirePremium.jsx'
