import '@testing-library/jest-dom/vitest'

// vitest.config.ts disables iframe page loading (article embeds must never hit
// the network in tests); happy-dom then reports each skipped iframe through
// console.error. Drop exactly that notice and pass everything else through.
const consoleError = console.error.bind(console)
console.error = (...args: unknown[]) => {
  const first = args[0]
  const text = first instanceof Error ? first.message : String(first ?? '')
  if (text.includes('Iframe page loading is disabled')) return
  consoleError(...args)
}
