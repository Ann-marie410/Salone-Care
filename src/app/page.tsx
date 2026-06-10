import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">SaloneCare</h1>
          <p className="text-xl mb-6">Your trusted digital healthcare platform connecting patients with doctors and pharmacies across Sierra Leone</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-white text-blue-600 px-6 py-3 rounded font-semibold hover:bg-gray-100">
              Get Started
            </Link>
            <Link href="/login" className="bg-transparent border-2 border-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-blue-600">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-2">📅 Easy Appointments</h3>
              <p>Book appointments with verified doctors at your convenience</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-2">💬 Direct Messaging</h3>
              <p>Real-time messaging with your healthcare provider</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-2">🤖 AI Assistant</h3>
              <p>Get health guidance from our intelligent health assistant (not a diagnosis)</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-2">💊 Digital Prescriptions</h3>
              <p>Secure prescription management and pharmacy verification</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-2">🏥 Hospital Locator</h3>
              <p>Find nearby hospitals and pharmacies using GPS</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-2">🚨 Emergency Contacts</h3>
              <p>Quick access to emergency services in your area</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">AI Health Assistant</h2>
          <p className="mb-6 text-gray-600">Chat with our intelligent assistant for health guidance (not medical diagnosis)</p>
          <Link href="/ai-assistant" className="inline-block bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700">
            Try AI Assistant
          </Link>
        </div>
      </section>

      {/* Hospital Locator */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Hospital & Pharmacy Locator</h2>
          <p className="mb-6 text-gray-600">Find healthcare facilities near you with directions</p>
          <Link href="/locator" className="inline-block bg-purple-600 text-white px-6 py-3 rounded font-semibold hover:bg-purple-700">
            Find Facilities
          </Link>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-16 px-4 bg-red-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Emergency?</h2>
          <p className="mb-6 text-gray-600">Quick access to emergency services</p>
          <Link href="/emergency" className="inline-block bg-red-600 text-white px-6 py-3 rounded font-semibold hover:bg-red-700">
            Emergency Contacts
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3">SaloneCare</h4>
              <p className="text-sm text-gray-400">Your trusted healthcare platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Product</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><Link href="/appointments">Appointments</Link></li>
                <li><Link href="/ai-assistant">AI Assistant</Link></li>
                <li><Link href="/locator">Locator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Users</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><Link href="/signup">Sign Up</Link></li>
                <li><Link href="/login">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
            <p>&copy; 2024 SaloneCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
