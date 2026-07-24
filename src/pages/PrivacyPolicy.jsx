import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Share2, Cookie, Mail, Phone, MapPin } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="mb-10"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-[#f88812]/10 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-[#f88812]" />
      </div>
      <h2 className="text-xl md:text-2xl font-extrabold text-[#3a2a22]">{title}</h2>
    </div>
    <div className="pl-13 text-gray-600 text-[15px] leading-relaxed space-y-3">
      {children}
    </div>
  </motion.div>
);

const PrivacyPolicy = () => {
  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans">

      {/* Hero Banner */}
      <div className="bg-[#3a2a22] text-white py-14 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <Shield size={48} className="text-[#f88812]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Your privacy matters to us. Learn how Omris Home Kitchen collects, uses, and protects your personal information.
          </p>
          <p className="text-gray-400 text-xs mt-4">Last updated: July 4, 2026</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Intro */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-[15px] leading-relaxed mb-12 p-6 bg-white border border-gray-100 rounded-xl shadow-sm"
        >
          Welcome to <strong className="text-[#3a2a22]">Omris Home Kitchen</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or place an order with us. Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.
        </motion.p>

        <Section icon={Eye} title="Information We Collect">
          <p>We may collect the following types of personal information when you interact with us:</p>
          <ul className="list-disc ml-5 space-y-2 mt-2">
            <li><strong className="text-[#3a2a22]">Personal Identification:</strong> Name, email address, phone number, and billing/shipping address when you place an order.</li>
            <li><strong className="text-[#3a2a22]">Transaction Data:</strong> Details about purchases you make through our website, including products ordered and payment information.</li>
            <li><strong className="text-[#3a2a22]">Technical Data:</strong> IP address, browser type, device information, and cookies collected automatically when you visit our site.</li>
            <li><strong className="text-[#3a2a22]">Communication Data:</strong> Messages you send us via WhatsApp, email, or contact forms.</li>
          </ul>
        </Section>

        <Section icon={Share2} title="How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc ml-5 space-y-2 mt-2">
            <li>To process and fulfill your orders, including shipping and delivery.</li>
            <li>To send you order confirmations, updates, and customer support messages.</li>
            <li>To respond to your inquiries made via WhatsApp, email, or our contact form.</li>
            <li>To improve our website, products, and overall customer experience.</li>
            <li>To comply with applicable legal obligations.</li>
            <li>To prevent fraudulent transactions and ensure security.</li>
          </ul>
        </Section>

        <Section icon={Lock} title="How We Protect Your Information">
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc ml-5 space-y-2 mt-2">
            <li>Secure HTTPS encryption for all data transmitted on our website.</li>
            <li>Restricted access to personal data — only authorized personnel may access it.</li>
            <li>We do <strong>not</strong> store your full payment card details on our servers. Payments are processed through secure, PCI-compliant third-party gateways.</li>
          </ul>
        </Section>

        <Section icon={Share2} title="Sharing Your Information">
          <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share your data only in the following limited circumstances:</p>
          <ul className="list-disc ml-5 space-y-2 mt-2">
            <li><strong className="text-[#3a2a22]">Delivery Partners:</strong> We share your name and address with courier/delivery services to fulfill your order.</li>
            <li><strong className="text-[#3a2a22]">Payment Processors:</strong> Secure third-party payment gateways process your payment information.</li>
            <li><strong className="text-[#3a2a22]">Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
          </ul>
        </Section>

        <Section icon={Cookie} title="Cookies">
          <p>
            Our website may use "cookies" to enhance user experience. Cookies are small files placed on your device by your web browser. You can choose to have your browser refuse cookies or alert you when cookies are being sent. However, some parts of our website may not function properly as a result.
          </p>
          <p>We use cookies for:</p>
          <ul className="list-disc ml-5 space-y-2 mt-2">
            <li>Keeping track of your shopping cart contents.</li>
            <li>Understanding how visitors use our website (analytics).</li>
            <li>Remembering your preferences for a better browsing experience.</li>
          </ul>
        </Section>

        <Section icon={Eye} title="Your Rights">
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul className="list-disc ml-5 space-y-2 mt-2">
            <li><strong className="text-[#3a2a22]">Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong className="text-[#3a2a22]">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong className="text-[#3a2a22]">Deletion:</strong> Request that we delete your personal information, subject to certain legal exceptions.</li>
            <li><strong className="text-[#3a2a22]">Opt-Out:</strong> Opt out of any future marketing communications from us.</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, please contact us using the details below.</p>
        </Section>

        <Section icon={Shield} title="Third-Party Links">
          <p>
            Our website may contain links to third-party websites (e.g., WhatsApp, Instagram). Please note that we have no control over the content or privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
          </p>
        </Section>

        <Section icon={Shield} title="Children's Privacy">
          <p>
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately so we can take appropriate action.
          </p>
        </Section>

        <Section icon={Shield} title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by updating the "Last updated" date at the top of this page. We encourage you to review this policy periodically.
          </p>
        </Section>

        {/* Contact Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#3a2a22] text-white rounded-2xl p-8 mt-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail size={24} className="text-[#f88812]" />
            <h2 className="text-xl font-extrabold">Contact Us About Privacy</h2>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please don't hesitate to get in touch.
          </p>
          <div className="space-y-3 text-sm text-gray-200">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#f88812] mt-0.5 flex-shrink-0" />
              <span>H.No.2-3-84/1/A, Lalitha Nilyam, Quadribagh, Amberpet, Hyderabad, Telangana — 500013</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-[#f88812] flex-shrink-0" />
              <span>+91 7670851967</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[#f88812] flex-shrink-0" />
              <span>omrishomekitchen@gmail.com</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
