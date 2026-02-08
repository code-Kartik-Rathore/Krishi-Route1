import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  Sprout,
  BarChart3,
  Target,
  IndianRupee,
  ShieldCheck,
  Truck,
  Clock,
  MapPinned,
  Heart,
  Quote,
  ChevronRight,
} from 'lucide-react';
import CalculatorCard from '../components/CalculatorCard';

const HIGHLIGHTS = [
  'Live government mandi prices',
  'Transport-aware profit calculation',
  'Smart mandi recommendations',
];

const STEPS = [
  {
    icon: Sprout,
    title: 'Select crop & quantity',
    description: 'Choose your crop and how much you want to sell (in quintals).',
  },
  {
    icon: Truck,
    title: 'Choose transport & location',
    description: 'Pick your vehicle and enter your location for accurate distance.',
  },
  {
    icon: BarChart3,
    title: 'Fetch live mandi prices',
    description: 'We use official government API to get real-time prices across mandis.',
  },
  {
    icon: Target,
    title: 'Get best mandi with max profit',
    description: 'We recommend the mandi that gives you the highest net profit.',
  },
];

const BENEFITS = [
  { icon: IndianRupee, title: 'Higher profit per trip', desc: 'Sell where you earn more, not just where it\'s nearest.' },
  { icon: ShieldCheck, title: 'Verified government data', desc: 'Prices from data.gov.in — transparent and trustworthy.' },
  { icon: Truck, title: 'Transport-aware pricing', desc: 'Fuel and vehicle cost included in every recommendation.' },
  { icon: Clock, title: 'Saves time & fuel', desc: 'One decision, one route — no guesswork.' },
  { icon: MapPinned, title: 'Location-based results', desc: 'Recommendations based on your actual location.' },
  { icon: Heart, title: 'Farmer-first design', desc: 'Built for Indian farmers, in your language and context.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(var(--krishi-neutral-bg))]">
      {/* ─────────────────────────────────────────────────────────────────────
          NAV
          ───────────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white text-lg shadow-lg shadow-primary/25">
              🚜
            </span>
            <span className="font-heading font-bold text-slate-800">Krishi-Route</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live API
            </span>
            <a
              href="#calculator"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition"
            >
              Find best mandi
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO
          ───────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 via-transparent to-primary-muted/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920')] bg-cover bg-center opacity-[0.08]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight"
              >
                Find the most profitable mandi for your crops
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg sm:text-xl text-slate-600 max-w-xl"
              >
                Live government prices + transport cost = maximum farmer profit.
              </motion.p>
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 space-y-3"
              >
                {HIGHLIGHTS.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </motion.ul>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/40 transition"
                >
                  Find best mandi
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  See how it works
                </a>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600"
                alt="Farmer with smartphone in field"
                className="rounded-2xl shadow-2xl shadow-slate-300/50 border border-white/60 w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-xl p-4 max-w-[220px]">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Live price</p>
                <p className="text-xl font-bold text-primary">₹2,450 / qtl</p>
                <p className="text-sm text-slate-600">Azadpur Mandi</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          2. CALCULATOR CARD (CENTERPIECE)
          ───────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
            Try it now
          </h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Enter your details below. We’ll use live government data to find your best mandi.
          </p>
        </motion.div>
        <CalculatorCard />
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. HOW IT WORKS
          ───────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
              How it works
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Four simple steps from your field to the best mandi.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light text-primary mb-4">
                  <step.icon className="w-7 h-7" />
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary-muted to-transparent" />
                )}
                <h3 className="font-heading font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4. WHY KRISHI-ROUTE
          ───────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
            Why Krishi-Route?
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Built for Indian farmers, powered by government data.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-primary-muted/50 transition"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary mb-4">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. MAP & ROUTE VISUAL
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
                Not the nearest mandi — the smartest mandi
              </h2>
              <p className="mt-4 text-slate-600">
                We show you routes and compare real transport costs so you can choose the mandi that
                gives you the highest net profit, not just the one closest by.
              </p>
              <ul className="mt-6 space-y-3">
                {['India-wide mandi coverage', 'Route-aware distance & cost', 'Live price comparison'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1592502230717-6d1b2e64d43a?w=800"
                alt="Truck transporting produce"
                className="w-full h-72 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent text-white">
                <p className="text-sm font-medium">Route-aware profit calculation</p>
                <p className="text-xs text-slate-300 mt-0.5">Distance + vehicle cost = net profit</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          6. TRUST & CREDIBILITY
          ───────────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center shadow-sm"
        >
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Government API</p>
                <p className="text-sm text-slate-600">data.gov.in</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Real-time prices</p>
                <p className="text-sm text-slate-600">Updated regularly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Farmer-centric</p>
                <p className="text-sm text-slate-600">Built for you</p>
              </div>
            </div>
          </div>
          <p className="mt-8 text-slate-600 max-w-2xl mx-auto">
            Krishi-Route uses only official government mandi price data. No guesswork — just
            transparent, verifiable numbers to help you make the best selling decision.
          </p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          7. FARMER STORY / TESTIMONIAL
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-lg"
          >
            <Quote className="w-10 h-10 text-primary/30 mb-4" />
            <blockquote className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed">
              “Earlier I sold at the nearest mandi. Now I sell at the most profitable mandi.”
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-8 items-center">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=120"
                alt="Farmer"
                className="w-16 h-16 rounded-full object-cover border-4 border-primary-light"
              />
              <div>
                <p className="font-semibold text-slate-900">Farmer, North India</p>
                <p className="text-sm text-slate-600">Uses Krishi-Route for onion & potato</p>
              </div>
              <div className="ml-auto rounded-xl bg-primary-light px-4 py-2">
                <p className="text-xs font-medium text-slate-600">Before vs after</p>
                <p className="text-lg font-bold text-primary">+₹2,800 / trip</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          8. FINAL CTA
          ───────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-light/20 to-primary-muted/20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920')] bg-cover bg-center opacity-[0.06]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900"
          >
            Your hard work deserves the best price.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-slate-600 max-w-xl mx-auto"
          >
            Join farmers who are already making smarter mandi choices with live government data.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Link
              to="#calculator"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg shadow-xl shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/40 transition"
            >
              Find my best mandi
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          9. FOOTER
          ───────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white text-lg">
                🚜
              </span>
              <div>
                <span className="font-heading font-bold text-slate-900">Krishi-Route</span>
                <p className="text-xs text-slate-500">Smart mandi discovery & profit optimization</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#how-it-works" className="text-slate-600 hover:text-primary font-medium">
                How it works
              </a>
              <a href="#calculator" className="text-slate-600 hover:text-primary font-medium">
                Find mandi
              </a>
              <a href="#calculator" className="text-slate-600 hover:text-primary font-medium">
                Contact
              </a>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Built for Indian farmers 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
}
