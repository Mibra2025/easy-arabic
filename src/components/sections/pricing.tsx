'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

const pricingPlans = [
  {
    name: 'AI Only',
    price: 19,
    description: 'Perfect for self-directed learners',
    features: [
      { name: 'Unlimited AI lessons', included: true },
      { name: 'Speech recognition', included: true },
      { name: 'Progress tracking', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Human teacher sessions', included: false }
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const,
    popular: false
  },
  {
    name: 'Hybrid Learning',
    price: 49,
    description: 'Best of both worlds',
    features: [
      { name: 'Everything in AI Only', included: true },
      { name: '4 human teacher sessions', included: true },
      { name: 'Cultural lessons', included: true },
      { name: 'Live conversation groups', included: true },
      { name: 'Priority support', included: true }
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'default' as const,
    popular: true
  },
  {
    name: 'Premium',
    price: 99,
    description: 'Complete learning experience',
    features: [
      { name: 'Everything in Hybrid', included: true },
      { name: 'Unlimited human sessions', included: true },
      { name: '1-on-1 dedicated teacher', included: true },
      { name: 'Custom learning plan', included: true },
      { name: 'Certificate program', included: true }
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
    popular: false
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible plans designed to fit your learning goals and budget
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''
              }`}>
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          feature.included 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {feature.included ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </div>
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}