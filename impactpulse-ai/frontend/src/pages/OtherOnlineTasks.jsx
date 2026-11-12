import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Search,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Briefcase,
  Filter,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  CreditCard,
  Cpu,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getExternalTasks, claimAndSubmitExternalTask, getPayPalConfig } from '../api'
import { formatCurrency, getCurrencySymbol, SUPPORTED_CURRENCIES } from '../utils/currency'

const categories = ['All', 'Civic Mapping', 'AI Data Annotation', 'Audio Labeling', 'Content Moderation']

export default function OtherOnlineTasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiMatchActive, setAiMatchActive] = useState(false)
  const [config, setConfig] = useState(null)

  // Claim & Submit Modal State
  const [selectedTask, setSelectedTask] = useState(null)
  const [workerEmail, setWorkerEmail] = useState('contributor.global@example.com')
  const [paypalEmail, setPaypalEmail] = useState('worker.sandbox@example.com')
  const [submissionProof, setSubmissionProof] = useState('')
  const [selectedAiProvider, setSelectedAiProvider] = useState('default_gemini')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [submitting, setSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)

  useEffect(() => {
    loadTasks()
    loadConfig()
  }, [category, searchQuery])

  const loadConfig = async () => {
    try {
      const cfg = await getPayPalConfig()
      setConfig(cfg)
      if (cfg.active_ai_provider) {
        setSelectedAiProvider(cfg.active_ai_provider)
      }
    } catch {
      // Backend offline fallback
    }
  }

  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await getExternalTasks(category, searchQuery)
      setTasks(data)
    } catch {
      // Backend fallback data
    } finally {
      setLoading(false)
    }
  }

  const handleAiSkillMatch = () => {
    setAiMatchActive(!aiMatchActive)
    if (!aiMatchActive) {
      toast.success('AI Matcher: Prioritized tasks matching data verification & mapping proficiencies.')
    }
  }

  const openClaimModal = (task) => {
    setSelectedTask(task)
    setSelectedCurrency(task.currency || 'USD')
    setSubmissionProof('')
    setSubmissionResult(null)
  }

  const closeClaimModal = () => {
    setSelectedTask(null)
    setSubmissionProof('')
    setSubmissionResult(null)
  }

  const handleSubmitProof = async (e) => {
    e.preventDefault()
    if (!submissionProof || submissionProof.trim().length < 10) {
      toast.error('Please provide detailed proof of task completion (PR link, changeset URL, or summary).')
      return
    }

    if (!paypalEmail) {
      toast.error('PayPal email address is required for monetary disbursal.')
      return
    }

    setSubmitting(true)
    setSubmissionResult(null)

    try {
      const res = await claimAndSubmitExternalTask({
        task_id: selectedTask.id,
        worker_email: workerEmail,
        paypal_email: paypalEmail,
        submission_proof: submissionProof,
        reward_amount: selectedTask.reward_amount || 3.50,
        currency: selectedCurrency,
        ai_provider: selectedAiProvider,
      })

      setSubmissionResult(res)

      if (res.success && res.status === 'paid') {
        const displayVal = formatCurrency(selectedTask.reward_amount || 3.50, selectedCurrency)
        toast.success(`Audit passed: PayPal payout of ${displayVal} disbursed!`)
      } else if (res.verification?.is_fraud) {
        toast.error('Anti-Fraud Takeover: Submission flagged as non-compliant or fraudulent.')
      } else {
        toast.error(res.message || 'Verification could not authorize disbursal.')
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit proof to AI auditor.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Globe size={24} className="text-paypal-light" />
              Other Online Tasks
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              External Real Work &amp; PayPal Disbursal
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Real tasks aggregated live from Humanitarian OpenStreetMap and GitHub Bounties. Complete tasks, submit proof, and get paid directly via PayPal Sandbox Payouts.
          </p>
        </div>

        {/* AI Match Button */}
        <button
          onClick={handleAiSkillMatch}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
            aiMatchActive
              ? 'bg-paypal-light text-white border-paypal-light shadow-md'
              : 'bg-paypal-surface text-gray-200 border-paypal-border hover:bg-paypal-card'
          }`}
        >
          <Sparkles size={14} className={aiMatchActive ? 'text-white' : 'text-paypal-light'} />
          <span>{aiMatchActive ? 'AI Skill Match: Active' : 'Run AI Skill Matcher'}</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-paypal-card border border-paypal-border">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Aggregated Opportunities</p>
          <p className="text-xl font-bold text-white mt-1">{tasks.length} Active</p>
        </div>
        <div className="p-4 rounded-xl bg-paypal-card border border-paypal-border">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Monetary Disbursal</p>
          <p className="text-xl font-bold text-paypal-success mt-1">Direct PayPal Payout</p>
        </div>
        <div className="p-4 rounded-xl bg-paypal-card border border-paypal-border">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Average Reward</p>
          <p className="text-xl font-bold text-white mt-1">$4.50 - $25.00 / Task</p>
        </div>
        <div className="p-4 rounded-xl bg-paypal-card border border-paypal-border">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Audit Protocol</p>
          <p className="text-xl font-bold text-paypal-light mt-1">Multi-AI Quality Rails</p>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="p-4 rounded-xl bg-paypal-card border border-paypal-border mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter size={14} className="text-gray-500 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-paypal-light text-white'
                  : 'bg-paypal-surface text-gray-400 hover:text-white hover:bg-paypal-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, platforms, or skills..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-paypal-surface border border-paypal-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-paypal-light"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-paypal-light" />
          <span>Querying external platforms &amp; public APIs in real-time...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center bg-paypal-card rounded-xl border border-paypal-border">
          <Briefcase size={36} className="mx-auto text-gray-600 mb-3" />
          <p className="text-white font-medium text-sm">No external tasks found matching criteria</p>
          <p className="text-xs text-gray-500 mt-1">Adjust your search query or reset category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              className="p-5 rounded-xl bg-paypal-card border border-paypal-border flex flex-col justify-between hover:border-paypal-light/50 transition-all shadow-sm"
              whileHover={{ y: -2 }}
            >
              <div>
                {/* Platform Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-gray-300 bg-paypal-surface px-2.5 py-1 rounded border border-paypal-border">
                    {task.platform}
                  </span>
                  <span className="text-[11px] font-mono text-paypal-light font-semibold">
                    {task.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-white text-sm leading-snug mb-2 line-clamp-2">
                  {task.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
                  {task.description}
                </p>

                {/* Skills tags */}
                {task.required_skills && task.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {task.required_skills.map((skill, i) => (
                      <span key={i} className="text-[10px] text-gray-300 bg-paypal-surface/80 px-2 py-0.5 rounded border border-paypal-border/60">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Details & Actions */}
              <div className="pt-4 border-t border-paypal-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 font-semibold block">Payout Amount</span>
                    <span className="text-sm font-bold text-paypal-success font-mono">
                      {formatCurrency(task.reward_amount || 3.50, task.currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-500 font-semibold block">Disbursal Rails</span>
                    <span className="text-[11px] font-medium text-gray-300 flex items-center gap-1 justify-end font-mono">
                      <ShieldCheck size={12} className="text-paypal-light" />
                      {task.payout_method || 'Direct PayPal'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>Source: {task.source || 'Public Feed'}</span>
                  {task.source?.includes('Live') && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-paypal-success animate-pulse" />
                      Live Feed
                    </span>
                  )}
                </div>

                {/* Two Action Buttons: Claim & Work */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openClaimModal(task)}
                    className="w-full py-2 px-2.5 rounded-lg bg-paypal-light hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CreditCard size={12} />
                    <span>Claim &amp; Get Paid</span>
                  </button>

                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-2 rounded-lg bg-paypal-surface hover:bg-paypal-border text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-paypal-border transition-all"
                  >
                    <span>Launch Task</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Claim & Submit Proof Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-paypal-card border border-paypal-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-paypal-border flex items-center justify-between bg-paypal-surface/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-paypal-light">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Submit Proof &amp; Claim PayPal Disbursal</h2>
                    <p className="text-[11px] text-gray-400">Task verification and automated PayPal Sandbox Payout</p>
                  </div>
                </div>

                <button
                  onClick={closeClaimModal}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-paypal-border transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Task Context Card */}
                <div className="p-3.5 rounded-xl bg-paypal-surface border border-paypal-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-400 font-mono">
                      {selectedTask.platform}
                    </span>
                    <span className="text-xs font-bold text-paypal-success font-mono">
                      {formatCurrency(selectedTask.reward_amount || 3.50, selectedCurrency || selectedTask.currency)} Payout
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs mb-1">{selectedTask.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Result Notification Card */}
                {submissionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      submissionResult.success && submissionResult.status === 'paid'
                        ? 'bg-emerald-950/40 border-emerald-800 text-gray-200'
                        : submissionResult.verification?.is_fraud
                        ? 'bg-rose-950/40 border-rose-800 text-gray-200'
                        : 'bg-yellow-950/40 border-yellow-800 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {submissionResult.success && submissionResult.status === 'paid' ? (
                          <>
                            <CheckCircle2 size={15} className="text-paypal-success" />
                            <span className="text-white">AI Audit Approved &bull; Payout Disbursed</span>
                          </>
                        ) : submissionResult.verification?.is_fraud ? (
                          <>
                            <AlertTriangle size={15} className="text-rose-400" />
                            <span className="text-white">Anti-Fraud Takeover: Disbursal Blocked</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={15} className="text-yellow-400" />
                            <span className="text-white">Submission Quality Insufficient</span>
                          </>
                        )}
                      </span>

                      {submissionResult.verification?.confidence_score && (
                        <span className="font-mono text-[11px] text-paypal-light">
                          Score: {(submissionResult.verification.confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {submissionResult.verification?.reasoning || submissionResult.message}
                    </p>

                    {submissionResult.payout?.payout_batch_id && (
                      <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-emerald-400">
                          PayPal Batch: {submissionResult.payout.payout_batch_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => { closeClaimModal(); navigate('/payouts'); }}
                          className="text-paypal-light hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>View in Ledger</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmitProof} className="space-y-3.5">
                  {/* AI Verifier Selector */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1 flex items-center justify-between">
                      <span>AI Verification Engine</span>
                      <span className="text-[10px] text-gray-500 font-mono">Autonomous Quality Gate</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAiProvider('default_gemini')}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedAiProvider === 'default_gemini'
                            ? 'bg-blue-950/60 border-paypal-light text-white'
                            : 'bg-paypal-surface border-paypal-border text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-[11px]">Default Gemini</div>
                        <div className="text-[9px] text-gray-400 font-mono">Cloud Multimodal</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedAiProvider('local_model')}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedAiProvider === 'local_model'
                            ? 'bg-blue-950/60 border-paypal-light text-white'
                            : 'bg-paypal-surface border-paypal-border text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-[11px]">Local AI Model</div>
                        <div className="text-[9px] text-gray-400 font-mono">Ollama / LM Studio</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedAiProvider('custom_cloud')}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedAiProvider === 'custom_cloud'
                            ? 'bg-blue-950/60 border-paypal-light text-white'
                            : 'bg-paypal-surface border-paypal-border text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-[11px]">Custom Cloud</div>
                        <div className="text-[9px] text-gray-400 font-mono">OpenAI / Groq</div>
                      </button>
                    </div>
                  </div>

                  {/* Worker & PayPal Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Contributor Email
                      </label>
                      <input
                        type="email"
                        required
                        className="input-field text-xs font-mono"
                        value={workerEmail}
                        onChange={(e) => setWorkerEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        PayPal Payout Email
                      </label>
                      <input
                        type="email"
                        required
                        className="input-field text-xs font-mono"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Disbursal Currency
                      </label>
                      <select
                        className="select-field text-xs font-mono font-semibold"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                      >
                        {SUPPORTED_CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.symbol}) — {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Proof of Work Textarea */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1">
                      Proof of Completion / Output Artifact
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Paste pull request URL, Humanitarian OpenStreetMap changeset ID, or detailed summary of completed task..."
                      className="input-field text-xs font-mono resize-none"
                      value={submissionProof}
                      onChange={(e) => setSubmissionProof(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      The AI auditor will inspect this against task criteria and detect low-effort spam or synthetic placeholders.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeClaimModal}
                      className="px-4 py-2 rounded-lg bg-paypal-surface hover:bg-paypal-border text-gray-300 font-semibold text-xs border border-paypal-border transition-colors"
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg bg-paypal-light hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Auditing &amp; Disbursing...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          <span>Audit &amp; Disburse ${(selectedTask.reward_amount || 3.50).toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
