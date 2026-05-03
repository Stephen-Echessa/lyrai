import { Alegreya_Sans } from 'next/font/google';

const alegreya_sans = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function Footer() {
  return (
    <footer className="w-full bg-[#593720] py-6">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className={`${alegreya_sans.className} text-[#FFF1D6] text-sm`}>
          © {new Date().getFullYear()} Mythicore Solutions. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}