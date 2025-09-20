import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
}

const Certificate: React.FC<CertificateProps> = ({ studentName, courseName, completionDate }) => {
  return (
    <div id="certificate" className="w-[800px] h-[600px] p-8 bg-white border-4 border-green-600 relative font-serif">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-green-800">Certificate of Completion</h1>
        <p className="text-lg mt-2">This certificate is proudly presented to</p>
      </div>
      <div className="text-center my-12">
        <h2 className="text-6xl font-extrabold text-gray-800 tracking-wider">{studentName}</h2>
      </div>
      <div className="text-center">
        <p className="text-lg">For successfully completing the course</p>
        <h3 className="text-3xl font-semibold text-gray-700 mt-2">{courseName}</h3>
      </div>
      <div className="absolute bottom-8 left-8 text-left">
        <p className="text-sm">Completion Date: {completionDate}</p>
      </div>
      <div className="absolute bottom-8 right-8 text-right">
                <img src="/logo.svg" alt="Logo" className="w-24 h-auto" />
        <p className="text-sm mt-2">SkillBridge AI</p>
      </div>
    </div>
  );
};

export default Certificate;
