import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mt-4 text-lg text-slate-600">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <h2>1. Introduction</h2>
        <p>
          BizConnect ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <ul>
            <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site.
            </li>
            <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
        </p>
         <ul>
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>Notify you of updates to the Site.</li>
        </ul>

        <h2>4. Disclosure of Your Information</h2>
        <p>
         We may share information we have collected about you in certain situations. Your information may be disclosed as follows: by law or to protect rights, business transfers, or with your consent. We do not sell your personal information to third parties.
        </p>
        
        <h2>5. Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h2>6. Your Data Rights</h2>
        <p>
          You have the right to request access to the personal data we hold about you, to have any inaccuracies corrected, and to request the deletion of your personal data. You can manage your account information or terminate your account at any time.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us through the form on our Contact page.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;