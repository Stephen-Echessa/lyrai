import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Bridge from "@/components/Bridge";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative">
      <main className="relative">
        <Header />
        <Hero />
        <About />
        <Services />
        <Bridge />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
