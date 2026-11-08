import type { ArchiveLog, Destination, InboxItem } from './types'

const KEYS = {
  items: 'paperflow.items.v1',
  logs: 'paperflow.archive.v1',
  destinations: 'paperflow.destinations.v1',
  theme: 'paperflow.theme.v1'
}

const defaults: Destination[] = [
  { id: 'notes', name: '知识库', description: '值得长期保存的内容' },
  { id: 'read', name: '待读清单', description: '文章、资料与灵感' },
  { id: 'project', name: '项目资料', description: '正在推进的事项' }
]

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const loadItems = () => read<InboxItem[]>(KEYS.items, [])
export const saveItems = (value: InboxItem[]) => write(KEYS.items, value)
export const loadLogs = () => read<ArchiveLog[]>(KEYS.logs, [])
export const saveLogs = (value: ArchiveLog[]) => write(KEYS.logs, value)
export const loadDestinations = () => read<Destination[]>(KEYS.destinations, defaults)
export const saveDestinations = (value: Destination[]) => write(KEYS.destinations, value)
export const loadTheme = () => read<'light' | 'dark'>(KEYS.theme, 'light')
export const saveTheme = (value: 'light' | 'dark') => write(KEYS.theme, value)

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}