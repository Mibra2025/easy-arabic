import { Moon, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const footerSections = [
  {
    title: 'Learning',
    links: [
      { name: 'Beginner Courses', href: '#' },
      { name: 'Intermediate Courses', href: '#' },
      { name: 'Advanced Courses', href: '#' },
      { name: 'Cultural Studies', href: '#' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'AI Tutor Guide', href: '#' },
      { name: 'Technical Support', href: '#' },
      { name: 'Community Forum', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Our Teachers', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Privacy Policy', href: '#' }
    ]
  }
]

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' }
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold">Easy Arabic</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Making Arabic accessible to everyone through innovative teaching methods 
              that combine human expertise with AI technology.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 Easy Arabic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}