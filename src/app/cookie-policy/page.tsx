'use client';

import { Section, Layout } from '@/components';
import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="animate-fade-in">
      <Section className="bg-gray-light">
        <div className="container py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-dark text-lg mb-4">
            Last updated: May 17, 2025
          </p>
        </div>
      </Section>

      <Section>
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-6">
              SnaggedIt ("we", "our", or "us") uses cookies and similar technologies on our website. This Cookie Policy explains how we use cookies, how they help us provide you with a better experience, and what choices you have regarding their use. This policy is designed to comply with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and the Privacy and Electronic Communications Regulations (PECR).
            </p>

            <h2 className="text-2xl font-bold mb-4">2. What Are Cookies?</h2>
            <p className="mb-6">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners. Cookies enhance your browsing experience by allowing websites to remember your preferences and understand how you use the site.
            </p>

            <h2 className="text-2xl font-bold mb-4">3. How We Use Cookies</h2>
            <p className="mb-4">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Essential cookies:</strong> These are necessary for the website to function properly and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.</li>
              <li><strong>Analytics cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics to help us improve our website and services.</li>
              <li><strong>Authentication cookies:</strong> These allow us to recognize you when you return to our website and keep you logged in during your visit.</li>
              <li><strong>Functionality cookies:</strong> These enable enhanced functionality and personalization, such as remembering your preferences and settings.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">4. Specific Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Essential Cookies</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 px-4 py-2">Name</th>
                    <th className="border border-gray-200 px-4 py-2">Purpose</th>
                    <th className="border border-gray-200 px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">supabase-auth-token</td>
                    <td className="border border-gray-200 px-4 py-2">Authentication session management</td>
                    <td className="border border-gray-200 px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">next-auth.csrf-token</td>
                    <td className="border border-gray-200 px-4 py-2">Security - prevents cross-site request forgery</td>
                    <td className="border border-gray-200 px-4 py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3">4.2 Analytics Cookies</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 px-4 py-2">Name</th>
                    <th className="border border-gray-200 px-4 py-2">Purpose</th>
                    <th className="border border-gray-200 px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">_ga</td>
                    <td className="border border-gray-200 px-4 py-2">Used by Google Analytics to distinguish users</td>
                    <td className="border border-gray-200 px-4 py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">_gid</td>
                    <td className="border border-gray-200 px-4 py-2">Used by Google Analytics to distinguish users</td>
                    <td className="border border-gray-200 px-4 py-2">24 hours</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">_gat</td>
                    <td className="border border-gray-200 px-4 py-2">Used by Google Analytics to throttle request rate</td>
                    <td className="border border-gray-200 px-4 py-2">1 minute</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold mb-4">5. Third-Party Cookies</h2>
            <p className="mb-6">
              Some cookies are placed by third parties on our website. These third parties include:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Google Analytics:</strong> We use Google Analytics to understand how visitors interact with our website. Google Analytics uses cookies to collect information about how you use our site. This information is used to compile reports and help us improve the site. The cookies collect information in an anonymous form, including the number of visitors to the site, where visitors have come from, and the pages they visited. For more information about Google Analytics cookies, please visit <a href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Cookie Usage</a>.</li>
              <li><strong>Supabase:</strong> We use Supabase for authentication services. Supabase uses cookies to keep you logged in and maintain your session.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">6. Managing Cookies</h2>
            <p className="mb-4">
              Under UK GDPR and PECR, you have the right to control what cookies are placed on your device. We provide several ways to manage your cookie preferences:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Cookie consent banner:</strong> When you first visit our website, you'll see a banner allowing you to accept all cookies, accept only essential cookies, or decline all non-essential cookies</li>
              <li><strong>Browser settings:</strong> Most web browsers allow you to manage cookies through their settings. You can delete existing cookies, block certain types of cookies, or receive alerts when cookies are being set</li>
              <li><strong>Opt-out of Google Analytics:</strong> You can install the <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a> to prevent your data from being used by Google Analytics</li>
            </ul>
            <p className="mb-6">
              Please note that if you choose to block or delete cookies, you may not be able to access certain areas or features of our website, and some services may not function properly. Essential cookies are required for the website to function and cannot be disabled.
            </p>
            <p className="mb-6">
              To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
            </p>

            <h2 className="text-2xl font-bold mb-4">7. Legal Basis for Processing</h2>
            <p className="mb-6">
              Under the UK GDPR, we process your personal data collected through cookies on the following legal bases:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Consent:</strong> For non-essential cookies (such as analytics cookies), we process your data based on your explicit consent, which you provide by clicking "Accept All Cookies" or "Accept Essential Only" on our cookie banner</li>
              <li><strong>Legitimate Interests:</strong> For essential cookies, we process your data based on our legitimate interests in providing a functioning and secure website</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">8. Your Data Protection Rights</h2>
            <p className="mb-6">
              Under the UK GDPR, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to rectification if your personal data is inaccurate or incomplete</li>
              <li>The right to erasure (the 'right to be forgotten')</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal data</li>
              <li>Rights relating to automated decision-making and profiling</li>
            </ul>
            <p className="mb-6">
              To exercise any of these rights, please contact us using the details provided below.
            </p>

            <h2 className="text-2xl font-bold mb-4">9. Changes to This Cookie Policy</h2>
            <p className="mb-6">
              We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page, and if the changes are significant, we will provide a more prominent notice. This policy was last updated on May 17, 2025.
            </p>

            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="mb-6">
              If you have any questions about our use of cookies or wish to exercise any of your data protection rights, please contact us at <a href="mailto:support@snagged-it.co.uk" className="text-primary hover:underline">support@snagged-it.co.uk</a>.
            </p>
            
            <h2 className="text-2xl font-bold mb-4">11. Complaints</h2>
            <p className="mb-6">
              If you are not satisfied with our response or believe we are not processing your personal data in accordance with the law, you have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues. You can contact the ICO at <a href="https://ico.org.uk/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ico.org.uk/</a> or by calling 0303 123 1113.
            </p>

          </div>
        </div>
      </Section>
      </div>
    </Layout>
  );
}
