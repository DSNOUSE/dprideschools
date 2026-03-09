'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import Container from '@/components/Container';
import { Edit, School, Description, Group, Mail, CheckCircle, Download, MenuBook, AttachMoney, CalendarMonth, Checklist } from '@mui/icons-material';

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    // Student Information
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    sex: '',
    nationality: '',
    religion: '',
    
    // Parent/Guardian Information
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentOccupation: '',
    parentAddress: '',
    
    // Academic Information
    previousSchool: '',
    previousClass: '',
    applyingForClass: '',
    admissionDate: '',
    
    // Medical Information
    medicalConditions: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Information
    reasonForChoosing: '',
    specialNeeds: '',
    howDidYouHear: '',
    
    // Documents
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const classes = [
    'Pre-Nursery (Discovery Class)',
    'Nursery 1',
    'Nursery 2',
    'Kindergarten 1',
    'Kindergarten 2',
    'Primary 1',
    'Primary 2',
    'Primary 3',
    'Primary 4',
    'Primary 5',
    'Junior Secondary 1',
    'Junior Secondary 2',
    'Junior Secondary 3'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Application submitted successfully! We will contact you within 3-5 working days.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          birthDate: '',
          sex: '',
          nationality: '',
          religion: '',
          parentFirstName: '',
          parentLastName: '',
          parentEmail: '',
          parentPhone: '',
          parentOccupation: '',
          parentAddress: '',
          previousSchool: '',
          previousClass: '',
          applyingForClass: '',
          admissionDate: '',
          medicalConditions: '',
          allergies: '',
          emergencyContact: '',
          emergencyPhone: '',
          reasonForChoosing: '',
          specialNeeds: '',
          howDidYouHear: '',
          agreeToTerms: false
        });
        setCurrentStep(1);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Student Information validation
        return !!(formData.firstName && formData.lastName && formData.birthDate && 
                 formData.sex && formData.nationality && formData.religion);
      
      case 2:
        // Parent/Guardian Information validation
        return !!(formData.parentFirstName && formData.parentLastName && 
                 formData.parentEmail && formData.parentPhone && 
                 formData.parentOccupation && formData.parentAddress);
      
      case 3:
        // Academic Information validation
        return !!(formData.applyingForClass && formData.admissionDate);
      
      case 4:
        // Additional Information validation
        return !!(formData.emergencyContact && formData.emergencyPhone && 
                 formData.agreeToTerms);
      
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      } else {
        setMessage('Please fill in all required fields before proceeding.');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[300px] md:min-h-[400px] py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/students-lab.png')" }}
        />
        <div className="absolute inset-0 bg-[#7763E5]/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">Student Application</h1>
          <p className="mt-4 text-lg text-white">Join the DPRIDE family - Apply for admission today</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/images/title-img.svg" 
                  alt="DPRIDE International School" 
                  className="w-8 h-8 mr-3"
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-0">How It Works</h2>
              </div>
              <p className="text-lg text-gray-600">Our straightforward admission process ensures a smooth start for your family.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  icon: <Edit sx={{ fontSize: 24, color: '#1e40af' }} />,
                  title: 'Submit Enquiry',
                  description: 'Complete our online enquiry form or contact us directly.',
                },
                {
                  step: 2,
                  icon: <School sx={{ fontSize: 24, color: '#1e40af' }} />,
                  title: 'School Visit',
                  description: 'Schedule a tour to see our facilities and meet our team.',
                },
                {
                  step: 3,
                  icon: <Description sx={{ fontSize: 24, color: '#1e40af' }} />,
                  title: 'Application',
                  description: 'Submit application form with required documents.',
                },
                {
                  step: 4,
                  icon: <Group sx={{ fontSize: 24, color: '#1e40af' }} />,
                  title: 'Assessment',
                  description: 'Your child will have a friendly introductory session.',
                },
                {
                  step: 5,
                  icon: <Mail sx={{ fontSize: 24, color: '#1e40af' }} />,
                  title: 'Offer',
                  description: 'Successful applicants receive an offer letter.',
                },
                {
                  step: 6,
                  icon: <CheckCircle sx={{ fontSize: 24, color: '#1e40af' }} />,
                  title: 'Enrollment',
                  description: 'Accept offer and complete enrollment procedures.',
                }
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        {item.icon}
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* The Form Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/images/title-img.svg" 
                  alt="DPRIDE International School" 
                  className="w-8 h-8 mr-3"
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-0">The Form</h2>
              </div>
              <p className="text-lg text-gray-600">Complete the application form below to start your child's journey at DPRIDE.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Step Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step <= currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm text-gray-600">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Student Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Student Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          Middle Name
                        </label>
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sex *
                        </label>
                        <select
                          name="sex"
                          value={formData.sex}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Sex</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nationality *
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Nigerian"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Religion *
                      </label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Islam, Christianity"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Parent/Guardian Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Parent/Guardian Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent/Guardian First Name *
                        </label>
                        <input
                          type="text"
                          name="parentFirstName"
                          value={formData.parentFirstName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parent/Guardian Last Name *
                        </label>
                        <input
                          type="text"
                          name="parentLastName"
                          value={formData.parentLastName}
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
                          name="parentEmail"
                          value={formData.parentEmail}
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
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation *
                      </label>
                      <input
                        type="text"
                        name="parentOccupation"
                        value={formData.parentOccupation}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="parentAddress"
                        value={formData.parentAddress}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full residential address"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Academic Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Academic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Previous School (if any)
                        </label>
                        <input
                          type="text"
                          name="previousSchool"
                          value={formData.previousSchool}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Previous Class (if any)
                        </label>
                        <input
                          type="text"
                          name="previousClass"
                          value={formData.previousClass}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Applying For Class *
                        </label>
                        <select
                          name="applyingForClass"
                          value={formData.applyingForClass}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Class</option>
                          {classes.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Admission Date *
                        </label>
                        <input
                          type="date"
                          name="admissionDate"
                          value={formData.admissionDate}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Additional Information */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Additional Information</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Conditions (if any)
                      </label>
                      <textarea
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Please describe any medical conditions we should be aware of"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies (if any)
                      </label>
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Please describe any allergies"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Name *
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Phone *
                        </label>
                        <input
                          type="tel"
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why did you choose DPRIDE International School?
                      </label>
                      <textarea
                        name="reasonForChoosing"
                        value={formData.reasonForChoosing}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How did you hear about us?
                      </label>
                      <select
                        name="howDidYouHear"
                        value={formData.howDidYouHear}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select an option</option>
                        <option value="website">School Website</option>
                        <option value="social">Social Media</option>
                        <option value="friend">Friend/Family Referral</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="search">Search Engine</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Needs (if any)
                      </label>
                      <textarea
                        name="specialNeeds"
                        value={formData.specialNeeds}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Please describe any special educational needs"
                      />
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          required
                          className="mt-1 mr-3"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the terms and conditions and certify that all information provided is accurate and complete. I understand that false information may result in the rejection of this application.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={currentStep === 1 ? 'invisible' : ''}
                  >
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="px-8"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading || !formData.agreeToTerms}
                      className="px-8"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Dates and Downloadable Resources Section */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Key Dates */}
              <div>
                <div className="flex items-center mb-6">
                  <CalendarMonth sx={{ fontSize: 32, color: '#1e40af', marginRight: 2 }} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-0">Key Dates</h2>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Application Period</h4>
                        <p className="text-gray-600">January - May 2026</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Assessment Period</h4>
                        <p className="text-gray-600">June - July 2026</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Offer Letters</h4>
                        <p className="text-gray-600">August 2026</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">School Year Begins</h4>
                        <p className="text-gray-600">September 8, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downloadable Resources */}
              <div>
                <div className="flex items-center mb-6">
                  <Download sx={{ fontSize: 32, color: '#1e40af', marginRight: 2 }} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-0">Downloadable Resources</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                          <Description sx={{ fontSize: 20, color: '#b45309' }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Application Form</h4>
                          <p className="text-sm text-gray-600">PDF • 2.3 MB</p>
                        </div>
                      </div>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <Download sx={{ fontSize: 16, color: '#fff', marginRight: 1 }} />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <MenuBook sx={{ fontSize: 20, color: '#15803d' }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">School Prospectus</h4>
                          <p className="text-sm text-gray-600">PDF • 5.7 MB</p>
                        </div>
                      </div>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <Download sx={{ fontSize: 16, color: '#fff', marginRight: 1 }} />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <AttachMoney sx={{ fontSize: 20, color: '#a855f7' }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Fee Structure</h4>
                          <p className="text-sm text-gray-600">PDF • 1.2 MB</p>
                        </div>
                      </div>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <Download sx={{ fontSize: 16, color: '#fff', marginRight: 1 }} />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                          <Checklist sx={{ fontSize: 20, color: '#dc2626' }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Admission Checklist</h4>
                          <p className="text-sm text-gray-600">PDF • 890 KB</p>
                        </div>
                      </div>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <Download sx={{ fontSize: 16, color: '#fff', marginRight: 1 }} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
