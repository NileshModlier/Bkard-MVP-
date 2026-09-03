// vCard (.vcf) generation + download for a business card record

export function buildVCard(card) {
  const {
    fullName = '',
    jobTitle = '',
    company = '',
    email = '',
    phone = '',
    website = '',
    address = ''
  } = card || {}

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${fullName};;;;`,
    `FN:${fullName}`,
    jobTitle ? `TITLE:${jobTitle}` : '',
    company ? `ORG:${company}` : '',
    email ? `EMAIL;TYPE=INTERNET:${email}` : '',
    phone ? `TEL;TYPE=CELL:${phone}` : '',
    website ? `URL:${website}` : '',
    address ? `ADR;TYPE=WORK:;;${address};;;;` : '',
    'END:VCARD'
  ].filter(Boolean)

  return lines.join('\n')
}

export function downloadVCard(card) {
  const vcf = buildVCard(card)
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${(card.fullName || 'contact').replace(/\s+/g, '_')}.vcf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
