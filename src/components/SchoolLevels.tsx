
import Image from 'next/image';

export default function SchoolLevels() {
  const levels = [
    { name: 'Toddler', image: '/images/toddler-girl.jpg', color: 'bg-teal-500' },
    { name: 'Discovery', image: '/images/toddler-boy.jpg', color: 'bg-pink-500' },
    { name: 'Explorer', image: '/images/primary-boy-white-shirt.jpg', color: 'bg-yellow-500' },
    { name: 'Preparatory', image: '/images/primary-girl.jpg', color: 'bg-green-500' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {levels.map((level) => (
            <div key={level.name} className="group relative overflow-hidden rounded-lg">
              <Image 
                src={level.image} 
                alt={level.name} 
                width={400}
                height={256}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className={`absolute inset-0 flex flex-col justify-end p-6 ${level.color}/50`}>
                <h3 className="text-white text-2xl font-bold">{level.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
