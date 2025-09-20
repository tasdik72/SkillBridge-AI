import React from 'react';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, children }) => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="prose prose-lg max-w-none mx-auto text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
