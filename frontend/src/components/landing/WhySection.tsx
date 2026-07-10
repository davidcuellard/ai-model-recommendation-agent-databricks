import { motion } from 'framer-motion'

const cards = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 11h6" />
      </svg>
    ),
    title: 'Grounded in live data',
    body: 'Pulls the full OpenRouter catalog fresh via a Databricks ingestion job — no stale hardcoded lists.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Subtask decomposition',
    body: 'Breaks your prompt into sub-problems and matches the right model to each one independently.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant recommendations',
    body: 'Vector Search over model embeddings returns relevant candidates in milliseconds.',
  },
]

export function WhySection() {
  return (
    <section className="bg-gray-900/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-3xl font-bold text-white md:text-4xl"
        >
          Why This App
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-shadow hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                {card.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
