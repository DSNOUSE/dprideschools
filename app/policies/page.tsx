export default function PoliciesPage() {
  const policies = [
    { title: 'Admissions Policy', href: '#' },
    { title: 'Safeguarding Policy', href: '#' },
    { title: 'Behaviour Policy', href: '#' },
    { title: 'Privacy Notice', href: '/privacy' },
    { title: 'Complaints Policy', href: '#' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">School Policies</h1>
          <ul className="space-y-3">
            {policies.map((policy: any) => (
              <li key={policy.title}>
                <a
                  href={policy.href}
                  className="block p-4 border rounded hover:bg-gray-50"
                  target={policy.href.startsWith('http') ? '_blank' : undefined}
                  rel={policy.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {policy.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
