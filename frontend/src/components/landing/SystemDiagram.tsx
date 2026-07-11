import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const NODE_W = 150
const NODE_H = 44
const NODE_RX = 8

const topNodes = [
  { id: 'openrouter', label: 'OpenRouter API', badge: 'Source', x: 20, y: 55 },
  { id: 'ingest', label: 'Ingestion Job', badge: 'Databricks', x: 210, y: 55 },
  { id: 'delta', label: 'Delta Table', badge: 'Unity Catalog', x: 400, y: 55 },
  { id: 'vs', label: 'Vector Search', badge: 'Databricks', x: 590, y: 55 },
]

const bottomNodes = [
  { id: 'user', label: 'User', badge: 'Browser', x: 20, y: 195 },
  { id: 'fastapi', label: 'FastAPI Backend', badge: 'Python', x: 210, y: 195 },
  { id: 'claude', label: 'Claude Haiku', badge: 'OpenRouter', x: 400, y: 195 },
  { id: 'reco', label: 'Recommendation', badge: 'JSON Plan', x: 590, y: 195 },
]

// Horizontal arrows: [x1, y1, x2, y2]
const topArrows: [number, number, number, number][] = [
  [170, 77, 210, 77],
  [360, 77, 400, 77],
  [550, 77, 590, 77],
]
const bottomArrows: [number, number, number, number][] = [
  [170, 217, 210, 217],
  [360, 217, 400, 217],
  [550, 217, 590, 217],
]

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill={color} />
    </marker>
  )
}

interface NodeGroupProps {
  node: { id: string; label: string; badge: string; x: number; y: number }
  stroke: string
  delay: number
  inView: boolean
  direction: 'up' | 'down'
}

function NodeGroup({ node, stroke, delay, inView, direction }: NodeGroupProps) {
  return (
    <motion.g
      initial={{ opacity: 0, y: direction === 'up' ? -12 : 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
    >
      <rect
        x={node.x}
        y={node.y}
        width={NODE_W}
        height={NODE_H}
        rx={NODE_RX}
        fill="#1f2937"
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 16}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#f9fafb"
      >
        {node.label}
      </text>
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 32}
        textAnchor="middle"
        fontSize={9}
        fill="#6b7280"
      >
        {node.badge}
      </text>
    </motion.g>
  )
}

export function SystemDiagram() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="bg-gray-900/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center text-3xl font-bold md:text-4xl"
        >
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Architecture
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 text-center text-sm text-gray-500"
        >
          Data pipeline (top) feeds the request flow (bottom) via Vector Search retrieval
        </motion.p>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <svg
            ref={ref}
            viewBox="0 0 780 300"
            className="w-full min-w-[600px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <ArrowMarker id="arrow-blue" color="#3b82f6" />
              <ArrowMarker id="arrow-violet" color="#8b5cf6" />
              <ArrowMarker id="arrow-indigo" color="#6366f1" />
            </defs>

            {/* Row labels */}
            <text x="20" y="20" fontSize={10} fill="#4b5563" fontWeight={600} letterSpacing={1}>
              DATA PIPELINE
            </text>
            <text x="20" y="180" fontSize={10} fill="#4b5563" fontWeight={600} letterSpacing={1}>
              REQUEST FLOW
            </text>

            {/* Top row nodes */}
            {topNodes.map((node, i) => (
              <NodeGroup
                key={node.id}
                node={node}
                stroke="#3b82f6"
                delay={i * 0.12}
                inView={inView}
                direction="up"
              />
            ))}

            {/* Bottom row nodes */}
            {bottomNodes.map((node, i) => (
              <NodeGroup
                key={node.id}
                node={node}
                stroke="#8b5cf6"
                delay={0.6 + i * 0.12}
                inView={inView}
                direction="down"
              />
            ))}

            {/* Top row arrows */}
            {topArrows.map(([x1, y1, x2, y2], i) => (
              <motion.path
                key={`ta-${i}`}
                d={`M${x1},${y1} L${x2},${y2}`}
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="none"
                markerEnd="url(#arrow-blue)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.15 }}
              />
            ))}

            {/* Bottom row arrows */}
            {bottomArrows.map(([x1, y1, x2, y2], i) => (
              <motion.path
                key={`ba-${i}`}
                d={`M${x1},${y1} L${x2},${y2}`}
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="none"
                markerEnd="url(#arrow-violet)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.85 + i * 0.15 }}
              />
            ))}

            {/* Vector Search → FastAPI connector (curved) */}
            <motion.path
              d="M 665 99 C 665 148 285 142 285 195"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="none"
              markerEnd="url(#arrow-indigo)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.3 }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
