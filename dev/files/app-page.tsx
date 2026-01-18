export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-harlingen-blue text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-harlingen-blue font-bold text-xl">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">City of Harlingen</h1>
                <p className="text-sm text-white/80">Official Website</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="hover:text-harlingen-gold transition">Government</a>
              <a href="#" className="hover:text-harlingen-gold transition">Services</a>
              <a href="#" className="hover:text-harlingen-gold transition">Residents</a>
              <a href="#" className="hover:text-harlingen-gold transition">Business</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-harlingen-blue to-harlingen-green text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Harlingen, Texas
          </h2>
          <p className="text-xl mb-8 text-white/90">
            The City Beside the Sea
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-harlingen-gold hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition">
              Pay Utilities
            </button>
            <button className="bg-white text-harlingen-blue hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition">
              Report an Issue
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          City Services
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <ServiceCard
            title="Utilities"
            description="Water, electric, and trash services"
            icon="💧"
          />
          <ServiceCard
            title="Public Works"
            description="Street maintenance and infrastructure"
            icon="🏗️"
          />
          <ServiceCard
            title="Parks & Recreation"
            description="Community programs and facilities"
            icon="🌳"
          />
          <ServiceCard
            title="Police Department"
            description="Public safety and emergency services"
            icon="👮"
          />
          <ServiceCard
            title="Fire Department"
            description="Fire protection and rescue services"
            icon="🚒"
          />
          <ServiceCard
            title="Permits & Licenses"
            description="Building permits and business licenses"
            icon="📋"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-gray-800">
            Quick Links
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <QuickLink text="Pay Water Bill" />
            <QuickLink text="Trash Schedule" />
            <QuickLink text="City Council" />
            <QuickLink text="Job Opportunities" />
            <QuickLink text="City Code" />
            <QuickLink text="Meeting Agendas" />
            <QuickLink text="Contact Us" />
            <QuickLink text="Events Calendar" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-harlingen-blue text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">City of Harlingen, Texas</p>
          <p className="text-sm text-white/70">
            118 E. Tyler Ave, Harlingen, TX 78550 | Phone: (956) 216-5000
          </p>
          <p className="text-xs text-white/50 mt-4">
            © 2025 City of Harlingen. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

function ServiceCard({ title, description, icon }: { 
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600">{description}</p>
      <a href="#" className="text-harlingen-blue hover:text-harlingen-gold mt-4 inline-block font-medium">
        Learn More →
      </a>
    </div>
  )
}

function QuickLink({ text }: { text: string }) {
  return (
    <a 
      href="#" 
      className="bg-white p-4 rounded hover:bg-harlingen-gold hover:text-white transition text-center font-medium"
    >
      {text}
    </a>
  )
}
