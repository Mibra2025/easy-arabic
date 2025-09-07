'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Clock, Heart, Bot, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section id="home" className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Master Arabic with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                Human & AI
              </span>{' '}
              Teachers
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Experience the perfect blend of traditional teaching and cutting-edge AI technology. 
              Learn Arabic faster and more effectively than ever before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Learning Now
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="text-gray-700 font-medium">Beginner Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <span className="text-gray-700 font-medium">Flexible Schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-8 w-8 text-blue-600" />
                <span className="text-gray-700 font-medium">Personalized Learning</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Main Circle */}
            <div className="w-80 h-80 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full flex items-center justify-center relative">
              <div className="text-6xl text-white font-bold">مرحبا</div>
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4"
              >
                <Badge className="bg-white text-blue-600 shadow-lg px-4 py-2 text-sm font-semibold">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </Badge>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute -bottom-4 -left-4"
              >
                <Badge className="bg-white text-emerald-600 shadow-lg px-4 py-2 text-sm font-semibold">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Human Teacher
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}