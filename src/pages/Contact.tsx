import React from 'react';
import PageContainer from '../components/ui/PageContainer';

const Contact: React.FC = () => {
  return (
    <PageContainer title="Contact Us">
      <p className="text-center mb-8">
        Have questions, feedback, or partnership inquiries? We'd love to hear from you. Fill out the form below, and our team will get back to you as soon as possible.
      </p>
      <form className="max-w-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input type="text" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea id="message" rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
          >
            Send Message
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

export default Contact;
