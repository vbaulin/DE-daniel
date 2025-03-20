"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface LearningStep {
  title: string;
  description: string;
  resources: string[];
}

interface LearningPathData {
  topic: string;
  steps: LearningStep[];
}

export default function LearningPath({
  path,
}: {
  path: LearningPathData | null;
}) {
  if (!path) {
    return (
      <Card className="w-full bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Your Learning Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Start chatting to get personalized learning suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <span>{path.topic}</span>
          <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
            {path.steps.length} steps
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {path.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8"
            >
              <div className="absolute left-0 top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {index + 1}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400">{step.description}</p>
                {step.resources.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">
                      Recommended Resources:
                    </p>
                    <ul className="space-y-1">
                      {step.resources.map((resource, resourceIndex) => (
                        <li
                          key={resourceIndex}
                          className="text-sm flex items-center gap-1 text-blue-400"
                        >
                          <ChevronRight className="w-3 h-3" />
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
