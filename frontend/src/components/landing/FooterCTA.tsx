import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function FooterCTA() {
  return (
    <section className="bg-gradient-to-b from-[#0a0f1e] to-gray-900 px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-3xl font-bold text-white md:text-4xl"
        >
          Ready to find your model?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 text-lg text-gray-400"
        >
          Try the live agent — describe any project and get instant recommendations.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-xs text-gray-600"
        >
          Built on Databricks · Powered by OpenRouter · Grounded in live data
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 flex items-center justify-center gap-1.5"
        >
          <img
            src="https://cdn.prod.website-files.com/673e584365dc85b813c0e0d7/686ed19a686120b0466805a2_Web_Favicon.png"
            alt="Factored"
            className="h-4 w-4 opacity-40"
          />
          <span className="text-xs text-gray-600">Factored Labs</span>
        </motion.div>
      </div>
    </section>
  )
}
