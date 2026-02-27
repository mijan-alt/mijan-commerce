import { randomBytes } from "crypto"

export function generateUniqueSuffix(length: number = 8): string {
  // Character set that's URL-safe: alphanumeric (lowercase + numbers)
  // Avoiding uppercase to maintain consistency with slug format
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'

  // Generate random bytes
  const random = randomBytes(length)

  // Convert to characters from our charset
  let result = ''
  for (let i = 0; i < length; i++) {
    // Use the random byte to index into our charset
    const randomIndex = random[i] % charset.length
    result += charset[randomIndex]
  }

  return result
}