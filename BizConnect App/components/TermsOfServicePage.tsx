import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="mt-4 text-lg text-slate-600">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <h2>1. Introduction</h2>
        <p>
          Welcome to BizConnect ("Platform", "Service"). These Terms of Service ("Terms") govern your use of our platform. By accessing or using the Service, you agree to be bound by these Terms.
        </p>

        <h2>2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
        </p>

        <h2>3. Content</h2>
        <p>
          Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness. By posting Content, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.
        </p>

        <h2>4. Prohibited Activities</h2>
        <p>
          You agree not to use the Service for any purpose that is illegal or prohibited by these Terms. You may not use the Service in any manner that could damage, disable, overburden, or impair the Service.
        </p>

        <h2>5. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
        </p>
        
        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall BizConnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please use the contact form on our Contact page.
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;