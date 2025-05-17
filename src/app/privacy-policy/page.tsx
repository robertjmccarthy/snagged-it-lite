'use client';

import { Section, Layout } from '@/components';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="animate-fade-in">
        <Section className="bg-gray-light">
          <div className="container py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
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
                Welcome to SnaggedIt ("we", "our", "us"). We are committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
              </p>
              <p className="mb-6">
                SnaggedIt is a service that allows users to document and track home build issues. This Privacy Policy applies to our website at snagged-it.co.uk and all related services.
              </p>
              <p className="mb-6">
                For the purposes of UK data protection laws, the data controller is SnaggedIt Ltd, a company registered in England and Wales.
              </p>

              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="mb-4">
                We collect and process the following types of information:
              </p>

              <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide to Us</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, and password.</li>
                <li><strong>Profile Information:</strong> Information you provide in your user profile, such as contact details.</li>
                <li><strong>Property Information:</strong> Details about your property, including address and property type.</li>
                <li><strong>Snag Information:</strong> Information about issues or "snags" in your property, including descriptions, locations, and photographs.</li>
                <li><strong>Builder Information:</strong> Contact details for builders or contractors that you provide to share your snag lists.</li>
                <li><strong>Payment Information:</strong> If you make a purchase, we collect payment information, though we do not store full payment card details.</li>
                <li><strong>Communications:</strong> When you contact us, we keep a record of your communication to help solve any issues you might be having.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Usage Data:</strong> Information about how you use our website and services, including log data, device information, and analytics data.</li>
                <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to track activity on our website and to hold certain information. For more information, please see our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.</li>
                <li><strong>Technical Data:</strong> This includes your IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system, and platform.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>To create and manage your account</li>
                <li>To provide and maintain our services</li>
                <li>To process and complete transactions</li>
                <li>To send administrative information, such as updates, security alerts, and support messages</li>
                <li>To respond to your comments, questions, and requests</li>
                <li>To improve our website and services</li>
                <li>To send marketing communications (with your consent)</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights, property, or safety, and that of our users or others</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing</h2>
              <p className="mb-4">
                Under UK data protection law, we must have a legal basis for processing your personal data. The legal bases we rely on are:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Contract:</strong> Processing is necessary for the performance of a contract with you (e.g., to provide you with our services after you sign up).</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests, provided those interests are not outweighed by your rights and interests (e.g., to improve and develop our services).</li>
                <li><strong>Legal Obligation:</strong> Processing is necessary to comply with a legal obligation (e.g., to comply with tax laws).</li>
                <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for a specific purpose (e.g., marketing communications).</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="mb-4">
                We may share your personal information with:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.</li>
                <li><strong>Business Partners:</strong> With your consent, we may share your information with builders or contractors you've specified to receive your snag lists.</li>
                <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.</li>
                <li><strong>With Your Consent:</strong> We may share your information for other purposes with your consent.</li>
              </ul>
              <p className="mb-6">
                We require all third parties to respect the security of your personal data and to treat it in accordance with the law.
              </p>

              <h2 className="text-2xl font-bold mb-4">6. International Transfers</h2>
              <p className="mb-6">
                Your personal data may be transferred to, and processed in, countries other than the country in which you are resident. These countries may have data protection laws that are different from the laws of your country.
              </p>
              <p className="mb-6">
                Specifically, our servers are located in the UK and EU, and our third-party service providers and partners operate around the world. This means that when we collect your personal data, we may process it in any of these countries.
              </p>
              <p className="mb-6">
                However, we have taken appropriate safeguards to require that your personal data will remain protected in accordance with this Privacy Policy. These include implementing the European Commission's Standard Contractual Clauses for transfers of personal data between our group companies and third-party service providers and partners, which require all parties to protect personal data they process from the EEA in accordance with European data protection law.
              </p>

              <h2 className="text-2xl font-bold mb-4">7. Data Security</h2>
              <p className="mb-6">
                We have implemented appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. These include:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Encryption of sensitive data</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication procedures</li>
                <li>Staff training on data protection</li>
              </ul>
              <p className="mb-6">
                However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>

              <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
              <p className="mb-6">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
              <p className="mb-6">
                To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.
              </p>
              <p className="mb-6">
                In some circumstances, we may anonymize your personal data (so that it can no longer be associated with you) for research or statistical purposes, in which case we may use this information indefinitely without further notice to you.
              </p>

              <h2 className="text-2xl font-bold mb-4">9. Your Rights</h2>
              <p className="mb-4">
                Under UK data protection law, you have rights including:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Right to Access:</strong> You can ask for copies of your personal data.</li>
                <li><strong>Right to Rectification:</strong> You can ask us to correct inaccurate personal data or complete incomplete data.</li>
                <li><strong>Right to Erasure:</strong> You can ask us to erase your personal data in certain circumstances.</li>
                <li><strong>Right to Restriction of Processing:</strong> You can ask us to restrict the processing of your personal data in certain circumstances.</li>
                <li><strong>Right to Object to Processing:</strong> You can object to the processing of your personal data in certain circumstances.</li>
                <li><strong>Right to Data Portability:</strong> You can ask that we transfer the personal data you gave us to another organization, or to you, in certain circumstances.</li>
              </ul>
              <p className="mb-6">
                You are not required to pay any charge for exercising your rights. If you make a request, we have one month to respond to you.
              </p>
              <p className="mb-6">
                To exercise any of these rights, please contact us using the details provided below.
              </p>

              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <p className="mb-6">
                Our services are not intended for children under the age of 16, and we do not knowingly collect personal data from children under 16. If we become aware that we have collected personal data from a child under 16 without verification of parental consent, we will take steps to remove that information from our servers.
              </p>

              <h2 className="text-2xl font-bold mb-4">11. Links to Other Websites</h2>
              <p className="mb-6">
                Our website may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
              </p>
              <p className="mb-6">
                We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>

              <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="mb-6">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
              <p className="mb-6">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>

              <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
              <p className="mb-6">
                If you have any questions about this Privacy Policy, or if you would like to exercise any of your data protection rights, please contact us at:
              </p>
              <ul className="list-none mb-6 space-y-2">
                <li><strong>Email:</strong> <a href="mailto:support@snagged-it.co.uk" className="text-primary hover:underline">support@snagged-it.co.uk</a></li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">14. Complaints</h2>
              <p className="mb-6">
                If you are not satisfied with our response or believe we are not processing your personal data in accordance with the law, you have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues.
              </p>
              <p className="mb-6">
                You can contact the ICO at <a href="https://ico.org.uk/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ico.org.uk/</a> or by calling 0303 123 1113.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  );
}
