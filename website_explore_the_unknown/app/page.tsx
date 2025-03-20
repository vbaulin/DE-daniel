import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Hero Section */}
      <header className="py-20 md:py-32 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold">
          Explore the Unknown Together
        </h1>
        <p className="mt-6 text-xl md:text-2xl max-w-2xl mx-auto text-gray-400">
          A collaborative development platform for open, decentralized science
          that empowers interdisciplinary innovation and knowledge sharing
        </p>
        <div className="mt-8">
          <Link href="/waitlist" passHref>
            <Button
              size="lg"
              className="px-8 py-3 font-medium bg-green-600 hover:bg-green-700 text-white"
            >
              Begin Your Knowledge Journey →
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
          {/* Education Card */}
          <div className="bg-gray-800 shadow-lg rounded-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-semibold mb-4">Education</h2>
            <p className="text-lg text-gray-300 mb-6">
              Master complex knowledge domains with AI-guided paths tailored to
              your needs and scientific ambitions.
            </p>
          </div>
          {/* Research Card */}
          <div className="bg-gray-800 shadow-lg rounded-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-semibold mb-4">Research</h2>
            <p className="text-lg text-gray-300 mb-6">
              Unearth hidden knowledge, generate breakthrough hypotheses, and
              accelerate your research with AI-powered exploration.
            </p>
          </div>
          {/* Collaboration Card */}
          <div className="bg-gray-800 shadow-lg rounded-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-semibold mb-4">Collaboration</h2>
            <p className="text-lg text-gray-300 mb-6">
              Connect, collaborate, and co-create with a dynamic network of
              innovators, amplifying your impact on the future of science.
            </p>
          </div>
          {/* New Scientific Discovery Engine Card */}
          <div className="bg-gray-900 shadow-lg rounded-lg p-8 transform hover:scale-105 transition-transform duration-300 md:col-span-3">
            <h2 className="text-3xl font-semibold mb-4">
              Scientific Discovery Engine
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              <strong>Scientific Discovery Engine</strong> is a collaborative
              platform for accelerating discovery in science and, more broadly,
              in any field pushing the boundaries of scientific understanding,
              learning process and building collaborations. We&apos;re moving
              beyond traditional, siloed research practices and embracing a
              dynamic, interconnected approach where human insight and AI power
              work in synergy. We are building a platform that empowers to
              actively pursue the research goals or learn new research field or
              topic. This paradigm shift is particularly crucial for tackling
              complex, interdisciplinary challenges like the development of
              cognizant matter.
            </p>
          </div>
        </div>
      </main>

      {/* Methods Section */}
      <section className="bg-gray-900 py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative w-full aspect-video mx-auto">
            <Image
              src="/discover_mentor_grey.png"
              alt="Discover Mentor"
              fill
              className="object-contain"
            />
          </div>
          <Link href="/methods" passHref>
            <Button
              size="lg"
              className="mt-8 px-8 py-3 font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              Explore Our Methodology →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          © 2025 Active Inference - Explore The Unknown. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
