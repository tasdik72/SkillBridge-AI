import React from 'react';
import PageContainer from '../components/ui/PageContainer';

const About: React.FC = () => {
  return (
    <PageContainer title="About SkillBridge AI">
      <p>
        Welcome to SkillBridge AI, the first AI-powered platform that combines personalized learning, micro-scholarships, peer mentorship, and wellness support to empower youth aged 15-29. Our mission is to bridge the gap between ambition and achievement, creating a world where every young person has the tools and support to build their future and shape their community.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Vision</h2>
      <p>
        We envision a future where education is not a one-size-fits-all model but a personalized journey tailored to each individual's goals and learning style. By leveraging the power of artificial intelligence, we create dynamic skill roadmaps that adapt to your progress, ensuring you are always on the most effective path to success. We believe that financial barriers should never stand in the way of learning, which is why our micro-scholarship program rewards your achievements and keeps you motivated.
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Community</h2>
      <p>
        At the heart of SkillBridge AI is a vibrant community of learners, mentors, and peers. We foster a supportive environment where you can connect with like-minded individuals, share your experiences, and grow together. Our mentorship program connects you with industry experts who provide invaluable guidance, while our wellness companion ensures you maintain a healthy balance on your journey.
      </p>
      <p className="mt-4">
        Join us in empowering the next generation of leaders, innovators, and changemakers. Your journey starts here.
      </p>
    </PageContainer>
  );
};

export default About;
