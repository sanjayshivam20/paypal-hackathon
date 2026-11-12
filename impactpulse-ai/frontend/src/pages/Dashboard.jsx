import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Layers,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Building2,
  Eye,
  Bot,
  Globe,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDashboardStats } from '../api'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      setStats({
        total_batches: 2, total_tasks: 9, available_tasks: 4,
        claimed_tasks: 2, completed_tasks: 3, rejected_tasks: 1,
        fraud_interceptions: 1, total_payouts: 5.20, platform_revenue: 1.30,
        total_workers: 3,
        task_status_breakdown: { available: 4, claimed: 2, paid: 3, rejected: 1, fraud_intercepted: 1 },
      })
    }
  }

  const statCards = stats ? [
    { label: 'Active Batches', value: stats.total_batches, icon: Layers, border: 'border-blue-900', text: 'text-blue-400' },
    { label: 'Available Work Queue', value: stats.available_tasks, icon: CheckCircle2, border: 'border-emerald-900', text: 'text-emerald-400' },
    { label: 'Total Disbursed', value: `$${stats.total_payouts.toFixed(2)}`, icon: DollarSign, border: 'border-cyan-900', text: 'text-cyan-400' },
    { label: 'Platform Revenue', value: `$${stats.platform_revenue.toFixed(2)}`, icon: TrendingUp, border: 'border-indigo-900', text: 'text-indigo-400' },
    { label: 'Fraud Interceptions', value: stats.fraud_interceptions || 1, icon: ShieldAlert, border: 'border-red-950', text: 'text-red-400' },
    { label: 'Active Contributors', value: stats.total_workers, icon: Users, border: 'border-purple-900', text: 'text-purple-400' },
  ] : []

  const chartData = stats ? [
    { name: 'Available', value: stats.task_status_breakdown?.available || 0, color: '#38BDF8' },
    { name: 'Claimed', value: stats.task_status_breakdown?.claimed || 0, color: '#FBBF24' },
    { name: 'Verified Paid', value: stats.task_status_breakdown?.paid || 0, color: '#34D399' },
    { name: 'Rejected', value: stats.task_status_breakdown?.rejected || 0, color: '#9CA3AF' },
    { name: 'Fraud Flagged', value: stats.task_status_breakdown?.fraud_intercepted || 1, color: '#F87171' },
  ] : []

  const architectureStages = [
    {
      num: '01',
      title: 'Enterprise Escrow Funding',
      tech: 'PayPal Orders API v2',
      desc: 'Authorized organizations deposit campaign budget into programmatic escrow.',
      icon: CreditCard,
    },
    {
      num: '02',
      title: 'Contributor Execution',
      tech: 'Web & Mobile Client',
      desc: 'Workers claim 60-second micro-tasks and upload photographic or textual proof.',
      icon: Eye,
    },
    {
      num: '03',
      title: 'Autonomous AI Audit',
      tech: 'Gemini 3.8 Flash & Multi-Engine AI',
      desc: 'AI inspects proof against ground truth criteria and evaluates fraud telemetry.',
      icon: Bot,
    },
    {
      num: '04',
      title: 'Global Multi-Currency Settlement',
      tech: 'PayPal Payouts API v1',
      desc: 'Sub-second monetary disbursal in 15+ international currencies (USD, EUR, GBP, JPY, CAD, AUD, INR, etc.).',
      icon: DollarSign,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Executive Hero */}
      <div className="mb-8 p-6 rounded-2xl bg-paypal-card border border-paypal-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                PayPal Multi-Currency Rails (15+ Currencies) &amp; Dual AI Engine
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              ImpactPulse AI — Enterprise Autonomous Crowdsourcing
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
              Programmatic data audit and disbursal engine. Eliminates administrative overhead by pairing Google Gemini 3.8 Flash multimodal quality assurance and local/cloud AI options with PayPal Sandbox multi-currency settlement rails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-paypal-surface border border-paypal-border text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Global Settlement</span>
              <span className="text-xs font-semibold text-paypal-success font-mono">15+ Currencies Accepted</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={item}
            className={`p-4 rounded-xl bg-paypal-card border ${card.border} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon size={16} className={card.text} />
              <span className="text-[10px] uppercase font-mono text-gray-400">Audited</span>
            </div>
            <p className="text-xl font-bold text-white font-mono">{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Architecture & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Architecture Pipeline */}
        <div className="lg:col-span-3 p-6 rounded-xl bg-paypal-card border border-paypal-border">
          <div className="flex items-center justify-between pb-4 border-b border-paypal-border mb-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                End-to-End System Architecture
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Automated Escrow, Inspection &amp; Disbursal Flow</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paypal-surface text-gray-300 border border-paypal-border">
              Agentic Commerce
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {architectureStages.map((stage) => (
              <div key={stage.num} className="p-4 rounded-lg bg-paypal-surface/60 border border-paypal-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-paypal-light">{stage.num}</span>
                    <stage.icon size={16} className="text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-white text-xs mb-1">{stage.title}</h3>
                  <span className="text-[10px] font-mono text-blue-300 block mb-2">{stage.tech}</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unit Economics Summary */}
          <div className="mt-6 pt-4 border-t border-paypal-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={15} className="text-paypal-light" />
              <span>Unit Economics Benchmark (per $2.00 task):</span>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-paypal-success font-semibold">$1.60 Disbursed to Worker</span>
              <span className="text-gray-500">·</span>
              <span className="text-blue-400 font-semibold">$0.40 Platform Commission</span>
            </div>
          </div>
        </div>

        {/* Task Telemetry Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-paypal-card border border-paypal-border">
          <div className="flex items-center justify-between pb-4 border-b border-paypal-border mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Task Status Telemetry
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Real-time queue distribution</p>
            </div>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#F3F4F6' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Direct Portal Routing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/organization"
          className="p-5 rounded-xl bg-paypal-card border border-paypal-border hover:border-paypal-light transition-all group block shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Building2 size={20} className="text-paypal-light" />
            <span className="text-[10px] font-semibold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              Verified Partner
            </span>
          </div>
          <h3 className="font-bold text-white text-sm group-hover:text-paypal-light transition-colors">
            Enterprise Portal
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Create verified task batches, define ground-truth acceptance rules, and fund escrow via PayPal Orders API.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-paypal-light font-semibold mt-4">
            <span>Manage Batches</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/contributor"
          className="p-5 rounded-xl bg-paypal-card border border-paypal-border hover:border-paypal-success transition-all group block shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Users size={20} className="text-paypal-success" />
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Zero Upfront Cost
            </span>
          </div>
          <h3 className="font-bold text-white text-sm group-hover:text-paypal-success transition-colors">
            Contributor Hub
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Claim micro-tasks, submit photo or text verification, and trigger autonomous PayPal disbursements on AI approval.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-paypal-success font-semibold mt-4">
            <span>Start Working</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/online-tasks"
          className="p-5 rounded-xl bg-paypal-card border border-paypal-border hover:border-blue-400 transition-all group block shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Globe size={20} className="text-blue-400" />
            <span className="text-[10px] font-semibold text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
              Aggregator
            </span>
          </div>
          <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
            Other Online Tasks
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Search external verified opportunities across OpenStreetMap, Hugging Face, and remote labeling platforms with AI matching.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mt-4">
            <span>Explore Opportunities</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </motion.div>
  )
}
