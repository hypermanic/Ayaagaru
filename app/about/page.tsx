import Link from 'next/link'

export default function About() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-6">About Pantulugaru</h1>
        <p className="text-lg mb-4">
          Pantulugaru is a dedicated devotional platform providing professional ritual booking services
          and spiritual guidance to help you maintain your traditions with ease.
        </p>
        <p className="text-lg mb-8">
          Our mission is to help practitioners deepen their spiritual journey through authentic rituals
          led by experienced Pantulus.
        </p>
        
        <div className="flex gap-4 flex-wrap">
          <Link href="/" className="px-6 py-2 bg-primary-saffron text-white rounded hover:bg-primary-warmGold transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
