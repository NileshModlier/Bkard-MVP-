import { useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

// Renders a scannable QR code that deep-links to the card's public share URL.
export default function QRGenerator({ cardId, size = 160, fgColor = '#1A1A1A', showDownload = false }) {
  const canvasWrapRef = useRef(null)
  const shareUrl = `${window.location.origin}/cards/share/${cardId}`

  const handleDownload = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `bkard-qr-${cardId}.png`
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-dark/10 bg-white p-4 shadow-sm">
        <QRCodeSVG value={shareUrl} size={size} fgColor={fgColor} bgColor="#ffffff" level="H" includeMargin={false} />
      </div>
      {/* Hidden canvas variant enables a crisp PNG download of the QR itself */}
      <div ref={canvasWrapRef} className="hidden">
        <QRCodeCanvas value={shareUrl} size={size * 3} fgColor={fgColor} bgColor="#ffffff" level="H" />
      </div>
      {showDownload && (
        <button onClick={handleDownload} className="text-xs font-semibold text-primary hover:underline">
          Download QR
        </button>
      )}
    </div>
  )
}
