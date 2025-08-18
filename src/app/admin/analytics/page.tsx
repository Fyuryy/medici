import { supabaseAdmin } from '@/lib/supabaseAdmin'
import screen from '@/styles/AdminScreens.module.css'
import styles from '@/styles/AdminAnalytics.module.css'

type Invitation = {
  id: string
  email: string | null
  phone: string | null
  created_at: string | null
  used: boolean | null
  event_id: string | null
}

type Ticket = {
  id: string
  user_id: string | null
  event_id: string | null
  issued_at: string | null
  ticket_code: string | null
  invitation_id: string | null
}

type User = {
  id: string
  name: string | null
  email: string | null
}

type Event = { id: string; name: string | null }

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  // 1) Invitations (by email ASC, then newest)
  const { data: invitations, error: invErr } = await supabaseAdmin
    .from('invitations')
    .select('id,email,phone,created_at,used,event_id')
    .order('email', { ascending: true })
    .order('created_at', { ascending: false })
    .returns<Invitation[]>()

  // 2) Tickets (all, newest first)
  const { data: ticketsRaw, error: tErr } = await supabaseAdmin
    .from('tickets')
    .select('id,user_id,event_id,issued_at,ticket_code,invitation_id')
    .order('issued_at', { ascending: false })
    .returns<Ticket[]>()

  // Lookups
  const eventIds = Array.from(
    new Set([
      ...((invitations ?? [])
        .map((i) => i.event_id)
        .filter(Boolean) as string[]),
      ...((ticketsRaw ?? [])
        .map((t) => t.event_id)
        .filter(Boolean) as string[]),
    ])
  )
  const userIds = Array.from(
    new Set(
      (ticketsRaw ?? []).map((t) => t.user_id).filter(Boolean) as string[]
    )
  )

  const eventsById: Record<string, Event> = {}
  if (eventIds.length) {
    const { data: events } = await supabaseAdmin
      .from('events')
      .select('id,name')
      .in('id', eventIds)
      .returns<Event[]>()
    events?.forEach((e) => (eventsById[e.id] = e))
  }

  const usersById: Record<string, User> = {}
  if (userIds.length) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id,name,email')
      .in('id', userIds)
      .returns<User[]>()
    users?.forEach((u) => (usersById[u.id] = u))
  }

  // Optional: opens per invitation (if invitation_events exists)
  let opensByInvitation: Record<string, number> | null = null
  try {
    if (invitations?.length) {
      const invIds = invitations.map((i) => i.id)
      const { data: openRows } = await supabaseAdmin
        .from('invitation_events')
        .select('invitation_id,event_type')
        .eq('event_type', 'open')
        .in('invitation_id', invIds)
        .returns<{ invitation_id: string; event_type: 'open' }[]>()

      if (openRows) {
        opensByInvitation = {}
        for (const r of openRows) {
          opensByInvitation[r.invitation_id] =
            (opensByInvitation[r.invitation_id] ?? 0) + 1
        }
      }
    }
  } catch {
    // table may not exist; silently skip opens
    opensByInvitation = null
  }

  // Tickets sorted by user name ASC
  const tickets = (ticketsRaw ?? [])
    .map((t) => ({
      ...t,
      user: t.user_id ? usersById[t.user_id] : undefined,
      event: t.event_id ? eventsById[t.event_id] : undefined,
    }))
    .sort((a, b) => {
      const an = a.user?.name?.toLowerCase() ?? ''
      const bn = b.user?.name?.toLowerCase() ?? ''
      return an.localeCompare(bn)
    })

  const showOpens = !!opensByInvitation

  return (
    <div className={screen.wrapper}>
      <div className={screen.stack}>
        <h1 className={screen.title}>Analytics</h1>

        {/* Invitations */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.h2}>Invitations</h2>
            {invErr && <p className={styles.error}>Failed: {invErr.message}</p>}
          </div>
          {!invErr && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Event</th>
                    <th>Created</th>
                    <th>Used</th>
                    {showOpens && <th>Opens</th>}
                  </tr>
                </thead>
                <tbody>
                  {(invitations ?? []).map((i) => {
                    const eventName = i.event_id
                      ? eventsById[i.event_id!]?.name ?? '—'
                      : '—'
                    const opens = showOpens
                      ? opensByInvitation![i.id] ?? 0
                      : null
                    return (
                      <tr key={i.id}>
                        <td className={styles.emph}>{i.email ?? '—'}</td>
                        <td>{i.phone ?? '—'}</td>
                        <td>{eventName}</td>
                        <td>
                          {i.created_at
                            ? new Date(i.created_at).toLocaleString()
                            : '—'}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              i.used ? styles.yes : styles.no
                            }`}
                          >
                            {i.used ? 'YES' : 'NO'}
                          </span>
                        </td>
                        {showOpens && <td>{opens}</td>}
                      </tr>
                    )
                  })}
                  {(!invitations || invitations.length === 0) && (
                    <tr>
                      <td colSpan={showOpens ? 6 : 5} className={styles.muted}>
                        No invitations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tickets */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.h2}>Tickets</h2>
            {tErr && <p className={styles.error}>Failed: {tErr.message}</p>}
          </div>
          {!tErr && (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Ticket Code</th>
                    <th>Event</th>
                    <th>Issued At</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td className={styles.emph}>{t.user?.name ?? '—'}</td>
                      <td>{t.user?.email ?? '—'}</td>
                      <td className={styles.mono}>{t.ticket_code ?? '—'}</td>
                      <td>{t.event?.name ?? '—'}</td>
                      <td>
                        {t.issued_at
                          ? new Date(t.issued_at).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.muted}>
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
