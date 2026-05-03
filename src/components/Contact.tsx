import { Alegreya, Alegreya_Sans } from 'next/font/google';
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from 'react-icons/fa';

const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const alegreyaSans = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function Contact() {
  return (
    <section id="contact" className="relative w-full bg-[#F3F0F0] py-12">
      <div className="mx-auto max-w-7xl px-4">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`${alegreya.className} text-3xl font-bold text-[#593720] mb-4`}>
            Contact Us
          </h2>
          <p className={`${alegreyaSans.className} text-lg text-[#593720] max-w-2xl mx-auto`}>
            Have a question, suggestion, or just want to say hello? We'd love to hear from you. Reach out through any of the channels below or send us a message directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Left Column - Contact Details */}
          <div className="flex flex-col justify-center space-y-6">
            <h2 className={`${alegreya.className} text-xl font-bold text-[#593720]`}>
              Get in Touch
            </h2>
            
            {/* Email */}
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-[#593720] text-xl flex-shrink-0" />
              <a
                href="mailto:stevechesa@gmail.com"
                className={`${alegreyaSans.className} text-[#593720] text-lg hover:text-[#856149] transition-colors`}
              >
                stevechesa@gmail.com
              </a>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-3">
              <FaPhone className="text-[#593720] text-xl flex-shrink-0" />
              <a
                href="tel:+254759694831"
                className={`${alegreyaSans.className} text-[#593720] text-lg hover:text-[#856149] transition-colors`}
              >
                +254 759 694 831
              </a>
            </div>

            {/* Socials */}
            <div className="pt-4">
              <p className={`${alegreyaSans.className} text-[#593720] text-base mb-4`}>
                You can also communicate with us via our socials:
              </p>
              <div className="flex items-center space-x-6">
                <a
                  href="https://twitter.com/chescore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#593720] hover:text-[#856149] transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter size={28} />
                </a>
                <a
                  href="https://instagram.com/mythicore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#593720] hover:text-[#856149] transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={28} />
                </a>
                <a
                  href="https://linkedin.com/in/Stephen-Echessa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#593720] hover:text-[#856149] transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={28} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="flex flex-col space-y-4">
            {/* Form */}
            <form className="flex flex-col space-y-3 text-lg">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  className={`${alegreyaSans.className} w-full px-3 py-2 rounded-lg border border-[#593720] bg-transparent text-[#593720] placeholder-[#a07850] focus:outline-none focus:ring-1 focus:ring-[#593720]`}
                />
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className={`${alegreyaSans.className} w-full px-3 py-2 rounded-lg border border-[#593720] bg-transparent text-[#593720] placeholder-[#a07850] focus:outline-none focus:ring-1 focus:ring-[#593720]`}
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Your email address"
                  className={`${alegreyaSans.className} w-full px-3 py-2 rounded-lg border border-[#593720] bg-transparent text-[#593720] placeholder-[#a07850] focus:outline-none focus:ring-1 focus:ring-[#593720]`}
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Your message"
                  className={`${alegreyaSans.className} w-full px-3 py-2 rounded-lg border border-[#593720] bg-transparent text-[#593720] placeholder-[#a07850] focus:outline-none focus:ring-1 focus:ring-[#593720] resize-none`}
                />
              </div>

              <button
                type="submit"
                className={`${alegreyaSans.className} w-full py-2 px-6 bg-[#593720] text-[#FFF1D6] font-bold rounded-lg hover:bg-[#856149] transition-colors duration-300 cursor-pointer`}
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}