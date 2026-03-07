interface OpenMorningsProps {
  title?: string;
  description?: string;
  dates?: { date: string; time: string }[];
  bookingRequired?: boolean;
}

export default function OpenMornings({ title, description, dates, bookingRequired }: OpenMorningsProps) {
  const defaultTitle = title || 'NEW INTAKE FOR SEPT 2026';
  const defaultDescription = description || 'Parents and Carers do not need to book to attend a tour, just simply turn up at main school reception for a prompt 9.30am start.';
  const defaultDates = dates || [
    { date: 'Thursday 9th October 2025', time: '9.30am' },
    { date: 'Wednesday 5th November 2025', time: '9.30am' },
    { date: 'Thursday 4th December 2025', time: '9.30am' },
    { date: 'Wednesday 7th January 2026', time: '9.30am' },
  ];

  return (
    <section className="bg-green-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1">
          <h2 className="text-4xl font-bold tracking-tight">LATEST NEWS</h2>
        </div>
        <div className="md:col-span-2 bg-green-600/50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-yellow-300">{defaultTitle}</h3>
          <p className="mt-4 font-semibold">OPEN MORNINGS</p>
          <ul className="mt-2 space-y-1">
            {defaultDates.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.date}</span>
                <span>{item.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">{defaultDescription}</p>
          <p className="mt-2 text-sm">We look forward to meeting you soon.</p>
          <div className="mt-6">
            <a href="/newsletter" className="px-5 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
              Latest Newsletter &gt;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
