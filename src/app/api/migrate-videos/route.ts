import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Running videos table migration...')

    // Step 1: Add is_published column
    const { error: isPublishedError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'videos' AND column_name = 'is_published'
            ) THEN
                ALTER TABLE videos ADD COLUMN is_published BOOLEAN DEFAULT true;
            END IF;
        END $$;
      `
    })

    // Step 2: Add video_url column
    const { error: videoUrlError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'videos' AND column_name = 'video_url'
            ) THEN
                ALTER TABLE videos ADD COLUMN video_url TEXT;
                UPDATE videos SET video_url = embed_url WHERE embed_url IS NOT NULL;
                ALTER TABLE videos ALTER COLUMN video_url SET NOT NULL;
            END IF;
        END $$;
      `
    })

    // Step 3: Update category constraint
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_category_check;
        ALTER TABLE videos ADD CONSTRAINT videos_category_check
            CHECK (category IN ('review', 'comparison', 'news', 'guide', 'event', 'Review', 'Launch', 'Comparison', 'Tutorial', 'News'));
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      errors: {
        isPublishedError,
        videoUrlError,
        constraintError
      }
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
