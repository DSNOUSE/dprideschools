import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';

export default function TeachingPage() {
  const classes = [
    { name: 'Nursery', age: '2-3 years', description: 'Early years foundation stage with play-based learning' },
    { name: 'Reception', age: '4-5 years', description: 'Foundation stage preparing for primary education' },
    { name: 'Key Stage 1', age: '5-7 years', description: 'Years 1-2: Building core literacy and numeracy skills' },
    { name: 'Key Stage 2', age: '7-11 years', description: 'Years 3-6: Developing deeper knowledge and critical thinking' },
  ];

  const curriculumValues = [
    { title: 'Respect', description: 'Fostering mutual respect and understanding' },
    { title: 'Excellence', description: 'Striving for academic and personal excellence' },
    { title: 'Collaboration', description: 'Working together to achieve common goals' },
    { title: 'Independence', description: 'Building confidence and self-reliance' },
    { title: 'Perseverance', description: 'Developing resilience and determination' },
    { title: 'Enjoyment', description: 'Creating a love for lifelong learning' },
  ];

  const extraActivities = [
    { name: 'Breakfast Club', time: '7:30 AM - 8:30 AM', description: 'Healthy breakfast and activities before school', price: '₦3,500 per session' },
    { name: 'After School Club', time: '3:00 PM - 6:00 PM', description: 'Supervised activities and homework support', price: '₦5,000 per session' },
    { name: 'Sports Programs', time: 'Various times', description: 'Football, basketball, athletics and more', price: 'Included in tuition' },
    { name: 'Music & Arts', time: 'After school', description: 'Piano, violin, drama and visual arts', price: 'Additional cost applies' },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="">
        <Container className="py-12">
          <SectionHeader 
            title="Teaching & Learning" 
            description="High expectations, engaging lessons, and support for every learner at DPRIDE International School." 
            align="center"
          />
        </Container>
      </section>

      {/* Our Classes Section */}
      <section className="py-16">
        <Container>
          <SectionHeader 
            title="Our Classes" 
            description="Structured learning pathways tailored to each developmental stage"
            align="center"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {classes.map((classItem, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{classItem.name}</h3>
                <p className="text-sm text-blue-600 font-semibold mb-3">{classItem.age}</p>
                <p className="text-gray-600 text-sm">{classItem.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Curriculum Section */}
      <section className="py-16 bg-white/50">
        <Container>
          <SectionHeader 
            title="Our Curriculum" 
            description="Ambitious, balanced, and designed to develop curious minds"
            align="center"
          />
          
          {/* Intent Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Intent</h3>
            <div className="bg-blue-50 rounded-2xl p-8 mb-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                The DPRIDE International curriculum is ambitious, providing all our pupils with a wide and balanced curriculum. 
                Our curious pupils explore topics in depth by answering essential questions that drive learning forward.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                The learning end goals are matched to international standards and the Nigerian curriculum, ensuring we have 
                comprehensive coverage and scope. To enhance this provision, our values are threaded through daily learning.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These values support personal development and encourage positive attitudes and learning behaviors for 
                school and life beyond DPRIDE.
              </p>
            </div>

            {/* Core Values Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {curriculumValues.map((value, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Implementation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50 rounded-2xl p-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quality Teaching</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We want all our pupils to be active and engaged in our exciting curriculum. This is intensified when 
                  staff have strong subject knowledge and regular training supports teachers to deliver high-quality lessons.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Weekly meetings are used to evaluate previous learning, identify next steps and plan appropriately. 
                  We recognise that pupils learn at different rates and sometimes revisit learning to ensure concepts are understood.
                </p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Memorable Learning</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We want to be creative and make learning memorable. We look for personal development opportunities to 
                  bring learning to life through trips, visits, and outdoor learning spaces.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Specialist teachers and inspirational assemblies enhance the learning experience. Subject displays and 
                  events celebrate and share examples of learning from across the school.
                </p>
              </div>
            </div>
          </div>

          {/* Impact Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Impact</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Student Outcomes</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Children are engaged in their learning and enjoy coming to school
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      High attendance levels reflect student engagement
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Children can recall key facts from their learning
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Well prepared for transitions between year groups
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Quality Assurance</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Curriculum meets international and Nigerian standards
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Children taught by well-trained, quality teachers
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Students with special needs fully included in lessons
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Strong progress from individual starting points
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Extra-Curricular Activities Section */}
      <section className="py-16.">
        <Container>
          <SectionHeader 
            title="Extra-Curricular Activities" 
            description="Enriching opportunities beyond the classroom"
            align="center"
          />
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {extraActivities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{activity.name}</h3>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {activity.price}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{activity.time}</p>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Homework & Parent Engagement Section */}
      <section className="py-16 bg-white">
        <Container>
          <SectionHeader 
            title="Homework & Parent Engagement" 
            description="Building strong partnerships between home and school"
            align="center"
          />
          <div className="max-w-4xl mx-auto">
            <div className="bg-orange-50 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reading Partnership</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We recognise the importance of engaging with parents to ensure their children read regularly at home. 
                Reading is the foundation of all learning, and we provide guidance and support for parents to help 
                their children develop strong literacy skills.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Digital Learning Platforms</h4>
                <p className="text-gray-700 text-sm mb-3">
                  We use engaging online platforms to help pupils practice basic skills for English and Mathematics:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Accelerated Reader for reading comprehension</li>
                  <li>• Times Tables Rock Stars for mathematics</li>
                  <li>• Interactive learning apps for various subjects</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Regular Practice</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Weekly homework includes:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Spellings from statutory word lists (Friday-Friday)</li>
                  <li>• Mathematics exercises to reinforce classroom learning</li>
                  <li>• Reading comprehension and vocabulary development</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
