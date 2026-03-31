import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { createPageMetadata } from '@/lib/metadata';
import {
  School,
  EmojiEvents,
  Lightbulb,
  Favorite,
  Star,
  Groups,
  Security,
  MenuBook,
  Computer,
  Science,
  LocalLibrary,
  SportsBasketball,
  Palette,
  Attractions,
  LocalHospital,
  Restaurant,
  Visibility,
  FlashOn,
  CheckCircle,
} from '@/components/MuiIcons';

export const metadata = createPageMetadata(
  'Our School - DPRIDE International School',
  'Discover our values, ethos, and the vibrant community that makes DPRIDE International School special. Learn about our history, vision, and commitment to excellence.',
  '/our-school'
);

export default function OurSchoolPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Image
                src="/images/title-img.svg"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8"
                aria-hidden="true"
              />
              <span className="font-semibold text-lg">About Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Our School
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Our school was created with a clear purpose: to offer a learning environment where academic excellence and character development go hand in hand. Accredited by Directorate of Quality Assurance, we continue to meet expectations of parents and learners by maintaining high standards, a supportive atmosphere, and a curriculum designed to inspire curiosity, confidence, and lifelong learning.
            </p>

          </div>
        </Container>
      </section>

      {/* Our Motto & Mission */}
      <section className="py-20">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/title-img.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  aria-hidden="true"
                />
                <span className="text-blue-600 font-semibold">Our Foundation</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Groom Them Young
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Since 2008, DPRIDE International School has been dedicated to providing high-quality western education
                while nurturing strong moral values in every child. Our school was founded on a clear purpose: to offer
                a learning environment where academic excellence and character development go hand in hand.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Accredited by the Directorate of Quality Assurance, we continue to meet the expectations of parents and
                learners by maintaining high standards, a supportive atmosphere, and a curriculum designed to inspire
                curiosity, confidence, and lifelong learning.
              </p>
            </div>
            <div className="relative h-96 md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/students-lab.png"
                alt="Students in laboratory"
                fill
                className="object-cover object-[center_top]"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Our Vision & Mission */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <SectionHeader
              title="Vision & Mission"
              description="Our commitment to excellence and holistic development"
              align="center"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16  rounded-2xl flex items-center justify-center mb-6">
                <Visibility sx={{ fontSize: 32, color: '#003366' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                To be the leading international school in Abuja, recognized for academic excellence,
                character development, and producing well-rounded individuals who contribute positively
                to society and excel in a global environment.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <FlashOn sx={{ fontSize: 32, color: '#003366' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                To provide a nurturing, inclusive, and stimulating learning environment that empowers
                students to achieve their highest potential academically, socially, and morally through
                innovative teaching, modern facilities, and a values-based curriculum.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <SectionHeader
              title="Our Core Values"
              description="The principles that guide everything we do"
              align="center"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: <EmojiEvents sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Excellence',
                description: 'We strive for the highest standards in academics, behavior, and personal development.',
              },
              {
                icon: <Favorite sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Respect',
                description: 'We value diversity, treat everyone with dignity, and foster a culture of mutual respect.',
              },
              {
                icon: <Lightbulb sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Innovation',
                description: 'We embrace creativity and encourage students to think critically and solve problems.',
              },
              {
                icon: <CheckCircle sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Integrity',
                description: 'We uphold honesty, responsibility, and strong moral values in all our actions.',
              },
              {
                icon: <Star sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Aspiration',
                description: 'We inspire students to dream big and work towards achieving their goals.',
              },
              {
                icon: <Groups sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Community',
                description: 'We build strong partnerships between students, parents, staff, and the wider community.',
              },
              {
                icon: <Security sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Safety',
                description: 'We ensure a secure, nurturing environment where every child feels safe and valued.',
              },
              {
                icon: <LocalLibrary sx={{ fontSize: 32, color: '#b45309' }} />,
                title: 'Learning',
                description: 'We foster a love for lifelong learning and continuous personal growth.',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group rounded-2xl p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-amber-300"
              >
                <div className="flex justify-center mb-3 sm:mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <div className="p-2 sm:p-3 to-amber-200 rounded-xl sm:rounded-2xl group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-amber-600 transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Facilities */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <Container>
          <div className="text-center mb-16">
            <SectionHeader
              title="World-Class Facilities"
              description="Modern learning spaces designed for 21st-century education"
              align="center"
            />
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: 'Smart Classrooms',
                description: 'Interactive whiteboards, projectors, and digital learning tools in every classroom.',
                icon: <School sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Science Laboratories',
                description: 'Fully equipped labs for Physics, Chemistry, and Biology practical sessions.',
                icon: <Science sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Library & Resource Center',
                description: 'Extensive collection of books, e-resources, and quiet study spaces.',
                icon: <LocalLibrary sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Sports Facilities',
                description: 'Football field, basketball court, and indoor sports hall for various activities.',
                icon: <SportsBasketball sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Computer Lab',
                description: 'Modern computers with high-speed internet and latest educational software.',
                icon: <Computer sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Art & Music Studios',
                description: 'Creative spaces for developing artistic talents and musical abilities.',
                icon: <Palette sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Playground',
                description: 'Safe, age-appropriate play areas for physical development and recreation.',
                icon: <Attractions sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Medical Center',
                description: 'On-site health facility with qualified nurse for student wellbeing.',
                icon: <LocalHospital sx={{ fontSize: 32, color: '#b45309' }} />,
              },
              {
                title: 'Cafeteria',
                description: 'Clean, spacious dining area serving nutritious and balanced meals.',
                icon: <Restaurant sx={{ fontSize: 32, color: '#b45309' }} />,
              },
            ].map((facility, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-amber-200"
              >
                <div className="flex justify-center mb-3 sm:mb-4 transform transition-all duration-500 group-hover:scale-110">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-500">
                    {facility.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#b45309] transition-colors duration-300">
                  {facility.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {facility.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Curriculum Approach */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative h-96 md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-girls.png"
                alt="Students learning"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/title-img.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  aria-hidden="true"
                />
                <span className="text-blue-600 font-semibold">Our Approach</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Holistic Education
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our curriculum is designed to develop the whole child - intellectually, emotionally, socially,
                and physically. We follow a comprehensive British-inspired curriculum adapted to meet the needs
                of our students in Nigeria.
              </p>
              <ul className="space-y-4">
                {[
                  'Strong foundation in core subjects (English, Mathematics, Sciences)',
                  'Character and values education integrated across all subjects',
                  'Practical, hands-on learning experiences',
                  'Regular assessments and personalized feedback',
                  'Small class sizes for individual attention',
                  'Extracurricular activities and clubs',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-amber-500 flex-shrink-0 mt-1">
                      <CheckCircle sx={{ fontSize: 20, color: '#b45309' }} />
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>



      {/* CTA Section */}
      <section className="py-20 text-[#4a4a4a]">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the DPRIDE Family?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience excellence in education. Schedule a visit or start your application today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/book-visit"
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-full transition-all duration-300"
              >
                Book a School Visit
              </a>
                            <a
                href="/contact"
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-full border-black transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
