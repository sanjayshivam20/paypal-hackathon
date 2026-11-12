import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Configuration ───────────────────────────────────────────────────────────

export const getPayPalConfig = () => api.get('/config/paypal').then(r => r.data)

export const getCurrencies = () => api.get('/currencies').then(r => r.data)

export const updateApiKeys = (data) => api.post('/config/update-keys', data).then(r => r.data)

// ── Role Authentication ─────────────────────────────────────────────────────

export const authOrganization = (data) => api.post('/auth/organization', data).then(r => r.data)

export const authWorker = (data) => api.post('/auth/worker', data).then(r => r.data)

export const getOrganizations = () => api.get('/organizations').then(r => r.data)

// ── Batch & Escrow (Organization Portal) ────────────────────────────────────

export const createBatch = (data) => api.post('/batches', data).then(r => r.data)

export const captureBatch = (batchId) => api.post(`/batches/${batchId}/capture`).then(r => r.data)

export const getBatches = () => api.get('/batches').then(r => r.data)

// ── Tasks & Anti-Fraud (Contributor Portal) ─────────────────────────────────

export const getAvailableTasks = (search = '', taskType = '') =>
  api.get('/tasks/available', { params: { search, task_type: taskType } }).then(r => r.data)

export const getAllTasks = () => api.get('/tasks/all').then(r => r.data)

export const claimTask = (taskId, workerEmail) =>
  api.post(`/tasks/${taskId}/claim`, { worker_email: workerEmail }).then(r => r.data)

export const submitTask = (taskId, formData) =>
  api.post(`/tasks/${taskId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const submitTaskText = (taskId, data) =>
  api.post(`/tasks/${taskId}/submit`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const getWorkerStats = (email) => api.get(`/workers/${email}/stats`).then(r => r.data)

// ── External Online Tasks Aggregator ────────────────────────────────────────

export const getExternalTasks = (category = 'All', query = '') =>
  api.get('/external-tasks', { params: { category, query } }).then(r => r.data)

export const claimAndSubmitExternalTask = (data) =>
  api.post('/external-tasks/claim-and-submit', data).then(r => r.data)

// ── Analytics & Ledgers ─────────────────────────────────────────────────────

export const getDashboardStats = () => api.get('/dashboard/stats').then(r => r.data)

export const getPayouts = () => api.get('/payouts').then(r => r.data)

// ── Manual Review & Contributor Appeal Rails ────────────────────────────────

export const getReviewQueue = () => api.get('/tasks/review-queue').then(r => r.data)

export const processManualReview = (taskId, data) =>
  api.post(`/tasks/${taskId}/manual-review`, data).then(r => r.data)

export const submitTaskAppeal = (taskId, data) =>
  api.post(`/tasks/${taskId}/appeal`, data).then(r => r.data)

export const getAppeals = () => api.get('/tasks/appeals').then(r => r.data)

export const resolveTaskAppeal = (taskId, data) =>
  api.post(`/tasks/${taskId}/resolve-appeal`, data).then(r => r.data)

// ── Payout Failure Handling & Reconciliation ─────────────────────────────────

export const retryPayout = (payoutId, data = {}) =>
  api.post(`/payouts/${payoutId}/retry`, data).then(r => r.data)

export const reconcilePayouts = () =>
  api.post('/payouts/reconcile').then(r => r.data)

export default api

