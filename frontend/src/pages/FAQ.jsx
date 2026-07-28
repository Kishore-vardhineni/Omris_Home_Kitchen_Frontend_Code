import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShoppingBag, Truck, RefreshCw, CreditCard, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'About Our Products',
    icon: ShoppingBag,
    questions: [
      {
        q: 'What makes Omris Home Kitchen pickles special?',
        a: 'Our pickles are made using traditional homestyle recipes passed down through generations. We use only fresh, natural ingredients with authentic spices — no artificial colors, preservatives, or additives. Every batch is prepared in small quantities to ensure the highest quality and taste.',
      },
      {
        q: 'Are your pickles 100% natural?',
        a: 'Yes! All our pickles are made with 100% natural ingredients. We do not use any artificial flavors, colors, or chemical preservatives. The natural spices and oils used act as natural preservatives to keep the pickles fresh.',
      },
      {
        q: 'How long do the pickles last after opening?',
        a: 'Once opened, our pickles last 3–6 months when stored in a cool, dry place. For best results, always use a clean, dry spoon when serving. Refrigerating after opening can extend shelf life further.',
      },
      {
        q: 'What pickle varieties do you offer?',
        a: 'We currently offer Chicken Bone Pickle, Chicken Boneless Pickle, Mango Pickle, and Tomato Pickle — available in 250g, 500g, and 1kg sizes. We keep adding new varieties, so stay tuned!',
      },
      {
        q: 'Are your products suitable for vegetarians?',
        a: 'We offer both vegetarian (Mango, Tomato) and non-vegetarian (Chicken Bone, Chicken Boneless) pickle varieties. All products are clearly labeled, so you can easily choose what fits your diet.',
      },
    ],
  },
  {
    category: 'Ordering & Payment',
    icon: CreditCard,
    questions: [
      {
        q: 'How do I place an order?',
        a: 'You can place an order directly on our website by adding products to your cart and clicking "Proceed to Checkout". You can also order via WhatsApp by clicking the "Order on WhatsApp" button on any product card — we will guide you through the process.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods through our secure Razorpay payment gateway, including UPI (GPay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Wallets.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card or bank details on our servers. All transactions are encrypted end-to-end.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'You can request an order modification or cancellation within 2 hours of placing the order by contacting us on WhatsApp (+91 7670851967) or email. Once the order is dispatched, cancellations are not possible.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'We deliver within 2–5 working days across India. Delivery timelines may vary slightly based on your location and courier availability. You will receive a tracking number via SMS/WhatsApp once your order is dispatched.',
      },
      {
        q: 'Do you offer free delivery?',
        a: 'Yes! We offer FREE delivery on all orders above Rs. 999. For orders below Rs. 999, a nominal shipping charge will be applied at checkout based on your delivery location.',
      },
      {
        q: 'Do you ship across India?',
        a: 'Yes, we ship to all serviceable pin codes across India. If you are unsure whether we deliver to your area, please reach out to us on WhatsApp and we will confirm.',
      },
      {
        q: 'How will I know when my order is shipped?',
        a: 'Once your order is packed and handed over to the courier, you will receive a WhatsApp message with your tracking details. You can use this to monitor your delivery in real time.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: RefreshCw,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Due to the perishable nature of food products, we generally do not accept returns. However, if you receive a damaged, leaking, or incorrect product, please contact us within 24 hours of delivery with photos, and we will resolve it immediately.',
      },
      {
        q: 'What if my order arrives damaged?',
        a: 'We take great care in packaging to prevent damage during transit. If your order arrives damaged, please take photos immediately and send them to us on WhatsApp (+91 7670851967) or email (omrishomekitchen@gmail.com) within 24 hours. We will arrange a replacement or full refund promptly.',
      },
      {
        q: 'How long does a refund take to process?',
        a: 'Once a refund is approved, it is processed within 5–7 working days back to your original payment method. You will receive a confirmation once the refund is initiated.',
      },
    ],
  },
  {
    category: 'Contact & Support',
    icon: Phone,
    questions: [
      {
        q: 'How can I contact Omris Home Kitchen?',
        a: 'You can reach us via WhatsApp at +91 7670851967, by email at omrishomekitchen@gmail.com, or through our Contact page. We typically respond within a few hours during business hours (9 AM – 7 PM IST).',
      },
      {
        q: 'Do you take bulk or custom orders?',
        a: 'Yes! We accept bulk orders for events, gifting, or corporate requirements. Please reach out to us on WhatsApp with your requirements and we will provide a custom quote.',
      },
      {
        q: 'Do you have a physical store?',
        a: 'We currently operate as a home kitchen business. Our products are available exclusively online through our website and WhatsApp. Our base is in Quadribagh, Amberpet, Hyderabad, Telangana — 500013.',
      },
    ],
  },
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left px-6 py-5 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-[15px] md:text-base text-[#3a2a22] pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={20} className="text-[#f88812]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 text-gray-600 text-[14px] md:text-[15px] leading-relaxed border-t border-gray-100">
              <div className="pt-4">{answer}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(null);

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
            <HelpCircle size={48} className="text-[#f88812]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Got a question? We've got answers! Browse through our most common questions below.
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              activeCategory === null
                ? 'bg-[#3a2a22] text-white border-[#3a2a22]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#f88812] hover:text-[#f88812]'
            }`}
          >
            All
          </button>
          {faqs.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category === activeCategory ? null : cat.category)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                activeCategory === cat.category
                  ? 'bg-[#f88812] text-white border-[#f88812]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#f88812] hover:text-[#f88812]'
              }`}
            >
              <cat.icon size={14} />
              {cat.category}
            </button>
          ))}
        </div>

        {/* FAQ Sections */}
        {faqs
          .filter((cat) => activeCategory === null || cat.category === activeCategory)
          .map((cat, catIdx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: catIdx * 0.1 }}
              className="mb-12"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#f88812]/10 flex items-center justify-center flex-shrink-0">
                  <cat.icon size={20} className="text-[#f88812]" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#3a2a22]">{cat.category}</h2>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {cat.questions.map((faq, i) => (
                  <FAQItem key={i} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </motion.div>
          ))}

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#3a2a22] text-white rounded-2xl p-8 text-center shadow-lg mt-4"
        >
          <HelpCircle size={36} className="text-[#f88812] mx-auto mb-3" />
          <h2 className="text-xl md:text-2xl font-extrabold mb-2">Still have questions?</h2>
          <p className="text-gray-300 text-sm mb-6">
            Can't find what you're looking for? Our friendly team is happy to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/917670851967?text=Hi!%20I%20have%20a%20question%20about%20Omris%20Home%20Kitchen."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25d366] text-white font-bold rounded-lg hover:bg-[#1ebe5d] transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#f88812] text-white font-bold rounded-lg hover:bg-[#e67a0a] transition-colors text-sm flex items-center justify-center"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default FAQ;
