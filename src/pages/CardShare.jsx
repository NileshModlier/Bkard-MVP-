import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import BusinessCard from '../components/cards/BusinessCard.jsx'
import QRGenerator from '../components/cards/QRGenerator.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { useCards } from '../hooks/useCards.js'
import { usePremium } from '../hooks/usePremium.js'
import { useToast } from '../hooks/useToast.js'
import { downloadVCard } from '../lib/vcard.js'
import { exportNodeAsPNG } from '../lib/exportImage.js'
import { exportNodeAsPDF } from '../lib/exportPdf.js'

export default function CardShare() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCardById, incrementView, updateCard } = useCards()
  const { canDownload, registerDownload, remaining, isPremium } = usePremium()
  const toast = useToast()

  const cardRef = useRef(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [busy, setBusy] = useState('')
  const [connected, setConnected] = useState(false)

  const card = getCardById(id)
  const viewedRef = useRef(false)

  useEffect(() => {
    if (card && !viewedRef.current) {
      incrementView(card.id)
      viewedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id])

  if (!card) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <p className="text-lg font-bold text-dark">Card not found</p>
        <p className="text-sm text-dark/50">This card may have been removed or the link is incorrect.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    )
  }

  const guardDownload = (action) => {
    if (!canDownload) {
      setPaywallOpen(true)
      return
    }
    registerDownload()
    action()
  }

  const handlePNG = () => guardDownload(async () => {
    setBusy('png')
    try {
      await exportNodeAsPNG(cardRef.current, `${card.fullName || 'bkard'}-card.png`)
      toast.success('PNG downloaded')
    } catch {
      toast.error('PNG export failed')
    } finally {
      setBusy('')
    }
  })

  const handlePDF = () => guardDownload(async () => {
    setBusy('pdf')
    try {
      await exportNodeAsPDF(cardRef.current, `${card.fullName || 'bkard'}-card.pdf`)
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF export failed')
    } finally {
      setBusy('')
    }
  })

  const handleVCard = () => guardDownload(() => {
    downloadVCard(card)
    toast.success('Contact saved as vCard')
  })

  const handleConnect = () => {
    setConnected(true)
    updateCard(card.id, { connections: (card.connections || 0) + 1 })
    toast.success('Connection request sent')
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg animate-fade-in">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-dark/50 hover:text-dark">
          ← Back to Bkard
        </Link>

        <BusinessCard ref={cardRef} card={card} className="mx-auto" />

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-dark/5 bg-white p-4 shadow-card">
          <div>
            <p className="text-sm font-bold text-dark">{card.fullName}</p>
            <p className="text-xs text-dark/50">{card.jobTitle} {card.company && `· ${card.company}`}</p>
          </div>
          <Button size="sm" onClick={handleConnect} disabled={connected}>
            {connected ? 'Requested ✓' : 'Connect'}
          </Button>
        </div>

        {card.bio && <p className="mt-4 text-sm leading-relaxed text-dark/65">{card.bio}</p>}

        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dark/5 bg-white p-6 shadow-card">
          <QRGenerator cardId={card.id} showDownload />
          <p className="text-center text-xs text-dark/45">Scan to save this card instantly</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button variant="outline" loading={busy === 'png'} onClick={handlePNG}>PNG</Button>
          <Button variant="outline" loading={busy === 'pdf'} onClick={handlePDF}>PDF</Button>
          <Button variant="outline" onClick={handleVCard}>vCard</Button>
        </div>

        {!isPremium && (
          <p className="mt-3 text-center text-xs text-dark/40">{remaining} of 15 free downloads remaining</p>
        )}
      </div>

      <Modal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="Unlock unlimited downloads"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPaywallOpen(false)}>Not now</Button>
            <Button onClick={() => navigate('/payment')}>Upgrade to Premium</Button>
          </>
        }
      >
        <p className="text-sm text-dark/60">
          You've used all 15 free downloads. Upgrade to Bkard Premium for
          unlimited PNG, PDF and vCard exports — plus priority discovery
          placement.
        </p>
      </Modal>
    </div>
  )
}
