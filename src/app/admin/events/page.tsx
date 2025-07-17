// src/app/admin/events/page.tsx
import EventsView from './EventsView'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export interface Event {
  id: string
  name: string
  date_time: string
  location: string
  created_at: string
}

export default async function AdminEventsPage() {
  // Fetch all events server-side with service-role key
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('id, name, date_time, location, created_at')
    .order('date_time', { ascending: true })

  if (error) {
    // Throw to let Next.js show an error boundary or fallback
    throw new Error(`Failed to load events: ${error.message}`)
  }

  return <EventsView initialEvents={events ?? []} />
}
