import Image from "next/image";
import { Alegreya_Sans, Alegreya } from "next/font/google";
import UploadMusic from "@/components/UploadMusic";

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Upload Music - Lyr.AI",
  description: "Upload or paste a Spotify link to analyze music with Lyr.AI",
};

export default function UploadPage() {
  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
      {/* Left - form area */}
      <div className="flex flex-col px-8 py-6 md:mt-32 bg-white">
        <a href="/" className="mb-4 flex items-center space-x-3 px-2">
          <Image src="/brown-logo.svg" alt="Lyr.AI" width={56} height={56} priority />
          <span className={alegreyaSans.className + " text-4xl font-extrabold text-[#593720]"}>Lyr.AI</span>
        </a>

        <div className="w-full">
          <UploadMusic />
        </div>
      </div>

      {/* Mobile wallpaper - full width, below form */}
      <div
        className="md:hidden h-100 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/upload-music-wallpaper.svg')" }}
      >
        <div className="absolute inset-0 bg-[#593720]/50" />
      </div>

      {/* Right - wallpaper (desktop only) */}
      <div className="hidden md:block relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/upload-music-wallpaper.svg')" }}
        />
        <div className="absolute inset-0 bg-[#593720]/50" />
      </div>
    </div>
  );
}