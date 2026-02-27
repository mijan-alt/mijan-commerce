// config/site.config.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * SITE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * To switch store types, just change the active preset at the bottom.
 * No other code changes needed!
 */

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type SiteConfig = {
  name: string
  description: string
  useGenderFiltering: boolean
  singleGender?: 'men' | 'women' | 'kids' | 'unisex' | null
  genderOptions: Array<{ label: string; value: string }>
  departments: Array<{ label: string; value: string }>
  navigationSections?: Array<{
    label: string
    value: string
    collection?: string
  }>
}

// ═══════════════════════════════════════════════════════════════
// PRESET CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Multi-Gender Fashion Store (Nike/Adidas style)
 * - Separate sections for Men, Women, Kids
 * - Gender-based navigation and filtering
 * - Best for: Athletic wear, fashion brands
 */
export const FASHION_MULTI_GENDER: SiteConfig = {
  name: 'Fashion Store',
  description: 'Premium fashion for everyone',
  
  useGenderFiltering: true,
  singleGender: null,
  
  genderOptions: [
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Kids', value: 'kids' },
    { label: 'Unisex', value: 'unisex' },
  ],
  
  departments: [
    { label: 'Shoes', value: 'shoes' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Sport', value: 'sport' },
  ],
}

/**
 * Women's Boutique
 * - Women-only products
 * - Simple navigation without gender split
 * - Best for: Women's fashion, lingerie, maternity
 */
export const WOMENS_BOUTIQUE: SiteConfig = {
  name: 'Bella Boutique',
  description: 'Curated fashion for women',
  
  useGenderFiltering: false,
  singleGender: 'women',
  
  genderOptions: [
    { label: 'Women', value: 'women' },
  ],
  
  departments: [
    { label: 'Dresses', value: 'dresses' },
    { label: 'Tops', value: 'tops' },
    { label: 'Bottoms', value: 'bottoms' },
    { label: 'Shoes', value: 'shoes' },
    { label: 'Bags', value: 'bags' },
    { label: 'Jewelry', value: 'jewelry' },
  ],
  
  navigationSections: [
    { label: 'New In', value: 'new-arrivals', collection: 'new-arrivals' },
    { label: 'Best Sellers', value: 'best-sellers', collection: 'best-sellers' },
    { label: 'Sale', value: 'sale', collection: 'on-sale' },
    { label: 'Shop All', value: 'all' },
  ],
}

/**
 * Men's Store
 * - Men-only products
 * - Simple navigation
 * - Best for: Menswear, suits, grooming
 */
export const MENS_STORE: SiteConfig = {
  name: 'Gentleman Supply',
  description: 'Premium menswear and accessories',
  
  useGenderFiltering: false,
  singleGender: 'men',
  
  genderOptions: [
    { label: 'Men', value: 'men' },
  ],
  
  departments: [
    { label: 'Suits & Blazers', value: 'suits' },
    { label: 'Shirts', value: 'shirts' },
    { label: 'Pants', value: 'pants' },
    { label: 'Shoes', value: 'shoes' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Grooming', value: 'grooming' },
  ],
  
  navigationSections: [
    { label: 'New Arrivals', value: 'new-arrivals', collection: 'new-arrivals' },
    { label: 'Best Sellers', value: 'best-sellers', collection: 'best-sellers' },
    { label: 'Sale', value: 'sale', collection: 'on-sale' },
    { label: 'Shop All', value: 'all' },
  ],
}

/**
 * Unisex Streetwear
 * - Gender-neutral products
 * - Single catalog for everyone
 * - Best for: Streetwear, urban fashion
 */
export const STREETWEAR_UNISEX: SiteConfig = {
  name: 'Urban Threads',
  description: 'Street fashion for everyone',
  
  useGenderFiltering: false,
  singleGender: 'unisex',
  
  genderOptions: [
    { label: 'Unisex', value: 'unisex' },
  ],
  
  departments: [
    { label: 'Hoodies', value: 'hoodies' },
    { label: 'Tees', value: 'tees' },
    { label: 'Bottoms', value: 'bottoms' },
    { label: 'Outerwear', value: 'outerwear' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Footwear', value: 'footwear' },
  ],
  
  navigationSections: [
    { label: 'New Drops', value: 'new-arrivals', collection: 'new-arrivals' },
    { label: 'Best Sellers', value: 'best-sellers', collection: 'best-sellers' },
    { label: 'Sale', value: 'sale', collection: 'on-sale' },
    { label: 'Shop All', value: 'all' },
  ],
}

/**
 * Beauty Store
 * - Skincare, makeup, haircare
 * - Gender-neutral approach
 * - Best for: Cosmetics, skincare, beauty
 */
export const BEAUTY_STORE: SiteConfig = {
  name: 'Glow Beauty',
  description: 'Premium beauty and skincare',
  
  useGenderFiltering: false,
  singleGender: 'unisex',
  
  genderOptions: [
    { label: 'Unisex', value: 'unisex' },
  ],
  
  departments: [
    { label: 'Skincare', value: 'skincare' },
    { label: 'Makeup', value: 'makeup' },
    { label: 'Haircare', value: 'haircare' },
    { label: 'Fragrance', value: 'fragrance' },
    { label: 'Body Care', value: 'body-care' },
    { label: 'Tools', value: 'tools' },
  ],
  
  navigationSections: [
    { label: 'New Arrivals', value: 'new-arrivals', collection: 'new-arrivals' },
    { label: 'Best Sellers', value: 'best-sellers', collection: 'best-sellers' },
    { label: 'Sale', value: 'sale', collection: 'on-sale' },
    { label: 'Shop All', value: 'all' },
  ],
}

/**
 * Kids Store (with gender filtering)
 * - Boys, Girls, Baby sections
 * - Age-appropriate categories
 * - Best for: Children's clothing, toys
 */
export const KIDS_STORE: SiteConfig = {
  name: 'Little Stars',
  description: 'Fashion and toys for kids',
  
  useGenderFiltering: true,
  singleGender: null,
  
  genderOptions: [
    { label: 'Boys', value: 'boys' },
    { label: 'Girls', value: 'girls' },
    { label: 'Baby', value: 'baby' },
    { label: 'Toddler', value: 'toddler' },
  ],
  
  departments: [
    { label: 'Clothing', value: 'clothing' },
    { label: 'Shoes', value: 'shoes' },
    { label: 'Toys', value: 'toys' },
    { label: 'School', value: 'school' },
    { label: 'Accessories', value: 'accessories' },
  ],
}

// ═══════════════════════════════════════════════════════════════
// ⭐ ACTIVE CONFIGURATION - CHANGE THIS LINE TO SWITCH PRESETS
// ═══════════════════════════════════════════════════════════════

export const SITE_CONFIG = WOMENS_BOUTIQUE

// Other options:
// export const SITE_CONFIG = WOMENS_BOUTIQUE
// export const SITE_CONFIG = MENS_STORE
// export const SITE_CONFIG = STREETWEAR_UNISEX
// export const SITE_CONFIG = BEAUTY_STORE
// export const SITE_CONFIG = KIDS_STORE

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const useGenderFiltering = () => SITE_CONFIG.useGenderFiltering
export const getSingleGender = () => SITE_CONFIG.singleGender
export const getGenderOptions = () => SITE_CONFIG.genderOptions
export const getDepartments = () => SITE_CONFIG.departments
export const getNavigationSections = () => SITE_CONFIG.navigationSections || []

export const shouldShowGender = (gender: string) => {
  if (!SITE_CONFIG.useGenderFiltering) return false
  if (SITE_CONFIG.singleGender) return gender === SITE_CONFIG.singleGender
  return SITE_CONFIG.genderOptions.some(opt => opt.value === gender)
}