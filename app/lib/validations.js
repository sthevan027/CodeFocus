import { z } from 'zod'

// Validação de registro
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().optional(),
  full_name: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  provider: z.string().default('email'),
  avatar_url: z.string().url().optional().or(z.literal(''))
})

// Validação de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

// Validação de ciclo
export const cycleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  duration: z.number().int().positive('Duração deve ser positiva'),
  phase: z.enum(['focus', 'shortBreak', 'longBreak'], {
    errorMap: () => ({ message: 'Fase inválida' })
  }),
  git_commit: z.string().optional(),
  git_files: z.string().optional()
})

// Validação de atualização de ciclo
export const cycleUpdateSchema = z.object({
  name: z.string().optional(),
  completed: z.boolean().optional(),
  interrupted: z.boolean().optional(),
  git_commit: z.string().optional(),
  git_files: z.string().optional(),
  end_time: z.string().datetime().optional()
})

// Validação de configurações
export const settingsUpdateSchema = z.object({
  focus_time: z.number().int().positive().optional(),
  short_break_time: z.number().int().positive().optional(),
  long_break_time: z.number().int().positive().optional(),
  auto_start_breaks: z.boolean().optional(),
  auto_start_pomodoros: z.boolean().optional(),
  sound_enabled: z.boolean().optional(),
  notifications_enabled: z.boolean().optional(),
  auto_commit: z.boolean().optional(),
  auto_push: z.boolean().optional(),
  git_commit_template: z.string().optional(),
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notification_sound: z.string().optional(),
  notification_volume: z.number().int().min(0).max(100).optional(),
  auto_generate_reports: z.boolean().optional(),
  report_format: z.enum(['txt', 'json', 'pdf']).optional(),
  oauth_preferences: z.record(z.any()).optional()
})

// Validação de relatório
export const reportGenerateSchema = z.object({
  report_type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  format: z.enum(['txt', 'json']).default('txt'),
  include_git_data: z.boolean().default(true),
  include_statistics: z.boolean().default(true),
  include_charts: z.boolean().default(true)
})

