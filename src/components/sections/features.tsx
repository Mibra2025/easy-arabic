'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Brain, Users, Clock, Mic, Gamepad2, Award } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Personalized lessons adapted to your learning pace and style using advanced AI algorithms.',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Users,
    title: 'Expert Human Teachers',
    description: 'Native Arabic speakers provide cultural context and personalized feedback that only humans can offer.',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Practice anytime with AI tutors while scheduling live sessions with human teachers when needed.',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    icon: Mic,
    title: 'Speech Recognition',
    description: 'Advanced pronunciation training with real-time feedback to perfect your Arabic accent.',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    icon: Gamepad2,
    title: 'Interactive Exercises',
    description: 'Engaging games and activities that make learning Arabic fun and memorable.',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    icon: Award,
    title: 'Certification',
    description: 'Earn recognized certificates as you progress through different levels of Arabic proficiency.',
    gradient: 'from-indigo-500 to-indigo-600'
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Easy Arabic?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the unique advantages of learning with both human expertise and AI innovation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}