import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Heart,
} from 'lucide-react';
import '../styles/Contact.css';
import chickenBonelessPickleImg from '../assets/images/Chicken_Boneless.png';

/* ─── FAQ Data ─────────────────────────────────────────────── */
const faqs = [
  { q: 'Do you deliver across India?', a: 'Yes! We deliver our homemade pickles across all major cities in India via reliable courier partners with careful packaging to preserve quality.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3–7 business days depending on your location. Express delivery options are available at checkout.' },
  { q: 'Are your pickles freshly prepared?', a: 'Absolutely. Every jar is prepared fresh in small batches using traditional recipes with no preservatives or artificial colours.' },
  { q: 'Can I place bulk or wholesale orders?', a: 'Yes! We welcome bulk and wholesale enquiries. Please reach out via phone or email and we\'ll be happy to discuss special pricing.' },
  { q: 'Which payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and cash on delivery for eligible pin codes.' },
];

/* ─── Contact Info Cards ────────────────────────────────────── */
const infoCards = [
  {
    icon: <MapPin size={22} />,
    title: 'Address',
    lines: ['H.No.2-3-84/1/A,', 'Lalitha Nilayam, Quadribagh,', 'Amberpet,', 'Hyderabad, Telangana'],
  },
  {
    icon: <Phone size={22} />,
    title: 'Phone',
    lines: ['+91 7670851967'],
  },
  {
    icon: <Mail size={22} />,
    title: 'Email',
    lines: ['omrishomekitchen@gmail.com'],
  },
  {
    icon: <Clock size={22} />,
    title: 'Business Hours',
    lines: ['Monday – Saturday: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 4:00 PM'],
  },
];

/* ── Config ─────────────────────────────────────────────────── */
const OWNER_EMAIL    = 'omrishomekitchen@gmail.com';
const WHATSAPP_NUM   = '917670851967'; // no + prefix

/* ─── Component ─────────────────────────────────────────────── */
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', privacy: false });
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  /* Validate */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email address is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    if (!form.privacy) e.privacy = 'Please agree to the privacy policy';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }

    setSending(true);

    /* ── 1. Email via mailto ──────────────────────────────────── */
    const emailSubject = encodeURIComponent(`[Omris Home Kitchen] ${form.subject}`);
    const emailBody = encodeURIComponent(
      `Hello,\n\nYou have received a new message from the Contact Us form.\n\n` +
      `Name    : ${form.name}\n` +
      `Email   : ${form.email}\n` +
      `Phone   : ${form.phone}\n` +
      `Subject : ${form.subject}\n\n` +
      `Message:\n${form.message}\n\n` +
      `---\nSent from Omris Home Kitchen website`
    );
    window.open(
      `mailto:${OWNER_EMAIL}?subject=${emailSubject}&body=${emailBody}`,
      '_blank',
      'noopener,noreferrer'
    );

    /* ── 2. WhatsApp via wa.me ────────────────────────────────── */
    const waText = encodeURIComponent(
      `*New Message — Omris Home Kitchen Contact Form*\n\n` +
      `*Name:* ${form.name}\n` +
      `*Email:* ${form.email}\n` +
      `*Phone:* ${form.phone}\n` +
      `*Subject:* ${form.subject}\n\n` +
      `*Message:*\n${form.message}`
    );
    window.open(
      `https://wa.me/${WHATSAPP_NUM}?text=${waText}`,
      '_blank',
      'noopener,noreferrer'
    );

    /* ── 3. Reset & show success ─────────────────────────────── */
    setSending(false);
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '', privacy: false });
    setTimeout(() => setSubmitted(false), 8000);
  };

  return (
    <div className="contact-page">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <div className="contact-hero-text">
            <h1 className="contact-title">Contact Us</h1>
            <div className="contact-title-bar" />
            <p className="contact-subtitle">
              We're here to help! Whether you have questions about our homemade
              pickles, bulk orders, deliveries, or feedback, we'd love to hear from you.
            </p>
            <p className="contact-tagline">
              <Heart size={16} className="tagline-heart" />
              <em>Made with Love, Served with Tradition</em>
            </p>
          </div>
          <div className="contact-hero-image">
            <img
              src={chickenBonelessPickleImg}
              alt="Homemade pickle jars"
              className="hero-pickle-img"
            />
          </div>
        </div>
      </section>

      {/* ── INFO + FORM ─────────────────────────────────────── */}
      <section className="contact-main container">

        {/* Left – Info Cards */}
        <div className="contact-info-col">
          {infoCards.map((card, i) => (
            <div className="info-card" key={i}>
              <div className="info-card-icon">{card.icon}</div>
              <div className="info-card-body">
                <h4 className="info-card-title">{card.title}</h4>
                {card.lines.map((line, j) => (
                  <p key={j} className="info-card-line">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right – Form */}
        <div className="contact-form-col">
          <h2 className="form-heading">Send Us a Message</h2>
          <div className="form-heading-bar" />

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name <span className="required">*</span></label>
                <input
                  id="name" name="name" type="text"
                  placeholder="Enter your full name"
                  value={form.name} onChange={handleChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address <span className="required">*</span></label>
                <input
                  id="email" name="email" type="email"
                  placeholder="Enter your email"
                  value={form.email} onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                <input
                  id="phone" name="phone" type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone} onChange={handleChange}
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject <span className="required">*</span></label>
                <input
                  id="subject" name="subject" type="text"
                  placeholder="Enter subject"
                  value={form.subject} onChange={handleChange}
                  className={errors.subject ? 'input-error' : ''}
                />
                {errors.subject && <span className="error-msg">{errors.subject}</span>}
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="message">Message <span className="required">*</span></label>
              <textarea
                id="message" name="message" rows={5}
                placeholder="Write your message here..."
                value={form.message} onChange={handleChange}
                className={errors.message ? 'input-error' : ''}
              />
              {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>

            <div className="form-group full-width privacy-row">
              <label className="privacy-label">
                <input
                  type="checkbox" name="privacy"
                  checked={form.privacy} onChange={handleChange}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/privacy" className="privacy-link">privacy policy</Link>
                </span>
              </label>
              {errors.privacy && <span className="error-msg">{errors.privacy}</span>}
            </div>

            <button type="submit" className="btn-send" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'} <Send size={16} />
            </button>

            {submitted && (
              <div className="success-banner">
                <CheckCircle size={22} className="success-icon" />
                <div>
                  <strong>Message Sent Successfully! 🎉</strong>
                  <p>Your message was delivered via:</p>
                  <div className="success-channels">
                    <span className="channel-tag channel-email">
                      <Mail size={13} /> Email
                    </span>
                    <span className="channel-tag channel-wa">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp
                    </span>
                  </div>
                  <p className="success-note">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ── MAP ─────────────────────────────────────────────── */}
      <section className="map-section container">
        <h2 className="section-heading">Find Us Here</h2>
        <div className="section-bar" />
        <div className="map-wrapper">
          <iframe
            title="Omris Home Kitchen Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.0!2d78.512!3d17.386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA5LjYiTiA3OMKwMzAnNDMuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin&q=Lalitha+Nilayam,+Quadribagh,+Amberpet,+Hyderabad,+Telangana"
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="faq-section container">
        <h2 className="section-heading">Frequently Asked Questions</h2>
        <div className="section-bar" />
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div className="cta-icon-wrap">
            <Heart size={32} />
          </div>
          <div className="cta-text">
            <h3>Have Questions? We're Just a Message Away!</h3>
            <p>We're happy to assist you with anything you need.</p>
          </div>
          <Link to="/veg-pickles" className="cta-btn">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Contact;
