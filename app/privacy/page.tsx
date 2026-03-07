export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 prose max-w-none">
          <h1 className="text-3xl font-bold mb-8">Privacy Notice</h1>
          <p>
            DPRIDE International School is committed to protecting your privacy. This notice explains how we collect, use, and protect your information.
          </p>
          <h2>Information We Collect</h2>
          <p>We collect personal information when you inquire, apply, or subscribe to our newsletter.</p>
          <h2>How We Use It</h2>
          <p>We use your information to respond to inquiries, process applications, and send updates.</p>
          <h2>Data Protection</h2>
          <p>We implement appropriate security measures to protect your data.</p>
          <h2>Contact</h2>
          <p>
            For privacy questions, email{' '}
            <a href="mailto:office@dprideschools.com" className="text-blue-600 hover:underline">
              office@dprideschools.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
