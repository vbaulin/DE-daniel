"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate the email address format on the client, too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Replace the simulated delay with an actual API call.
      const res = await fetch("/api_ts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "An error occurred. Please try again later.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
    }
    setLoading(false);
  };

  // Add this effect to prevent scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // Reset on unmount
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-green-900 to-black text-white">
      <div className="bg-gray-800 bg-opacity-90 p-6 md:p-10 rounded-md shadow-lg max-w-md w-full mx-4 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
          Join Our Waitlist
        </h1>
        <p className="mb-6 md:mb-8">
          Subscribe now to get early access and receive updates on our
          breakthrough platform that revolutionizes open and decentralized
          science!
        </p>
        {success ? (
          <div className="bg-green-500 p-4 rounded-md mb-4">
            Thank you for subscribing! We&apos;ll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="w-full p-2 md:p-3 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Submitting..." : "Subscribe"}
            </Button>
          </form>
        )}
        <div className="mt-6">
          <Link href="/" className="text-blue-400 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
