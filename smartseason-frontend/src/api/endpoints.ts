import api from './client'

export interface LoginData { email: string; password: string }
export interface RegisterData { name: string; email: string; password: string }
export interface FieldCreateData { name: string; cropType: string; plantingDate: string; assignedAgentId?: number | null }
export interface FieldUpdateData { stage: string; notes?: string }

// Auth
export const login = (data: LoginData) => api.post('/auth/login', data)
export const register = (data: RegisterData) => api.post('/auth/register', data)

// Fields
export const getFields = () => api.get('/fields')
export const getFieldById = (id: number) => api.get(`/fields/${id}`)
export const createField = (data: FieldCreateData) => api.post('/fields', data)
export const assignField = (id: number, agentId: number | null) => api.patch(`/fields/${id}/assign`, { agentId })
export const getAgents = () => api.get('/fields/agents')

// Field Updates
export const updateField = (id: number, data: FieldUpdateData) => api.post(`/fields/${id}/update`, data)
export const getFieldUpdates = (id: number) => api.get(`/fields/${id}/updates`)

// Dashboard
export const getDashboard = () => api.get('/dashboard')
