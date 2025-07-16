// pages/terms.tsx
import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Terms of Service</h1>

        <p className="text-gray-700 mb-4">
          Welcome to AI Maven Studio! These Terms of Service (“Terms”) govern your use of our website, products, and services.
          Please read these Terms carefully before using or purchasing from our platform.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using our service, you agree to be bound by these Terms. If you do not agree, do not use our service.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">2. Description of Service</h2>
        <p className="text-gray-700 mb-4">
          AI Maven Studio provides AI-generated custom headshots. Our service allows you to upload photos, complete a personalized intake form,
          and receive high-quality digital portraits delivered via email or dashboard.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">3. Delivery Timeline</h2>
        <p className="text-gray-700 mb-4">
          Most orders are delivered within 1–3 business days. Turnaround time may vary depending on image quality, volume, and technical factors.
          If delays occur, we’ll notify you by email.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">4. Refund Policy</h2>
        <p className="text-gray-700 mb-4">
          Due to the personalized and digital nature of our product, <strong>all sales are final</strong>. We do <strong>not</strong> offer refunds under any circumstances.
          By completing your purchase, you acknowledge and accept this policy.
        </p>
        <p className="text-gray-700 mb-4">
          However, if you’re not satisfied with the results, we offer <strong>one complimentary re-render</strong> within 7 days of delivery.
          This allows you to refine your intake answers and upload new photos if desired.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">5. Disputes & Chargebacks</h2>
        <p className="text-gray-700 mb-4">
          By purchasing, you agree not to file a chargeback or payment dispute without first contacting us.
          If a dispute is opened, we reserve the right to provide Stripe with intake forms, delivery proof, and all communications to validate the order.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">6. License of Use</h2>
        <p className="text-gray-700 mb-4">
          Final images are licensed to you for personal and professional use (e.g., LinkedIn, websites, resumes).
          You may not resell, redistribute, or claim the technology or results as your own.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">7. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          We are not responsible for aesthetic preferences, likeness variations, or misuse of generated images.
          The service is intended to provide digital enhancements, not replace traditional photography.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">8. Governing Law</h2>
        <p className="text-gray-700 mb-4">
          These Terms are governed by and construed in accordance with the laws of the State of Georgia, United States,
          without regard to conflict of law principles.
        </p>

        <h2 className="text-2xl font-semibold text-charcoal mt-8 mb-2">9. Contact</h2>
        <p className="text-gray-700 mb-4">
          For any questions or concerns, please email us at{" "}
          <a href="mailto:support@aimavenstudio.com" className="text-muted-gold underline">
            support@aimavenstudio.com
          </a>.
        </p>

        <div className="mt-12">
          <Link href="/" className="text-muted-gold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
