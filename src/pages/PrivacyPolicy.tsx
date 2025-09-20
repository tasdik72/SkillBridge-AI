import React from 'react';
import PageContainer from '../components/ui/PageContainer';

const PrivacyPolicy: React.FC = () => {
  return (
    <PageContainer title="Privacy Policy">
      <p className="text-sm text-gray-500 mb-6">Last updated: 20 September 2025</p>
      <p>
        Your privacy is important to us. It is SkillBridge AI's policy to respect your privacy regarding any information we may collect from you across our website and other sites we own and operate.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
      <p>
        We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
      <p>
        We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Sharing Your Information</h2>
      <p>
        We don’t share any personally identifying information publicly or with third-parties, except when required to by law.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. External Sites</h2>
      <p>
        Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Choices</h2>
      <p>
        You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Acceptance of this Policy</h2>
      <p>
        Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
      </p>
    </PageContainer>
  );
};

export default PrivacyPolicy;
