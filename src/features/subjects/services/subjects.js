import { supabase } from '../../../lib/supabaseClient.js'
import { getUserId } from '../../auth/services/auth.js'

const COLUMNS = 'id, user_id, subject_code, subject_name, instructor, room, color, created_at'

export async function fetchSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select(COLUMNS)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createSubject(values) {
  // RLS enforces ownership server-side; user_id is still set explicitly
  // from the current session on every INSERT (architecture contract).
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: userId,
      subject_code: values.subject_code,
      subject_name: values.subject_name,
      instructor: values.instructor || null,
      room: values.room || null,
      color: values.color,
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function updateSubject(id, values) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('subjects')
    .update({
      subject_code: values.subject_code,
      subject_name: values.subject_name,
      instructor: values.instructor || null,
      room: values.room || null,
      color: values.color,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function deleteSubject(id) {
  const userId = await getUserId()
  // Deleting a subject cascades to its class_sessions (setup.sql).
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

/** Postgres unique-violation on (user_id, subject_code). */
export function isUniqueViolation(error) {
  return error?.code === '23505'
}
