import { createClient } from '@supabase/supabase-js';
import { Product, ProductCategory, Order, CartItem } from '../types';

const SUPABASE_URL = "https://iyurbpfsvqzmdyaqinqi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXJicGZzdnF6bWR5YXFpbnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjkyODUsImV4cCI6MjEwMjkwNTI4NX0.QiHk-cjLDETbK385RqW3R40A3ePpTn1B0XgN4FOJs2Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Demo / Seed fallback dataset if database table is initially empty
export const SAMPLE_CATEGORIES: ProductCategory[] = [
  { id: '1', name: 'Vegetables', slug: 'vegetables', icon: '🥬' },
  { id: '2', name: 'Fruits', slug: 'fruits', icon: '🍎' },
  { id: '3', name: 'Grains & Cereals', slug: 'grains', icon: '🌾' },
  { id: '4', name: 'Pulses & Lentils', slug: 'pulses', icon: '🫘' },
  { id: '5', name: 'Organic Dairy & Honey', slug: 'dairy', icon: '🍯' },
  { id: '6', name: 'Spices & Herbs', slug: 'spices', icon: '🌿' }
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    farmer_id: 'farm-101',
    farmer_name: 'Rameshwar Lal Patel',
    category_id: '1',
    name: 'Organic Desi Tomatoes (देसी टमाटर)',
    description: 'Sun-ripened, naturally grown sour juicy desi tomatoes straight from Khet in Meerut. No synthetic chemicals.',
    price_per_unit: 35,
    unit: 'kg',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 85,
    farm_location: 'Meerut, Uttar Pradesh',
    harvest_date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'prod-2',
    farmer_id: 'farm-102',
    farmer_name: 'Gurpreet Singh Dhillon',
    category_id: '3',
    name: 'Premium Sharbati Wheat (शरबती गेहूं)',
    description: 'Golden, heavy grains of authentic Sharbati wheat. Freshly harvested and stone-cleaned on the farm.',
    price_per_unit: 48,
    unit: 'kg',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 250,
    farm_location: 'Hoshangabad, Madhya Pradesh',
    harvest_date: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'prod-3',
    farmer_id: 'farm-103',
    farmer_name: 'Mahadev Anna Patil',
    category_id: '2',
    name: 'Farm Fresh Alphonso Mangoes (हापुस आम)',
    description: 'Naturally tree-ripened Ratnagiri Alphonso mangoes with rich aroma and golden sweetness.',
    price_per_unit: 420,
    unit: 'dozen',
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 40,
    farm_location: 'Ratnagiri, Maharashtra',
    harvest_date: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'prod-4',
    farmer_id: 'farm-101',
    farmer_name: 'Rameshwar Lal Patel',
    category_id: '1',
    name: 'Fresh Green Spinach (पालक)',
    description: 'Crisp, nutrient-rich pesticide-free palak harvested every morning before sunrise.',
    price_per_unit: 25,
    unit: 'bunch',
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 60,
    farm_location: 'Meerut, Uttar Pradesh',
    harvest_date: new Date().toISOString()
  },
  {
    id: 'prod-5',
    farmer_id: 'farm-104',
    farmer_name: 'Bhawani Shankar Sharma',
    category_id: '4',
    name: 'Unpolished Toor Dal (अरहर दाल)',
    description: 'Traditional water-milled, unpolished arhar dal with 100% natural fiber and earthy taste.',
    price_per_unit: 145,
    unit: 'kg',
    image_url: 'https://images.unsplash.com/photo-1585994829377-50e507b9efeb?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 120,
    farm_location: 'Gulbarga, Karnataka',
    harvest_date: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: 'prod-6',
    farmer_id: 'farm-105',
    farmer_name: 'Savitri Devi',
    category_id: '5',
    name: 'Pure Mustard Honey (शुद्ध सरसों शहद)',
    description: 'Raw, unfiltered apiary honey gathered directly from mustard blooms in winter.',
    price_per_unit: 380,
    unit: 'kg',
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 35,
    farm_location: 'Bharatpur, Rajasthan',
    harvest_date: new Date(Date.now() - 864000000).toISOString()
  },
  {
    id: 'prod-7',
    farmer_id: 'farm-104',
    farmer_name: 'Bhawani Shankar Sharma',
    category_id: '1',
    name: 'Fresh Crunchy Shimla Mirch (शिमला मिर्च)',
    description: 'Vibrant green bell peppers grown in polyhouses under controlled temperature for extra crispness.',
    price_per_unit: 55,
    unit: 'kg',
    image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 45,
    farm_location: 'Solan, Himachal Pradesh',
    harvest_date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'prod-8',
    farmer_id: 'farm-102',
    farmer_name: 'Gurpreet Singh Dhillon',
    category_id: '6',
    name: 'Organic Whole Turmeric (साबुत हल्दी)',
    description: 'High curcumin (5%+) whole dried turmeric rhizomes, sun-cured without artificial yellow dyes.',
    price_per_unit: 210,
    unit: 'kg',
    image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    is_available: true,
    stock: 90,
    farm_location: 'Sangli, Maharashtra',
    harvest_date: new Date(Date.now() - 1200000000).toISOString()
  }
];

// Helper functions for API calls with safety fallbacks
export async function fetchCategories(): Promise<ProductCategory[]> {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return SAMPLE_CATEGORIES;
    }
    return data.map((c: any) => ({
      id: String(c.id),
      name: c.name || c.title || c.category_name || 'Category',
      slug: c.slug || '',
      icon: c.icon || '🌱'
    }));
  } catch (err) {
    console.warn('Using fallback categories:', err);
    return SAMPLE_CATEGORIES;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return SAMPLE_PRODUCTS;
    }

    return data.map((p: any) => ({
      id: p.id,
      farmer_id: p.farmer_id,
      farmer_name: p.farmer_name || p.farmer?.name || 'Local Farmer',
      category_id: p.category_id,
      name: p.name || 'Fresh Farm Product',
      description: p.description || '',
      price_per_unit: Number(p.price_per_unit) || 0,
      unit: p.unit || 'kg',
      image_url: p.image_url || null,
      is_active: p.is_active ?? true,
      is_available: p.is_available ?? true,
      stock: Number(p.stock) || 0,
      farm_location: p.farm_location || 'Local Farm',
      harvest_date: p.harvest_date || null,
      created_at: p.created_at
    }));
  } catch (err) {
    console.warn('Using fallback products:', err);
    return SAMPLE_PRODUCTS;
  }
}

export async function fetchProductById(id: string | number): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      const match = SAMPLE_PRODUCTS.find(p => String(p.id) === String(id));
      return match || null;
    }

    return {
      id: data.id,
      farmer_id: data.farmer_id,
      farmer_name: data.farmer_name || 'Local Farmer',
      category_id: data.category_id,
      name: data.name || 'Fresh Farm Product',
      description: data.description || '',
      price_per_unit: Number(data.price_per_unit) || 0,
      unit: data.unit || 'kg',
      image_url: data.image_url || null,
      is_active: data.is_active ?? true,
      is_available: data.is_available ?? true,
      stock: Number(data.stock) || 0,
      farm_location: data.farm_location || 'Local Farm',
      harvest_date: data.harvest_date || null,
      created_at: data.created_at
    };
  } catch (err) {
    const match = SAMPLE_PRODUCTS.find(p => String(p.id) === String(id));
    return match || null;
  }
}

export async function placeOrderInDb(orderRows: any[]): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('orders')
      .insert(orderRows);

    if (error) {
      console.warn('Supabase insert error, saving locally:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn('Order exception:', err);
    return { success: false, error: err };
  }
}
