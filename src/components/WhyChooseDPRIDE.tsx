export default function WhyChooseDPRIDE() {
  const features = [
    {
      title: 'Academic Excellence',
      description: 'We maintain high standards of education with experienced teachers and comprehensive curriculum.'
    },
    {
      title: 'Modern Facilities',
      description: 'State-of-the-art classrooms, science labs, and sports facilities for holistic development.'
    },
    {
      title: 'Small Class Sizes',
      description: 'Personalized attention with optimal student-to-teacher ratios for better learning outcomes.'
    },
    {
      title: 'Character Development',
      description: 'Focus on building strong moral values and leadership skills in every student.'
    },
    {
      title: 'Safe Environment',
      description: 'Secure campus with 24/7 surveillance and trained staff ensuring student safety.'
    },
    {
      title: 'Sports & Activities',
      description: 'Wide range of extracurricular activities promoting physical and mental well-being.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose DPRIDE
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover what makes DPRIDE International School the perfect choice for your child's education and future success.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              {/* Background Image for each card */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 rounded-2xl"
                style={{
                  backgroundImage: `url("/images/junior-boy.jpg")`
                }}
              />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="#" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
            Learn More About Us
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
