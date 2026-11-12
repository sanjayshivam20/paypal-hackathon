import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Cpu,
  Server,
  Cloud,
  Loader2,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPayPalConfig, updateApiKeys } from '../api'

export default function ApiSettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('paypal') // 'paypal' | 'ai'
  
  // PayPal credentials
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [hasExistingSecret, setHasExistingSecret] = useState(false)

  // AI Engine configuration
  const [aiProvider, setAiProvider] = useState('default_gemini') // 'default_gemini' | 'local_model' | 'custom_cloud'
  
  // Gemini settings
  const [geminiKey, setGeminiKey] = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-3.8-flash')
  const [hasExistingGeminiKey, setHasExistingGeminiKey] = useState(false)

  // Local model settings
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434/v1')
  const [localModelName, setLocalModelName] = useState('llama3.2')

  // Custom cloud settings
  const [customProvider, setCustomProvider] = useState('openai')
  const [customApiKey, setCustomApiKey] = useState('')
  const [customModelName, setCustomModelName] = useState('gpt-4o-mini')
  const [customBaseUrl, setCustomBaseUrl] = useState('https://api.openai.com/v1')
  const [hasExistingCustomKey, setHasExistingCustomKey] = useState(false)

  const [loading, setLoading] = useState(false)
  const [configStatus, setConfigStatus] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const loadConfig = async () => {
    try {
      const cfg = await getPayPalConfig()
      setConfigStatus(cfg)
      if (cfg.client_id && cfg.client_id !== 'test') {
        setClientId(cfg.client_id)
      }
      setHasExistingSecret(Boolean(cfg.has_client_secret))
      setHasExistingGeminiKey(Boolean(cfg.has_gemini_key))
      setHasExistingCustomKey(Boolean(cfg.has_custom_key))

      if (cfg.active_gemini_model) {
        setGeminiModel(cfg.active_gemini_model)
      }
      if (cfg.active_ai_provider) {
        setAiProvider(cfg.active_ai_provider)
      }
      if (cfg.local_endpoint) {
        setLocalEndpoint(cfg.local_endpoint)
      }
      if (cfg.local_model_name) {
        setLocalModelName(cfg.local_model_name)
      }
      if (cfg.custom_provider) {
        setCustomProvider(cfg.custom_provider)
      }
      if (cfg.custom_model_name) {
        setCustomModelName(cfg.custom_model_name)
      }
      if (cfg.custom_base_url) {
        setCustomBaseUrl(cfg.custom_base_url)
      }
    } catch {
      // Backend offline fallback
    }
  }

  const handleCustomProviderChange = (prov) => {
    setCustomProvider(prov)
    if (prov === 'openai') {
      setCustomBaseUrl('https://api.openai.com/v1')
      setCustomModelName('gpt-4o-mini')
    } else if (prov === 'groq') {
      setCustomBaseUrl('https://api.groq.com/openai/v1')
      setCustomModelName('llama-3.3-70b-versatile')
    } else if (prov === 'mistral') {
      setCustomBaseUrl('https://api.mistral.ai/v1')
      setCustomModelName('mistral-small-latest')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        paypal_client_id: clientId.trim(),
        paypal_client_secret: clientSecret.trim(),
        ai_provider: aiProvider,
        gemini_api_key: geminiKey.trim(),
        gemini_model: geminiModel,
        local_endpoint: localEndpoint.trim(),
        local_model_name: localModelName.trim(),
        custom_provider: customProvider,
        custom_api_key: customApiKey.trim(),
        custom_model_name: customModelName.trim(),
        custom_base_url: customBaseUrl.trim(),
      }

      const res = await updateApiKeys(payload)

      if (res.paypal_status === 'CONNECTED') {
        toast.success('PayPal Sandbox: Live connection verified.')
      } else if (res.paypal_status.startsWith('FAILED')) {
        toast.error(`PayPal Sandbox: ${res.paypal_status}`)
      }

      if (res.gemini_status === 'CONNECTED') {
        toast.success(`Google Gemini: ${res.active_gemini_model} verified.`)
      } else if (res.gemini_status.startsWith('FAILED')) {
        toast.error(`Gemini validation: ${res.gemini_status}`)
      }

      toast.success(`AI Verification Engine set to: ${aiProvider.replace('_', ' ').toUpperCase()}`)
      loadConfig()
      setTimeout(onClose, 1000)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update credentials.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-paypal-card border border-paypal-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-paypal-border flex items-center justify-between bg-paypal-surface/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-paypal-light">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">System Credentials &amp; AI Engine Settings</h2>
              <p className="text-[11px] text-gray-400">Configure live PayPal Developer Sandbox and Dual AI Verification Engines</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-paypal-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Status Header Bar */}
        <div className="px-5 py-3 bg-paypal-surface/30 border-b border-paypal-border grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-paypal-surface border border-paypal-border">
            <span className="text-gray-400 text-[11px]">PayPal Sandbox:</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              configStatus?.is_live_sandbox
                ? 'bg-emerald-950 text-paypal-success border border-emerald-800'
                : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
            }`}>
              {configStatus?.is_live_sandbox ? 'LIVE CONNECTED' : 'UNCONFIGURED'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-paypal-surface border border-paypal-border">
            <span className="text-gray-400 text-[11px]">Active AI Engine:</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-paypal-light border border-blue-800 uppercase">
              {configStatus?.active_ai_provider || aiProvider}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-paypal-border bg-paypal-surface/40 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('paypal')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'paypal'
                ? 'border-paypal-light text-paypal-light'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>PayPal Sandbox Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-paypal-light text-paypal-light'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu size={14} />
            <span>AI Verification Engine (Dual Options)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {activeTab === 'paypal' ? (
            /* ── Tab 1: PayPal Credentials ── */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-paypal-surface/60 border border-paypal-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white tracking-wide text-xs">
                    PayPal Sandbox REST API Credentials
                  </span>
                  <a
                    href="https://developer.paypal.com/dashboard/applications/sandbox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-paypal-light hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>developer.paypal.com</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Powers the Orders API v2 (client escrow funding) and Payouts API v1 (instant worker disbursement upon AI approval).
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-gray-300 mb-1">
                    Sandbox Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter PayPal Sandbox Client ID (e.g. AXXXXXXXX...)"
                    className="input-field text-xs font-mono"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-gray-300">
                      Sandbox Secret Key
                    </label>
                    {hasExistingSecret && (
                      <span className="text-[10px] text-paypal-success flex items-center gap-1 font-mono">
                        <Lock size={10} />
                        Secret configured in backend environment
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={hasExistingSecret ? "•••••••••••••••••••••••••••••••• (Leave blank to keep current)" : "Enter PayPal Sandbox Client Secret (e.g. EXXXXXXXX...)"}
                    className="input-field text-xs font-mono"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                  />

                  <p className="text-[10px] text-gray-500 mt-1">
                    Keys are validated live against https://api-m.sandbox.paypal.com before being persisted.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Tab 2: AI Verification Engine ── */
            <div className="space-y-4">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Choose the AI engine used for micro-task quality auditing and anti-fraud takeover. Select between Google Gemini, a 100% private local model, or a custom cloud provider.
              </p>

              {/* Provider Radio Cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Option 1: Default Gemini */}
                <div
                  onClick={() => setAiProvider('default_gemini')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    aiProvider === 'default_gemini'
                      ? 'bg-blue-950/40 border-paypal-light text-white shadow-sm'
                      : 'bg-paypal-surface/60 border-paypal-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Cloud size={16} className={aiProvider === 'default_gemini' ? 'text-paypal-light' : 'text-gray-500'} />
                    <span className="font-semibold text-xs text-white">Google Gemini</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Flagship multimodal vision reasoning &amp; anti-fraud heuristics.
                  </p>
                </div>

                {/* Option 2: Local AI Model */}
                <div
                  onClick={() => setAiProvider('local_model')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    aiProvider === 'local_model'
                      ? 'bg-blue-950/40 border-paypal-light text-white shadow-sm'
                      : 'bg-paypal-surface/60 border-paypal-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Server size={16} className={aiProvider === 'local_model' ? 'text-paypal-light' : 'text-gray-500'} />
                    <span className="font-semibold text-xs text-white">Local AI Model</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Runs locally on Ollama or LM Studio. Zero external API fees.
                  </p>
                </div>

                {/* Option 3: Custom Cloud */}
                <div
                  onClick={() => setAiProvider('custom_cloud')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    aiProvider === 'custom_cloud'
                      ? 'bg-blue-950/40 border-paypal-light text-white shadow-sm'
                      : 'bg-paypal-surface/60 border-paypal-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Cpu size={16} className={aiProvider === 'custom_cloud' ? 'text-paypal-light' : 'text-gray-500'} />
                    <span className="font-semibold text-xs text-white">Custom Cloud AI</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    OpenAI GPT-4o, Groq Llama 3.3, or custom endpoint key.
                  </p>
                </div>
              </div>

              {/* Sub-panel based on selection */}
              {aiProvider === 'default_gemini' && (
                <div className="p-4 rounded-xl bg-paypal-surface/60 border border-paypal-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Google Gemini Settings</span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-paypal-light hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>aistudio.google.com</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        placeholder={hasExistingGeminiKey ? "•••••••••••••••••••••••• (Leave blank to keep current)" : "Enter Gemini API Key (e.g. AIzaSy...)"}
                        className="input-field text-xs font-mono"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                      />

                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Active Model
                      </label>
                      <select
                        className="select-field text-xs font-mono"
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.target.value)}
                      >
                        <option value="gemini-3.8-flash">gemini-3.8-flash (Active)</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Standard)</option>
                        <option value="gemini-3.7-flash">gemini-3.7-flash (Preview)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {aiProvider === 'local_model' && (
                <div className="p-4 rounded-xl bg-paypal-surface/60 border border-paypal-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Local Inference Configuration (OpenAI Compatible)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Private Offline Inference</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Local Server Base URL
                      </label>
                      <input
                        type="text"
                        placeholder="http://localhost:11434/v1"
                        className="input-field text-xs font-mono"
                        value={localEndpoint}
                        onChange={(e) => setLocalEndpoint(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Ollama: :11434/v1 | LM Studio: :1234/v1</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Model Identifier
                      </label>
                      <input
                        type="text"
                        placeholder="llama3.2"
                        className="input-field text-xs font-mono"
                        value={localModelName}
                        onChange={(e) => setLocalModelName(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">e.g. llama3.2, mistral, deepseek-r1, qwen2.5</p>
                    </div>
                  </div>
                </div>
              )}

              {aiProvider === 'custom_cloud' && (
                <div className="p-4 rounded-xl bg-paypal-surface/60 border border-paypal-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">Custom Cloud LLM Settings</span>
                    <div className="flex gap-1.5">
                      {['openai', 'groq', 'mistral'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleCustomProviderChange(p)}
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border transition-colors ${
                            customProvider === p
                              ? 'bg-paypal-light text-white border-paypal-light'
                              : 'bg-paypal-surface text-gray-400 border-paypal-border'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Custom API Key
                      </label>
                      <input
                        type="password"
                        placeholder={hasExistingCustomKey ? "••••••••••••••••••••••••" : "sk-..."}
                        className="input-field text-xs font-mono"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-300 mb-1">
                        Model Name
                      </label>
                      <input
                        type="text"
                        placeholder="gpt-4o-mini"
                        className="input-field text-xs font-mono"
                        value={customModelName}
                        onChange={(e) => setCustomModelName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-300 mb-1">
                      Endpoint Base URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://api.openai.com/v1"
                      className="input-field text-xs font-mono"
                      value={customBaseUrl}
                      onChange={(e) => setCustomBaseUrl(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-paypal-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-paypal-surface hover:bg-paypal-border text-gray-300 font-semibold text-xs border border-paypal-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-paypal-light hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Validating live configuration...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Save &amp; Apply Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
