import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Privacy Policy</h1>
      <div className="space-y-6 text-slate-600 leading-relaxed text-center">
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, post a challenge or idea, or communicate with other users. This may include your name, email address, and any other information you choose to provide.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of the BizConnect platform. This includes connecting users, facilitating communication, and personalizing your experience.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">3. Sharing of Your Information</h2>
          <p>We do not share your personal information with third parties except as necessary to provide our services or as required by law. Your profile information, posts, and public interactions will be visible to other users of the platform.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">4. Your Choices</h2>
          <p>You may review and update your account information at any time by accessing your profile settings. You may also delete your account, but please note that some information may remain in our records after your account is deleted.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;