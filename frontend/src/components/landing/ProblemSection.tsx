import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'

interface StatProps {
  target: number
  suffix: string
  label: string
}

function Stat({ target, suffix, label }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(target, 2000, inView)

  return (
    <div ref={ref}>
      <p className="text-6xl font-bold text-white">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-gray-400">{label}</p>
    </div>
  )
}

const painPoints = [
  'Too many models to evaluate manually',
  'Pricing, context length, and capabilities change constantly',
  'No single model is best for every subtask',
]

export function ProblemSection() {
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
          The Problem
        </motion.h2>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Stats */}
          <div className="space-y-10">
            <Stat target={300} suffix="+" label="AI models on OpenRouter alone" />
            <Stat target={40} suffix="h" label="Hours spent manually comparing models per project" />
          </div>

          {/* Pain points */}
          <div className="space-y-4">
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4"
              >
                <span className="mt-0.5 shrink-0 text-red-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <p className="text-gray-300">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
