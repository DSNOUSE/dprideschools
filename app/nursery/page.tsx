import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
import { Button } from '@/components/Button';

export default function NurseryPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-white">
        <Container className="py-12">
          <SectionHeader title="Our Nursery" description="A nurturing, play-based start to learning with caring, qualified staff." />
        </Container>
      </section>

      {/* About Our Nursery */}
      <section className="bg-gray-50">
        <Container className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to DPRIDE Nursery</h2>
              <p className="text-gray-600 mb-4">
                Our nursery program provides a warm, nurturing environment where young children can explore, learn, and grow. We focus on developing the whole child through play-based learning, social interaction, and foundational academic skills for all.
              </p>
              <p className="text-gray-600 mb-6">
                With experienced teachers and a carefully designed curriculum, we ensure that each child receives the attention and support they need to thrive during these crucial early years.
              </p>
              <Button variant="blue-pill">
                Schedule a Visit
              </Button>
            </div>
            <div className="bg-blue-100 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growing Together</h3>
              <p className="text-gray-600">Where little minds blossom and big dreams begin</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Age Groups */}
      <section className="bg-white">
        <Container className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Age Groups & Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer age-appropriate programs designed to meet the developmental needs of each child
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-yellow-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🍼</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Playgroup (2-3 years)</h3>
              <p className="text-gray-600 mb-4">
                Introduction to structured play, social skills, and basic concepts through songs, stories, and hands-on activities.
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Sensory development</li>
                <li>• Language skills</li>
                <li>• Social interaction</li>
                <li>• Motor skills development</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nursery 1 (3-4 years)</h3>
              <p className="text-gray-600 mb-4">
                Building foundational skills through structured learning, creative expression, and increased independence.
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Early literacy & numeracy</li>
                <li>• Creative arts & music</li>
                <li>• Science exploration</li>
                <li>• Emotional development</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nursery 2 (4-5 years)</h3>
              <p className="text-gray-600 mb-4">
                Preparing for primary school with advanced concepts, critical thinking, and school readiness skills.
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Reading readiness</li>
                <li>• Mathematical concepts</li>
                <li>• Problem-solving skills</li>
                <li>• Independence building</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Daily Activities */}
      <section className="bg-gray-50">
        <Container className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Daily Activities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A balanced schedule of learning, play, and rest to support your child's development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Circle Time</h4>
              <p className="text-sm text-gray-600">Morning songs, calendar, weather, and sharing time</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">🔤</div>
              <h4 className="font-semibold text-gray-900 mb-2">Learning Centers</h4>
              <p className="text-sm text-gray-600">Reading, writing, math, and science exploration</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">🎭</div>
              <h4 className="font-semibold text-gray-900 mb-2">Creative Play</h4>
              <p className="text-sm text-gray-600">Art, music, drama, and imaginative play</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">⚽</div>
              <h4 className="font-semibold text-gray-900 mb-2">Outdoor Play</h4>
              <p className="text-sm text-gray-600">Physical activities, playground time, and nature exploration</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Facilities */}
      <section className="bg-white">
        <Container className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Facilities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Safe, stimulating environments designed for young learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🏫</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Spacious Classrooms</h4>
                <p className="text-sm text-gray-600">Bright, colorful rooms with age-appropriate learning materials</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">🎨</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Art & Music Studio</h4>
                <p className="text-sm text-gray-600">Creative spaces for artistic expression and music exploration</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">📚</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Library Corner</h4>
                <p className="text-sm text-gray-600">Cozy reading area with age-appropriate books</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">🌳</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Playground</h4>
                <p className="text-sm text-gray-600">Safe outdoor equipment for physical development</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">🥗</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Nutrition Area</h4>
                <p className="text-sm text-gray-600">Clean space for meals and snacks with healthy options</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-2xl">🛌</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Rest Area</h4>
                <p className="text-sm text-gray-600">Quiet space for naps and rest time</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Enrollment CTA */}
      <section className="bg-blue-600">
        <Container className="py-16">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Nursery Family?</h2>
            <p className="text-xl mb-8 opacity-90">
              Give your child the best start in life with DPRIDE International School
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="yellow-pill" className="text-gray-800">
                Apply Now
              </Button>
              <Button variant="transparent" className="text-white border-white hover:bg-white hover:text-blue-600">
                Download Brochure
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
