import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import {
  LayoutGrid,
  RefreshCw,
  Download,
  Search,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'
import { getAllTasks } from '../api'
import { formatCurrency } from '../utils/currency'

// ── Professional Cell Renderers (Zero Emojis) ───────────────────────────────

const StatusBadgeRenderer = (params) => {
  const data = params.data || {}
  const status = data.status || 'pending'
  const isFraud = data.fraud_flagged

  if (isFraud) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950 text-red-400 border border-red-800">
        FRAUD FLAGGED
      </span>
    )
  }

  const styles = {
    available: 'bg-blue-950 text-blue-300 border border-blue-800',
    claimed: 'bg-amber-950 text-amber-300 border border-amber-800',
    submitted: 'bg-purple-950 text-purple-300 border border-purple-800',
    paid: 'bg-emerald-950 text-paypal-success border border-emerald-800',
    rejected: 'bg-gray-800 text-gray-400 border border-gray-700',
    pending: 'bg-gray-900 text-gray-500 border border-gray-800',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${styles[status] || styles.pending}`}>
      {status === 'paid' ? 'VERIFIED PAID' : status}
    </span>
  )
}

const OrganizationRenderer = (params) => {
  const org = params.value || 'Verified Enterprise'
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
      <CheckCircle2 size={12} className="text-paypal-light flex-shrink-0" />
      <span className="truncate">{org}</span>
    </div>
  )
}

const TypeBadgeRenderer = (params) => {
  const type = (params.value || 'image').toLowerCase()
  const styles = {
    image: 'text-blue-400 bg-blue-950/60 border-blue-800',
    text: 'text-purple-400 bg-purple-950/60 border-purple-800',
    audio: 'text-amber-400 bg-amber-950/60 border-amber-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${styles[type] || 'text-gray-400'}`}>
      {type}
    </span>
  )
}

const ConfidenceRenderer = (params) => {
  const score = params.value
  if (score == null) return <span className="text-gray-600 font-mono text-xs">—</span>
  const pct = (score * 100).toFixed(0)
  const isFraud = params.data?.fraud_flagged
  const color = isFraud ? 'bg-red-500' : score >= 0.8 ? 'bg-paypal-success' : score >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2 w-full pt-1">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono text-gray-300 w-8 text-right">{pct}%</span>
    </div>
  )
}

const PayoutRenderer = (params) => {
  const val = params.value
  if (!val) return <span className="text-gray-600 font-mono text-xs">—</span>
  const curr = params.data?.currency || 'USD'
  return <span className="text-paypal-success font-mono font-bold text-xs">{formatCurrency(val, curr)}</span>
}

const PayoutIdRenderer = (params) => {
  const val = params.value
  if (!val) return <span className="text-gray-600 font-mono text-[11px]">—</span>
  return <span className="font-mono text-gray-300 text-[11px]">{val}</span>
}

export default function TaskBoard() {
  const [rowData, setRowData] = useState([])
  const [quickFilter, setQuickFilter] = useState('')
  const [lastRefresh, setLastRefresh] = useState(null)
  const [gridApi, setGridApi] = useState(null)

  useEffect(() => {
    loadTasks()
    const interval = setInterval(loadTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadTasks = async () => {
    try {
      const data = await getAllTasks()
      setRowData(data.map(t => ({
        ...t,
        confidence_score: t.verification_result?.confidence_score ?? null,
        approved: t.verification_result?.approved ?? null,
        reasoning: t.verification_result?.reasoning ?? null,
      })))
      setLastRefresh(new Date())
    } catch {
      // Backend not yet reachable
    }
  }

  const onGridReady = useCallback((params) => {
    setGridApi(params.api)
    params.api.sizeColumnsToFit()
  }, [])

  const columnDefs = useMemo(() => [
    {
      headerName: 'Task & Enterprise Metadata',
      children: [
        {
          field: 'id',
          headerName: 'Task ID',
          width: 120,
          filter: 'agTextColumnFilter',
          cellStyle: { fontFamily: 'monospace', fontSize: '11px', color: '#9CA3AF' },
        },
        {
          field: 'organization_name',
          headerName: 'Enterprise Client',
          width: 190,
          cellRenderer: OrganizationRenderer,
          filter: 'agTextColumnFilter',
        },
        {
          field: 'title',
          headerName: 'Task Scope',
          flex: 1,
          minWidth: 200,
          filter: 'agTextColumnFilter',
        },
        {
          field: 'task_type',
          headerName: 'Modality',
          width: 105,
          cellRenderer: TypeBadgeRenderer,
          filter: 'agTextColumnFilter',
        },
      ],
    },
    {
      headerName: 'Verification & Anti-Fraud Telemetry',
      children: [
        {
          field: 'status',
          headerName: 'Audit Status',
          width: 140,
          cellRenderer: StatusBadgeRenderer,
          filter: 'agTextColumnFilter',
        },
        {
          field: 'confidence_score',
          headerName: 'AI Confidence',
          width: 160,
          cellRenderer: ConfidenceRenderer,
          filter: 'agNumberColumnFilter',
        },
        {
          field: 'worker_email',
          headerName: 'Contributor',
          width: 170,
          filter: 'agTextColumnFilter',
          cellStyle: { fontSize: '11px', fontFamily: 'monospace' },
        },
      ],
    },
    {
      headerName: 'PayPal Sandbox Settlement',
      children: [
        {
          field: 'payout_amount',
          headerName: 'Bounty',
          width: 110,
          cellRenderer: PayoutRenderer,
          filter: 'agNumberColumnFilter',
        },
        {
          field: 'payout_id',
          headerName: 'Disbursal Batch ID',
          width: 170,
          cellRenderer: PayoutIdRenderer,
          filter: 'agTextColumnFilter',
        },
      ],
    },
  ], [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), [])

  const exportCsv = () => {
    if (gridApi) gridApi.exportDataAsCsv({ fileName: 'impactpulse-task-ledger.csv' })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <LayoutGrid size={24} className="text-paypal-light" />
              AG Grid Task &amp; Audit Ledger
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              AG Grid Community Edition
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Real-time multi-column telemetry streaming Gemini confidence ratings, anti-fraud flags, and PayPal Sandbox batch IDs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
              <Clock size={10} />
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-8 pr-3 py-1.5 text-xs bg-paypal-card border border-paypal-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-paypal-light w-44"
              placeholder="Filter grid..."
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
            />
          </div>
          <button
            onClick={loadTasks}
            className="p-2 rounded-lg bg-paypal-card border border-paypal-border hover:bg-paypal-surface text-gray-300 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg bg-paypal-card border border-paypal-border hover:bg-paypal-surface text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Meta */}
      <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-paypal-success" />
          <span>{rowData.length} Total Task Records Streamed · Sync Interval 5s</span>
        </div>
        <span className="font-mono text-[11px] text-gray-500">Dual Rail: Gemini Multimodal + PayPal Sandbox</span>
      </div>

      {/* AG Grid Component */}
      <div className="ag-theme-alpine-dark rounded-xl overflow-hidden border border-paypal-border shadow-sm" style={{ height: 600 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          quickFilterText={quickFilter}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowSelection="multiple"
          animateRows={true}
          enableCellTextSelection={true}
          getRowId={(params) => params.data.id}
        />
      </div>
    </motion.div>
  )
}
