// pages/terms.tsx
import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Terms of Service</h1>

        {/* Example content. Replace with your actual legal text. */}
        <p className="text-gray-700 mb-4">
          Welcome to AI Maven! These Terms of Service (“Terms”) govern your use of our website, products, and services. 
          Please read these Terms carefully before using or purchasing from our platform.
        </p>
        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using our service, you agree to be bound by these Terms. If you do not agree, do not use our service.
        </p>
        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">2. Description of Service</h2>
        <p className="text-gray-700 mb-4">
          AI Maven provides AI-generated headshots. Our service allows you to upload a selfie, answer a short questionnaire, 
          and receive professional headshot images via email within an hour.
        </p>
        {/* …add all sections (payment terms, intellectual property, disclaimers, etc.)… */}

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">3. Governing Law</h2>
        <p className="text-gray-700 mb-4">
          These Terms are governed by and construed in accordance with the laws of [Your State/Country], without regard 
          to its conflict of laws principles.
        </p>

        {/* Link back to home or any other place */}
        <div className="mt-12">
          <Link href="/" className="text-muted-gold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
