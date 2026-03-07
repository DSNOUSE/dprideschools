
interface NewsItem {
  title?: string;
  slug?: { current: string };
  excerpt?: string;
  publishedAt?: string;
}

interface NewsProps {
  items?: NewsItem[];
}

export default function News({ items }: NewsProps) {
  const openMornings = [
    { date: 'Thursday 9th October 2025', time: '9.30am' },
    { date: 'Wednesday 5th November 2025', time: '9.30am' },
    { date: 'Thursday 4th December 2025', time: '9.30am' },
    { date: 'Wednesday 7th January 2026', time: '9.30am' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">News</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Stay updated with our latest announcements and upcoming events
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full mb-4">
                ADMISSIONS OPEN
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                New Intake for September 2026
              </h3>
              <p className="text-xl text-cyan-300 font-semibold">Open Mornings</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {openMornings.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{item.date}</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-semibold">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 mb-8 border border-white/10">
            <p className="text-gray-200 leading-relaxed">
              <span className="font-semibold text-white">Important:</span> Parents and Carers do not need to book to attend a tour. 
              Simply turn up at main school reception for a prompt 9.30am start.
            </p>
            <p className="text-gray-200 mt-2">We look forward to meeting you soon.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Latest Newsletter →
            </a>
            <a href="#" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              Book a Visit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
