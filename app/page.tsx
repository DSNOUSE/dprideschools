import Hero from '@/components/Hero';
import Welcome from '@/components/Welcome';
import CurrentMonthEvents from '@/components/CurrentMonthEvents';
import OurSchool from '@/components/OurSchool';
import SchoolLevels from '@/components/SchoolLevels';
import News from '@/components/News';
import WhyChooseDPRIDE from '@/components/WhyChooseDPRIDE';
import OpenMornings from '@/components/OpenMornings';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
import { sanityFetch } from '@/lib/sanity';
import { homepageQuery } from '@/lib/queries';
import { LinkButton } from '@/components/Button';
import { School, Edit, Download, Phone } from '@mui/icons-material';

export default async function HomePage() {
  const data = (await sanityFetch(homepageQuery).catch(() => null)) as any;
  const heroTitle = data?.heroTitle || 'Welcome to DPRIDE International School';
  const heroCta = data?.heroCta || { label: 'Book a Visit', href: '/apply' };
  const headteacherMessage = data?.headteacherMessage || {
    name: 'Maryam Salihu Mohammed',
    message: `DPRIDE International School, Abuja was founded on 15 September 2008, driven by a deep commitment to provide high-quality western education while nurturing strong moral values in every child. Our school was created with a clear purpose: to offer a learning environment where academic excellence and character development go hand in hand. Accredited by Directorate of Quality Assurance, we continue to meet expectations of parents and learners by maintaining high standards, a supportive atmosphere, and a curriculum designed to inspire curiosity, confidence, and lifelong learning.

At DPRIDE, we believe that every child has potential to thrive. Our motto, "Groom Them Young," reflects our dedication to giving pupils the best possible start through well-equipped facilities, committed staff, and a holistic approach that supports both academic growth and personal development. We are proud to partner with families and wider community to raise children who are not only knowledgeable but also responsible, respectful, and ready to contribute positively to society.`,
  };
  const newsItems = data?.news || [];
  const admissions = data?.admissions || {
    title: 'Ready to visit or apply?',
    description: 'Book a visit to experience DPIS, or start your application.',
    bookVisitLabel: 'Book a Visit',
    applyLabel: 'Apply Now',
  };
  const openMornings = data?.openMornings || {};
  
  return (
    <main className="min-h-screen">
      <Hero />
      <Welcome message={headteacherMessage.message} name={headteacherMessage.name} />
      <CurrentMonthEvents />
      
      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/images/title-img.svg" 
                alt="" 
                className="w-8 h-8"
                aria-hidden="true"
              />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Why Choose DPRIDE
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes our school the perfect environment for your child's growth and success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <img src="/images/academic-excellence.svg" alt="" className="w-10 h-10" aria-hidden="true" />,
                title: 'Academic Excellence',
                description: 'High standards with experienced teachers dedicated to student success',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: <img src="/images/global-services.svg" alt="" className="w-10 h-10" aria-hidden="true" />,
                title: 'Modern Facilities',
                description: 'State-of-the-art classrooms, labs, and learning spaces',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: <img src="/images/youth-development.svg" alt="" className="w-10 h-10" aria-hidden="true" />,
                title: 'Small Class Sizes',
                description: 'Personalized attention for optimal learning outcomes',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: <img src="/images/healthy-kids-day.svg" alt="" className="w-10 h-10" aria-hidden="true" />,
                title: 'Character Development',
                description: 'Building strong moral values and leadership skills',
                color: 'from-amber-500 to-amber-600'
              },
              {
                icon: <img src="/images/child-care.svg" alt="" className="w-10 h-10" aria-hidden="true" />,
                title: 'Safe Environment',
                description: 'Secure campus with comprehensive safety measures',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: <img src="/images/sport-activity.svg" alt="" className="w-10 h-10" aria-hidden="true" />,
                title: 'Sports & Activities',
                description: 'Wide range of extracurricular programs and sports',
                color: 'from-indigo-500 to-indigo-600'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-amber-50">
        <Container>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/images/title-img.svg" 
                alt="" 
                className="w-8 h-8"
                aria-hidden="true"
              />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Get Started
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to begin your journey with DPRIDE International School
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'Book a Visit', 
                href: '/book-visit',
                icon: <School sx={{ fontSize: 32, color: '#1e40af' }} />,
                description: 'Schedule a tour'
              },
              { 
                label: 'Apply Now', 
                href: '/apply',
                icon: <Edit sx={{ fontSize: 32, color: '#1e40af' }} />,
                description: 'Start application'
              },
              { 
                label: 'Download Brochure', 
                href: '#',
                icon: <Download sx={{ fontSize: 32, color: '#1e40af' }} />,
                description: 'Learn more'
              },
              { 
                label: 'Contact Us', 
                href: '/contact',
                icon: <Phone sx={{ fontSize: 32, color: '#1e40af' }} />,
                description: 'Get in touch'
              }
            ].map((action) => {
              return (
              <a key={action.label} href={action.href} className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                  <div className="mb-4 flex justify-center">
                    {action.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{action.label}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </a>
            );
            })}
          </div>
        </Container>
      </section>

      {/* News Section */}
      {newsItems.length > 0 && (
        <section className="py-20 bg-white">
          <Container>
            <SectionHeader title="Latest News" align="center" />
            <News items={newsItems} />
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url("/images/bg1.png")' }}>
        <div className="absolute inset-0 bg-purple-50/90"></div>
        <Container>
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/images/title-img.svg" 
                alt="" 
                className="w-6 h-6"
                aria-hidden="true"
              />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {admissions.title}
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              {admissions.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton 
                href="/apply" 
                size="lg"
                shape="pill"
              >
                {admissions.bookVisitLabel}
              </LinkButton>
              <LinkButton 
                href="/apply" 
                size="lg"
                shape="pill"
              >
                {admissions.applyLabel}
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-gray-600">Visit our campus in the heart of Abuja</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="rounded-lg overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=30B+Oke-Agbe+Cl,+Garki+2,+Abuja,+Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                className="w-full h-96"
                title="DPRIDE International School Location"
              />
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
