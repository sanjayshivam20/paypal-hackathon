import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { DollarSign, TrendingUp, CheckCircle2, ShieldCheck, Download, RefreshCw, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import toast from 'react-hot-toast'
import { getPayouts, getDashboardStats, retryPayout, reconcilePayouts } from '../api'
import { formatCurrency } from '../utils/currency'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const StatusRenderer = (params) => {
  const status = (params.data?.status || params.value || '').toLowerCase()
  if (status === 'success' || status === 'settled') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-950 text-paypal-success border border-emerald-800">
        SETTLED
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span
        title={params.data?.failure_reason || 'Payout rejected by PayPal'}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-red-950 text-red-400 border border-red-800 cursor-help"
      >
        <AlertCircle size={10} />
        FAILED
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-yellow-950 text-yellow-400 border border-yellow-800">
      {status || 'PENDING'}
    </span>
  )
}


const AmountRenderer = (params) => {
  const curr = params.data?.currency || 'USD'
  return <span className="text-paypal-success font-mono font-bold text-xs">{formatCurrency(params.value, curr)}</span>
}

const DateRenderer = (params) => {
  if (!params.value) return <span className="text-gray-600 font-mono text-xs">—</span>
  return <span className="text-gray-400 font-mono text-xs">{new Date(params.value).toLocaleString()}</span>
}

export default function Payouts() {
  const [payoutData, setPayoutData] = useState([])
  const [stats, setStats] = useState(null)
  const [gridApi, setGridApi] = useState(null)
  const [reconciling, setReconciling] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 8000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [payoutsRes, statsRes] = await Promise.all([getPayouts(), getDashboardStats()])
      setPayoutData(payoutsRes)
      setStats(statsRes)
    } catch {
      // Backend not yet reached
    }
  }

  const handleRetry = async (payoutId) => {
    try {
      toast.loading('Retrying payout via PayPal Sandbox...', { id: 'retry' })
      const res = await retryPayout(payoutId)
      if (res.success) {
        toast.success(res.message || 'Payout retry succeeded!', { id: 'retry' })
      } else {
        toast.error(res.message || 'Payout retry failed.', { id: 'retry' })
      }
      loadData()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Payout retry error', { id: 'retry' })
    }
  }

  const handleReconcile = async () => {
    setReconciling(true)
    try {
      const res = await reconcilePayouts()
      toast.success(res.message || 'Reconciliation complete!')
      loadData()
    } catch {
      toast.error('Reconciliation check failed.')
    } finally {
      setReconciling(false)
    }
  }

  const totalDisbursed = payoutData.reduce((sum, p) => sum + p.amount, 0)
  const platformRevenue = stats?.platform_revenue || (totalDisbursed * 0.25)

  const pieData = [
    { name: 'Worker Disbursements (80%)', value: totalDisbursed || 5.20, color: '#00CF92' },
    { name: 'Platform Escrow Fee (20%)', value: platformRevenue || 1.30, color: '#0070E0' },
  ]

  const columnDefs = useMemo(() => [
    { field: 'id', headerName: 'Disbursal ID', width: 130, cellStyle: { fontFamily: 'monospace', fontSize: '11px', color: '#9CA3AF' } },
    { field: 'task_id', headerName: 'Audited Task ID', width: 130, cellStyle: { fontFamily: 'monospace', fontSize: '11px' } },
    { field: 'worker_email', headerName: 'Recipient PayPal Address', flex: 1, minWidth: 190, cellStyle: { fontFamily: 'monospace', fontSize: '11px' } },
    { field: 'amount', headerName: 'Disbursed', width: 140, cellRenderer: AmountRenderer },
    { field: 'currency', headerName: 'Currency', width: 100, cellRenderer: (params) => (
      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
        {params.value || 'USD'}
      </span>
    )},
    { field: 'payout_batch_id', headerName: 'PayPal Payout Batch ID', flex: 1, minWidth: 180, cellStyle: { fontFamily: 'monospace', fontSize: '11px', color: '#93C5FD' } },
    { field: 'status', headerName: 'Rail Status', width: 110, cellRenderer: StatusRenderer },
    {
      headerName: 'Actions',
      width: 100,
      cellRenderer: (params) => {
        if (params.data?.status === 'failed') {
          return (
            <button
              onClick={() => handleRetry(params.data.id)}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-800 transition-colors"
            >
              Retry
            </button>
          )
        }
        return <span className="text-gray-600 text-[10px]">—</span>
      },
    },
    { field: 'created_at', headerName: 'Settlement Timestamp', width: 180, cellRenderer: DateRenderer, sort: 'desc' },
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), [])

  const onGridReady = useCallback((params) => {
    setGridApi(params.api)
    params.api.sizeColumnsToFit()
  }, [])

  const statCards = [
    { label: 'Total Disbursed to Workers', value: `$${totalDisbursed.toFixed(2)} USD`, icon: DollarSign, color: 'text-paypal-success', border: 'border-emerald-900' },
    { label: 'Retained Platform Commission', value: `$${platformRevenue.toFixed(2)} USD`, icon: TrendingUp, color: 'text-paypal-light', border: 'border-blue-900' },
    { label: 'Programmatic Payouts Executed', value: payoutData.length, icon: CheckCircle2, color: 'text-purple-400', border: 'border-purple-900' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <DollarSign size={24} className="text-paypal-light" />
              PayPal Sandbox Disbursement Ledger
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Payouts API v1
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Automated settlement audit log. Every row represents a programmatic transaction executed via the PayPal Payouts API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="px-3 py-1.5 rounded-lg bg-paypal-card border border-paypal-border hover:bg-paypal-surface text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start"
          >
            <RefreshCw size={13} className={reconciling ? 'animate-spin' : ''} />
            <span>Reconcile PayPal Status</span>
          </button>
          {gridApi && (
            <button
              onClick={() => gridApi.exportDataAsCsv({ fileName: 'paypal-payout-ledger.csv' })}
              className="px-3 py-1.5 rounded-lg bg-paypal-card border border-paypal-border hover:bg-paypal-surface text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>


      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statCards.map(card => (
          <motion.div
            key={card.label}
            variants={item}
            className={`p-5 rounded-xl bg-paypal-card border ${card.border} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={18} className={card.color} />
              <span className="text-[10px] font-mono text-gray-500 uppercase">PayPal Rail</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Treasury Fee Split */}
        <div className="p-6 rounded-xl bg-paypal-card border border-paypal-border flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Treasury Split Ratio</h2>
            <p className="text-[11px] text-gray-400 mb-4">Programmatic breakdown per task transaction</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={38}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#E5E7EB', fontSize: 11 }}
                    formatter={(val) => `$${val.toFixed(2)} USD`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-paypal-border/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-paypal-success" />
                <span className="text-gray-300">Worker Payout</span>
              </div>
              <span className="font-mono text-white font-semibold">80%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-paypal-light" />
                <span className="text-gray-300">ImpactPulse Treasury</span>
              </div>
              <span className="font-mono text-white font-semibold">20%</span>
            </div>
          </div>
        </div>

        {/* AG Grid Payouts Ledger */}
        <div className="lg:col-span-3">
          <div className="ag-theme-alpine-dark rounded-xl overflow-hidden border border-paypal-border shadow-sm" style={{ height: 420 }}>
            <AgGridReact
              rowData={payoutData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
              enableCellTextSelection={true}
              getRowId={(params) => params.data.id}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
