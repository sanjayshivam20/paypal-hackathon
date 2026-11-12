import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Plus,
  Layers,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createBatch, getBatches, captureBatch, authOrganization, getPayPalConfig,
  getReviewQueue, processManualReview, getAppeals, resolveTaskAppeal,
} from '../api'
import { getCurrencySymbol, formatCurrency, SUPPORTED_CURRENCIES } from '../utils/currency'


export default function OrganizationPortal() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [paypalConfig, setPaypalConfig] = useState(null)
  const [org, setOrg] = useState({
    org_name: 'Urban Mobility & ADA Commission',
    business_email: 'contact@urban-ada.gov',
    paypal_account_email: 'treasury@urban-ada.gov',
    industry: 'Civic Infrastructure & Accessibility',
    verified: true,
    verification_badge: 'Verified Municipal Agency',
    registration_id: 'MUNI-NY-2026',
    escrow_balance: 120.00,
  })

  const [form, setForm] = useState({
    title: '',
    description: '',
    verification_criteria: '',
    task_type: 'image',
    currency: 'USD',
    num_tasks: 5,
    price_per_task: 2.00,
  })

  const [activeOrder, setActiveOrder] = useState(null)
  const [reviewItems, setReviewItems] = useState([])
  const [appeals, setAppeals] = useState([])

  useEffect(() => {
    loadBatches()
    loadPayPalConfig()
    loadReviewAndAppeals()
    const interval = setInterval(loadReviewAndAppeals, 8000)
    return () => clearInterval(interval)
  }, [])

  const loadReviewAndAppeals = async () => {
    try {
      const [queueData, appealsData] = await Promise.all([getReviewQueue(), getAppeals()])
      setReviewItems(queueData || [])
      setAppeals(appealsData || [])
    } catch {
      // Backend not running
    }
  }

  const handleManualReview = async (taskId, decision) => {
    try {
      toast.loading(`Processing ${decision}...`, { id: 'review' })
      const res = await processManualReview(taskId, {
        reviewer_email: org.business_email,
        decision,
        review_notes: `Manual ${decision} by ${org.org_name}`,
      })
      toast.success(res.message || `Task ${decision}d!`, { id: 'review' })
      loadReviewAndAppeals()
      loadBatches()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Review action failed', { id: 'review' })
    }
  }

  const handleResolveAppeal = async (taskId, decision) => {
    try {
      toast.loading(`Resolving appeal: ${decision}...`, { id: 'appeal' })
      const res = await resolveTaskAppeal(taskId, {
        reviewer_email: org.business_email,
        decision,
        review_notes: `Appeal ${decision}d by ${org.org_name}`,
      })
      toast.success(res.message || `Appeal ${decision}d!`, { id: 'appeal' })
      loadReviewAndAppeals()
      loadBatches()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Appeal resolution failed', { id: 'appeal' })
    }
  }


  const loadBatches = async () => {
    try {
      const data = await getBatches()
      setBatches(data)
    } catch {
      // Backend not running yet
    }
  }

  const loadPayPalConfig = async () => {
    try {
      const cfg = await getPayPalConfig()
      setPaypalConfig(cfg)
    } catch {
      setPaypalConfig({ client_id: 'test', environment: 'sandbox' })
    }
  }

  const currSymbol = getCurrencySymbol(form.currency)
  const isZeroDecimal = form.currency === 'JPY'
  const totalCost = isZeroDecimal
    ? Math.round(form.num_tasks * form.price_per_task)
    : (form.num_tasks * form.price_per_task).toFixed(2)
  const platformFee = isZeroDecimal
    ? Math.round(form.num_tasks * form.price_per_task * 0.20)
    : (form.num_tasks * form.price_per_task * 0.20).toFixed(2)
  const workerPayout = isZeroDecimal
    ? Math.round(form.price_per_task * 0.80)
    : (form.price_per_task * 0.80).toFixed(2)

  const handleCreateBatch = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.verification_criteria) {
      toast.error('All fields including Verification Ground Truth Criteria are mandatory.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        client_email: org.business_email,
        organization_name: org.org_name,
        title: form.title,
        description: form.description,
        verification_criteria: form.verification_criteria,
        task_type: form.task_type,
        currency: form.currency,
        num_tasks: form.num_tasks,
        price_per_task: form.price_per_task,
      }

      const result = await createBatch(payload)
      setActiveOrder(result)
      toast.success(`Batch order generated: ${result.paypal_order_id} (${form.currency}). Complete PayPal authorization.`)
      loadBatches()
      setForm(f => ({ ...f, title: '', description: '', verification_criteria: '' }))
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to initialize task batch.')
    } finally {
      setLoading(false)
    }
  }

  const handleCaptureEscrow = async (batchId) => {
    try {
      const result = await captureBatch(batchId)
      toast.success(`PayPal Escrow Captured: ${result.tasks_activated} tasks activated for workers.`)
      setActiveOrder(null)
      loadBatches()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Escrow capture failed.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Enterprise Organization Header */}
      <div className="p-6 rounded-2xl bg-paypal-card border border-paypal-border mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-paypal-light">
              <Building2 size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{org.org_name}</h1>
                {/* Official Verified Enterprise Tick Mark */}
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 text-xs font-semibold"
                  title="Audited and Verified Enterprise Partner"
                >
                  <CheckCircle2 size={13} className="text-paypal-light fill-blue-950" />
                  <span>{org.verification_badge}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Registration: <span className="font-mono text-gray-300">{org.registration_id}</span> · Industry: {org.industry}
              </p>
              <p className="text-xs text-gray-400">
                Authorized Disbursal Account: <span className="text-paypal-light font-mono">{org.paypal_account_email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-paypal-surface p-4 rounded-xl border border-paypal-border">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Active Escrow Treasury</p>
              <p className="text-2xl font-bold text-white">${org.escrow_balance.toFixed(2)} USD</p>
            </div>
            <div className="w-px h-10 bg-paypal-border" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Platform Fee Rate</p>
              <p className="text-sm font-bold text-paypal-light">20% Tier A</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form: Post Task Batch with Proof of Reality */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl bg-paypal-card border border-paypal-border">
            <div className="flex items-center justify-between pb-4 border-b border-paypal-border mb-5">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-paypal-light" />
                <h2 className="text-base font-bold text-white">Create Verified Task Batch</h2>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-paypal-surface text-gray-400 border border-paypal-border">
                Escrow Protected
              </span>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Batch Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urban Accessibility Ramp Verification"
                  className="input-field text-xs"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Work Specifications
                </label>
                <textarea
                  placeholder="Explain exactly what workers must photograph, transcribe, or inspect..."
                  className="input-field text-xs min-h-[75px] resize-none"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              {/* Requirement: Prove Task is Real / Acceptance Criteria */}
              <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-900/60">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1.5">
                  <FileCheck size={14} className="text-paypal-light" />
                  <span>Ground Truth Verification Criteria</span>
                </label>
                <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                  Enterprise requirement: Define the objective benchmark Google Gemini will inspect to verify the work is legitimate before issuing payment.
                </p>
                <textarea
                  placeholder="e.g. Photo must clearly display storefront entrance, sidewalk curb elevation, and continuous handrail."
                  className="input-field text-xs min-h-[65px] bg-paypal-card border-blue-800/80 resize-none text-gray-200"
                  value={form.verification_criteria}
                  onChange={(e) => setForm(f => ({ ...f, verification_criteria: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Modality
                  </label>
                  <select
                    className="select-field text-xs"
                    value={form.task_type}
                    onChange={(e) => setForm(f => ({ ...f, task_type: e.target.value }))}
                  >
                    <option value="image">Image (Multimodal)</option>
                    <option value="text">Text / Fact Audit</option>
                    <option value="audio">Audio Transcription</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Batch Volume
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="input-field text-xs"
                    value={form.num_tasks}
                    onChange={(e) => setForm(f => ({ ...f, num_tasks: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Settlement Currency
                  </label>
                  <select
                    className="select-field text-xs font-mono font-semibold"
                    value={form.currency}
                    onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Price per Task ({form.currency})
                  </label>
                  <input
                    type="number"
                    min="0.10"
                    step={form.currency === 'JPY' ? '10' : '0.10'}
                    className="input-field text-xs font-mono"
                    value={form.price_per_task}
                    onChange={(e) => setForm(f => ({ ...f, price_per_task: parseFloat(e.target.value) || 2.00 }))}
                  />
                </div>
              </div>

              {/* Real-time Economic Breakdown */}
              <div className="p-3.5 rounded-lg bg-paypal-surface border border-paypal-border text-xs space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>Gross Budget ({form.num_tasks} × {currSymbol}{form.price_per_task})</span>
                  <span className="font-mono text-white font-semibold">{currSymbol}{totalCost} {form.currency}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Worker Payout per Item (80%)</span>
                  <span className="font-mono text-paypal-success font-semibold">{currSymbol}{workerPayout} {form.currency}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ImpactPulse Fee (20%)</span>
                  <span className="font-mono text-paypal-light font-semibold">{currSymbol}{platformFee} {form.currency}</span>
                </div>
                <div className="border-t border-paypal-border pt-1.5 flex justify-between font-bold text-white">
                  <span>Total Escrow Deposit</span>
                  <span className="font-mono text-sm text-paypal-light">{currSymbol}{totalCost} {form.currency}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-paypal-light hover:bg-blue-600 font-semibold text-white text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <CreditCard size={15} />
                <span>{loading ? 'Generating Escrow...' : 'Deploy Batch to PayPal Sandbox'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Escrow Orders & Enterprise Batches */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Order Authorization Card (if generated) */}
          {activeOrder && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-blue-950/40 border-2 border-paypal-light shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-paypal-light" />
                  <span className="text-sm font-bold text-white">PayPal Sandbox Escrow Authorization</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
                  Order ID: {activeOrder.paypal_order_id}
                </span>
              </div>
              <p className="text-xs text-gray-300 mb-4">
                An escrow order has been registered on the PayPal Sandbox Orders API. Authorize and lock the funds to activate task availability.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={activeOrder.paypal_approve_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-paypal-light hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
                >
                  <span>Authorize in PayPal Sandbox</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => handleCaptureEscrow(activeOrder.batch?.id || activeOrder.batch_id || activeOrder.batch)}
                  className="px-4 py-2 rounded-lg bg-paypal-success hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 size={13} />
                  <span>Execute Sandbox Capture</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Batches Table & Telemetry */}
          <div className="p-6 rounded-xl bg-paypal-card border border-paypal-border">
            <div className="flex items-center justify-between pb-4 border-b border-paypal-border mb-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-paypal-light" />
                <h2 className="text-base font-bold text-white">Enterprise Task Batches</h2>
              </div>
              <span className="text-xs text-gray-400 font-mono">{batches.length} Batches Registered</span>
            </div>

            {batches.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No task batches deployed yet. Fill the batch form to fund your first micro-task campaign.
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="p-4 rounded-lg bg-paypal-surface/60 border border-paypal-border">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-sm">{batch.title}</h3>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            batch.status === 'funded'
                              ? 'bg-emerald-950 text-paypal-success border border-emerald-800'
                              : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                          }`}>
                            {batch.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{batch.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-white font-mono">
                          {formatCurrency(batch.total_cost, batch.currency)}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-mono">
                          {batch.num_tasks} tasks × {formatCurrency(batch.price_per_task, batch.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Box */}
                    {batch.verification_criteria && (
                      <div className="p-2.5 rounded bg-paypal-card border border-paypal-border/80 my-2.5 text-[11px] text-gray-300">
                        <span className="font-semibold text-gray-400 block mb-0.5">Ground Truth Criteria:</span>
                        {batch.verification_criteria}
                      </div>
                    )}

                    {/* Progress details */}
                    {batch.tasks && (
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-paypal-border/60">
                        <div className="flex gap-3">
                          <span className="text-blue-400 font-mono">
                            {batch.tasks.filter(t => t.status === 'available').length} Available
                          </span>
                          <span className="text-paypal-success font-mono">
                            {batch.tasks.filter(t => t.status === 'paid').length} Verified &amp; Paid
                          </span>
                          <span className="text-red-400 font-mono">
                            {batch.tasks.filter(t => t.status === 'rejected').length} Rejected
                          </span>
                        </div>

                        {batch.status === 'pending' && (
                          <button
                            onClick={() => handleCaptureEscrow(batch.id)}
                            className="text-xs text-paypal-light hover:underline font-semibold"
                          >
                            Capture Escrow →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Human Review Queue & Contributor Appeals */}
          <div className="p-6 rounded-xl bg-paypal-card border border-paypal-border">
            <div className="flex items-center justify-between pb-4 border-b border-paypal-border mb-4">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-amber-400" />
                <h2 className="text-base font-bold text-white">Human Review Queue &amp; Contributor Appeals</h2>
              </div>
              <span className="text-xs text-amber-300 font-mono">
                {reviewItems.length + appeals.length} Action Items
              </span>
            </div>

            {reviewItems.length === 0 && appeals.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                Zero pending manual reviews or appeals. Submissions are currently processed autonomously by Gemini 3.8 Flash.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Borderline Review Items */}
                {reviewItems.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">Task ID: {task.id}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-900 text-amber-200">
                        Borderline AI Confidence ({((task.verification_result?.confidence_score || 0) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-medium">{task.title}</p>
                    <div className="p-2.5 rounded bg-paypal-surface text-[11px] text-gray-300">
                      <span className="font-semibold text-gray-400 block mb-0.5">Contributor Submission:</span>
                      {task.submission_text || task.submission_url || 'No text proof'}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-400 font-mono">
                        Bounty: {formatCurrency(task.payout_amount, task.currency)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleManualReview(task.id, 'reject')}
                          className="px-3 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleManualReview(task.id, 'approve')}
                          className="px-3 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800"
                        >
                          Approve &amp; Disburse
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Worker Appeals */}
                {appeals.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-blue-950/30 border border-blue-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300 font-mono">Appeal for Task: {task.id}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                        Contributor Appeal Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-medium">{task.title}</p>
                    <div className="p-2.5 rounded bg-paypal-surface text-[11px] text-blue-200 border border-blue-800/40">
                      <span className="font-semibold text-blue-300 block mb-0.5">Worker Appeal Statement:</span>
                      {task.appeal_text || 'No statement provided'}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-400 font-mono">
                        Worker: {task.worker_email} | Bounty: {formatCurrency(task.payout_amount, task.currency)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveAppeal(task.id, 'reject')}
                          className="px-3 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800"
                        >
                          Uphold Rejection
                        </button>
                        <button
                          onClick={() => handleResolveAppeal(task.id, 'approve')}
                          className="px-3 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800"
                        >
                          Overturn &amp; Disburse Payout
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>

  )
}
