'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import { School, Person, MenuBook } from '@mui/icons-material';

export default function BookVisitPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    preferredDate: '',
    preferredTime: '',
    visitType: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/book-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Thank you for booking a visit! We will contact you shortly to confirm your appointment.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          childName: '',
          childAge: '',
          preferredDate: '',
          preferredTime: '',
          visitType: '',
          message: ''
        });
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to book visit. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[300px] md:min-h-[400px] main-bg text-white py-20">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Book a School Visit</h1>
          <p className="mt-4 text-lg">Schedule a tour and discover the DPRIDE difference</p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Schedule Your Visit</h2>
              
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.includes('Thank you') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Child Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Child Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Name *
                      </label>
                      <input
                        type="text"
                        name="childName"
                        value={formData.childName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Age *
                      </label>
                      <input
                        type="text"
                        name="childAge"
                        value={formData.childAge}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 5 years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Visit Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Visit Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Time</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Type *
                    </label>
                    <select
                      name="visitType"
                      value={formData.visitType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Visit Type</option>
                      <option value="general">General School Tour</option>
                      <option value="classroom">Classroom Observation</option>
                      <option value="meeting">Meeting with Principal</option>
                      <option value="assessment">Assessment & Enrollment</option>
                    </select>
                  </div>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific questions or requirements for your visit..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3"
                  >
                    {loading ? 'Submitting...' : 'Book Visit'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* Additional Information */}
      <section className="py-16 bg-gray-100">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">What to Expect During Your Visit</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <School sx={{ fontSize: 40, color: '#1e40af' }} />
                </div>
                <h3 className="font-semibold mb-2">Campus Tour</h3>
                <p className="text-gray-600">Explore our modern facilities, classrooms, and learning spaces</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Person sx={{ fontSize: 40, color: '#1e40af' }} />
                </div>
                <h3 className="font-semibold mb-2">Meet Our Staff</h3>
                <p className="text-gray-600">Interact with our dedicated teachers and administrative staff</p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <MenuBook sx={{ fontSize: 40, color: '#1e40af' }} />
                </div>
                <h3 className="font-semibold mb-2">Learn About Programs</h3>
                <p className="text-gray-600">Discover our curriculum and extracurricular activities</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
