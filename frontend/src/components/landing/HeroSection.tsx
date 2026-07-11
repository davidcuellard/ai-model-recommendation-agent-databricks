import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const words = ['Find', 'the', 'Right', 'AI', 'Model.', 'Instantly.']

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0f1e] px-6 text-center">
      {/* Animated grid background */}
      <div
        className="animate-grid-pan pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-gray-800/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400"
        >
          {/* Databricks logomark */}
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7.5V12l10 5.5L22 12V7.5L12 2zm0 2.31L20.08 9 12 13.69 3.92 9 12 4.31zM3.92 13.31L12 18l8.08-4.69V10.5L12 15.19 3.92 10.5v2.81z" />
          </svg>
          Powered by Databricks · Real World Architecture
        </motion.div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="mr-3 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl"
        >
          Describe what you want to build. The agent decomposes it into subtasks and
          recommends the best AI model for each — grounded in live OpenRouter data, stored
          in Delta Lake, governed by Unity Catalog, and retrieved via Databricks AI Search.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Link to="/app">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]"
            >
              Launch App →
            </motion.button>
          </Link>

          {/* Databricks stack strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {['Delta Lake', 'Unity Catalog', 'AI Search Index', 'Databricks Apps'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-gray-700 bg-gray-800/60 px-3 py-1 text-xs font-medium text-gray-400"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
