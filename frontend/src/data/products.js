// ─── Centralized Product Catalog ──────────────────────────────────────────────
// Single source of truth for all products across the app.
//
// Structure:
//   - Each product has a CANONICAL id (used as the URL slug).
//   - priceMap: weight-to-price mapping — easy to change, easy to extend.
//   - packingPrices: additional charge per packing option.
//   - listing variants: separate records (cb-250, cb-500 …) still exist for the
//     listing pages so each card shows the correct per-weight price; they each
//     point at the canonical product id via `canonicalId` for deep-linking.

import chickenBonePickleImg from '../assets/images/Chicken_Bone.png';
import chickenBonePickleImg2 from '../assets/images/Chicken_Bone2.png';
import chickenBonePickleImg3 from '../assets/images/ChickenBone3.png';
import chickenBonelessPickleImg from '../assets/images/Chicken_Boneless.png';
import mangoPickleImg from '../assets/images/Mango_Pickel.png';
import tomatoPickleImg from '../assets/images/tomato_pickle.png';
import landingImage from '../assets/images/Landingpage_Image.png';
import landingImage1 from '../assets/images/Landingpage_Image1.png';

// ── Packing price additions (applies globally) ────────────────────────────────
// Add new packing options here — ProductDetail picks them up automatically.
export const PACKING_PRICES = {
  'Without Bottle': 0,
  'Bottle': 30,
};

// ── Canonical products (shown on the Product Detail page) ─────────────────────
// priceMap keys are the weight labels shown in the UI pill selector.
// To add a new weight tier, just add an entry to priceMap — no other changes needed.
export const canonicalProducts = [
  {
    id: 'chicken-bone-pickle',
    name: 'Chicken Bone Pickle',
    category: 'nonVeg',
    image: chickenBonePickleImg,
    gallery: [
      { src: chickenBonePickleImg, alt: 'Chicken Bone Pickle Jar' },
      { src: chickenBonePickleImg2, alt: 'Chicken Bone Pickle Kitchen Preparation' },
      { src: chickenBonePickleImg3, alt: 'Chicken Bone Pickle Andhra Spices' },
      { src: chickenBonePickleImg, alt: 'Chicken Bone Pickle Closeup' },
    ],
    description: 'Tender bone-in chicken pieces marinated in traditional Andhra spices, slow-cooked and preserved in cold-pressed sesame oil.',
    priceMap: {
      '250gm': 280,
      '500gm': 560,
      '1kg': 900,
    },
    defaultWeight: '250gm',
  },
  {
    id: 'chicken-boneless-pickle',
    name: 'Chicken Boneless Pickle',
    category: 'nonVeg',
    image: chickenBonelessPickleImg,
    gallery: [
      { src: chickenBonelessPickleImg, alt: 'Chicken Boneless Pickle Jar' },
      { src: landingImage1, alt: 'Chicken Boneless Pickle Fresh Preparation' },
      { src: landingImage, alt: 'Chicken Boneless Pickle Spices' },
      { src: chickenBonelessPickleImg, alt: 'Chicken Boneless Pickle Serving' },
    ],
    description: 'Tender boneless chicken pieces marinated in signature Andhra spice blend, preserved in cold-pressed sesame oil.',
    priceMap: {
      '250gm': 320,
      '500gm': 650,
      '1kg': 1300,
    },
    defaultWeight: '250gm',
  },
  {
    id: 'tomato-pickle',
    name: 'Tomato Pickle',
    category: 'veg',
    image: tomatoPickleImg,
    gallery: [
      { src: tomatoPickleImg, alt: 'Tomato Pickle Jar' },
      { src: landingImage, alt: 'Fresh Tomatoes & Spices' },
      { src: landingImage1, alt: 'Traditional Tomato Pickle Recipe' },
      { src: tomatoPickleImg, alt: 'Tomato Pickle Serving' },
    ],
    description: 'Sun-ripened tomatoes slow-cooked with aromatic spices and sesame oil — a tangy Andhra pantry staple.',
    priceMap: {
      '250gm': 200,
      '500gm': 400,
      '1kg': 600,
    },
    defaultWeight: '250gm',
  },
  {
    id: 'mango-pickle',
    name: 'Mango Pickle',
    category: 'veg',
    image: mangoPickleImg,
    gallery: [
      { src: mangoPickleImg, alt: 'Mango Pickle Jar' },
      { src: landingImage1, alt: 'Raw Mango & Andhra Spices' },
      { src: landingImage, alt: 'Traditional Mango Pickle Recipe' },
      { src: mangoPickleImg, alt: 'Mango Pickle Close Up' },
    ],
    description: 'Raw mangoes handpicked and blended with aromatic Andhra spices, preserved in cold-pressed sesame oil.',
    priceMap: {
      '250gm': 220,
      '500gm': 400,
      '1kg': 6000,
    },
    defaultWeight: '250gm',
  },
  // ── Home-page variety items ──────────────────────────────────────────────────
  {
    id: 'garlic-pickle',
    name: 'Garlic Pickle',
    category: 'veg',
    image: tomatoPickleImg,
    gallery: [
      { src: tomatoPickleImg, alt: 'Garlic Pickle Jar' },
      { src: landingImage, alt: 'Garlic Cloves & Guntur Chilli' },
      { src: landingImage1, alt: 'Traditional Garlic Pickle Prep' },
      { src: tomatoPickleImg, alt: 'Garlic Pickle Serving' },
    ],
    description: 'Whole garlic cloves slow-cooked with Guntur chili powder and sesame oil for an intense, pungent flavor.',
    priceMap: {
      '250gm': 249,
      '500gm': 479,
      '1kg': 899,
    },
    defaultWeight: '250gm',
  },
  {
    id: 'mixed-veg-pickle',
    name: 'Mixed Veg Pickle',
    category: 'veg',
    image: mangoPickleImg,
    gallery: [
      { src: mangoPickleImg, alt: 'Mixed Veg Pickle Jar' },
      { src: landingImage, alt: 'Seasonal Vegetables & Andhra Spices' },
      { src: landingImage1, alt: 'Mixed Veg Pickle Recipe' },
      { src: mangoPickleImg, alt: 'Mixed Veg Pickle Close Up' },
    ],
    description: 'A colorful medley of seasonal vegetables blended with traditional Andhra pickle masala.',
    priceMap: {
      '250gm': 189,
      '500gm': 359,
      '1kg': 699,
    },
    defaultWeight: '250gm',
  },
  {
    id: 'green-chilli-pickle',
    name: 'Green Chilli Pickle',
    category: 'veg',
    image: tomatoPickleImg,
    gallery: [
      { src: tomatoPickleImg, alt: 'Green Chilli Pickle Jar' },
      { src: landingImage1, alt: 'Green Chillies & Sesame Oil' },
      { src: landingImage, alt: 'Green Chilli Pickle Recipe' },
      { src: tomatoPickleImg, alt: 'Green Chilli Pickle Serving' },
    ],
    description: 'Whole green chillies preserved in sesame oil with a bold spice mix — for the true heat-lovers.',
    priceMap: {
      '250gm': 159,
      '500gm': 299,
      '1kg': 549,
    },
    defaultWeight: '250gm',
  },
];

// ── Helper: look up a canonical product by id ─────────────────────────────────
export const getProductById = (id) =>
  canonicalProducts.find((p) => p.id === id) || null;

// ─────────────────────────────────────────────────────────────────────────────
// Listing-page records (one card per weight for Products / VegPickles / NonVegPickles)
// Each record carries a `canonicalId` that ProductDetail uses for the deep-link.
// ─────────────────────────────────────────────────────────────────────────────

export const chickenBoneProducts = [
  { id: 'chicken-bone-pickle', name: 'Chicken Bone Pickle', price: 280, image: chickenBonePickleImg, category: 'nonVeg' },
];

export const chickenBonelessProducts = [
  { id: 'chicken-boneless-pickle', name: 'Chicken Boneless Pickle', price: 320, image: chickenBonelessPickleImg, category: 'nonVeg' },
];

export const tomatoProducts = [
  { id: 'tomato-pickle', name: 'Tomato Pickle', price: 200, image: tomatoPickleImg, category: 'veg' },
];

export const mangoProducts = [
  { id: 'mango-pickle', name: 'Mango Pickle', price: 220, image: mangoPickleImg, category: 'veg' },
];

// ── Home-page variety cards ────────────────────────────────────────────────────
export const varietyProducts = [
  { id: 'veg-pickle', name: 'Veg Pickle', label: 'Veg Pickles', price: 189, image: mangoPickleImg, category: 'veg', route: '/veg-pickles' },
  { id: 'non-veg-pickle', name: 'Non Veg Pickle', label: 'Non veg Pickles', price: 189, image: chickenBonelessPickleImg, category: 'nonVeg', route: '/non-veg-pickles' },
  { id: 'garlic-pickle', name: 'Garlic Pickle', label: 'Podis', price: 249, image: chickenBonePickleImg, category: 'podis', route: '/products' },
  { id: 'mixed-veg-pickle', name: 'Mixed Veg Pickle', label: 'Sweets', price: 189, image: tomatoPickleImg, category: 'veg', route: '/products' },
  { id: 'green-chilli-pickle', name: 'Green Chilli Pickle', label: 'Snacks', price: 159, image: tomatoPickleImg, category: 'veg', route: '/products' },
];

// ── Master flat list (all listing cards) ──────────────────────────────────────
export const allProducts = [
  ...varietyProducts,
  ...chickenBoneProducts,
  ...chickenBonelessProducts,
  ...tomatoProducts,
  ...mangoProducts,
];
