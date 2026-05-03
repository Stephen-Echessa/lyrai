import { Alegreya, Alegreya_Sans } from "next/font/google"

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function Services() {
  return (
    <section id="services">
      <div className="relative w-full bg-[#F3F0F0] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className={`${alegreya.className} text-3xl font-bold text-center text-[#593720] mb-8`}>
            Services
          </h2>
          <p className={`${alegreyaSans.className} text-lg text-center text-[#593720] max-w-3xl mx-auto mb-12`}>
            Explore Lyr.AI's advanced analysis tools and user-friendly interface. Dive into the world of music with our professional insights and personalized recommendations.
          </p>

          <div className="flex flex-col gap-2">

            {/* Row 1: Music Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <div className="flex items-center justify-center px-10">
                <img src="/headphones.svg" alt="Headphones" width={256} height={256} />
              </div>
              <div className="flex flex-col justify-center items-center text-center px-10">
                <h3 className={`${alegreya.className} text-xl font-bold mb-4 text-[#593720]`}>
                  Music Analysis
                </h3>
                <p className={`${alegreyaSans.className} text-lg text-[#593720]`}>
                  Unlock the secrets of your favorite tracks with Lyr.AI's in-depth music analysis. Our AI platform evaluates and critiques songs, offering you a detailed understanding of their composition and emotional impact. Whether you're a casual listener or a music enthusiast, our insights will enrich your appreciation for each piece.
                </p>
              </div>
            </div>

            {/* Row 2: Lyrical Insights — text left, image right on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              {/* Image first on mobile via order, after text on desktop */}
              <div className="flex items-center justify-center px-10 order-first md:order-last">
                <img src="/band.svg" alt="Band" width={256} height={256} />
              </div>
              <div className="flex flex-col justify-center items-center text-center px-10 order-last md:order-first">
                <h3 className={`${alegreya.className} text-xl font-bold mb-4 mt-6 text-[#593720]`}>
                  Lyrical Insights
                </h3>
                <p className={`${alegreyaSans.className} text-lg text-[#593720]`}>
                  Join us as we explore the heartfelt meanings behind lyrics! Discover the captivating stories behind each song and elevate your listening experience. Let's dive into the world of music together and uncover the magic that makes songs so special!
                </p>
              </div>
            </div>

            {/* Row 3: User-Friendly Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
              <div className="flex items-center justify-center px-10">
                <img src="/dvd.svg" alt="DVD" width={256} height={256} />
              </div>
              <div className="flex flex-col justify-center items-center text-center px-10">
                <h3 className={`${alegreya.className} text-xl font-bold mb-4 text-[#593720]`}>
                  User-Friendly Uploads
                </h3>
                <p className={`${alegreyaSans.className} text-lg text-[#593720]`}>
                    Experience effortless interaction with our user-friendly upload options. Simply paste a Spotify link and let Lyr.AI handle the rest — our platform is designed for simplicity and efficiency. Engage with music like never before!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}