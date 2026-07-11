import { motion } from 'framer-motion'

const steps = [
  {
    n: 1,
    label: 'Describe your task',
    detail: 'Type what you want to build in plain language',
  },
  {
    n: 2,
    label: 'Agent decomposes',
    detail: 'Claude breaks it into independent subtasks',
  },
  {
    n: 3,
    label: 'AI Search retrieves',
    detail: 'Databricks AI Search returns top-5 model chunks from the live catalog',
  },
  {
    n: 4,
    label: 'Recommendation delivered',
    detail: 'Structured plan with model + rationale per subtask',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-[#0a0f1e] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center text-3xl font-bold text-white md:text-4xl"
        >
          How It Works
        </motion.h2>

        {/* Desktop timeline */}
        <div className="hidden md:block">
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute top-5 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"
            />
            <div className="relative grid grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.2 }}
                  className="text-center"
                >
                  <div className="relative z-10 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-[#0a0f1e] text-sm font-bold text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                    {step.n}
                  </div>
                  <p className="mb-1 text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile stepper */}
        <div className="space-y-6 md:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-[#0a0f1e] text-sm font-bold text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
