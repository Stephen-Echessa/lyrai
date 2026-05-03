import Image from "next/image"
import { Alegreya, Alegreya_Sans } from "next/font/google"

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export default function Hero() {
    return (
        <section className={`${alegreya.className} relative w-full bg-gray-900 min-h-screen`}>
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                backgroundImage: "url('/hero.svg')",
                }}
            />

            {/* Brown overtone overlay */}
            <div className="absolute inset-0 bg-[#593720]/15" />

            {/* Content */}
            <div className="relative flex flex-col items-center justify-center px-4 py-24 text-center md:py-32 min-h-screen">
                <h1 className="text-3xl font-semibold leading-tight md:text-5xl md:leading-tight text-[#FFF1D6]">
                    Decode the soul of every song with Lyr.AI
                </h1>

                <h3 className={alegreyaSans.className + " mt-6 text-base text-[#FFF1D6] md:text-xl font-medium"}>
                    Analyze melodies and lyrics to reveal the stories, emotions,<br/>
                    and patterns hidden within every track.
                </h3>

                <a
                href="/upload-music"
                className={alegreyaSans.className + " mt-8 inline-block rounded-full bg-[#593720] px-8 py-4 text-lg font-bold text-[#FFF1D6] shadow-lg hover:bg-[#4a2d1a] transition-colors"}
                >
                    Get Started
                </a>
            </div>
        </section>
    )
}