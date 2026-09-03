import html2canvas from 'html2canvas'

// Renders a DOM node (the business card element) to a PNG and triggers download
export async function exportNodeAsPNG(node, filename = 'bkard-card.png') {
  if (!node) throw new Error('No node provided for PNG export')

  const canvas = await html2canvas(node, {
    scale: 3,
    backgroundColor: null,
    useCORS: true
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to create PNG blob'))
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      resolve(true)
    }, 'image/png')
  })
}
