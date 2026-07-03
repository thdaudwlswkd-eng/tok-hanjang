import { redirect } from 'next/navigation'
import LandingPage from './LandingPage'

export default function HomePage() {
  const cardId = process.env.HOME_CARD_ID ?? process.env.HOME_D_ID
  if (cardId) redirect(`/card/${cardId}`)
  return <LandingPage />
}
