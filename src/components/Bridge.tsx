import React from 'react';
import { Alegreya } from 'next/font/google';

const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const Bridge = () => {
  return (
    <section className="relative bg-center bg-cover h-[200px] flex items-center justify-center" style={{ backgroundImage: 'url(/bridge.svg)' }}>
        <div className="relative z-10 text-center">
            <h2 className={`${alegreya.className} text-2xl md:text-5xl text-white`}>
            Upload a song and start exploring Lyr.AI today!
            </h2>
        </div>
        <div className="absolute inset-0 bg-black opacity-50" />
    </section>
  );
};

export default Bridge;