'use client'; 
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Virtuoso } from 'react-virtuoso';
import {
  AlertCircle,
  ArrowDown,
  ChevronLeft,
  Info,
  Inbox,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  User,
  X,
} from 'lucide-react';
import { useChat } from '../../../hooks/dashboard/useChat';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import api from '../../../libs/axios';

// ─── Types (JSDoc) ────────────────────────────────────────────────────────────
// ChatSidebarProps, ChatPreviewProps, ConversationThreadProps …
// (kept as JSDoc to avoid TypeScript dependency)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** @returns {boolean} */
const isRTL = () =>
  typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

const nameToHue = (str = '') =>
  [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

function fmtSidebarTime(date, t) {
  if (!date) return '';
  const d:any = new Date(date);
  const diffDays = Math.floor((Date.now() - d) / 86_400_000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return t('yesterday');
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fmtMsgTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function fmtDayLabel(date, t) {
  const d:any = new Date(date);
  const diffDays = Math.floor((Date.now() - d) / 86_400_000);
  if (diffDays === 0) return t('today');
  if (diffDays === 1) return t('yesterday');
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// ─── Global CSS (injected once) ───────────────────────────────────────────────

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
 

:root {
  --bg:           #F0EFEC;
  --surface:      #FFFFFF;
  --surface2:     #F8F7F5;
  --surface3:     #F0EFec;
  --border:       rgba(0,0,0,0.07);
  --border2:      rgba(0,0,0,0.13);
  --text:         #111110;
  --text2:        #6F6E6A;
  --text3:        #AEADA9;
  --accent:       #2563EB;
  --accent-bg:    #EFF4FF;
  --accent-dim:   rgba(37,99,235,0.10);
  --accent-hover: #1D4ED8;
  --green:        #16A34A;
  --red:          #DC2626;
  --red-bg:       #FEF2F2;
  --sh-xs:        0 1px 2px rgba(0,0,0,0.05);
  --sh-sm:        0 1px 4px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
  --sh-md:        0 4px 16px rgba(0,0,0,0.08),0 2px 4px rgba(0,0,0,0.04);
  --sh-lg:        0 16px 48px rgba(0,0,0,0.12),0 4px 12px rgba(0,0,0,0.06);
  --r-sm: 8px; --r-md: 12px; --r-lg: 18px; --r-xl: 24px;
  --font: 'Geist','DM Sans',system-ui,sans-serif;
  --ease: cubic-bezier(0.4,0,0.2,1);
  --spring: cubic-bezier(0.34,1.56,0.64,1);
}

body { font-family:var(--font); background:var(--bg); color:var(--text); -webkit-font-smoothing:antialiased; }

::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--border2); border-radius:9px; }
::-webkit-scrollbar-thumb:hover { background:var(--text3); }

:focus-visible { outline:2px solid var(--accent); outline-offset:2px; border-radius:4px; }

@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:1}50%{opacity:.4} }
@keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
@keyframes msgIn  { from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes shimmer{ 0%{background-position:200% 0}100%{background-position:-200% 0} }
@keyframes popIn  { 0%{opacity:0;transform:scale(.92)}60%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)} }

.ci-spin   { animation:spin .8s linear infinite; }
.ci-pulse  { animation:pulse 2s ease-in-out infinite; }
.ci-fadeUp { animation:fadeUp .2s var(--ease) both; }
.ci-msgIn  { animation:msgIn .18s var(--ease) both; }
.ci-popIn  { animation:popIn .25s var(--spring) both; }

.ci-skel {
  background:linear-gradient(90deg,var(--border) 25%,var(--surface2) 50%,var(--border) 75%);
  background-size:200% 100%;
  animation:shimmer 1.6s ease-in-out infinite;
  border-radius:var(--r-sm);
}

/* Mobile override */
@media(max-width:767px){
  .ci-sidebar { display:none !important; }
  .ci-sidebar.ci-sidebar--visible { display:flex !important; }
  .ci-panel-mobile {
    position:fixed!important;inset:0!important;z-index:50!important;
    border-radius:0!important;
    transform:translateX(100%);
    transition:transform .3s var(--ease);
  }
  .ci-panel-mobile.ci-panel-mobile--open { transform:translateX(0); }
  .ci-back-btn { display:flex!important; }
  .ci-root { padding:0!important; height:100dvh!important; }
}
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById('ci-global')) return;
    const el = document.createElement('style');
    el.id = 'ci-global';
    el.textContent = GLOBAL_CSS;
    document.head.prepend(el);
  }, []);
  return null;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

const Avatar = memo(({ src, name = '', size = 40, status }:any) => {
  const hue = nameToHue(name);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        background: `hsl(${hue},55%,93%)`, color: `hsl(${hue},45%,38%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: size * 0.34, userSelect: 'none',
        border: '1.5px solid rgba(0,0,0,0.06)', flexShrink: 0,
        fontFamily: 'var(--font)',
      }}>
        {src
          ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          : (initials || <User size={size * 0.44} />)
        }
      </div>
      {status !== undefined && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: Math.max(9, size * 0.27), height: Math.max(9, size * 0.27),
          borderRadius: '50%', border: '2px solid var(--surface)',
          background: status === 'online' ? 'var(--green)' : 'var(--text3)',
        }} />
      )}
    </div>
  );
});

const UnreadBadge = ({ count }) =>
  count ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 19, height: 19, padding: '0 5px', borderRadius: 99,
      background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700,
      lineHeight: 1, flexShrink: 0,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

const StatusDot = ({ online }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: online ? 'var(--green)' : 'var(--text3)' }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: online ? 'var(--green)' : 'var(--text3)', ...(online && { animation: 'pulse 2s infinite' }) }} />
    {online ? 'Online' : 'Offline'}
  </span>
);

function useHover() {
  const [h, setH] = useState(false);
  return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }];
}

const IconBtn = memo(({ icon: Icon, label, onClick, size = 34 }:any) => {
  const [h, hProps]:any = useHover();
  return (
    <button aria-label={label} title={label} onClick={onClick} {...hProps}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--border)', cursor: 'pointer',
        background: h ? 'var(--surface3)' : 'var(--surface)',
        color: 'var(--text2)', transition: 'background .12s',
      }}>
      <Icon size={14} strokeWidth={1.9} />
    </button>
  );
});

const PrimaryBtn = memo(({ children, onClick, small = false, style: s = {} }:any) => {
  const [h, hProps]:any = useHover();
  return (
    <button onClick={onClick} {...hProps}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: small ? '6px 12px' : '9px 18px',
        borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
        background: h ? 'var(--accent-hover)' : 'var(--accent)', color: '#fff',
        fontSize: small ? 13 : 14, fontWeight: 500, fontFamily: 'var(--font)',
        transition: 'background .12s', ...s,
      }}>
      {children}
    </button>
  );
});

const OutlineBtn = memo(({ children, onClick, small = false }:any) => {
  const [h, hProps]:any = useHover();
  return (
    <button onClick={onClick} {...hProps}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: small ? '6px 12px' : '9px 18px',
        borderRadius: 'var(--r-md)', cursor: 'pointer',
        background: h ? 'var(--surface2)' : 'var(--surface)',
        border: '1px solid var(--border2)', color: 'var(--text)',
        fontSize: small ? 13 : 14, fontWeight: 500, fontFamily: 'var(--font)',
        transition: 'background .12s',
      }}>
      {children}
    </button>
  );
});

// ─── Skeletons ────────────────────────────────────────────────────────────────

export function ChatPreviewSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
      <div className="ci-skel" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div className="ci-skel" style={{ height: 13, width: '38%' }} />
          <div className="ci-skel" style={{ height: 11, width: 34 }} />
        </div>
        <div className="ci-skel" style={{ height: 11, width: '62%' }} />
      </div>
    </div>
  );
}

function MessageSkeleton({ mine = false }) {
  const rtl = isRTL();
  const flip = mine ? !rtl : rtl;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '5px 16px', flexDirection: flip ? 'row-reverse' : 'row' }}>
      <div className="ci-skel" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 260, alignItems: flip ? 'flex-end' : 'flex-start' }}>
        <div className="ci-skel" style={{ height: 11, width: 70 }} />
        <div className="ci-skel" style={{ height: 42, width: 200, borderRadius: 'var(--r-lg)' }} />
      </div>
    </div>
  );
}

// ─── Chat Preview Card ────────────────────────────────────────────────────────

const ChatPreviewCard = memo(function ChatPreviewCard({ conversation, selected, isSending = false, onClick }:any) {
  const t = useTranslations('chat');
  const [h, hProps]:any = useHover();
  const rtl = isRTL();
  const isSupport = conversation.supportUserId === conversation?.partner?.id;
  const displayName = isSupport ? t('supportName') : (conversation?.partner?.name ?? '');
  const hasUnread = !isSending && conversation?.myUnreadCount > 0;

  return (
    <div
      role="button" tabIndex={0} aria-selected={selected}
      onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick?.()}
      {...hProps}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', margin: '2px 8px', borderRadius: 'var(--r-lg)',
        cursor: 'pointer', direction: rtl ? 'rtl' : 'ltr',
        transition: 'background .12s, box-shadow .12s',
        background: selected ? 'var(--accent-bg)' : h ? 'var(--surface3)' : 'transparent',
        boxShadow: selected ? `inset ${rtl ? '-' : ''}3px 0 0 var(--accent)` : 'none',
        opacity: isSending ? 0.6 : 1,
      }}
    >
      <Avatar src={conversation?.partner?.imagePath} name={displayName} size={44} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Row 1: name + time */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: hasUnread ? 600 : 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
          {!isSending && conversation?.lastMessage && (
            <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {fmtSidebarTime(conversation.lastMessage.created_at, t)}
            </span>
          )}
        </div>
        {/* Row 2: preview + badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {isSending ? (
            <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t('sending')}…
            </span>
          ) : conversation?.lastMessage?.content ? (
            <span style={{ fontSize: 12, flex: 1, color: hasUnread ? 'var(--text)' : 'var(--text2)', fontWeight: hasUnread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conversation.lastMessage.content}
            </span>
          ) : null}
          {hasUnread && <UnreadBadge count={conversation.myUnreadCount} />}
          {isSending && <Loader2 size={12} strokeWidth={2} className="ci-spin" style={{ color: 'var(--accent)', flexShrink: 0 }} />}
        </div>
      </div>
    </div>
  );
});

// ─── Admin User Search ────────────────────────────────────────────────────────

function AdminUserSearch({ onOpenUserChat, onViewUserDetails }) {
  const t = useTranslations('chat');
  const rtl = isRTL();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastQ = useRef('');
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    lastQ.current = trimmed;
    if (trimmed.length < 2) { setUsers([]); setError(null); setLoading(false); return; }
    const ctrl = new AbortController();
    const tid = window.setTimeout(async () => {
      try {
        setLoading(true); setError(null);
        const params = new URLSearchParams({ page: '1', limit: '8', search: trimmed, sortBy: 'name', sortOrder: 'ASC' });

        const res = await api.get(`/users/all?${params}`, { signal: ctrl.signal });
        const data = res.data;
        if (lastQ.current === trimmed) setUsers(data?.records || []);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setUsers([]); setError(e?.message || t('searchUsersError'));
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => { clearTimeout(tid); ctrl.abort(); };
  }, [query, t]);

  const hasQuery = query.trim().length >= 2;
  const isEmpty = hasQuery && !loading && !error && users.length === 0;

  return (
    <div style={{ padding: '12px 12px 12px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ position: 'relative' }}>
        <Search size={13} strokeWidth={2} style={{
          position: 'absolute', top: '50%', [rtl ? 'right' : 'left']: 12,
          transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none',
        }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={t('searchUsers')}
          style={{
            width: '100%', height: 38, borderRadius: 'var(--r-md)',
            border: `1.5px solid ${inputFocused ? 'var(--accent)' : 'var(--border)'}`,
            background: 'var(--surface2)',
            [rtl ? 'paddingRight' : 'paddingLeft']: 36,
            [rtl ? 'paddingLeft' : 'paddingRight']: 12,
            fontSize: 16, color: 'var(--text)', outline: 'none', 
            boxShadow: inputFocused ? '0 0 0 3px var(--accent-dim)' : 'none',
            transition: 'border-color .12s, box-shadow .12s',
            direction: rtl ? 'rtl' : 'ltr',
          }}
        />
      </div>

      <div style={{ marginTop: 10, minHeight: 24 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
            <Loader2 size={12} className="ci-spin" style={{ color: 'var(--accent)' }} /> {t('searchingUsers')}
          </div>
        )}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--red)' }}>
            <AlertCircle size={12} /> {error}
          </div>
        )}
        {!hasQuery && !loading && (
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>{t('searchUsersHint')}</p>
        )}
        {isEmpty && (
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>{t('noUsersFound')}</p>
        )}
        {users.length > 0 && (
          <div style={{ maxHeight: 228, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {users.map(u => {
              const [rh, rhProps] = [false, {}]; // simplified; full hover per row needs hook per item
              return (
                <div key={u.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 'var(--r-md)', direction: rtl ? 'rtl' : 'ltr' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <button type="button" onClick={() => onOpenUserChat(u.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: rtl ? 'right' : 'left', fontFamily: 'var(--font)' }}>
                    <Avatar src={u.imagePath} name={u.name} size={32} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                    </span>
                  </button>
                  <IconBtn icon={Info} label={t('viewUserDetails')} onClick={() => onViewUserDetails(u)} size={30} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat Sidebar ─────────────────────────────────────────────────────────────

export const ChatSidebar = memo(function ChatSidebar({
  loadingConversations, sortedConversationsIds, conversationsMap,
  handleSelectChat, fetchMoreConversations, currentOpenConversationId,
  isSending, isAdmin, onOpenUserChat, onViewUserDetails,
}:any) {
  const t = useTranslations('chat');

  const data = useMemo(
    () => sortedConversationsIds.toArray().map(({ id }) => conversationsMap.get(id)).filter(Boolean),
    [sortedConversationsIds, conversationsMap]
  );

  const isEmpty = !loadingConversations && data.length === 0;
  const isInit  = loadingConversations && data.length === 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--surface)', borderRadius: 'var(--r-xl)',
      border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--sh-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={14} strokeWidth={2} style={{ color: 'var(--accent)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t('messages')}</span>
        </div>
        {data.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, padding: '0 6px', borderRadius: 99, background: 'var(--surface3)', color: 'var(--text2)', fontSize: 11, fontWeight: 600 }}>
            {data.length > 99 ? '99+' : data.length}
          </span>
        )}
      </div>

      {isAdmin && <AdminUserSearch onOpenUserChat={onOpenUserChat} onViewUserDetails={onViewUserDetails} />}

      {isInit && (
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 6 }}>
          {Array.from({ length: 7 }).map((_, i) => <ChatPreviewSkeleton key={i} />)}
        </div>
      )}

      {isEmpty && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: 'var(--r-lg)', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={22} style={{ color: 'var(--text3)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{t('noConversationsYet')}</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 170 }}>{t('startMessagingToSeeChats')}</p>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <Virtuoso
          style={{ flex: 1 }}
          data={data}
          endReached={() => { if (!loadingConversations) fetchMoreConversations(); }}
          increaseViewportBy={300}
          components={{
            Header: () => <div style={{ height: 6 }} />,
            Footer: () => loadingConversations ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}>
                <Loader2 size={13} className="ci-spin" style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{t('loadingMore')}</span>
              </div>
            ) : <div style={{ height: 6 }} />,
          }}
          itemContent={(_i, conv) => {
            if (!conv) return null;
            return (
              <ChatPreviewCard
                key={conv.id}
                selected={conv.id === currentOpenConversationId}
                isSending={isSending?.get(conv.id) || false}
                conversation={conv}
                onClick={() => handleSelectChat(conv.id)}
              />
            );
          }}
        />
      )}
    </div>
  );
});

// ─── Day Divider ──────────────────────────────────────────────────────────────

function DayDivider({ date, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {fmtDayLabel(date, t)}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

// ─── Message Row ──────────────────────────────────────────────────────────────

const MessageRow = memo(function MessageRow({ msg, participant, currentUserId, onRetry }:any) {
  const t = useTranslations('chat');
  const isMine   = msg.senderId === currentUserId;
  const isSending = msg.status === 'sending';
  const isFailed  = msg.status === 'error';
  const rtl = isRTL();
  // Mine: in LTR → row-reverse. In RTL → row (right is now "mine" side)
  const rowDir = isMine
    ? (rtl ? 'row' : 'row-reverse')
    : (rtl ? 'row-reverse' : 'row');
  const alignSelf = isMine
    ? (rtl ? 'flex-start' : 'flex-end')
    : (rtl ? 'flex-end' : 'flex-start');

  return (
    <div className="ci-msgIn" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '3px 16px', flexDirection: rowDir }}>
      <Avatar src={isMine ? null : participant?.imagePath} name={isMine ? 'Me' : (participant?.name ?? '')} size={30} />

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 'min(72%, 480px)', alignItems: alignSelf, gap: 3 }}>
        {/* Meta */}
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', paddingInline: 4 }}>
          {isMine ? t('you') : (participant?.name ?? '')}
          {' · '}
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMsgTime(msg.created_at)}</span>
        </span>

        {/* Bubble */}
        <div style={{
          padding: '9px 14px',
          borderRadius: isMine
            ? (rtl ? '18px 18px 4px 18px' : '18px 18px 4px 18px')
            : (rtl ? '18px 18px 18px 4px' : '18px 18px 18px 4px'),
          background: isMine ? 'var(--accent)' : 'var(--surface2)',
          color: isMine ? '#fff' : 'var(--text)',
          border: isMine ? 'none' : '1px solid var(--border)',
          fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word',
          boxShadow: 'var(--sh-xs)',
          opacity: isSending ? 0.55 : isFailed ? 0.8 : 1,
          transition: 'opacity .15s',
        }} className='' >
          {msg.content}
        </div>

        {/* Status */}
        {isMine && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingInline: 4 }}>
            {isSending && (
              <><Loader2 size={10} className="ci-spin" style={{ color: 'var(--text3)' }} />
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{t('sending')}</span></>
            )}
            {isFailed && (
              <button onClick={() => onRetry?.(msg)} title={t('failedSendTitle')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 11, fontWeight: 500, padding: 0, fontFamily: 'var(--font)' }}>
                <RefreshCw size={10} /> {t('retry')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Message Input ────────────────────────────────────────────────────────────

function MessageInput({ handleSendMessage, currentConversationId }) {
  const t = useTranslations('chat');
  const rtl = isRTL();
  const drafts = useRef(new Map());
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!currentConversationId) return;
    setMessage(drafts.current.get(currentConversationId) || '');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [currentConversationId]);

  const send = () => {
    if (!message.trim()) return;
    handleSendMessage(message);
    if (currentConversationId) drafts.current.set(currentConversationId, '');
    setMessage('');
    inputRef.current?.focus();
  };

  const handleChange = v => {
    setMessage(v);
    if (currentConversationId) drafts.current.set(currentConversationId, v);
  };

  const canSend = !!message.trim();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, direction: rtl ? 'rtl' : 'ltr' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={t('typeMessage')}
        value={message}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        style={{
          flex: 1, height: 42, borderRadius: 99,
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--surface2)',
          paddingInline: 16, fontSize: 14, color: 'var(--text)',
          outline: 'none', fontFamily: 'var(--font)',
          boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
          transition: 'border-color .12s, box-shadow .12s',
          direction: rtl ? 'rtl' : 'ltr',
        }}
      />
      <button
        onClick={send}
        disabled={!canSend}
        style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
          background: canSend ? 'var(--accent)' : 'var(--surface3)',
          color: canSend ? '#fff' : 'var(--text3)',
          transition: 'background .12s, transform .1s',
        }}
        onMouseDown={e => { if (canSend) e.currentTarget.style.transform = 'scale(0.9)'; }}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Send size={15} strokeWidth={2.2} style={{ transform: rtl ? 'scaleX(-1)' : 'none' }} />
      </button>
    </div>
  );
}

// ─── Conversation Thread ──────────────────────────────────────────────────────

const ConversationThread = memo(function ConversationThread({
  messages = [], participant, onSendMessage,
  loadingMessageId, currentOpenConversationId,
  retryMessage, loadMoreMessages, loadingMoreId,
  markAsRead, isPartnerAdmin, onViewUserDetails,
  currentUserId, userStatuses, onBack,
}:any) {
  const t = useTranslations('chat');
  const rtl = isRTL();
  const scrollRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const prevCount = useRef(0);
  const isOnline = userStatuses?.get?.(participant?.id) === 'online';
  const displayName = isPartnerAdmin ? t('supportName') : (participant?.name ?? '');

  // Group by day (messages array is newest-first)
  const grouped = useMemo(() => {
    const result = [];
    let lastDate = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const d = new Date(msg.created_at).toDateString();
      if (d !== lastDate) { result.push({ type: 'day', date: msg.created_at, key: `d-${d}` }); lastDate = d; }
      result.push({ type: 'msg', msg, key: String(msg.id) });
    }
    return result;
  }, [messages]);

  const scrollToBottom = useCallback((smooth = false) => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 180;
    const isNew = messages.length > prevCount.current;
    prevCount.current = messages.length;
    if (!isNew) return;
    const last = messages[0];
    if (!last) return;
    if (last.senderId === currentUserId || nearBottom) {
      requestAnimationFrame(() => scrollToBottom());
      markAsRead?.(currentOpenConversationId);
      setShowScrollBtn(false);
    } else {
      setShowScrollBtn(true);
    }
  }, [messages.length, currentUserId, currentOpenConversationId]);

  // New conversation
  useEffect(() => {
    prevCount.current = 0;
    setShowScrollBtn(false);
    requestAnimationFrame(() => scrollToBottom());
    markAsRead?.(currentOpenConversationId);
  }, [currentOpenConversationId]);

  const handleScroll = async () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 180;
    if (nearBottom && showScrollBtn) { setShowScrollBtn(false); markAsRead?.(currentOpenConversationId); }
    if (scrollTop < 140 && !loadingMoreId && currentOpenConversationId) {
      const prevH = scrollRef.current.scrollHeight;
      await loadMoreMessages?.(currentOpenConversationId);
      requestAnimationFrame(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop += scrollRef.current.scrollHeight - prevH;
      });
    }
  };

  const isLoadingMsgs = loadingMessageId === currentOpenConversationId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thread Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0, direction: rtl ? 'rtl' : 'ltr' }}>
        <button className="ci-back-btn" onClick={onBack}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 4, borderRadius: 8 }}>
          <ChevronLeft size={20} style={{ transform: rtl ? 'scaleX(-1)' : 'none' }} />
        </button>

        <Avatar src={participant?.imagePath} name={displayName} size={42}
          status={isPartnerAdmin ? undefined : (isOnline ? 'online' : 'offline')} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
          {!isPartnerAdmin && <StatusDot online={isOnline} />}
        </div>

        {!isPartnerAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {participant?.phoneNumber && (
              <a href={`tel:${participant.phoneNumber}`} style={{ textDecoration: 'none' }}>
                <IconBtn icon={Phone} label={t('callUser')} size={34} />
              </a>
            )}
            {onViewUserDetails && (
              <IconBtn icon={Info} label={t('viewUserDetails')} onClick={() => onViewUserDetails(participant)} size={34} />
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', position: 'relative', paddingBlock: 8 }}
      >
        {loadingMoreId === currentOpenConversationId && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)' }}>
              <Loader2 size={12} className="ci-spin" style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{t('loadingHistory')}</span>
            </div>
          </div>
        )}

        {isLoadingMsgs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => <MessageSkeleton key={i} mine={i % 3 === 0} />)}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--r-xl)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>{t('noMessages')}</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>{t('startConversation')}</p>
            </div>
          </div>
        ) : (
          grouped.map(item =>
            item.type === 'day'
              ? <DayDivider key={item.key} date={item.date} t={t} />
              : <MessageRow key={item.key} msg={item.msg} participant={participant} currentUserId={currentUserId} onRetry={retryMessage} />
          )
        )}
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <div style={{ position: 'absolute', bottom: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }} className="ci-popIn">
          <button
            onClick={() => { scrollToBottom(true); markAsRead?.(currentOpenConversationId); setShowScrollBtn(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 99, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--sh-md)', fontFamily: 'var(--font)' }}>
            <ArrowDown size={13} /> {t('newMessages')}
          </button>
        </div>
      )}

      <MessageInput handleSendMessage={onSendMessage} currentConversationId={currentOpenConversationId} />
    </div>
  );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyChatState() {
  const t = useTranslations('chat');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 18, padding: 48, textAlign: 'center' }}>
      <div style={{ width: 68, height: 68, borderRadius: 'var(--r-xl)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
        <MessageSquare size={28} style={{ color: 'var(--accent)' }} />
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{t('selectConversation')}</p>
        <p style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 200 }}>{t('selectConversationHint')}</p>
      </div>
    </div>
  );
}

// ─── User Details Modal ───────────────────────────────────────────────────────

function UserDetailsModal({ userId, onClose, onOpenChat }) {
  const t = useTranslations('chat');
  const rtl = isRTL();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    setLoading(true); setError(null); setDetails(null);

    api.get(`/users/${userId}/full-details`, { signal: ctrl.signal })
    .then(r => r).then(setDetails)
      .catch(e => { if (e?.name !== 'AbortError') setError(e?.message || t('userDetailsError')); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
 
    return () => ctrl.abort();
  }, [userId, t]);

  if (!userId) return null;

  const fields = details ? [
    [t('email'), details.email],
    [t('phoneNumber'), details.phoneNumber],
    [t('birthDate'), details.birthDate ? new Date(details.birthDate).toLocaleDateString() : null],
    [t('lastLogin'), details.lastLogin ? new Date(details.lastLogin).toLocaleString() : t('never')],
    [t('nationality'), details.nationality?.name || details.nationality?.name_ar],
    [t('identityType'), details.identityType],
    [t('identityNumber'), details.identityNumber],
    [t('shortAddress'), details.shortAddress],
    [t('notificationsEnabled'), details.notificationsEnabled ? t('yes') : t('no')],
    [t('createdAt'), details.created_at ? new Date(details.created_at).toLocaleString() : null],
  ] : [];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="ci-popIn"
        style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 600, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)', border: '1px solid var(--border)', direction: rtl ? 'rtl' : 'ltr' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t('userDetails')}</span>
          <IconBtn icon={X} label={t('close')} onClick={onClose} size={30} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="ci-skel" style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="ci-skel" style={{ height: 16, width: '45%' }} />
                  <div className="ci-skel" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="ci-skel" style={{ height: 56, borderRadius: 'var(--r-md)' }} />)}
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: 32 }}>
              <AlertCircle size={36} style={{ color: 'var(--red)' }} />
              <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {!loading && !error && details && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <Avatar src={details.imagePath} name={details.name} size={58} />
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{details.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{details.email}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>{details.role}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--surface3)', color: 'var(--text2)', fontSize: 11, fontWeight: 600 }}>{details.status}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  {details.phoneNumber && (
                    <a href={`tel:${details.phoneNumber}`} style={{ textDecoration: 'none' }}>
                      <OutlineBtn small><Phone size={13} />{t('callUser')}</OutlineBtn>
                    </a>
                  )}
                  <PrimaryBtn small onClick={() => { onOpenChat(details.id); onClose(); }}>
                    <MessageSquare size={13} />{t('openChat')}
                  </PrimaryBtn>
                </div>
              </div>

              {/* Detail grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                {fields.map(([label, val]) => (
                  <div key={label} style={{ padding: '11px 14px', borderRadius: 'var(--r-md)', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', wordBreak: 'break-word' }}>{val ?? t('notProvided')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

const ChatPanel = memo(function ChatPanel({
  selectedUser, loadingMessageId, currentOpenConversationId,
  messages, handleSendMessage, retryMessage, loadMoreMessages,
  handleCloseThread, isOpen, loadingMoreId, markAsRead,
  isPartnerAdmin, onViewUserDetails, currentUserId, userStatuses,
}:any) {
  const isNewChat = loadingMessageId?.startsWith('new-chat');

  return (
    <div
      className={`ci-panel-mobile ${isOpen ? 'ci-panel-mobile--open' : ''}`}
      style={{
        background: 'var(--surface)', borderRadius: 'var(--r-xl)',
        height: '100%', border: '1px solid var(--border)',
        overflow: 'hidden', boxShadow: 'var(--sh-sm)',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}
    >
      {isNewChat ? (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 0 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <div className="ci-skel" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
            <div className="ci-skel" style={{ height: 15, width: 140 }} />
          </div>
          {Array.from({ length: 6 }).map((_, i) => <MessageSkeleton key={i} mine={i % 3 === 0} />)}
        </div>
      ) : selectedUser ? (
        <ConversationThread
          isPartnerAdmin={isPartnerAdmin}
          markAsRead={markAsRead}
          loadingMoreId={loadingMoreId}
          loadMoreMessages={loadMoreMessages}
          retryMessage={retryMessage}
          currentOpenConversationId={currentOpenConversationId}
          loadingMessageId={loadingMessageId}
          messages={messages?.items || []}
          participant={selectedUser}
          onSendMessage={handleSendMessage}
          onViewUserDetails={onViewUserDetails}
          currentUserId={currentUserId}
          userStatuses={userStatuses}
          onBack={handleCloseThread}
        />
      ) : (
        <EmptyChatState />
      )}
    </div>
  );
});

// ─── ChatInterface (root export) ──────────────────────────────────────────────

export default function ChatInterface() {
  // Hooks from your existing implementation – keep exactly as-is.
  const {
    sortedConversationsIds,
    conversationsMap,
    currentOpenConversationId,
    handleSelectChat,
    currentConversation,
    currentConversationMessages,
    loadingConversations,
    loadingMessageId,
    sendMessage,
    retryMessage,
    loadingMoreId,
    loadMoreMessages,
    isSending,
    markAsRead,
    fetchMoreConversations,
    openChatWithUser,
  } = useChat?.() ?? {};

  const { role, user } = useAuth?.() ?? {};
  const { userStatuses } = useSocket?.() ?? {};
  const [detailsUserId, setDetailsUserId] = useState(null);
  const isAdmin = role === 'admin';

  const handleViewUserDetails = useCallback(u => setDetailsUserId(u.id), []);

  const chatOpen = !!currentOpenConversationId;

  return (
    <>
      <InjectStyles />
      <div className="ci-root" style={{ display: 'flex', gap: 12, padding: 16, height: 'calc(100vh - 130px)', maxWidth: 1400, margin: '0 auto' }}>
        {/* Sidebar */}
        <div
          className={`ci-sidebar ${!chatOpen ? 'ci-sidebar--visible' : ''}`}
          style={{ width: 300, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <ChatSidebar
            fetchMoreConversations={fetchMoreConversations}
            isSending={isSending}
            conversationsMap={conversationsMap}
            currentOpenConversationId={currentOpenConversationId}
            handleSelectChat={handleSelectChat}
            loadingConversations={loadingConversations}
            sortedConversationsIds={sortedConversationsIds}
            isAdmin={isAdmin}
            onOpenUserChat={openChatWithUser}
            onViewUserDetails={handleViewUserDetails}
          />
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
          <ChatPanel
            markAsRead={markAsRead}
            loadingMoreId={loadingMoreId}
            loadMoreMessages={loadMoreMessages}
            loadingMessageId={loadingMessageId}
            retryMessage={retryMessage}
            currentOpenConversationId={currentOpenConversationId}
            selectedUser={currentConversation?.partner}
            isPartnerAdmin={currentConversation?.partner?.id === currentConversation?.supportUserId}
            messages={currentConversationMessages}
            handleSendMessage={content => sendMessage(currentOpenConversationId || '', content)}
            handleCloseThread={() => handleSelectChat(null)}
            isOpen={chatOpen}
            onViewUserDetails={isAdmin ? handleViewUserDetails : undefined}
            currentUserId={user?.id}
            userStatuses={userStatuses}
          />
        </div>
      </div>

      {isAdmin && (
        <UserDetailsModal
          userId={detailsUserId}
          onClose={() => setDetailsUserId(null)}
          onOpenChat={openChatWithUser}
        />
      )}
    </>
  );
}