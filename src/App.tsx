import { useEffect, useMemo, useState } from 'react'
import { Archive, Check, Clock3, FileText, Inbox, Link2, Moon, Plus, Sun, Trash2, FolderOpen, ArrowDownToLine } from 'lucide-react'
import type { ArchiveLog, InboxItem, Destination } from './types'
import { downloadJSON, loadDestinations, loadItems, loadLogs, loadTheme, saveDestinations, saveItems, saveLogs, saveTheme } from './storage'

type Page = 'capture' | 'triage' | 'archive' | 'settings'
const isLink = (s: string) => /^https?:\/\/\S+$/i.test(s.trim())

export default function App() {
  const [items, setItems] = useState<InboxItem[]>(loadItems)
  const [logs, setLogs] = useState<ArchiveLog[]>(loadLogs)
  const [destinations, setDestinations] = useState<Destination[]>(loadDestinations)
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme)
  const [page, setPage] = useState<Page>('capture')
  const [draft, setDraft] = useState('')
  const [destination, setDestination] = useState('')
  const [newDestination, setNewDestination] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => saveItems(items), [items])
  useEffect(() => saveLogs(logs), [logs])
  useEffect(() => saveDestinations(destinations), [destinations])
  useEffect(() => { saveTheme(theme); document.documentElement.dataset.theme = theme }, [theme])
  const inbox = useMemo(() => items.filter(x => x.status === 'inbox'), [items])
  const current = inbox[0]
  const capture = () => {
    const raw = draft.trim()
    if (!raw) return
    const link = isLink(raw)
    setItems(old => [{ id: crypto.randomUUID(), type: link ? 'link' : 'text', raw, title: link ? raw.replace(/^https?:\/\//, '').split('/')[0] : raw.split('\n')[0].slice(0, 48), excerpt: raw.replace(/\s+/g, ' ').slice(0, 150), createdAt: new Date().toISOString(), status: 'inbox' }, ...old])
    setDraft('')
    setNotice('已投递到收件托盘')
    window.setTimeout(() => setNotice(''), 1600)
  }
  const sort = (status: 'archived' | 'snoozed' | 'dropped') => {
    if (!current) return
    setItems(old => old.map(x => x.id === current.id ? { ...x, status, destination: status === 'archived' ? (destination || destinations[0]?.name || '知识库') : undefined, snoozedUntil: status === 'snoozed' ? new Date(Date.now() + 86400000).toISOString() : undefined } : x))
    if (status === 'archived') setLogs(old => [{ itemId: current.id, destination: destination || destinations[0]?.name || '知识库', time: new Date().toISOString(), title: current.title }, ...old])
    setNotice(status === 'archived' ? '已归档' : status === 'snoozed' ? '已放入稍后托盘' : '已丢弃')
    window.setTimeout(() => setNotice(''), 1600)
  }
  const addDestination = () => {
    const name = newDestination.trim()
    if (!name || destinations.some(x => x.name === name)) return
    setDestinations(old => [...old, { id: crypto.randomUUID(), name, description: '自定义归档出口' }])
    setNewDestination('')
  }
  const nav: { id: Page; label: string }[] = [{ id: 'capture', label: '快速捕获' }, { id: 'triage', label: '分拣台' }, { id: 'archive', label: '归档记录' }, { id: 'settings', label: '工作台设置' }]
  return <div className="app-shell">
    <header className="topbar"><div className="brand-lockup"><div className="brand-mark"><Inbox size={19}/></div><div><div className="brand-name">Paperflow<span>®</span></div><div className="brand-caption">PERSONAL INTAKE SYSTEM</div></div></div><div className="topbar-right"><span className="desk-status"><i/> LOCAL DESK · 已就绪</span><button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button><div className="avatar">P</div></div></header>
    <div className="workspace"><aside className="sidebar"><div className="side-label">WORKSPACE</div><div className="nav-list">{nav.map(n => <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}><span>{n.label}</span><small>{n.id.toUpperCase()}</small></button>)}</div><div className="sidebar-divider"/><div className="tray-mini"><div className="tray-mini-top">收件托盘 <span className="tray-count">{inbox.length}</span></div><div className="mini-paper-stack">{inbox.slice(0,4).map(x => <i key={x.id}/>)}{!inbox.length && <span className="empty-tray">空托盘</span>}</div><div className="tray-mini-foot">待处理 <b>{inbox.length} ITEMS</b></div></div><div className="sidebar-bottom"><div className="privacy-seal">● 仅保存在此设备</div><div className="version">PAPERFLOW / 1.0.0</div></div></aside>
    <main className="main-area"><div className="page-heading"><div><div className="eyebrow">YOUR PERSONAL DESK ／ {page.toUpperCase()}</div><h1>{page === 'capture' ? '把灵感，先放在这里。' : page === 'triage' ? '一张一张，妥善安放。' : page === 'archive' ? '每一份留存，都有迹可循。' : '整理你的分拣规则。'}</h1><p>不必现在整理。先收下，稍后再决定它的去处。</p></div></div>
    {page === 'capture' && <section className="capture-layout"><div className="capture-column"><div className="section-kicker">INCOMING NOTE · 01 / CAPTURE</div><div className="paper-note"><div className="note-topline"><span>QUICK DROP</span><span>无需分类</span></div><textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') capture() }} placeholder="写下一段想法，或直接粘贴一个链接……"/><div className="note-footer"><span>{isLink(draft) ? <><Link2 size={13}/> LINK DETECTED</> : <><FileText size={13}/> PLAIN TEXT</>} · 自动识别类型</span><span>{draft.length} CHAR</span></div></div><div className="capture-actions"><span>⌘ / Ctrl + Enter 投递</span><button className="primary-button" onClick={capture} disabled={!draft.trim()}>投递到收件托盘 <ArrowDownToLine size={16}/></button></div><div className="capture-footnote">快速捕获不请求网络、不弹确认、不打断思路。</div></div><div className="tray-column"><div className="section-kicker">INBOX TRAY · LIVE STACK</div><div className="physical-tray"><div className="tray-paper-stack">{inbox.slice(0,6).map(x => <div className="stack-paper" key={x.id}>{x.title}</div>)}{!inbox.length && <div className="tray-empty-mark"><Inbox size={32}/><span>等待下一张便签</span></div>}</div><div className="tray-front"><span>INCOMING / {String(inbox.length).padStart(2,'0')}</span><b>收 件 托 盘</b></div></div><div className="tray-summary"><div><b>{inbox.length}</b><span>待分拣</span></div><div><b>{items.filter(x => x.status === 'snoozed').length}</b><span>稍后处理</span></div><div><b>{items.filter(x => x.status === 'archived').length}</b><span>已归档</span></div></div><button className="text-link" onClick={() => setPage('triage')}>前往分拣台 →</button></div></section>}
    {page === 'triage' && <section className="triage-section"><div className="triage-toolbar"><div className="queue-indicator">NEXT IN LINE <b>{inbox.length ? `01 / ${String(inbox.length).padStart(2,'0')}` : 'QUEUE EMPTY'}</b></div></div>{current ? <div className="sorting-floor"><button className="sort-bin bin-later" onClick={() => sort('snoozed')}><Clock3/><b>稍后处理</b><span>放进待办托盘</span><kbd>S</kbd></button><article className="triage-paper"><div className="triage-paper-meta"><span>{current.type.toUpperCase()} NOTE</span><span>{new Date(current.createdAt).toLocaleString('zh-CN')}</span></div><h2>{current.title}</h2><p>{current.excerpt}</p>{current.type === 'link' && <a href={current.raw} target="_blank" rel="noreferrer">{current.raw}</a>}<div className="triage-paper-bottom">FROM INBOX TRAY</div></article><button className="sort-bin bin-archive" onClick={() => sort('archived')}><FolderOpen/><b>归档入柜</b><span>送往知识库</span><kbd>A</kbd></button><button className="sort-bin bin-trash" onClick={() => sort('dropped')}><Trash2/><b>碎纸丢弃</b><span>不再需要</span><kbd>D</kbd></button></div> : <div className="empty-queue"><Check size={30}/><h2>托盘已经清空</h2><p>所有碎片都已找到去处。</p><button className="primary-button" onClick={() => setPage('capture')}>继续捕获 <Plus size={15}/></button></div>}<div className="triage-bottom"><label>归档目的地 <select value={destination} onChange={e => setDestination(e.target.value)}>{destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></label></div></section>}
    {page === 'archive' && <section className="archive-section"><div className="archive-header"><div><span className="section-kicker">CABINET REGISTER</span><h2>归档流水账</h2><p>每次归档都会生成一条独立记录。</p></div><button className="export-button" onClick={() => downloadJSON(`paperflow-archive-${new Date().toISOString().slice(0,10)}.json`, logs)}><ArrowDownToLine size={16}/> 导出归档记录</button></div><div className="log-table"><div className="log-table-head"><span>ITEM / CONTENT</span><span>DESTINATION</span><span>ARCHIVED AT</span></div>{logs.length ? logs.map((x,i) => <div className="log-row" key={x.itemId + i}><div><FileText size={15}/><b>{x.title}</b></div><span className="destination-tag">{x.destination}</span><time>{new Date(x.time).toLocaleString('zh-CN')}</time></div>) : <div className="log-empty">归档记录将在这里按时间排列。</div>}</div></section>}
    {page === 'settings' && <section className="settings-section"><div className="settings-card"><div className="settings-card-heading"><div><span className="section-kicker">ROUTING RULES</span><h2>归档目的地</h2><p>为你的碎片设置不同出口。</p></div><FolderOpen/></div><div className="destination-list">{destinations.map(d => <div className="destination-row" key={d.id}><div><b>{d.name}</b><span>{d.description}</span></div><button className="remove-button" disabled={destinations.length <= 1} onClick={() => setDestinations(old => old.filter(x => x.id !== d.id))}>×</button></div>)}</div><div className="add-destination"><input value={newDestination} onChange={e => setNewDestination(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDestination()} placeholder="新目的地名称…"/><button onClick={addDestination} disabled={!newDestination.trim()}>＋ 添加出口</button></div></div><div className="settings-card"><h2>桌面氛围</h2><div className="theme-options"><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><Sun/><b>日间书桌</b></button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><Moon/><b>夜间书桌</b></button></div></div></section>}
    </main></div><footer className="conveyor-wrap"><div className="conveyor-label"><span>WEEKLY CONVEYOR</span><small>本周流转</small></div><div className="conveyor-track"><div className="conveyor-stat"><span className="stat-label">CAPTURED</span><b>{items.length}</b><small>累计捕获</small></div><div className="conveyor-stat"><span className="stat-label">FILED</span><b>{logs.length}</b><small>已归档</small></div><div className="conveyor-stat backlog"><span className="stat-label">BACKLOG</span><b>{inbox.length}</b><small>当前积压</small></div></div></footer>{notice && <div className="toast"><Check size={15}/>{notice}</div>}
  </div>
}