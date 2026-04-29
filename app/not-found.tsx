import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist. Please check the URL or return to the home page.
        </p>
        
        <Link href="/" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition inline-block">
          Go Home
        </Link>
      </div>
    </main>
  )
}
