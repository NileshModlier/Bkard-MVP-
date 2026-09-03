import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Renders a DOM node (the business card element) to a single-page PDF
export async function exportNodeAsPDF(node, filename = 'bkard-card.pdf') {
  if (!node) throw new Error('No node provided for PDF export')

  const canvas = await html2canvas(node, {
    scale: 3,
    backgroundColor: '#ffffff',
    useCORS: true
  })

  const imgData = canvas.toDataURL('image/png')
  const widthMM = 90
  const heightMM = (canvas.height / canvas.width) * widthMM

  const pdf = new jsPDF({
    orientation: widthMM > heightMM ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMM + 20, heightMM + 20]
  })

  pdf.setFillColor(247, 247, 247)
  pdf.rect(0, 0, widthMM + 20, heightMM + 20, 'F')
  pdf.addImage(imgData, 'PNG', 10, 10, widthMM, heightMM)
  pdf.save(filename)
  return true
}
