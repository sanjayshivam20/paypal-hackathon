import { useState } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Users,
  LayoutGrid,
  DollarSign,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X,
  CreditCard,
  Key,
} from 'lucide-react'

import Dashboard from './pages/Dashboard'
import OrganizationPortal from './pages/ClientPortal'
import ContributorHub from './pages/WorkerHub'
import OtherOnlineTasks from './pages/OtherOnlineTasks'
import TaskBoard from './pages/TaskBoard'
import Payouts from './pages/Payouts'
import ApiSettingsModal from './components/ApiSettingsModal'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Executive Dashboard' },
  { path: '/organization', icon: Building2, label: 'Enterprise Portal', badge: 'Verified' },
  { path: '/contributor', icon: Users, label: 'Contributor Hub' },
  { path: '/online-tasks', icon: Globe, label: 'Other Online Tasks', badge: 'External' },
  { path: '/tasks', icon: LayoutGrid, label: 'AG Grid Task Board' },
  { path: '/payouts', icon: DollarSign, label: 'Disbursement Ledger' },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-paypal-bg text-gray-200">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#F3F4F6',
            border: '1px solid #374151',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00CF92', secondary: '#111827' } },
          error: { iconTheme: { primary: '#FF4444', secondary: '#111827' } },
        }}
      />

      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label="Toggle navigation"
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-paypal-card rounded-lg border border-paypal-border shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-paypal-card border-r border-paypal-border
          flex flex-col transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-paypal-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-paypal-light flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base">ImpactPulse AI</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 text-paypal-light border border-blue-800">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Autonomous Escrow &amp; Audit Rails</p>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Banner */}
        <div className="p-4 border-b border-paypal-border/60 bg-paypal-surface/40">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Portal Selection</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { navigate('/organization'); setSidebarOpen(false) }}
              className="text-left p-2 rounded-lg bg-paypal-surface hover:bg-paypal-border transition-colors border border-paypal-border/80"
            >
              <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
                <Building2 size={12} className="text-paypal-light" />
                <span>Enterprise</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-blue-400 mt-0.5">
                <CheckCircle2 size={10} className="text-blue-400" />
                <span>Verified Tick</span>
              </div>
            </button>
            <button
              onClick={() => { navigate('/contributor'); setSidebarOpen(false) }}
              className="text-left p-2 rounded-lg bg-paypal-surface hover:bg-paypal-border transition-colors border border-paypal-border/80"
            >
              <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
                <Users size={12} className="text-paypal-success" />
                <span>Contributor</span>
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5">Instant Payouts</div>
            </button>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-paypal-light/15 text-paypal-light border border-paypal-light/30'
                    : 'text-gray-300 hover:text-white hover:bg-paypal-surface/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  badge === 'Verified' ? 'bg-blue-900/60 text-blue-300' : 'bg-gray-800 text-gray-300'
                }`}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Infrastructure Status & Credentials Manager */}
        <div className="p-4 border-t border-paypal-border bg-paypal-card/80 space-y-2.5">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-paypal-surface hover:bg-paypal-border text-gray-200 text-xs font-semibold flex items-center justify-between border border-paypal-border transition-colors"
          >
            <div className="flex items-center gap-2">
              <Key size={13} className="text-paypal-light" />
              <span>API Credentials</span>
            </div>
            <span className="text-[10px] font-mono text-paypal-light uppercase">Configure</span>
          </button>

          <div className="p-3 rounded-lg border border-paypal-border bg-paypal-surface/50 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-paypal-success" />
                <span className="text-gray-300 font-medium text-[11px]">PayPal Sandbox Rails</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Orders + Payouts</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-paypal-border/60">
              <span className="text-[11px] text-gray-400">AI Quality Auditor</span>
              <span className="text-[10px] font-mono text-paypal-light font-semibold">Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </aside>

      {/* API Credentials Modal */}
      <ApiSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Main Workspace View */}
      <main className="flex-1 overflow-y-auto">
        {/* Environment & Platform Escrow Model Banner */}
        <div className="bg-paypal-card border-b border-paypal-border px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-paypal-success"></span>
            <span className="font-semibold text-gray-200">PayPal Developer Sandbox</span>
            <span className="text-gray-400">| Test Currency Environment</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Platform Escrow Reserve: Orders v2 Auth/Capture</span>
            <span className="text-gray-600">•</span>
            <span className="text-paypal-light">15 Benchmark ISO Currencies</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/organization" element={<OrganizationPortal />} />
              <Route path="/client" element={<Navigate to="/organization" replace />} />
              <Route path="/contributor" element={<ContributorHub />} />
              <Route path="/worker" element={<Navigate to="/contributor" replace />} />
              <Route path="/online-tasks" element={<OtherOnlineTasks />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/payouts" element={<Payouts />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
