// pages/privacy-policy.tsx
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Privacy Policy</h1>

        {/* Example content. Replace with your actual privacy policy. */}
        <p className="text-gray-700 mb-4">
          At AI Maven (“we,” “our,” or “us”), we respect your privacy and are committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
          or use our services.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We may collect personal information that you provide directly to us, such as your name, email address, and payment 
          information when you register for an account or make a purchase.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          We use your information to:  
          (a) Provide and maintain our services,  
          (b) Process payments,  
          (c) Send you updates and promotional materials (with your consent),  
          (d) Comply with legal obligations.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">3. Data Sharing and Disclosure</h2>
        <p className="text-gray-700 mb-4">
          We do not sell your personal data. We may share information with third-party service providers (e.g., payment processors, 
          email platforms) to deliver our services. We require these vendors to keep your data confidential.
        </p>

        {/* …add additional sections (cookies, user rights, data retention, etc.)… */}

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">4. Your Rights</h2>
        <p className="text-gray-700 mb-4">
          Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise 
          these rights, please contact us at <a href="mailto:support@aimavenstudio.com" className="underline text-muted-gold">support@aimavenstudio.com</a>.
        </p>

        <div className="mt-12">
          <Link href="/" className="text-muted-gold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
