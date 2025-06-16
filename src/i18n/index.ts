import { createI18n } from 'vue-i18n'
import type { LocaleMessages, SupportedLocales } from '@/types/i18n'
import eng from '@/langs/eng'
import ita from '@/langs/ita'

const messages: Record<SupportedLocales, LocaleMessages> = {
  en: eng,
  it: ita
}

// Recupera la lingua salvata o usa italiano come default
const getStoredLocale = (): SupportedLocales => {
  const stored = localStorage.getItem('locale') as SupportedLocales | null
  return stored && ['en', 'it'].includes(stored) ? stored : 'it'
}

const i18n = createI18n({
  legacy: false, 
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true 
})

export default i18n