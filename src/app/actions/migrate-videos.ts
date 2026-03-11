'use server'

import { createClient } from '@supabase/supabase-js'

export async function migrateVideosTable(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        message: 'Supabase configuration missing',
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Checking videos table schema...')

    // Check if video_url column exists
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'videos')

    const columnNames = columns?.map((col: any) => col.column_name) || []
    const hasVideoUrl = columnNames.includes('video_url')
    const hasIsPublished = columnNames.includes('is_published')

    console.log('Schema check:', { hasVideoUrl, hasIsPublished, columnNames })

    if (!hasVideoUrl || !hasIsPublished) {
      return {
        success: false,
        message: 'Database schema needs migration',
        error: `Missing columns: ${!hasVideoUrl ? 'video_url ' : ''}${!hasIsPublished ? 'is_published' : ''}. Please run the SQL migration script: fix-videos-schema-migration.sql`,
      }
    }

    return {
      success: true,
      message: 'Database schema is up to date',
    }
  } catch (error) {
    console.error('Migration check error:', error)
    return {
      success: false,
      message: 'Failed to check schema',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
