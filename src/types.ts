export type ItemType = 'text' | 'link'
export type ItemStatus = 'inbox' | 'archived' | 'dropped' | 'snoozed'

export interface InboxItem {
  id: string
  type: ItemType
  raw: string
  title: string
  excerpt: string
  createdAt: string
  status: ItemStatus
  destination?: string
  snoozedUntil?: string
}

export interface ArchiveLog {
  itemId: string
  destination: string
  time: string
  title: string
}

export interface Destination {
  id: string
  name: string
  description: string
}