'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Brain, 
  Calendar, 
  Palette, 
  Kanban, 
  Users, 
  Smartphone,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Smart task suggestions, natural language processing, and automatic priority detection to boost your productivity.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Kanban,
    title: 'Kanban Board',
    description: 'Visualize your workflow with customizable columns, drag-and-drop functionality, and real-time updates.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Calendar,
    title: 'Google Calendar Sync',
    description: 'Seamlessly integrate with Google Calendar for automatic event creation and intelligent scheduling.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Palette,
    title: 'Visual Canvas',
    description: 'Built-in drawing canvas for sketches, mind maps, and visual notes attached to your tasks.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share boards with team members, assign tasks, and collaborate in real-time with permission controls.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Access your todos from web, desktop (Electron), or mobile devices with automatic synchronization.',
    color: 'from-teal-500 to-blue-500'
  },
  {
    icon: Zap,
    title: 'Offline Support',
    description: 'Work without internet connection and sync automatically when you\'re back online.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'End-to-end encryption with Clerk authentication ensures your data stays private and secure.',
    color: 'from-gray-500 to-slate-500'
  },
  {
    icon: Globe,
    title: 'Export & Import',
    description: 'Export your data to CSV/JSON or import from other todo applications seamlessly.',
    color: 'from-pink-500 to-rose-500'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Stay Organized</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover powerful features designed to supercharge your productivity and help you achieve your goals faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
