export const DEFAULT_SETTINGS = {
  focus_time: 25,
  short_break_time: 5,
  long_break_time: 15,
  cycles_before_long_break: 4,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  sound_enabled: true,
  notifications_enabled: true,
  auto_commit: false
}

export function normalizeSettings(input) {
  if (!input || typeof input !== 'object') return { ...DEFAULT_SETTINGS }

  // Suporta formato antigo (frontend)
  const focus_time =
    input.focus_time ??
    input.focusDuration ??
    input.focusTime ??
    DEFAULT_SETTINGS.focus_time

  const short_break_time =
    input.short_break_time ??
    input.shortBreakDuration ??
    input.shortBreakTime ??
    DEFAULT_SETTINGS.short_break_time

  const long_break_time =
    input.long_break_time ??
    input.longBreakDuration ??
    input.longBreakTime ??
    DEFAULT_SETTINGS.long_break_time

  const cycles_before_long_break =
    input.cycles_before_long_break ??
    input.cyclesBeforeLongBreak ??
    DEFAULT_SETTINGS.cycles_before_long_break

  const auto_start_breaks =
    input.auto_start_breaks ??
    input.autoStartBreaks ??
    DEFAULT_SETTINGS.auto_start_breaks

  const auto_start_pomodoros =
    input.auto_start_pomodoros ??
    input.autoStartPomodoros ??
    DEFAULT_SETTINGS.auto_start_pomodoros

  const sound_enabled =
    input.sound_enabled ??
    input.sounds ??
    input.soundEnabled ??
    DEFAULT_SETTINGS.sound_enabled

  const notifications_enabled =
    input.notifications_enabled ??
    input.notifications ??
    input.notificationsEnabled ??
    DEFAULT_SETTINGS.notifications_enabled

  const auto_commit = input.auto_commit ?? input.autoCommit ?? DEFAULT_SETTINGS.auto_commit

  return {
    ...DEFAULT_SETTINGS,
    focus_time: Number(focus_time) || DEFAULT_SETTINGS.focus_time,
    short_break_time: Number(short_break_time) || DEFAULT_SETTINGS.short_break_time,
    long_break_time: Number(long_break_time) || DEFAULT_SETTINGS.long_break_time,
    cycles_before_long_break: Number(cycles_before_long_break) || DEFAULT_SETTINGS.cycles_before_long_break,
    auto_start_breaks: Boolean(auto_start_breaks),
    auto_start_pomodoros: Boolean(auto_start_pomodoros),
    sound_enabled: Boolean(sound_enabled),
    notifications_enabled: Boolean(notifications_enabled),
    auto_commit: Boolean(auto_commit),
  }
}

export function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = localStorage.getItem('codefocus-settings')
    if (!raw) return { ...DEFAULT_SETTINGS }
    return normalizeSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return
  const normalized = normalizeSettings(settings)
  localStorage.setItem('codefocus-settings', JSON.stringify(normalized))
}

