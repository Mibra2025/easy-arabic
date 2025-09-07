'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, MessageSquare, Eye, Calendar, Infinity, TrendingUp, Zap, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

const humanFeatures = [
  {
    icon: Heart,
    text: 'Cultural insights and context'
  },
  {
    icon: MessageSquare,
    text: 'Conversational practice'
  },
  {
    icon: Eye,
    text: 'Personalized feedback'
  },
  {
    icon: Calendar,
    text: 'Flexible scheduling'
  }
]

const aiFeatures = [
  {
    icon: Infinity,
    text: 'Available 24/7'
  },
  {
    icon: TrendingUp,
    text: 'Adaptive learning paths'
  },
  {
    icon: Zap,
    text: 'Instant corrections'
  },
  {
    icon: RotateCcw,
    text: 'Unlimited practice'
  }
]

export function Teachers() {
  return (
    <section id="teachers" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Meet Your Teaching Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The perfect combination of human expertise and AI intelligence
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Human Teachers Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-emerald-500">
              <CardHeader className="text-center pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl">👨‍🏫</div>
                </div>
                <CardTitle className="text-2xl text-gray-900">Human Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {humanFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Teachers Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500">
              <CardHeader className="text-center pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl">🤖</div>
                </div>
                <CardTitle className="text-2xl text-gray-900">AI Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}