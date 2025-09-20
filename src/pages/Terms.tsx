import React from 'react';
import PageContainer from '../components/ui/PageContainer';

const Terms: React.FC = () => {
  return (
    <PageContainer title="Terms and Conditions">
      <p className="text-sm text-gray-500 mb-6">Last updated: 20 September 2025</p>
      <p>
        Welcome to SkillBridge AI. These Terms and Conditions govern your use of our website and services. By accessing or using our service, you agree to be bound by these terms.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Use of Service</h2>
      <p>
        You agree to use our services for lawful purposes only. You must not use our service in any way that is unlawful, fraudulent, or harmful, or in connection with any unlawful, fraudulent, or harmful purpose or activity.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Accounts</h2>
      <p>
        When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Intellectual Property</h2>
      <p>
        The service and its original content, features, and functionality are and will remain the exclusive property of SkillBridge AI and its licensors. The service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Termination</h2>
      <p>
        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
      <p>
        In no event shall SkillBridge AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Changes to Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us through the information provided on our contact page.
      </p>
    </PageContainer>
  );
};

export default Terms;
