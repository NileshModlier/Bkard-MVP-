// Central app constants — colors, storage keys, limits

export const STORAGE_KEYS = {
  USER: 'bkard_user',
  GST_VERIFIED: 'bkard_gst_verified',
  CARDS: 'bkard_cards',
  DOWNLOAD_COUNT: 'bkard_download_count',
  IS_PREMIUM: 'bkard_is_premium',
  ONBOARDED: 'bkard_onboarded',
  SESSION: 'bkard_session'
}

export const FREE_DOWNLOAD_LIMIT = 15

export const BRAND = {
  primary: '#3A86FF',
  accent: '#FFBE0B',
  dark: '#1A1A1A',
  bg: '#F7F7F7'
}

export const CARD_TEMPLATES = [
  {
    id: 'obsidian',
    name: 'Obsidian Executive',
    description: 'Matte black with gold foil accents',
    bg: 'linear-gradient(135deg, #1A1A1A 0%, #2b2b2b 100%)',
    text: '#FFFFFF',
    accent: '#FFBE0B'
  },
  {
    id: 'azure',
    name: 'Azure Signature',
    description: 'Bold primary blue with clean typography',
    bg: 'linear-gradient(135deg, #3A86FF 0%, #084EC0 100%)',
    text: '#FFFFFF',
    accent: '#FFBE0B'
  },
  {
    id: 'ivory',
    name: 'Ivory Minimal',
    description: 'Bright, minimal, Apple-inspired whitespace',
    bg: 'linear-gradient(135deg, #FFFFFF 0%, #F1F1F1 100%)',
    text: '#1A1A1A',
    accent: '#3A86FF'
  },
  {
    id: 'graphite',
    name: 'Graphite Pro',
    description: 'Charcoal gradient with subtle accent glow',
    bg: 'linear-gradient(135deg, #2C2C2E 0%, #1A1A1A 100%)',
    text: '#FFFFFF',
    accent: '#3A86FF'
  },
  {
    id: 'sunrise',
    name: 'Sunrise Elite',
    description: 'Warm amber gradient for a bold identity',
    bg: 'linear-gradient(135deg, #FFBE0B 0%, #FF8C42 100%)',
    text: '#1A1A1A',
    accent: '#1A1A1A'
  },
  {
    id: 'emerald',
    name: 'Emerald Boardroom',
    description: 'Deep green with platinum text accents',
    bg: 'linear-gradient(135deg, #0F3D2E 0%, #1A1A1A 100%)',
    text: '#FFFFFF',
    accent: '#3A86FF'
  }
]
