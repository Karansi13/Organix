'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

export default function DemoSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            See It in
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Action</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Take a peek at how Organix transforms your daily workflow with intuitive design and powerful features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Kanban Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl">
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Kanban Board View
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize tasks visually with drag-and-drop columns
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 flex gap-4">
                <div className="flex-1 bg-blue-50 dark:bg-blue-900 rounded p-3">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Backlog</h4>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm text-sm">
                      <div className="font-medium">Design landing page</div>
                      <div className="text-xs text-gray-500">High priority</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm text-sm">
                      <div className="font-medium">Setup database</div>
                      <div className="text-xs text-gray-500">Medium priority</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-yellow-50 dark:bg-yellow-900 rounded p-3">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">In Progress</h4>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm text-sm">
                      <div className="font-medium">API integration</div>
                      <div className="text-xs text-gray-500">High priority</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-green-50 dark:bg-green-900 rounded p-3">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Completed</h4>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm text-sm">
                      <div className="font-medium">Project setup</div>
                      <div className="text-xs text-gray-500">✓ Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* AI Features Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl">
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI-Powered Features
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Let AI help you stay organized and productive
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Natural Language Input
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">You type:</div>
                    <div className="font-mono text-sm">"Finish project report by Friday at 5 PM"</div>
                  </div>
                  <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                    → AI creates task with deadline and high priority
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Smart Suggestions
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded text-sm">
                      💡 "Based on your pattern, you might want to schedule a follow-up meeting"
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded text-sm">
                      📅 "This task would fit well in your 2 PM slot tomorrow"
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Canvas Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Visual Canvas Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sketch ideas, create mind maps, and attach visual notes to your tasks
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 h-48 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Palette className="h-12 w-12 mx-auto mb-2" />
                <div className="text-lg font-medium">Interactive Canvas</div>
                <div className="text-sm">Draw, sketch, and visualize your ideas</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function Palette({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z" />
    </svg>
  );
}
