import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ChatWidget from './ChatWidget.jsx'
import AgentConsole from './AgentConsole.jsx'
import { CHAT_API_BASE } from './chatConfig.js'
import { getVisitorId } from './chatIdentity.js'

const assetBase = import.meta.env.BASE_URL
const heroVideoSrc = `${assetBase}videos/bg.mp4`
const practiceVideoSrc = `${assetBase}videos/practice.mp4`
const aboutVideoSrc = `${assetBase}videos/about.mp4`
const brandLogoSrc = `${assetBase}logo.png`
const videoFallbackBase = '/Hello/'

function videoSourcesFor(fileName) {
  const candidates = [
    `${assetBase}videos/${fileName}`,
    `${videoFallbackBase}videos/${fileName}`,
    `/videos/${fileName}`,
  ]
  return [...new Set(candidates)]
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Practice Areas' },
  { id: 'team', label: 'Professionals' },
  { id: 'insights', label: 'Insights' },
  { id: 'contact', label: 'Contact' },
]

const serviceCards = [
  {
    id: 'formation-governance',
    title: 'Business Formation & Governance',
    description:
      'Entity structuring, shareholder agreements, and board governance frameworks for long-term stability.',
    timeline: '1-3 weeks for foundational structuring',
    process: 'Assessment, ownership framework design, and governance implementation.',
  },
  {
    id: 'commercial-contracts',
    title: 'Commercial Contracts',
    description:
      'Drafting and negotiation support for vendor, licensing, service, and strategic partnership agreements.',
    timeline: '3-10 business days for core contract cycles',
    process: 'Clause risk review, redlining strategy, and negotiation support.',
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute Resolution',
    description:
      'Commercial dispute strategy and representation focused on reducing risk and protecting reputation.',
    timeline: '24-72 hour response for urgent disputes',
    process: 'Rapid case triage, leverage analysis, and dispute posture planning.',
  },
]

const teamMembers = [
  {
    name: 'Avery Collins',
    role: 'Managing Partner',
    focus: 'Corporate Strategy and Board Advisory',
    bio: 'Leads cross-border transactions and governance strategy for growth-stage and mid-market companies.',
  },
  {
    name: 'Jordan Reyes',
    role: 'Partner',
    focus: 'Contracts and Commercial Operations',
    bio: 'Advises executive teams on contract architecture, risk allocation, and strategic negotiations.',
  },
  {
    name: 'Morgan Patel',
    role: 'Senior Counsel',
    focus: 'Commercial Litigation',
    bio: 'Focuses on complex business disputes, urgent injunction matters, and crisis-response legal strategy.',
  },
]

const insights = [
  {
    id: 'cross-border-contract-enforcement',
    title: 'Cross-Border Contract Enforcement for International Vendors',
    date: 'March 22, 2026',
    category: 'Contracts',
    serviceId: 'commercial-contracts',
    summary:
      'A strategic briefing on contract enforceability, risk transfer clauses, and dispute readiness for international operations.',
  },
  {
    id: 'minority-shareholder-protection',
    title: 'Protecting Minority Shareholders in Mid-Market Companies',
    date: 'March 14, 2026',
    category: 'Corporate Governance',
    serviceId: 'formation-governance',
    summary:
      'Practical protections for minority positions, board process controls, and governance dispute prevention.',
  },
  {
    id: 'commercial-dispute-risk-reduction',
    title: 'How to Reduce Risk During High-Value Commercial Disputes',
    date: 'January 24, 2026',
    category: 'Dispute Resolution',
    serviceId: 'dispute-resolution',
    summary:
      'How leadership teams can manage litigation posture, preserve leverage, and protect business continuity.',
  },
]

const homeHighlights = [
  {
    label: 'Business-First',
    text: 'Counsel aligned with operational and commercial goals.',
  },
  {
    label: 'Responsive',
    text: 'Clear communication and rapid strategic guidance.',
  },
  {
    label: 'Outcome-Driven',
    text: 'Legal solutions built for stability and long-term growth.',
  },
]

const homeServicePillars = [
  {
    title: 'M&A and Investment Counsel',
    detail: 'Deal structuring, diligence, and negotiation support.',
  },
  {
    title: 'Contract Systems',
    detail: 'Drafting and review workflows that scale with operations.',
  },
  {
    title: 'Workforce and Leadership Risk',
    detail: 'Employment strategy, executive agreements, and policy controls.',
  },
  {
    title: 'Commercial Dispute Defense',
    detail: 'Practical litigation posture focused on leverage and outcomes.',
  },
  {
    title: 'Entity Structuring',
    detail: 'Formation, ownership frameworks, and governance mechanics.',
  },
  {
    title: 'Regulatory Readiness',
    detail: 'Compliance planning for durable, audit-ready growth.',
  },
]

const homeTrustPoints = [
  {
    title: 'Commercial Grounding',
    text: 'Counsel shaped by financial, operational, and leadership realities.',
  },
  {
    title: 'Senior-Led Work',
    text: 'Direct attorney involvement from planning through execution.',
  },
  {
    title: 'Cross-Discipline Coverage',
    text: 'Transactions, disputes, and governance coordinated as one strategy.',
  },
  {
    title: 'Scaling Support',
    text: 'Frameworks that support growth, compliance, and board confidence.',
  },
]

function HomePage({ onNavigate }) {
  return (
    <>
      <section className="hero-shell">
        <div className="hero-video-wrap" aria-hidden="true">
          <video className="hero-video" src={heroVideoSrc} autoPlay loop muted playsInline>
            {videoSourcesFor('bg.mp4').map((src) => (
              <source key={src} src={src} type="video/mp4" />
            ))}
          </video>
          <div className="hero-overlay" />
        </div>

        <div className="hero-content reveal">
          <span className="badge">Business Law Counsel</span>
          <h1>Practical legal strategy for modern companies and leadership teams.</h1>
          <p>
            Sequoia Law Group advises founders, executives, and established
            businesses with clear legal strategy aligned to commercial outcomes.
          </p>
          <div className="hero-actions">
            <button className="btn btn-gold" onClick={() => onNavigate('contact')}>
              Schedule a Strategy Call
            </button>
            <button className="btn btn-dark" onClick={() => onNavigate('services')}>
              Explore Services
            </button>
          </div>
          <p className="hero-proof">
            Senior-led counsel with a 1 business day response target for new inquiries.
          </p>

          <section className="home-info-grid">
            {homeHighlights.map((item) => (
              <article key={item.label} className="home-info-card">
                <p>{item.label}</p>
                <h3>{item.text}</h3>
              </article>
            ))}
          </section>

        </div>

        <section className="insight-strip reveal reveal-delay">
          {insights.map((item) => (
            <article key={item.title} className="insight-card">
              <h2>{item.title}</h2>
              <p>{item.date}</p>
            </article>
          ))}
        </section>
      </section>

      <section className="container">
        <section className="home-trust-band reveal">
          <article className="home-trust-lead">
            <p className="section-kicker section-kicker-gold">What We Deliver</p>
            <h3>Legal partnership built for momentum, not just paperwork.</h3>
          </article>
          {homeTrustPoints.map((point) => (
            <article key={point.title} className="home-trust-point">
              <p>{point.title}</p>
              <h4>{point.text}</h4>
            </article>
          ))}
        </section>

        <section className="home-story-split reveal">
          <div className="home-story-media" aria-hidden="true">
            <video src={aboutVideoSrc} autoPlay loop muted playsInline>
              {videoSourcesFor('about.mp4').map((src) => (
                <source key={src} src={src} type="video/mp4" />
              ))}
            </video>
          </div>
          <article className="home-story-copy">
            <p className="section-kicker">Our Approach</p>
            <h2>Trusted business counsel for teams making high-stakes decisions.</h2>
            <p>
              We work alongside founders, executives, and in-house teams to resolve
              legal pressure points before they become operational setbacks.
            </p>
            <p>
              From critical contract cycles to dispute readiness and governance
              planning, we prioritize clear direction and timely execution.
            </p>
            <button className="btn btn-gold" onClick={() => onNavigate('contact')}>
              Schedule a Strategy Call
            </button>
          </article>
        </section>

        <section className="home-seamless-window reveal">
          <section className="home-signature-wrap">
            <div className="section-head">
              <p className="section-kicker">Core Capabilities</p>
              <h2>Built for business pressure, growth, and governance.</h2>
            </div>
            <section className="home-signature-grid" aria-label="Core business law capabilities">
              {homeServicePillars.map((pillar) => (
                <article key={pillar.title} className="home-signature-card">
                  <p>{pillar.title}</p>
                  <h3>{pillar.detail}</h3>
                </article>
              ))}
            </section>
          </section>

          <section className="section home-why-block">
            <div className="section-head">
              <p className="section-kicker">Why Sequoia</p>
              <h2>Business-first counsel with legal depth.</h2>
            </div>
            <div className="split">
              <article className="panel panel-light">
                <p className="section-kicker section-kicker-dark">Strategic Focus</p>
                <p>
                  We combine legal precision with business context so your team moves
                  faster with less risk.
                </p>
              </article>
              <article className="panel panel-dark">
                <p className="section-kicker section-kicker-gold">Execution</p>
                <p>
                  Rapid response, practical guidance, and disciplined process for
                  critical business decisions.
                </p>
              </article>
            </div>
          </section>
        </section>
      </section>
    </>
  )
}

function AboutPage() {
  const aboutHighlights = [
    {
      label: 'Client-Centered',
      text: 'Direct access to senior counsel and clear communication at every stage.',
    },
    {
      label: 'Business-Aligned',
      text: 'Legal strategy built around operational realities and growth priorities.',
    },
    {
      label: 'Execution Focus',
      text: 'Practical advice with disciplined follow-through on deadlines and outcomes.',
    },
  ]

  return (
    <section className="page-block page-block-flush reveal">
      <section className="about-cinematic about-hero">
        <div className="about-video-wrap" aria-hidden="true">
          <video className="about-video" src={aboutVideoSrc} autoPlay loop muted playsInline>
            {videoSourcesFor('about.mp4').map((src) => (
              <source key={src} src={src} type="video/mp4" />
            ))}
          </video>
          <div className="about-video-overlay" />
        </div>

        <div className="about-content">
          <p className="section-kicker section-kicker-gold">About Us</p>
          <section className="about-highlight-grid">
            {aboutHighlights.map((item) => (
              <article key={item.label} className="about-highlight-card">
                <p>{item.label}</p>
                <h3>{item.text}</h3>
              </article>
            ))}
          </section>
          <h2>A trusted legal partner for growth-minded businesses.</h2>
          <p>
            Sequoia Law Group is a business law firm focused on helping companies
            scale responsibly through strong contracts, structured governance, and
            practical risk management.
          </p>
          <p>
            Our team works closely with founders, leadership teams, and boards to
            align legal guidance with operational priorities and commercial strategy.
          </p>
        </div>
      </section>

      <section className="container">
        <article className="section">
          <p className="lead">
            We advise on transactions, disputes, and governance questions with a
            business-first perspective and disciplined execution.
          </p>
        </article>
      </section>
    </section>
  )
}

function ServicesPage({ onOpenService }) {
  const featuredMatters = [
    {
      title: 'Shareholder Rights During Governance Disputes',
      tag: 'Featured Matter',
    },
    {
      title: 'Drafting Enforceable International Vendor Agreements',
      tag: 'Business Contract',
    },
    {
      title: 'Crisis Response in High-Stakes Commercial Litigation',
      tag: 'Case Strategy',
    },
  ]
  return (
    <section className="page-block reveal">
      <section className="practice-cinematic practice-hero">
        <div className="practice-video-wrap" aria-hidden="true">
          <video
            className="practice-video"
            src={practiceVideoSrc}
            autoPlay
            loop
            muted
            playsInline
          >
            {videoSourcesFor('practice.mp4').map((src) => (
              <source key={src} src={src} type="video/mp4" />
            ))}
          </video>
          <div className="practice-video-overlay" />
        </div>

        <div className="practice-content">
          <p className="section-kicker section-kicker-gold">Practice Areas</p>
          <section className="practice-feature-grid">
            {featuredMatters.map((item) => (
              <article key={item.title} className="practice-feature-card">
                <p>{item.tag}</p>
                <h3>{item.title}</h3>
              </article>
            ))}
          </section>
          <h2>Business law counsel for complex, high-impact decisions.</h2>
          <p>
            We support organizations through transactions, disputes, and governance
            matters with strategy built for business continuity.
          </p>
        </div>

      </section>

      <div className="container">
        <div className="section-head">
          <p className="section-kicker">Core Services</p>
          <h2>Core legal services for modern businesses.</h2>
        </div>
        <div className="cards">
          {serviceCards.map((card) => (
            <article key={card.title} className="card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button className="service-link" onClick={() => onOpenService(card.id)}>
                View service details
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceDetailPage({ serviceId, onBack, onNavigate }) {
  const service = serviceCards.find((item) => item.id === serviceId)
  if (!service) {
    return (
      <section className="container page-block reveal">
        <article className="section">
          <h2>Service not found.</h2>
          <button className="btn btn-dark" onClick={onBack}>
            Back to Services
          </button>
        </article>
      </section>
    )
  }

  const relatedInsights = insights.filter((item) => item.serviceId === serviceId)

  return (
    <section className="container page-block reveal">
      <article className="section">
        <p className="section-kicker">Service Detail</p>
        <h2>{service.title}</h2>
        <p className="lead">{service.description}</p>
        <p>
          <strong>Process:</strong> {service.process}
        </p>
        <p>
          <strong>Typical timeline:</strong> {service.timeline}
        </p>
        <div className="service-detail-actions">
          <button className="btn btn-dark" onClick={onBack}>
            Back to Services
          </button>
          <button className="btn btn-gold" onClick={() => onNavigate('contact')}>
            Schedule a Strategy Call
          </button>
        </div>
      </article>
      <article className="section">
        <p className="section-kicker">Related Insights</p>
        <div className="insight-list">
          {relatedInsights.map((item) => (
            <article key={item.id} className="insight-item">
              <p className="insight-category">{item.category}</p>
              <h3>{item.title}</h3>
              <p className="insight-date">{item.date}</p>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

function TeamPage() {
  return (
    <section className="container page-block reveal">
      <div className="section-head">
        <p className="section-kicker">Professionals</p>
        <h2>Experienced counsel across corporate, contract, and dispute matters.</h2>
      </div>
      <section className="team-grid">
        {teamMembers.map((member) => (
          <article key={member.name} className="team-card">
            <div className="team-avatar" aria-hidden="true">
              {member.name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </div>
            <p className="team-role">{member.role}</p>
            <h3>{member.name}</h3>
            <p className="team-focus">{member.focus}</p>
            <p>{member.bio}</p>
          </article>
        ))}
      </section>
    </section>
  )
}

function InsightsPage({ onOpenService, onNavigate }) {
  const [featured, ...articles] = insights

  return (
    <section className="container page-block reveal">
      <div className="section-head">
        <p className="section-kicker">Insights</p>
        <h2>Practical legal insights for leadership teams.</h2>
      </div>

      <section className="insights-layout">
        <article className="insight-feature">
          <p className="insight-category">{featured.category}</p>
          <h3>{featured.title}</h3>
          <p className="insight-date">{featured.date}</p>
          <p>{featured.summary}</p>
          <button className="service-link" onClick={() => onOpenService(featured.serviceId)}>
            Related service
          </button>
        </article>

        <div className="insight-list">
          {articles.map((item) => (
            <article key={item.title} className="insight-item">
              <p className="insight-category">{item.category}</p>
              <h3>{item.title}</h3>
              <p className="insight-date">{item.date}</p>
              <p>{item.summary}</p>
              <button className="service-link" onClick={() => onOpenService(item.serviceId)}>
                Related service
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="cards">
        {insights.map((item) => (
          <article key={item.title} className="card">
            <p className="insight-category">{item.category}</p>
            <h3>{item.title}</h3>
            <p className="insight-date">{item.date}</p>
            <p>{item.summary}</p>
            <button className="service-link" onClick={() => onOpenService(item.serviceId)}>
              Related service
            </button>
          </article>
        ))}
      </section>
      <button className="btn btn-gold" onClick={() => onNavigate('contact')}>
        Schedule a Strategy Call
      </button>
    </section>
  )
}

function ContactPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [caseType, setCaseType] = useState('Business Formation')
  const [message, setMessage] = useState('')
  const [method, setMethod] = useState('email')
  const [status, setStatus] = useState('')
  const [isSending, setIsSending] = useState(false)

  const caseOptions = [
    'Business Formation',
    'Contracts and Agreements',
    'Commercial Disputes',
    'Regulatory and Compliance',
    'General Business Inquiry',
  ]

  async function handleAutoSend(event) {
    event.preventDefault()
    if (method !== 'chat') return

    const cleanMessage = message.trim()
    if (!fullName.trim() || !email.trim() || !cleanMessage) {
      setStatus('Please complete name, email, and inquiry details.')
      return
    }

    setIsSending(true)
    setStatus('')
    try {
      const visitorId = getVisitorId()
      const response = await fetch(`${CHAT_API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: 'sequoia-website',
          sender: visitorId,
          senderLabel: fullName.trim() || 'Website Visitor',
          role: 'visitor',
          text: `New inquiry\nCase type: ${caseType}\nEmail: ${email.trim()}\nMessage: ${cleanMessage}`,
        }),
      })

      if (response.ok) {
        setStatus('Inquiry sent to our team. We will follow up shortly.')
        setMessage('')
      } else {
        setStatus('Could not send automatically. Please use email option.')
      }
    } catch {
      setStatus('Could not connect to chat server. Please use email option.')
    } finally {
      setIsSending(false)
    }
  }

  function validateRequiredFields() {
    const cleanMessage = message.trim()
    if (!fullName.trim() || !email.trim() || !cleanMessage) {
      setStatus('Please complete name, email, and inquiry details.')
      return false
    }
    return true
  }

  const emailSubject = encodeURIComponent(`New ${caseType} inquiry from ${fullName || 'Website Visitor'}`)
  const emailBody = encodeURIComponent(
    `Full Name: ${fullName}\nEmail: ${email}\nCase Type: ${caseType}\n\nMessage:\n${message}`,
  )

  return (
    <section className="container page-block reveal">
      <div className="section-head">
        <p className="section-kicker">Contact</p>
        <h2>Tell us about your matter and we will respond promptly.</h2>
      </div>
      <section className="contact-layout">
        <article className="panel panel-dark contact-main">
          <p className="section-kicker section-kicker-gold">Primary Contact</p>
          <h3>Sequoia Law Group</h3>
          <p>
            123 Justice Avenue, Suite 400
            <br />
            Your City, ST 00000
          </p>
          <p>(555) 123-4567</p>
          <a href="mailto:intake@sequolaw.com" className="email-link">
            intake@sequolaw.com
          </a>
          <p className="contact-help-text">
            Expect a response within 1 business day. Your details are used only for intake follow-up.
          </p>
        </article>

        <form className="panel panel-light inquiry-form" onSubmit={handleAutoSend}>
          <p className="section-kicker section-kicker-dark">Inquire Now</p>
          <label className="field-label" htmlFor="full-name">Full Name</label>
          <input
            id="full-name"
            className="contact-input"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
            required
          />

          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="contact-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label className="field-label" htmlFor="case-type">Type of Case</label>
          <select
            id="case-type"
            className="contact-input"
            value={caseType}
            onChange={(event) => setCaseType(event.target.value)}
          >
            {caseOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <label className="field-label" htmlFor="message">Message</label>
          <textarea
            id="message"
            className="contact-textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Briefly explain your inquiry."
            required
          />

          <div className="contact-methods">
            <button
              type="button"
              className={`method-btn ${method === 'email' ? 'is-active' : ''}`}
              onClick={() => setMethod('email')}
            >
              Send via Email
            </button>
            <button
              type="button"
              className={`method-btn ${method === 'chat' ? 'is-active' : ''}`}
              onClick={() => setMethod('chat')}
            >
              Send Automatically
            </button>
          </div>

          {method === 'email' ? (
            <a
              className="btn btn-gold contact-submit"
              href={`mailto:intake@sequolaw.com?subject=${emailSubject}&body=${emailBody}`}
              onClick={(event) => {
                if (!validateRequiredFields()) {
                  event.preventDefault()
                }
              }}
            >
              Schedule a Strategy Call via Email
            </a>
          ) : (
            <button className="btn btn-gold contact-submit" type="submit" disabled={isSending}>
              {isSending ? 'Sending...' : 'Schedule a Strategy Call'}
            </button>
          )}

          {status ? <p className="contact-status">{status}</p> : null}
        </form>
      </section>
    </section>
  )
}

export default function App() {
  const isAgentView = new URLSearchParams(window.location.search).get('agent') === '1'
  const [activePage, setActivePage] = useState('home')
  const [activeServiceId, setActiveServiceId] = useState(serviceCards[0].id)

  useEffect(() => {
    const titles = {
      home: 'Sequoia Law Group | Business Law Counsel',
      about: 'About | Sequoia Law Group',
      services: 'Services | Sequoia Law Group',
      serviceDetail: 'Service Detail | Sequoia Law Group',
      team: 'Professionals | Sequoia Law Group',
      insights: 'Insights | Sequoia Law Group',
      contact: 'Schedule a Strategy Call | Sequoia Law Group',
    }
    document.title = titles[activePage] ?? titles.home
  }, [activePage])

  function openService(serviceId) {
    setActiveServiceId(serviceId)
    setActivePage('serviceDetail')
  }

  const page = useMemo(() => {
    if (activePage === 'about') return <AboutPage />
    if (activePage === 'services') return <ServicesPage onOpenService={openService} />
    if (activePage === 'serviceDetail') {
      return (
        <ServiceDetailPage
          serviceId={activeServiceId}
          onBack={() => setActivePage('services')}
          onNavigate={setActivePage}
        />
      )
    }
    if (activePage === 'team') return <TeamPage />
    if (activePage === 'insights') {
      return <InsightsPage onOpenService={openService} onNavigate={setActivePage} />
    }
    if (activePage === 'contact') return <ContactPage />

    return <HomePage onNavigate={setActivePage} />
  }, [activePage, activeServiceId])

  if (isAgentView) {
    return <AgentConsole />
  }

  return (
    <main className="site">
      <header className="topbar">
        <button className="brand brand-btn" onClick={() => setActivePage('home')}>
          <img src={brandLogoSrc} alt="Sequoia Law Group logo" className="brand-logo" />
          <span className="brand-text">SEQUOIA LAW GROUP</span>
        </button>
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-link ${activePage === item.id ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className="nav-cta" onClick={() => setActivePage('contact')}>
          Contact Us
        </button>
      </header>

      <section key={activePage} className="page-transition">
        {page}
      </section>

      <footer className="footer-note site-footer">
        <p>
          Sequoia Law Group | Bar admissions and jurisdiction-specific services available on request.
          This website is attorney advertising and does not create an attorney-client relationship.
        </p>
      </footer>

      <ChatWidget />
    </main>
  )
}