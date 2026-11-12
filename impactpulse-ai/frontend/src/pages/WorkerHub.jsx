import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  Image,
  FileText,
  DollarSign,
  Star,
  AlertTriangle,
  Send,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAvailableTasks, claimTask, submitTask, getWorkerStats, authWorker, submitTaskAppeal } from '../api'
import { formatCurrency } from '../utils/currency'



export default function ContributorHub() {
  const [email, setEmail] = useState('maria.santos@gmail.com')
  const [fullName, setFullName] = useState('Maria Santos')
  const [authenticated, setAuthenticated] = useState(true)
  const [tasks, setTasks] = useState([])
  const [claimedTask, setClaimedTask] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [workerStats, setWorkerStats] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [workerAiProvider, setWorkerAiProvider] = useState('default_gemini')
  const [appealModalOpen, setAppealModalOpen] = useState(false)
  const [appealReason, setAppealReason] = useState('')
  const [appealSubmitting, setAppealSubmitting] = useState(false)
  const fileRef = useRef(null)


  useEffect(() => {
    loadTasks()
    if (authenticated && email) {
      loadStats()
    }
    const interval = setInterval(loadTasks, 8000)
    return () => clearInterval(interval)
  }, [authenticated, email, searchQuery, typeFilter])

  const loadTasks = async () => {
    try {
      const data = await getAvailableTasks(searchQuery, typeFilter)
      setTasks(data)
    } catch {
      // Backend not reached
    }
  }

  const loadStats = async () => {
    try {
      const data = await getWorkerStats(email)
      setWorkerStats(data.worker)
    } catch {
      // Stats fallback
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Valid PayPal email is required for instant disbursements.')
      return
    }
    try {
      await authWorker({ email, full_name: fullName })
      setAuthenticated(true)
      toast.success(`Signed in as ${email}. Ready for task assignment.`)
      loadStats()
    } catch {
      setAuthenticated(true)
    }
  }

  const handleClaim = async (task) => {
    try {
      const claimed = await claimTask(task.id, email)
      setClaimedTask(claimed)
      setResult(null)
      setFile(null)
      setPreview(null)
      setTextInput('')
      toast.success(`Task claimed: ${task.title}. Review criteria and submit proof.`)
      loadTasks()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Unable to claim task.')
    }
  }

  const handleFileChange = (f) => {
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleSubmitProof = async () => {
    if (!claimedTask) return
    setSubmitting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('worker_email', email)
      formData.append('ai_provider', workerAiProvider)

      if (claimedTask.task_type === 'text') {
        if (!textInput.trim()) {
          toast.error('Submission text is required.')
          setSubmitting(false)
          return
        }
        formData.append('submission_text', textInput)
      } else {
        if (!file) {
          toast.error('Please attach visual proof file.')
          setSubmitting(false)
          return
        }
        formData.append('file', file)
      }

      const res = await submitTask(claimedTask.id, formData)
      setResult(res)

      if (res.verification?.is_fraud) {
        toast.error('Anti-Fraud Takeover: Submission flagged for fraudulent or invalid activity.')
      } else if (res.verification?.approved) {
        toast.success(`Approved by Gemini AI! Disbursed $${claimedTask.payout_amount.toFixed(2)} via PayPal.`)
      } else {
        toast.error('Quality Audit: Submission did not meet required acceptance criteria.')
      }

      setClaimedTask(null)
      loadTasks()
      loadStats()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Submission verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendAppeal = async () => {
    if (!appealReason.trim() || appealReason.trim().length < 15) {
      toast.error('Please describe your reason for appeal (min 15 characters).')
      return
    }
    setAppealSubmitting(true)
    try {
      await submitTaskAppeal(result.task.id, {
        worker_email: email,
        appeal_reason: appealReason,
      })
      toast.success('Appeal submitted! An enterprise reviewer will evaluate your submission.')
      setAppealModalOpen(false)
      setResult(prev => ({
        ...prev,
        task: { ...prev.task, status: 'appealed', appeal_status: 'pending' },
      }))
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit appeal.')
    } finally {
      setAppealSubmitting(false)
    }
  }

  // Not signed in

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-paypal-card border border-paypal-border shadow-md text-center">
        <div className="w-14 h-14 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center mx-auto mb-4 text-paypal-light">
          <Users size={28} />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Contributor Work Portal</h2>
        <p className="text-xs text-gray-400 mb-6">
          Sign in with your PayPal address to receive programmatic, instant disbursements upon AI audit approval.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Maria Santos"
              className="input-field text-xs"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              PayPal Payout Email
            </label>
            <input
              type="email"
              placeholder="worker@example.com"
              className="input-field text-xs font-mono"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-lg bg-paypal-light hover:bg-blue-600 font-semibold text-white text-xs shadow-sm transition-colors">
            Access Work Pool
          </button>
        </form>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Contributor Profile Header */}
      <div className="p-6 rounded-2xl bg-paypal-card border border-paypal-border mb-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-paypal-surface border border-paypal-border flex items-center justify-center text-paypal-success">
            <Users size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">{fullName}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-paypal-success border border-emerald-800">
                Active Contributor
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              PayPal Settlement Address: <span className="font-mono text-paypal-light">{email}</span>
            </p>
          </div>
        </div>

        {/* Real-time Earnings Telemetry */}
        {workerStats && (
          <div className="flex items-center gap-6 bg-paypal-surface p-3.5 rounded-xl border border-paypal-border">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Disbursed</p>
              <p className="text-xl font-bold text-paypal-success font-mono">
                ${workerStats.total_earned.toFixed(2)} USD
              </p>
            </div>
            <div className="w-px h-8 bg-paypal-border" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Verified Tasks</p>
              <p className="text-xl font-bold text-white font-mono">{workerStats.tasks_completed}</p>
            </div>
            <div className="w-px h-8 bg-paypal-border" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Account Rating</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-white font-mono">{workerStats.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Task Pool & Filters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Available Verified Tasks</h2>
              <span className="text-xs font-mono text-gray-400">({tasks.length} in queue)</span>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-paypal-card border border-paypal-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-paypal-light"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="py-1.5 px-2.5 text-xs bg-paypal-card border border-paypal-border rounded-lg text-gray-300 focus:outline-none focus:border-paypal-light"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Modalities</option>
                <option value="image">Image</option>
                <option value="text">Text</option>
              </select>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center bg-paypal-card rounded-xl border border-paypal-border">
              <AlertTriangle size={36} className="mx-auto text-gray-600 mb-3" />
              <p className="text-white font-medium text-sm">No tasks currently available</p>
              <p className="text-xs text-gray-500 mt-1">
                Enterprises are preparing new batches. Switch to Enterprise Portal or check Other Online Tasks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-xl bg-paypal-card border border-paypal-border flex flex-col justify-between hover:border-paypal-light/40 transition-colors"
                >
                  <div>
                    {/* Organization Verified Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-300">
                        <CheckCircle2 size={13} className="text-paypal-light" />
                        <span className="truncate max-w-[170px]">{task.organization_name || 'Verified Enterprise'}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-paypal-surface text-gray-300 border border-paypal-border">
                        {task.task_type}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-sm mb-1.5">{task.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>

                    {task.verification_criteria && (
                      <div className="p-2 rounded bg-paypal-surface/60 border border-paypal-border/80 text-[11px] text-gray-300 mb-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">Criteria:</span>
                        {task.verification_criteria}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-paypal-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 font-semibold block">Payout</span>
                      <span className="text-sm font-bold text-paypal-success font-mono">
                        {formatCurrency(task.payout_amount, task.currency)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClaim(task)}
                      className="px-3.5 py-1.5 rounded-lg bg-paypal-surface hover:bg-paypal-light hover:text-white text-gray-200 text-xs font-semibold border border-paypal-border transition-colors flex items-center gap-1.5"
                    >
                      <span>Claim Task</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Submission Panel & Anti-Fraud Inspection Terminal */}
        <div>
          <AnimatePresence mode="wait">
            {claimedTask ? (
              <motion.div
                key="active-claim"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-xl bg-paypal-card border-2 border-paypal-light/80 shadow-md"
              >
                <div className="flex items-center justify-between pb-3 border-b border-paypal-border mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-paypal-light" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Active Submission</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-paypal-success">
                    {formatCurrency(claimedTask.payout_amount, claimedTask.currency)}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mb-1">{claimedTask.title}</h3>
                <p className="text-xs text-gray-400 mb-4">{claimedTask.description}</p>

                {claimedTask.verification_criteria && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900 text-xs text-blue-200 mb-4">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider mb-0.5 text-blue-300">
                      Audit Ground Truth:
                    </span>
                    {claimedTask.verification_criteria}
                  </div>
                )}

                {/* Proof Upload Area */}
                {claimedTask.task_type === 'text' ? (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Text Response
                    </label>
                    <textarea
                      placeholder="Type your response verifying the criteria..."
                      className="input-field text-xs min-h-[120px] resize-none"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer transition-colors ${
                      dragActive ? 'border-paypal-light bg-paypal-light/10' : 'border-paypal-border hover:border-gray-500'
                    }`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragActive(false)
                      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0])
                    }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                    {preview ? (
                      <div>
                        <img src={preview} alt="Visual Proof Preview" className="max-h-44 mx-auto rounded-lg mb-2 object-contain" />
                        <span className="text-[11px] text-gray-400">Click to replace photo</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="mx-auto text-gray-500 mb-2" />
                        <p className="text-xs font-semibold text-white">Upload Ground-Level Photo</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Drag file or click to browse</p>
                      </>
                    )}
                  </div>
                )}

                {/* AI Engine Selection */}
                <div className="mb-4">
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>AI Quality &amp; Anti-Fraud Auditor</span>
                    <span className="text-paypal-light font-mono text-[9px]">Select Verifier</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setWorkerAiProvider('default_gemini')}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        workerAiProvider === 'default_gemini'
                          ? 'bg-blue-950/70 border-paypal-light text-white shadow-sm'
                          : 'bg-paypal-surface border-paypal-border text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="text-[10px] font-bold">Gemini Cloud</div>
                      <div className="text-[9px] text-gray-400 font-mono">Multimodal</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkerAiProvider('local_model')}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        workerAiProvider === 'local_model'
                          ? 'bg-blue-950/70 border-paypal-light text-white shadow-sm'
                          : 'bg-paypal-surface border-paypal-border text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="text-[10px] font-bold">Local Model</div>
                      <div className="text-[9px] text-gray-400 font-mono">Ollama / LMStudio</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkerAiProvider('custom_cloud')}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        workerAiProvider === 'custom_cloud'
                          ? 'bg-blue-950/70 border-paypal-light text-white shadow-sm'
                          : 'bg-paypal-surface border-paypal-border text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="text-[10px] font-bold">Custom Cloud</div>
                      <div className="text-[9px] text-gray-400 font-mono">OpenAI / Groq</div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmitProof}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-paypal-success hover:bg-emerald-600 font-semibold text-white text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>AI Auditor Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit for AI Audit &amp; PayPal Payout</span>
                    </>
                  )}
                </button>
              </motion.div>
            ) : result ? (
              <motion.div
                key="audit-result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-xl bg-paypal-card border border-paypal-border shadow-md"
              >
                {/* Anti-Fraud Takeover Banner */}
                {result.verification?.is_fraud ? (
                  <div className="p-4 rounded-xl bg-red-950/60 border-2 border-red-600 mb-4 text-center">
                    <ShieldAlert size={40} className="mx-auto text-red-400 mb-2" />
                    <h3 className="font-bold text-red-300 text-sm tracking-wide">
                      ANTI-FRAUD TAKEOVER ACTIVATED
                    </h3>
                    <p className="text-xs text-red-200 mt-1 leading-relaxed">
                      Submission flagged for deceptive, low-entropy, or irrelevant content. Programmatic disbursal revoked.
                    </p>
                    {result.verification?.fraud_indicators?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {result.verification.fraud_indicators.map((ind, i) => (
                          <span key={i} className="text-[10px] font-mono bg-red-900/80 text-red-200 px-2 py-0.5 rounded">
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : result.verification?.approved ? (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 mb-4 text-center">
                    <CheckCircle2 size={40} className="mx-auto text-paypal-success mb-2" />
                    <h3 className="font-bold text-white text-sm tracking-wide">
                      QUALITY AUDIT: PASSED
                    </h3>
                    <p className="text-xs text-emerald-300 mt-1">
                      Proof verified against task criteria. Instant PayPal Sandbox disbursal completed.
                    </p>
                  </div>
                ) : (result.task?.status === 'needs_review' || result.verification?.needs_manual_review) ? (
                  <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-600 mb-4 text-center">
                    <AlertTriangle size={40} className="mx-auto text-amber-400 mb-2" />
                    <h3 className="font-bold text-white text-sm tracking-wide">
                      BORDERLINE — QUEUED FOR HUMAN REVIEW
                    </h3>
                    <p className="text-xs text-amber-200 mt-1">
                      AI identified partial criteria compliance. An enterprise organizer will manually inspect your submission and authorize payout.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 mb-4 text-center">
                    <XCircle size={40} className="mx-auto text-gray-400 mb-2" />
                    <h3 className="font-bold text-white text-sm">QUALITY CRITERIA NOT MET</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      The submission did not achieve necessary confidence thresholds. You may appeal below.
                    </p>
                  </div>
                )}

                {/* Audit Telemetry */}
                <div className="space-y-3 text-xs mb-4">
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>AI Auditor Confidence Rating</span>
                      <span className="font-mono font-bold text-white">
                        {((result.verification?.confidence_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-paypal-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          result.verification?.is_fraud
                            ? 'bg-red-500'
                            : result.verification?.approved
                            ? 'bg-paypal-success'
                            : (result.task?.status === 'needs_review' || result.verification?.needs_manual_review)
                            ? 'bg-amber-400'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${(result.verification?.confidence_score || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-paypal-surface border border-paypal-border">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                      AI Auditor Reasoning:
                    </span>
                    <p className="text-gray-300 leading-relaxed text-[11px]">
                      {result.verification?.reasoning}
                    </p>
                  </div>

                  {result.payout && (
                    <div className={`p-3 rounded-lg text-[11px] ${
                      result.payout.batch_status === 'FAILED'
                        ? 'bg-red-950/40 border border-red-800'
                        : 'bg-emerald-950/40 border border-emerald-800'
                    }`}>
                      <span className={`font-semibold block mb-0.5 ${
                        result.payout.batch_status === 'FAILED' ? 'text-red-400' : 'text-paypal-success'
                      }`}>
                        {result.payout.batch_status === 'FAILED'
                          ? 'PayPal Payout Exception (Logged for Retry):'
                          : 'PayPal Payout Rail Executed:'}
                      </span>
                      <p className="text-gray-300 font-mono text-[10px]">
                        Batch ID: {result.payout.payout_batch_id}
                      </p>
                      <p className="text-gray-400 text-[10px] mt-0.5">
                        Amount: {formatCurrency(result.payout.amount, result.payout.currency)} to {result.payout.receiver}
                      </p>
                      {result.payout.error && (
                        <p className="text-red-300 text-[10px] mt-1 font-mono">
                          Diagnostic: {result.payout.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Appeal Options */}
                {result.task?.status === 'rejected' && !result.verification?.is_fraud && result.task?.appeal_status !== 'pending' && (
                  <button
                    onClick={() => setAppealModalOpen(true)}
                    className="w-full py-2.5 mb-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-xs font-semibold text-blue-200 border border-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle size={13} />
                    <span>Appeal This Decision (Request Human Review)</span>
                  </button>
                )}
                {result.task?.appeal_status === 'pending' && (
                  <div className="p-2.5 mb-2 rounded-lg bg-blue-950 border border-blue-800 text-[11px] text-blue-300 text-center font-medium">
                    Appeal Filed — Awaiting Enterprise Reviewer Resolution
                  </div>
                )}

                <button
                  onClick={() => setResult(null)}
                  className="w-full py-2 rounded-lg bg-paypal-surface hover:bg-paypal-border text-xs font-semibold text-gray-200 border border-paypal-border transition-colors"
                >
                  Return to Available Tasks
                </button>
              </motion.div>
            ) : (
              <div className="p-8 rounded-xl bg-paypal-card border border-paypal-border text-center">
                <Search size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-semibold text-white">No Task Claimed</p>
                <p className="text-xs text-gray-500 mt-1">
                  Select an enterprise-verified task on the left to claim and complete.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Worker Appeal Modal */}
      {appealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paypal-card border border-paypal-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Appeal AI Audit Decision
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              If you believe the AI auditor misunderstood your submission or misclassified the evidence, provide additional context for the human review team.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Explanation &amp; Supporting Context
                </label>
                <textarea
                  rows={4}
                  className="input-field text-xs resize-none"
                  placeholder="Explain why your submission meets the criteria, citing verifiable photo angles, timestamps, or source links..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setAppealModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white bg-paypal-surface hover:bg-paypal-border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendAppeal}
                  disabled={appealSubmitting}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {appealSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Submit Appeal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

