import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute.jsx'

import Exclusivity from '../pages/onboarding/Exclusivity.jsx'
import OnboardingCards from '../pages/onboarding/Cards.jsx'
import Verification from '../pages/onboarding/Verification.jsx'

import Login from '../pages/auth/Login.jsx'
import GstVerification from '../pages/auth/GstVerification.jsx'

import Dashboard from '../pages/Dashboard.jsx'
import Create from '../pages/create/Create.jsx'
import Details from '../pages/create/Details.jsx'
import Templates from '../pages/create/Templates.jsx'
import Cards from '../pages/Cards.jsx'
import CardShare from '../pages/CardShare.jsx'
import Payment from '../pages/Payment.jsx'
import Settings from '../pages/Settings.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding/exclusivity" replace />} />

      {/* Onboarding — public */}
      <Route path="/onboarding/exclusivity" element={<Exclusivity />} />
      <Route path="/onboarding/cards" element={<OnboardingCards />} />
      <Route path="/onboarding/verification" element={<Verification />} />

      {/* Auth — public */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/gst-verification" element={
        <ProtectedRoute><GstVerification /></ProtectedRoute>
      } />

      {/* Public card share page — no auth required so anyone can view/download */}
      <Route path="/cards/share/:id" element={<CardShare />} />

      {/* Protected app */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
      <Route path="/create/details" element={<ProtectedRoute><Details /></ProtectedRoute>} />
      <Route path="/create/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
