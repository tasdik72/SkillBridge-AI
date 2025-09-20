import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateType?: 'achievement' | 'completion' | 'excellence' | 'mastery';
  additionalInfo?: string;
  issuer?: string;
  signature?: string;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateType = 'achievement',
  additionalInfo,
  issuer = 'SkillBridge AI',
  signature = '_______________________'
}) => {
  const getCertificateStyle = () => {
    const styles = {
      achievement: {
        primaryColor: '#059669',    // Green-600
        secondaryColor: '#10b981',  // Green-500
        accentColor: '#047857',     // Green-700
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: '#059669',
        textColor: 'text-green-700'
      },
      completion: {
        primaryColor: '#3b82f6',    // Blue-600
        secondaryColor: '#60a5fa',  // Blue-500
        accentColor: '#2563eb',     // Blue-700
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: '#3b82f6',
        textColor: 'text-blue-700'
      },
      excellence: {
        primaryColor: '#7c3aed',    // Purple-600
        secondaryColor: '#8b5cf6',  // Purple-500
        accentColor: '#6d28d9',     // Purple-700
        bgGradient: 'from-purple-50 to-violet-50',
        borderColor: '#7c3aed',
        textColor: 'text-purple-700'
      },
      mastery: {
        primaryColor: '#dc2626',    // Red-600
        secondaryColor: '#ef4444',  // Red-500
        accentColor: '#b91c1c',     // Red-700
        bgGradient: 'from-red-50 to-rose-50',
        borderColor: '#dc2626',
        textColor: 'text-red-700'
      }
    };

    return styles[certificateType] || styles.achievement;
  };

  const style = getCertificateStyle();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div id="certificate" className="w-[900px] h-[650px] bg-white relative font-serif shadow-2xl">
      {/* Background Pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.bgGradient} opacity-30`} />

      {/* Decorative Border Frame */}
      <div className="absolute inset-0 border-[20px] border-white rounded-[30px] shadow-inner" />
      <div className="absolute inset-4 border-[8px] border-dashed rounded-[20px] opacity-20" style={{borderColor: style.primaryColor}} />

      {/* Main Border */}
      <div
        className="absolute inset-8 border-[4px] rounded-[16px]"
        style={{borderColor: style.primaryColor}}
      />

      {/* Inner Content Area */}
      <div className="relative z-10 h-full px-16 py-12 flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Issuer Badge */}
          <div className="inline-flex items-center px-6 py-2 rounded-full mb-6" style={{backgroundColor: `${style.primaryColor}15`}}>
            <div className="text-sm font-bold tracking-wider uppercase" style={{color: style.primaryColor}}>
              {issuer}
            </div>
          </div>

          {/* Certificate Title */}
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Certificate of Achievement
          </h1>

          {/* Certificate Type Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-lg mb-6" style={{backgroundColor: style.primaryColor}}>
            <span className="text-white font-semibold capitalize text-sm tracking-wide">
              {certificateType} Certificate
            </span>
          </div>

          <div className="text-gray-600 text-lg font-medium mb-8">
            This is to certify that
          </div>
        </div>

        {/* Recipient Section */}
        <div className="text-center my-12 flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <div className="text-7xl font-bold text-gray-900 mb-4 leading-tight tracking-wider">
              {studentName}
            </div>
            <div className="w-32 h-1 mx-auto mb-6" style={{backgroundColor: style.primaryColor}} />
          </div>

          <div className="text-gray-700 text-xl mb-4">
            has successfully demonstrated
          </div>

          <div className="text-4xl font-bold text-gray-900 mb-6 leading-relaxed max-w-4xl mx-auto">
            {courseName}
          </div>

          {additionalInfo && (
            <div className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {additionalInfo}
            </div>
          )}
        </div>

        {/* Achievement Badge */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <div
            className="w-40 h-40 rounded-full shadow-2xl flex items-center justify-center border-4"
            style={{
              background: `linear-gradient(135deg, ${style.primaryColor}, ${style.secondaryColor})`,
              borderColor: style.accentColor
            }}
          >
            <div className="text-white text-center">
              <div className="text-lg font-bold">{issuer.split(' ')[0]}</div>
              <div className="text-3xl font-extrabold">{issuer.split(' ')[1]}</div>
              <div className="text-sm opacity-90">Excellence</div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto grid grid-cols-3 gap-8 items-end pt-8">
          {/* Issue Date */}
          <div className="text-center">
            <div
              className="h-1 mb-3 mx-auto w-16"
              style={{backgroundColor: style.primaryColor}}
            />
            <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
              Issued On
            </div>
            <div className="text-base text-gray-800 font-semibold">
              {formatDate(completionDate)}
            </div>
          </div>

          {/* Official Seal */}
          <div className="col-span-1 text-center">
            <div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-xl border-3"
              style={{
                background: `linear-gradient(135deg, ${style.primaryColor}20, ${style.secondaryColor}20)`,
                borderColor: style.primaryColor
              }}
            >
              <div className="text-center">
                <div className="text-sm font-bold" style={{color: style.primaryColor}}>
                  Official
                </div>
                <div className="text-xl font-extrabold" style={{color: style.primaryColor}}>
                  Seal
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              Certificate ID: {Date.now()}
            </div>
          </div>

          {/* Signature */}
          <div className="text-center">
            <div
              className="h-1 mb-3 mx-auto w-20"
              style={{backgroundColor: style.primaryColor}}
            />
            <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
              Authorized Signature
            </div>
            <div className="text-base text-gray-800 font-semibold italic">
              {signature}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Platform Director
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 left-8 w-16 h-16 opacity-10">
          <div className="w-full h-full border-2 rounded-full" style={{borderColor: style.primaryColor}} />
        </div>
        <div className="absolute bottom-8 right-8 w-12 h-12 opacity-10">
          <div
            className="w-full h-full transform rotate-45"
            style={{backgroundColor: style.primaryColor}}
          />
        </div>
      </div>
    </div>
  );
};

export default Certificate;
