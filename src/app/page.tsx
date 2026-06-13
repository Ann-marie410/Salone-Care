import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🏥 SaloneCare</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 rounded hover:bg-blue-700 transition">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition font-semibold">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Wave */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 py-20 px-4 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">Healthcare for Everyone</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
            Your Digital Healthcare Partner
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            Connect with trusted doctors and pharmacies. Get healthcare services when you need them, where you need them.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/signup" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-semibold text-lg">
              Get Started Free
            </Link>
            <Link href="#features" className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-semibold text-lg">
              Learn More
            </Link>
          </div>
        </div>

        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 Q360,0 720,40 T1440,40 L1440,120 L0,120 Z" fill="#dbeafe" opacity="0.5"></path>
          <path d="M0,60 Q360,20 720,60 T1440,60 L1440,120 L0,120 Z" fill="#bfdbfe" opacity="0.7"></path>
          <path d="M0,80 Q360,40 720,80 T1440,80 L1440,120 L0,120 Z" fill="#93c5fd"></path>
        </svg>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Amazing Features</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Everything you need for better healthcare</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📅", title: "Easy Appointments", desc: "Book appointments with verified doctors instantly" },
              { icon: "💬", title: "Direct Messaging", desc: "Real-time chat with your healthcare provider" },
              { icon: "🤖", title: "AI Assistant", desc: "Get personalized health guidance 24/7" },
              { icon: "💊", title: "We Heath Pharmacy", desc: "Affordable medicines from NLE 10 at your trusted pharmacy" },
              { icon: "🏥", title: "Hospital Locator", desc: "Find nearby hospitals and pharmacies easily" },
              { icon: "🚨", title: "Emergency Contacts", desc: "Quick access to emergency services anytime" }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl hover:shadow-xl transition-all hover:border-blue-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">🤖 AI Health Assistant</h3>
          <p className="mb-6 text-gray-700 text-lg">Chat with our intelligent assistant for health guidance and medical information</p>
          <Link href="/ai-assistant" className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-semibold">
            Try AI Assistant
          </Link>
        </div>
      </section>

      {/* Pharmacy Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">💊 We Heath Pharmacy</h3>
          <p className="mb-6 text-gray-700 text-lg">Quality medicines from NLE 10. Visit us or call 077578317</p>
          <Link href="/pharmacy" className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-semibold">
            Browse Medicines
          </Link>
        </div>
      </section>

      {/* Hospital Locator Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">🏥 Find Nearby Facilities</h3>
          <p className="mb-6 text-gray-700 text-lg">Discover hospitals and pharmacies near you with real-time directions</p>
          <Link href="/locator" className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg font-semibold">
            Find Facilities
          </Link>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-2 text-red-600">🚨 Emergency?</h3>
          <p className="mb-6 text-gray-700 text-lg">Get immediate access to emergency services and contacts</p>
          <Link href="/emergency" className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold">
            Emergency Contacts
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        {/* Wave background */}
        <svg className="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 Q360,0 720,40 T1440,40 L1440,120 L0,120 Z" fill="white"></path>
        </svg>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of patients getting better healthcare today</p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all shadow-lg font-semibold text-lg">
            Create Your Account Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-xl">SaloneCare</h4>
              <p className="text-sm text-gray-400">Your trusted healthcare platform for Sierra Leone</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><Link href="/appointments" className="hover:text-white transition">Appointments</Link></li>
                <li><Link href="/ai-assistant" className="hover:text-white transition">AI Assistant</Link></li>
                <li><Link href="/locator" className="hover:text-white transition">Hospital Locator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">© 2024 SaloneCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
