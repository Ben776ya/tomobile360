/**
 * create-staff-user.mjs
 *
 * Creates (or updates) a staff account: an auth.users entry + the matching
 * profiles row with the right role.
 *
 * Both halves are mandatory. Nothing in this project creates a profiles row
 * automatically — there is no handle_new_user trigger and no signup flow — and
 * a user without a profiles row fails every gate (middleware, admin layout,
 * server actions, RLS). This script is the supported way to onboard staff.
 *
 * Roles:
 *   admin       full access to /admin/*
 *   journalist  /admin/blog only (enforced in middleware + RLS)
 *   user        no admin access
 *
 * Requires migrations/add-user-roles.sql to have been run first.
 *
 * Run from tomobile360/:
 *   node scripts/create-staff-user.mjs --email=x@y.ma --password='...' --name='Prénom Nom' --role=journalist
 *   node scripts/create-staff-user.mjs --email=x@y.ma --password='...' --name='Prénom Nom' --role=journalist --apply
 *
 * Resetting a forgotten password (there is no self-service reset in the app,
 * and no SMTP is configured, so this is how an admin rotates a credential):
 *   node scripts/create-staff-user.mjs --email=x@y.ma --password='<new>' --reset-password --apply
 * Reset mode changes the password ONLY — name and role are left untouched, so
 * a rotation can never accidentally alter someone's access.
 *
 * Dry-run by default. The password is never echoed back.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

function loadEnvLocal() {
  const envPath = path.join(projectRoot, '.env.local')
  if (!fs.existsSync(envPath)) { console.error('ERROR: .env.local not found at', envPath); process.exit(1) }
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i === -1) continue
    const k = line.slice(0, i).trim()
    let v = line.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    process.env[k] = v
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing Supabase env vars'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// ---------------------------------------------------------------- args

function arg(name) {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  return hit ? hit.slice(prefix.length) : undefined
}

const APPLY = process.argv.includes('--apply')
const RESET_PASSWORD = process.argv.includes('--reset-password')
const email = (arg('email') || '').trim().toLowerCase()
const password = arg('password') || ''
const fullName = (arg('name') || '').trim()
const role = (arg('role') || '').trim()

const VALID_ROLES = ['admin', 'journalist', 'user']
const USAGE = `
Usage:
  Create a new staff member:
    node scripts/create-staff-user.mjs --email=<email> --password=<password> --name=<full name> --role=<${VALID_ROLES.join('|')}> [--apply]

  Reset an existing member's password (no email sent):
    node scripts/create-staff-user.mjs --email=<email> --password=<new password> --reset-password [--apply]
`

const problems = []
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.push('--email is missing or not a valid email address')
if (!password) problems.push('--password is required')
else if (password.length < 12) problems.push('--password must be at least 12 characters')

// In reset mode only the email + new password matter; name and role are left
// untouched so a rotation can never accidentally change someone's access.
if (!RESET_PASSWORD) {
  if (!fullName) problems.push('--name is required')
  if (!VALID_ROLES.includes(role)) problems.push(`--role must be one of: ${VALID_ROLES.join(', ')}`)
} else {
  if (fullName) problems.push('--name cannot be combined with --reset-password')
  if (role) problems.push('--role cannot be combined with --reset-password (use a normal run, or the /admin/users dropdown)')
}

if (problems.length) {
  console.error('\nInvalid arguments:')
  for (const p of problems) console.error('  -', p)
  console.error(USAGE)
  process.exit(1)
}

console.log(`\n=== create-staff-user — Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}${RESET_PASSWORD ? ' (password reset)' : ''} ===`)
console.log(`  email : ${email}`)
if (!RESET_PASSWORD) {
  console.log(`  name  : ${fullName}`)
  console.log(`  role  : ${role}`)
}
console.log(`  pass  : (${password.length} characters, not shown)\n`)

// ---------------------------------------------------------------- helpers

/**
 * listUsers has no server-side email filter in supabase-js v2, so page through
 * until we find a match. Staff lists are tiny; a few pages is plenty.
 */
async function findUserByEmail(target) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(`listUsers failed: ${error.message}`)
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === target)
    if (hit) return hit
    if (data.users.length < 200) return null
  }
  return null
}

// ---------------------------------------------------------------- main

async function main() {
  const existing = await findUserByEmail(email)

  // ----- password reset mode: touches the password and nothing else ---------
  if (RESET_PASSWORD) {
    if (!existing) {
      console.error(`ERROR: no account found for ${email}. Nothing to reset.`)
      console.error('Create the account first (see --help usage above).')
      process.exit(1)
    }

    const { data: current } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', existing.id)
      .single()

    if (!APPLY) {
      console.log(`DRY-RUN: would set a new password for ${email} (id ${existing.id})`)
      console.log(`DRY-RUN: role stays '${current?.role ?? 'unknown'}', name stays '${current?.full_name ?? 'unknown'}'`)
      console.log('DRY-RUN: no email is sent — hand the new password over yourself.')
      console.log('\nRe-run with --apply to write.\n')
      return
    }

    const { error } = await supabase.auth.admin.updateUserById(existing.id, { password })
    if (error) { console.error('ERROR resetting password:', error.message); process.exit(1) }

    console.log(`Password updated for ${email} (id ${existing.id}).`)
    console.log(`Role unchanged: ${current?.role ?? 'unknown'}`)
    console.log('\nAny existing sessions stay valid until they expire — if this is a')
    console.log('suspected compromise, also sign the user out from the Supabase')
    console.log('dashboard (Authentication > Users > the user > Sign out).\n')
    return
  }

  // ----- create / update mode ----------------------------------------------
  if (!APPLY) {
    if (existing) {
      console.log(`DRY-RUN: auth user already exists (id ${existing.id})`)
      console.log('DRY-RUN: would leave the password unchanged and upsert the profile with:')
    } else {
      console.log('DRY-RUN: would create the auth user (email pre-confirmed, no email sent)')
      console.log('DRY-RUN: would insert the profile with:')
    }
    console.log(`         { full_name: '${fullName}', role: '${role}' }`)
    console.log('\nRe-run with --apply to write.\n')
    return
  }

  let userId

  if (existing) {
    userId = existing.id
    console.log(`Auth user already exists (id ${userId}) — password left unchanged.`)
    console.log('(Use --reset-password to change it.)')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // no SMTP dependency; they can sign in immediately
      user_metadata: { full_name: fullName },
    })
    if (error) { console.error('ERROR creating auth user:', error.message); process.exit(1) }
    userId = data.user.id
    console.log(`Created auth user (id ${userId}).`)
  }

  // Service-role client, so the profiles_role_guard trigger treats this as a
  // trusted context and syncs is_admin from role.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, role }, { onConflict: 'id' })

  if (profileError) {
    console.error('ERROR upserting profile:', profileError.message)
    console.error('The auth user exists but has no usable profile — re-run this script to finish.')
    process.exit(1)
  }

  const { data: check, error: checkError } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_admin')
    .eq('id', userId)
    .single()

  if (checkError) { console.error('ERROR verifying profile:', checkError.message); process.exit(1) }

  console.log('\nProfile written and verified:')
  console.log(`  id       : ${check.id}`)
  console.log(`  full_name: ${check.full_name}`)
  console.log(`  role     : ${check.role}`)
  console.log(`  is_admin : ${check.is_admin}   (derived from role by the DB trigger)`)
  console.log(`\nDone. ${email} can now sign in at /login.\n`)
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1) })
