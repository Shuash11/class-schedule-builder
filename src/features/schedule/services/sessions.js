import { supabase } from '../../../lib/supabaseClient.js'
import { getUserId } from '../../auth/services/auth.js'

const COLUMNS = 'id, subject_id, user_id, day_of_week, start_time, end_time, created_at'

export async function fetchSessions() {
  const { data, error } = await supabase
    .from('class_sessions')
    .select(COLUMNS)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createSession(values) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('class_sessions')
    .insert({
      user_id: userId,
      subject_id: values.subject_id,
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function updateSession(id, values) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('class_sessions')
    .update({
      subject_id: values.subject_id,
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function deleteSession(id) {
  const userId = await getUserId()
  const { error } = await supabase
    .from('class_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}
