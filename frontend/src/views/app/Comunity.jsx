// pages/app/Community.jsx
import Link from "next/link";

export default function Community() {
  const features = [
    {
      icon: "💬",
      title: "Real-time Discussions",
      description: "Connect with peers in live conversations about job searches, interview prep, and career advice."
    },
    {
      icon: "👥",
      title: "Study Groups",
      description: "Form or join small groups to prepare for technical interviews and system design together."
    },
    {
      icon: "💼",
      title: "Job Board",
      description: "Exclusive job postings shared by members and recruiters from top tech companies."
    },
    {
      icon: "🎓",
      title: "Mentorship Program",
      description: "Get 1-on-1 guidance from industry veterans who've been through similar transitions."
    },
    {
      icon: "📅",
      title: "Live Events",
      description: "Weekly workshops, AMAs with hiring managers, and networking mixers."
    },
    {
      icon: "🏆",
      title: "Success Stories",
      description: "Learn from members who successfully landed roles at Google, Stripe, Microsoft, and more."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Now at Stripe",
      former: "Ex-Google PM",
      content: "This community was instrumental in my interview prep. The mock interview sessions and resume reviews made all the difference.",
      avatar: "SC",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Michael Rodriguez",
      role: "Now at Microsoft",
      former: "Senior SWE at Meta",
      content: "Found my current role through a job posting shared here. Beyond grateful for the support system during a tough transition.",
      avatar: "MR",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Emily Watson",
      role: "Tech Recruiter",
      former: "Ex-Amazon Recruiter",
      content: "I've placed 12 candidates from this community in the last 3 months. The talent here is incredible.",
      avatar: "EW",
      color: "from-green-500 to-green-600"
    }
  ];

  const stats = [
    { value: "12,000+", label: "Community Members" },
    { value: "450+", label: "Job Placements" },
    { value: "2,500+", label: "Study Group Sessions" },
    { value: "94%", label: "Member Satisfaction" }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              12,000+ Members Strong
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              You're Not Alone in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> This Journey</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join a supportive community of tech professionals navigating career transitions.
              Share experiences, get advice, and open doors together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/community/join"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Join the Community →
              </Link>
              <Link
                href="/community/about"
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-gray-200">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our community provides resources, connections, and support at every stage of your career transition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories From Members
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real people, real results. See how our community has helped others land their next role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-green-600 font-medium">{testimonial.role}</p>
                    <p className="text-xs text-gray-400">{testimonial.former}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="mt-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Get instant access to discussions, job postings, study groups, and mentorship opportunities.
          </p>
          <Link
            href="/community/join"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            Get Started Free
            <span className="text-lg">→</span>
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Free to join • No spam • Leave anytime
          </p>
        </div>
      </div>
    </div>
  );
}
