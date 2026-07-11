import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const DB_RED = '#FF3621'
const NODE_W = 150
const NODE_H = 44
const NODE_RX = 8

const topNodes = [
  { id: 'openrouter', label: 'OpenRouter API', badge: 'Source',        x: 20,  y: 55, stroke: '#3b82f6' },
  { id: 'ingest',    label: 'Ingestion Job',   badge: 'Databricks',    x: 210, y: 55, stroke: DB_RED },
  { id: 'delta',     label: 'Delta Table',     badge: 'Unity Catalog', x: 400, y: 55, stroke: DB_RED },
  { id: 'vs',        label: 'Vector Search',   badge: 'Databricks',    x: 590, y: 55, stroke: DB_RED },
]

const bottomNodes = [
  { id: 'user',    label: 'User',             badge: 'Browser',         x: 20,  y: 195, stroke: '#8b5cf6' },
  { id: 'fastapi', label: 'FastAPI Backend',  badge: 'Databricks Apps', x: 210, y: 195, stroke: DB_RED },
  { id: 'claude',  label: 'Claude Haiku',     badge: 'OpenRouter',      x: 400, y: 195, stroke: '#8b5cf6' },
  { id: 'reco',    label: 'Recommendation',   badge: 'JSON Plan',       x: 590, y: 195, stroke: '#8b5cf6' },
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
  node: { id: string; label: string; badge: string; x: number; y: number; stroke: string }
  delay: number
  inView: boolean
  direction: 'up' | 'down'
}

function NodeGroup({ node, delay, inView, direction }: NodeGroupProps) {
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
        stroke={node.stroke}
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
        fill={node.stroke === DB_RED ? '#FF3621' : '#6b7280'}
        fontWeight={node.stroke === DB_RED ? 600 : 400}
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
        {/* Heading */}
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

        {/* Databricks badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-3 flex items-center justify-center gap-2"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF3621]/40 bg-[#FF3621]/10 px-3 py-1 text-xs font-semibold text-[#FF3621]">
            <img
              src="https://www.agiledataengine.com/hs-fs/hubfs/databricks-white%5B18%5D.png?width=600&height=270&name=databricks-white%5B18%5D.png"
              alt="Databricks"
              className="h-12 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(36%) sepia(97%) saturate(2000%) hue-rotate(355deg) brightness(100%)' }}
            />
            Powered by Databricks Lakehouse
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 text-center text-sm text-gray-500"
        >
          Data pipeline (top) feeds the request flow (bottom) via Databricks AI Search retrieval
        </motion.p>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <svg
            ref={ref}
            viewBox="0 0 780 310"
            className="w-full min-w-[600px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <ArrowMarker id="arrow-blue"   color="#3b82f6" />
              <ArrowMarker id="arrow-violet" color="#8b5cf6" />
              <ArrowMarker id="arrow-indigo" color="#6366f1" />
              <ArrowMarker id="arrow-db"     color={DB_RED} />
            </defs>

            {/* Row labels */}
            <text x="20" y="20" fontSize={10} fill="#4b5563" fontWeight={600} letterSpacing={1}>
              DATA PIPELINE
            </text>
            <text x="20" y="180" fontSize={10} fill="#4b5563" fontWeight={600} letterSpacing={1}>
              REQUEST FLOW
            </text>

            {/* Databricks grouping rect — top row (Ingestion → Delta → AI Search) */}
            <motion.rect
              x={200}
              y={42}
              width={552}
              height={70}
              rx={12}
              fill={DB_RED}
              fillOpacity={0.04}
              stroke={DB_RED}
              strokeWidth={1}
              strokeOpacity={0.25}
              strokeDasharray="4 3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
            <motion.text
              x={476}
              y={36}
              textAnchor="middle"
              fontSize={8}
              fill={DB_RED}
              fontWeight={700}
              letterSpacing={1.5}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              DATABRICKS LAKEHOUSE
            </motion.text>

            {/* Databricks grouping rect — FastAPI (Databricks Apps) */}
            <motion.rect
              x={200}
              y={182}
              width={160}
              height={70}
              rx={12}
              fill={DB_RED}
              fillOpacity={0.04}
              stroke={DB_RED}
              strokeWidth={1}
              strokeOpacity={0.25}
              strokeDasharray="4 3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            />

            {/* Top row nodes */}
            {topNodes.map((node, i) => (
              <NodeGroup
                key={node.id}
                node={node}
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
                stroke={i === 0 ? '#3b82f6' : DB_RED}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="none"
                markerEnd={i === 0 ? 'url(#arrow-blue)' : 'url(#arrow-db)'}
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
                stroke={i === 0 ? DB_RED : '#8b5cf6'}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="none"
                markerEnd={i === 0 ? 'url(#arrow-db)' : 'url(#arrow-violet)'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.85 + i * 0.15 }}
              />
            ))}

            {/* AI Search → FastAPI connector (curved) */}
            <motion.path
              d="M 665 99 C 665 148 285 142 285 195"
              stroke={DB_RED}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="none"
              markerEnd="url(#arrow-db)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.3 }}
            />

            {/* Legend */}
            <g transform="translate(20, 280)">
              <rect x={0} y={-8} width={8} height={8} rx={1} fill={DB_RED} fillOpacity={0.8} />
              <text x={12} y={0} fontSize={8} fill="#6b7280">Databricks</text>
              <rect x={90} y={-8} width={8} height={8} rx={1} fill="#3b82f6" fillOpacity={0.8} />
              <text x={102} y={0} fontSize={8} fill="#6b7280">External</text>
              <rect x={170} y={-8} width={8} height={8} rx={1} fill="#8b5cf6" fillOpacity={0.8} />
              <text x={182} y={0} fontSize={8} fill="#6b7280">App layer</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
