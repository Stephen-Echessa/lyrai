"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import { Alegreya_Sans } from "next/font/google";

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Header({ forceSolid }: { forceSolid?: boolean } = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector("section");
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        setIsScrolled(heroRect.top < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const solid = forceSolid || isScrolled || menuOpen;

  return (
    <header
      className={`${alegreyaSans.className} fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        solid ? "bg-[#593720] bg-opacity-95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="Company Logo"
            width={56}
            height={56}
            priority
          />
          <span className="text-[30px] font-extrabold px-2 text-[#FFF1D6]">
            Lyr.AI
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center space-x-6 text-[20px] font-medium text-[#FFF1D6]">
            <li className="mx-8">
              <a href="#about" className="hover:text-[#FFFFFF]">About</a>
            </li>
            <li className="mx-8">
              <a href="#services" className="hover:text-[#FFFFFF]">Services</a>
            </li>
            <li className="mx-8">
              <a href="#contact" className="hover:text-[#FFFFFF]">Contact Us</a>
            </li>
            <li className="mx-8">
              <a
                href="/upload-music"
                className="border p-4 rounded-full hover:bg-[#856149] hover:border-[#856149] transition-colors"
              >
                Get Started
              </a>
            </li>
          </ul>
        </nav>

        {/* Hamburger Button (mobile only) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-[#FFF1D6] transition-transform duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#FFF1D6] transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#FFF1D6] transition-transform duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="bg-[#593720] bg-opacity-98 px-6 pb-6">
          <ul className="flex flex-col space-y-4 text-[18px] font-medium text-[#FFF1D6]">
            <li>
              <a
                href="#about"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="block py-2 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
              </a>
            </li>
            <li className="pt-2">
              <a
                href="/upload-music"
                className="inline-block border px-6 py-3 rounded-full hover:bg-[#856149] hover:border-[#856149] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}