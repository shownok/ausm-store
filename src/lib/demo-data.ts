/**
 * PLACEHOLDER CATALOG — used only when Supabase is not configured.
 * Names, prices and stock are examples. Replace them with real products
 * through the admin panel once the database is connected
 * (supabase/seed.sql loads the same catalog into the database).
 */
import type { Category, CategoryGroup, Product, StoreSettings, Variant } from "./types";

export const DEMO_SETTINGS: StoreSettings = {
  store_name: "ausm",
  whatsapp: "8801XXXXXXXXX",
  email: "hello@ausm.com.bd",
  bkash_number: "01XXXXXXXXX",
  nagad_number: "01XXXXXXXXX",
  delivery_inside_dhaka: 70,
  delivery_outside_dhaka: 130,
  free_delivery_over: 3000,
  announcement: "Cash on Delivery all over Bangladesh · Free delivery over ৳3,000",
};

const CATS: [string, string, CategoryGroup][] = [
  ["T-Shirts", "t-shirts", "Fashion"],
  ["Polo Shirts", "polo-shirts", "Fashion"],
  ["Hoodies & Sweatshirts", "hoodies", "Fashion"],
  ["Joggers & Bottoms", "bottoms", "Fashion"],
  ["Footwear", "footwear", "Fashion"],
  ["Caps & Hats", "caps", "Accessories"],
  ["Bags & Totes", "bags", "Accessories"],
  ["Wallets", "wallets", "Accessories"],
  ["Watches", "watches", "Accessories"],
  ["Sunglasses", "sunglasses", "Accessories"],
  ["Mugs & Drinkware", "drinkware", "Lifestyle"],
  ["Home & Desk", "home-desk", "Lifestyle"],
  ["Gift Boxes", "gift-boxes", "Lifestyle"],
  ["Phone Cases", "phone-cases", "Phone & Tech"],
  ["Tech Accessories", "tech", "Phone & Tech"],
];

export const DEMO_CATEGORIES: Category[] = CATS.map(([name, slug, group], i) => ({
  id: `cat-${slug}`,
  name,
  slug,
  group_name: group,
  image_url: null,
  sort_order: i,
  active: true,
}));

const SIZES = ["S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["40", "41", "42", "43", "44"];
const PHONE_MODELS = [
  "iPhone 13",
  "iPhone 14",
  "iPhone 15",
  "iPhone 16",
  "Samsung S24",
  "Samsung A55",
  "Xiaomi Redmi Note 13",
];

const variantSets: Record<string, string[]> = {
  "t-shirts": SIZES,
  "polo-shirts": SIZES,
  hoodies: SIZES,
  bottoms: ["28", "30", "32", "34", "36"],
  footwear: SHOE_SIZES,
  "phone-cases": PHONE_MODELS,
};

// [name, categorySlug, price, compareAt, featured, tags, description]
type Row = [string, string, number, number | null, boolean, string[], string];

const ROWS: Row[] = [
  ["Signature Logo Tee", "t-shirts", 750, 950, true, ["new", "bestseller"], "Heavyweight 210 GSM cotton tee with the ausm mark on the chest. Relaxed fit that holds its shape wash after wash."],
  ["Art of Life Graphic Tee", "t-shirts", 850, null, true, ["new"], "Oversized drop-shoulder tee with a back print inspired by Dhaka street art. 100% combed cotton."],
  ["Essential Blank Tee", "t-shirts", 550, null, false, [], "The everyday basic. Soft single-jersey cotton in a regular fit."],
  ["Classic Piqué Polo", "polo-shirts", 1150, 1350, false, ["bestseller"], "Breathable piqué cotton polo with a ribbed collar and embroidered mark."],
  ["Textured Knit Polo", "polo-shirts", 1450, null, true, ["new"], "Lightweight knit polo for warm evenings. Smart enough for dinner, easy enough for weekends."],
  ["Heavyweight Pullover Hoodie", "hoodies", 1950, 2300, true, ["bestseller"], "380 GSM brushed fleece, kangaroo pocket and a double-layered hood. Built for Dhaka winters."],
  ["Crewneck Sweatshirt", "hoodies", 1650, null, false, [], "Clean crewneck in soft loop-back fleece with ribbed cuffs and hem."],
  ["Everyday Joggers", "bottoms", 1250, null, true, ["new"], "Tapered joggers with an elastic waist, drawcord and zip pockets."],
  ["Relaxed Cargo Pants", "bottoms", 1750, 1950, false, [], "Cotton twill cargos with a relaxed straight leg and six pockets."],
  ["Canvas Low-Top Sneakers", "footwear", 2450, 2800, true, ["bestseller"], "Vulcanised canvas sneakers with a cushioned insole. Goes with everything."],
  ["Comfort Slides", "footwear", 890, null, false, [], "Soft one-piece EVA slides with a contoured footbed."],
  ["Embroidered Dad Cap", "caps", 650, null, true, ["bestseller"], "Washed cotton six-panel cap with an adjustable strap and embroidered mark."],
  ["Bucket Hat", "caps", 750, null, false, ["new"], "Reversible cotton bucket hat. Two looks in one."],
  ["Everyday Canvas Tote", "bags", 690, null, true, [], "Heavy canvas tote with an inner zip pocket. Fits a laptop up to 14\"."],
  ["Urban Crossbody Bag", "bags", 1450, 1650, false, ["new"], "Water-resistant crossbody with three compartments and an adjustable strap."],
  ["Slim Leather Wallet", "wallets", 1190, null, false, [], "Genuine leather bifold with six card slots. Slim enough for a front pocket."],
  ["Card Holder", "wallets", 650, null, false, [], "Minimal card holder with four slots and a centre pocket for notes."],
  ["Minimal Analog Watch", "watches", 2950, 3500, true, ["bestseller"], "38mm case, mineral glass and a genuine leather strap. Water-resistant to 3 ATM."],
  ["Sport Digital Watch", "watches", 1850, null, false, [], "Lightweight digital watch with stopwatch, alarm and backlight."],
  ["Classic Wayfarer Sunglasses", "sunglasses", 1290, null, false, [], "UV400 polarised lenses in a timeless frame. Includes a hard case."],
  ["Round Metal Sunglasses", "sunglasses", 1390, 1590, false, ["new"], "Lightweight metal frame with UV400 protection."],
  ["Ceramic Mug", "drinkware", 450, null, true, [], "350ml ceramic mug with the ausm mark. Microwave and dishwasher safe."],
  ["Insulated Steel Bottle", "drinkware", 990, null, false, ["bestseller"], "750ml double-walled bottle. Keeps drinks cold for 24 hours, hot for 12."],
  ["Desk Organiser Set", "home-desk", 1150, null, false, [], "Three-piece organiser set for pens, cables and notes."],
  ["Art Print Poster (A3)", "home-desk", 550, null, false, ["new"], "Museum-quality matte poster print. Frame not included."],
  ["The Starter Gift Box", "gift-boxes", 1990, 2350, true, [], "A tee, a mug and a cap, packed in a branded gift box with a handwritten card."],
  ["Art of Life Phone Case", "phone-cases", 650, null, true, ["bestseller"], "Slim hard case with a full-wrap art print and raised edges to protect the camera."],
  ["Clear MagSafe Case", "phone-cases", 850, null, false, [], "Anti-yellowing clear case with built-in magnets."],
  ["Braided Fast-Charge Cable", "tech", 450, null, false, [], "1.5m braided USB-C cable with 60W fast charging."],
  ["Mini Power Bank 10,000mAh", "tech", 1650, 1850, false, ["new"], "Pocket-size power bank with USB-C PD fast charging."],
];

function makeVariants(productId: string, catSlug: string, i: number): Variant[] {
  const names = variantSets[catSlug] ?? ["Standard"];
  return names.map((name, j) => ({
    id: `${productId}-v${j}`,
    product_id: productId,
    name,
    sku: null,
    price: null,
    // deterministic pseudo-random stock so the demo has a few sold-out sizes
    stock: names.length > 1 && (i * 7 + j * 3) % 11 === 0 ? 0 : 5 + ((i + j * 5) % 20),
    sort_order: j,
  }));
}

export const DEMO_PRODUCTS: Product[] = ROWS.map(
  ([name, catSlug, price, compare, featured, tags, description], i) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const id = `prod-${slug}`;
    const category = DEMO_CATEGORIES.find((c) => c.slug === catSlug)!;
    return {
      id,
      name,
      slug,
      description,
      category_id: category.id,
      price,
      compare_at_price: compare,
      images: [],
      tags,
      featured,
      active: true,
      created_at: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
      variants: makeVariants(id, catSlug, i),
      category,
    };
  },
);
