'use client';

import { useState } from 'react';
import Container from '@/components/Container';
import Image from 'next/image';

export default function ParentsPage() {
  const [activeTab, setActiveTab] = useState('announcements');

  // Mock data for demonstration
  const announcements = [
    {
      id: 1,
      type: 'Events',
      color: 'bg-blue-100 text-blue-800',
      title: 'World Book Day Celebrations',
      description: 'Join us for a day of literary fun as students dress up as their favorite book characters and participate in reading activities.',
      date: 'Feb 15, 2026'
    },
    {
      id: 2,
      type: 'Academic',
      color: 'bg-green-100 text-green-800',
      title: 'Parent-Teacher Conferences',
      description: 'Schedule your meeting with teachers to discuss your child\'s progress and academic performance this term.',
      date: 'Jan 20, 2026'
    },
    {
      id: 3,
      type: 'Sports',
      color: 'bg-orange-100 text-orange-800',
      title: 'Inter-House Sports Competition',
      description: 'Annual sports day featuring various athletic events and competitions between school houses.',
      date: 'Jan 25, 2026'
    }
  ];

  const feeStructure = [
    { level: 'Nursery', period: 'per term', amount: '₦180,000' },
    { level: 'Reception', period: 'per term', amount: '₦200,000' },
    { level: 'Years 1-6', period: 'per term', amount: '₦250,000' }
  ];

  const portalCards = [
    {
      icon: '📊',
      title: 'View Results',
      description: "Access your child's academic performance and grades",
      color: 'from-blue-500 to-blue-600',
      href: '/results',
    },
    {
      icon: '🔔',
      title: 'Announcements',
      description: 'Stay updated with latest school news and notices',
      color: 'from-amber-500 to-amber-600',
      href: '#announcements',
    },
    {
      icon: '🗓️',
      title: 'Calendar',
      description: 'View school events, holidays, and important dates',
      color: 'from-purple-500 to-purple-600',
      href: '/calendar',
    },
    {
      icon: '📄',
      title: 'Newsletters',
      description: 'Download monthly newsletters and school updates',
      color: 'from-green-500 to-green-600',
      href: '#newsletters',
    },
    {
      icon: '💳',
      title: 'Fee Payment',
      description: 'Pay school fees and view payment history',
      color: 'from-red-500 to-red-600',
      href: '#fees',
    },
    {
      icon: '🚌',
      title: 'Transport',
      description: 'Manage transportation services and routes',
      color: 'from-indigo-500 to-indigo-600',
      href: '#transport',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-amber py-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Parent Portal</h1>
          <p className="text-lg md:text-xl">
            Stay connected with your child's education. Access all the resources you need.
          </p>
        </div>
      </section>

      {/* Portal Cards Grid */}
      <section className="py-16">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portalCards.map((card, index) => (
              <a
                key={index}
                href={card.href}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${card.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl text-white">{card.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Access</span>
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Content Sections with Tabs */}
      <section className="py-16 bg-white">
        <Container>
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {['announcements', 'calendar', 'newsletters'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'announcements' && 'Announcements'}
                  {tab === 'calendar' && 'Calendar'}
                  {tab === 'newsletters' && 'Newsletters'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Announcements Tab */}
              {activeTab === 'announcements' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recent Announcements</h2>
                  <div className="space-y-6">
                    {announcements.map((announcement: any) => (
                      <div key={announcement.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${announcement.color}`}>
                            {announcement.type}
                          </span>
                          <span className="text-sm text-gray-500">{announcement.date}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{announcement.description}</p>
                        <button className="mt-4 text-blue-600 font-medium hover:text-blue-700 flex items-center">
                          Read More
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Tab */}
              {activeTab === 'calendar' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">School Calendar</h2>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-semibold text-gray-900">First Term Begins</h4>
                          <p className="text-sm text-gray-600">September 16, 2024</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Academic</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-semibold text-gray-900">Parent-Teacher Meeting</h4>
                          <p className="text-sm text-gray-600">October 5, 2024 - 4:00 PM</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Meeting</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Inter-House Sports</h4>
                          <p className="text-sm text-gray-600">November 15, 2024 - 9:00 AM</p>
                        </div>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Sports</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletters Tab */}
              {activeTab === 'newsletters' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">School Newsletters</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {['January 2026', 'December 2025', 'November 2025'].map((month) => (
                      <div key={month} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{month}</h4>
                          <span className="text-2xl text-gray-500">📄</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Monthly school newsletter with updates and announcements</p>
                        <button className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                          Download PDF
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Fee Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Fee Information</h3>
                <div className="space-y-3 mb-6">
                  {feeStructure.map((fee: any) => (
                    <div key={fee.level} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{fee.level}</p>
                        <p className="text-sm text-gray-500">{fee.period}</p>
                      </div>
                      <p className="font-bold text-gray-900">{fee.amount}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Fees include curriculum materials, textbooks, and extracurricular activities.
                  </p>
                </div>
                <button className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
                  <span className="mr-2">📄</span>
                  Download Fee Schedule
                </button>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="/contact" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-xl text-gray-500 mr-2">🏫</span>
                    <span className="text-gray-700">Contact School</span>
                  </a>
                  <a href="/calendar" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-xl text-gray-500 mr-2">📅</span>
                    <span className="text-gray-700">Academic Calendar</span>
                  </a>
                  <a href="/book-visit" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-xl text-gray-500 mr-2">📈</span>
                    <span className="text-gray-700">Schedule Visit</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Additional Information Sections */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-blue-600">🏫</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Academic Excellence</h3>
              <p className="text-sm text-gray-600">Comprehensive curriculum with focus on holistic development</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-green-600">📈</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">Real-time access to your child's academic performance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-amber-600">🔔</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600">Instant notifications about school events and updates</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-purple-600">💳</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy Payments</h3>
              <p className="text-sm text-gray-600">Secure and convenient online payment options</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
