import {Alegreya, Alegreya_Sans} from "next/font/google"

const alegreya = Alegreya({
    subsets: ["latin"],
    weight: ["400", "700"],
})

const alegreyaSans = Alegreya_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
})

export default function About() {
    return (
        <section id="about" className={`relative w-full bg-[#FFFFFF] py-10`}>
            <div className="mx-auto max-w-7xl px-4">
                <h2 className={`${alegreya.className} text-3xl font-bold text-center text-[#593720] mb-8`}>
                    About Us
                </h2>
                <p className={`${alegreyaSans.className} text-lg text-center text-[#593720] max-w-3xl mx-auto`}>
                    At Lyr.AI, we harness technology to transform how you experience music. Add a Spotify link, and our intelligent chatbot will analyze the track, interpret the lyrics, and reveal the nuances of the sound. This interactive approach helps you engage with your favorite songs in a more meaningful and personal way.
                </p>
            </div>
        </section>
    )
}

