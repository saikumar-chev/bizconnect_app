import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Terms of Service</h1>
      <div className="space-y-6 text-slate-600 leading-relaxed text-center">
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using the BizConnect platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use this platform.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">2. User Conduct</h2>
          <p>You are responsible for all content you post and for your interactions with other users. You agree not to post content that is unlawful, harmful, or otherwise objectionable. We reserve the right to remove any content and terminate accounts for violations of these terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">3. Intellectual Property</h2>
          <p>You retain ownership of the content you post. By posting content, you grant BizConnect a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection with the service.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">4. Disclaimers</h2>
          <p>The BizConnect platform is provided "as is" without any warranties. We do not guarantee the accuracy, completeness, or usefulness of any information on the platform and are not responsible for any user-generated content.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;