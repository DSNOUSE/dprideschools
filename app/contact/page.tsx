'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Thank you for contacting us! We will get back to you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to send message. Please try again.');
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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[300px] md:min-h-[400px] main-bg text-white py-20">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-4 text-lg">We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16">
        <Container>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                {/* School Address */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">School Address</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>DPRIDE International School</strong></p>
                    <p>No. 30B Oke Agbe Close, Off Ladoke Akintola Boulevard</p>
                    <p>Garki II, Abuja</p>
                    <p>Plot 701, Tafawa Balewa Way Area 8, Garki</p>
                    <p>Abuja, Nigeria</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>Phone:</strong> 
                      <a href="tel:+2348000000000" className="text-blue-600 hover:underline ml-2">
                        +234 800 000 0000
                      </a>
                    </p>
                    <p>
                      <strong>Email:</strong> 
                      <a href="mailto:office@dprideschools.com" className="text-blue-600 hover:underline ml-2">
                        office@dprideschools.com
                      </a>
                    </p>
                    <p>
                      <strong>Director:</strong> Maryam Salihu Mohammed
                    </p>
                  </div>
                </div>

                {/* Office Hours */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Office Hours</h3>
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Monday - Friday:</strong> 8:00 AM - 4:00 PM</p>
                    <p><strong>Saturday:</strong> 9:00 AM - 1:00 PM</p>
                    <p><strong>Sunday:</strong> Closed</p>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <span className="text-sm">FB</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                      <span className="text-sm">TW</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                      <span className="text-sm">IG</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="admissions">Admissions Inquiry</option>
                    <option value="academic">Academic Information</option>
                    <option value="fees">Fee Information</option>
                    <option value="general">General Inquiry</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Find Us</h2>
            <p className="text-gray-600">Visit our campus in the heart of Abuja</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Google Maps Embed */}
            <div className="rounded-lg overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=30B+Oke-Agbe+Cl,+Garki+2,+Abuja,+Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="384"
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

      {/* FAQ Section */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">What are the admission requirements?</h3>
                <p className="text-gray-600">Admission requirements vary by class level. Generally, we require birth certificates, previous school records, immunization records, and a completed application form.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">How can I schedule a school visit?</h3>
                <p className="text-gray-600">You can schedule a visit by clicking the "Book a Visit" button on our homepage or calling us directly. We offer tours Monday through Saturday.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">What is the student-to-teacher ratio?</h3>
                <p className="text-gray-600">We maintain a low student-to-teacher ratio of approximately 15:1 to ensure personalized attention for each student.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">Do you offer transportation services?</h3>
                <p className="text-gray-600">Yes, we offer transportation services for students in select areas. Please contact us for more information about routes and fees.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
