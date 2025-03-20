"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const paths = [
  {
    id: "learning",
    title: "Learning",
    description: "Personalized educational journey",
    color: "from-purple-500/20 to-red-500/20",
    activeColor: "from-purple-500 to-red-500",
    image: "/learning_workflow-modules.png",
  },
  {
    id: "discovery",
    title: "Discovery",
    description: "Explore unknown territories",
    color: "from-blue-500/20 to-green-500/20",
    activeColor: "from-blue-500 to-green-500",
    image: "/discover_workflow.png",
  },
  {
    id: "collaboration",
    title: "Collaboration",
    description: "Connect with others",
    color: "from-yellow-500/20 to-orange-500/20",
    activeColor: "from-yellow-500 to-orange-500",
    image: "/collab_workflow.png",
  },
];

export default function DiscoveryMentorVisualization() {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [showPaths, setShowPaths] = useState(false);
  const [intentionsActive, setIntentionsActive] = useState(false);

  // Start the visualization flow
  useEffect(() => {
    const timer1 = setTimeout(() => setIntentionsActive(true), 1000);
    const timer2 = setTimeout(() => setShowPaths(true), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Auto-cycle through paths
  useEffect(() => {
    if (!showPaths) return;

    const interval = setInterval(() => {
      setActivePath((current) => {
        if (!current) return paths[0].id;
        const currentIndex = paths.findIndex((p) => p.id === current);
        return paths[(currentIndex + 1) % paths.length].id;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [showPaths]);

  return (
    <div className="relative w-full h-[830px] bg-black/40 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 flex flex-col items-center">
        {/* Intentions Node */}
        <motion.div
          className="relative mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: intentionsActive ? 1.1 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center p-4">
              <div className="text-center">
                <span className="text-white font-bold text-xl mb-2 block">
                  My Intentions
                </span>
                <span className="text-gray-400 text-sm block">
                  Understanding your goals and aspirations
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connection Lines Container */}
        {showPaths && (
          <div
            className="relative w-full max-w-7xl"
            style={{ marginTop: "1rem", height: "20rem" }}
          >
            {/* Vertical connector coming down from the center of "My Intentions" */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ width: "2px", height: "1.5rem" }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full bg-gradient-to-b from-white via-white to-transparent" />
            </motion.div>

            {/* Horizontal spine that connects to all paths */}
            <motion.div
              className="absolute left-0 right-0"
              style={{ top: "1.5rem", height: "2px" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full bg-white/20" />
            </motion.div>

            {/* Short vertical branches going down to each path container */}
            {paths.map((path, index) => {
              const isActive = path.id === activePath;
              // For three equally spaced paths, the centers are at about 16.67%, 50%, and 83.33%
              const leftOffset = `${index * 33.33 + 16.665}%`;

              return (
                <motion.div
                  key={`line-${path.id}`}
                  className="absolute"
                  style={{
                    left: leftOffset,
                    top: "1.7rem",
                    width: "2px",
                    height: "1.5rem",
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: isActive ? 0.8 : 0.2 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className={`w-full h-full bg-gradient-to-b ${
                      isActive
                        ? "from-white via-white to-transparent"
                        : "from-white/20 to-transparent"
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Paths Container */}
        <motion.div
          className="relative w-full max-w-7xl px-8 mt-12 flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: showPaths ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {paths.map((path, index) => {
            const isActive = path.id === activePath;

            return (
              <motion.div
                key={path.id}
                className="relative"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 + index * 0.2 }}
              >
                <motion.div
                  className={`w-80 rounded-lg ${
                    isActive
                      ? "border-2 border-white"
                      : "border border-white/20"
                  } cursor-pointer transition-all duration-300`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setActivePath(path.id)}
                >
                  <div className="h-full rounded-lg bg-black/90 p-6">
                    <h3 className="text-white font-semibold text-lg mb-4">
                      {path.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {path.description}
                    </p>

                    {/* Workflow Image Container */}
                    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-black/50">
                      <Image
                        src={path.image}
                        alt={`${path.title} Workflow`}
                        fill
                        className="object-cover invert"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
