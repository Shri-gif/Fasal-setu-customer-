import { createClient } from '@supabase/supabase-js';
import { Product, ProductCategory } from '../types';

/**
 * FASAL SETU CUSTOMER
 * Supabase connection
 *
 * Supabase is the source of truth for live customer data.
 * No fake/demo data is returned when a database request fails.
 */

const SUPABASE_URL =
  'https://iyurbpfsvqzmdyaqinqi.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_yMfCVOi95ZMwNjyHNuc-Ww_8LyLAwDE';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/*
 * These exports are kept only because CartContext.tsx currently imports
 * SAMPLE_PRODUCTS.
 *
 * IMPORTANT:
 * They are NOT used as fallback data.
 * Customer-facing data always comes from Supabase.
 */
export const SAMPLE_CATEGORIES: ProductCategory[] = [];
export const SAMPLE_PRODUCTS: Product[] = [];

interface FarmerRow {
  id: string | number;
  farm_name?: string | null;
  farm_location?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
}

interface CategoryRow {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  icon?: string | null;
}

/**
 * Create a URL-friendly slug when the database doesn't contain one.
 */
function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build farmer location from the real farmers table.
 */
function buildFarmLocation(
  farmer?: FarmerRow
): string | null {
  if (!farmer) return null;

  const parts = [
    farmer.farm_location,
    farmer.city,
    farmer.district,
    farmer.state,
  ]
    .map(value => (value || '').trim())
    .filter(Boolean);

  return [...new Set(parts)].join(', ') || null;
}

/**
 * Convert Supabase product row into the Product type used
 * throughout the existing customer application.
 */
function mapProduct(
  row: any,
  farmerMap: Map<string, FarmerRow> = new Map()
): Product {
  const farmer = row.farmer_id
    ? farmerMap.get(String(row.farmer_id))
    : undefined;

  return {
    id: row.id,

    farmer_id:
      row.farmer_id ?? null,

    farmer_name:
      farmer?.farm_name ||
      row.farmer_name ||
      row.farmer?.farm_name ||
      'Local Farmer',

    category_id:
      row.category_id ?? null,

    name:
      row.name ||
      'Fresh Farm Product',

    description:
      row.description ||
      '',

    price_per_unit:
      Number(row.price_per_unit ?? 0),

    unit:
      row.unit ||
      'kg',

    image_url:
      row.image_url ||
      null,

    is_active:
      row.is_active ?? true,

    is_available:
      row.is_available ?? true,

    stock:
      Number(row.stock ?? 0),

    farm_location:
      buildFarmLocation(farmer) ||
      row.farm_location ||
      row.farmer?.farm_location ||
      null,

    harvest_date:
      row.harvest_date ||
      null,

    created_at:
      row.created_at ||
      undefined,
  };
}

/**
 * Fetch REAL product categories from Supabase.
 */
export async function fetchCategories(): Promise<ProductCategory[]> {
  const {
    data,
    error,
  } = await supabase
    .from('product_categories')
    .select('*')
    .order('name', {
      ascending: true,
    });

  if (error) {
    console.error(
      'Fasal Setu: failed to fetch product categories:',
      error
    );

    return [];
  }

  if (!data) {
    return [];
  }

  return (data as CategoryRow[]).map(category => ({
    id: category.id,

    name:
      category.name ||
      'Category',

    slug:
      category.slug ||
      makeSlug(category.name || 'category'),

    icon:
      category.icon ||
      '🌱',
  }));
}

/**
 * Fetch REAL products from Supabase.
 *
 * Products are fetched first.
 * Farmer information is then fetched separately using farmer_id.
 *
 * This avoids depending on a specific Supabase relationship name.
 */
export async function fetchProducts(): Promise<Product[]> {
  const {
    data,
    error,
  } = await supabase
    .from('products')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error(
      'Fasal Setu: failed to fetch products:',
      error
    );

    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  /*
   * Only explicitly inactive products are hidden.
   *
   * If an older database row has NULL in is_active,
   * it is treated as active so valid products don't
   * accidentally disappear.
   */
  const activeProducts = data.filter(
    (row: any) =>
      row.is_active !== false
  );

  if (activeProducts.length === 0) {
    return [];
  }

  /*
   * Collect all farmer IDs used by the products.
   */
  const farmerIds = [
    ...new Set(
      activeProducts
        .map((row: any) => row.farmer_id)
        .filter(
          (id: any) =>
            id !== null &&
            id !== undefined
        )
        .map((id: any) => String(id))
    ),
  ];

  const farmerMap =
    new Map<string, FarmerRow>();

  /*
   * Fetch real farmer information.
   */
  if (farmerIds.length > 0) {
    const {
      data: farmers,
      error: farmerError,
    } = await supabase
      .from('farmers')
      .select(
        'id, farm_name, farm_location, city, district, state'
      )
      .in('id', farmerIds);

    if (farmerError) {
      /*
       * Don't hide valid products just because farmer
       * information cannot be read.
       */
      console.warn(
        'Fasal Setu: farmer details could not be fetched. Products will still be shown:',
        farmerError
      );
    } else if (farmers) {
      (farmers as FarmerRow[]).forEach(
        farmer => {
          farmerMap.set(
            String(farmer.id),
            farmer
          );
        }
      );
    }
  }

  /*
   * Return ONLY real Supabase products.
   */
  return activeProducts.map(
    row =>
      mapProduct(
        row,
        farmerMap
      )
  );
}

/**
 * Fetch a single REAL product from Supabase.
 */
export async function fetchProductById(
  id: string | number
): Promise<Product | null> {
  const {
    data,
    error,
  } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(
      `Fasal Setu: failed to fetch product ${id}:`,
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  /*
   * Explicitly inactive products should not be
   * visible to customers.
   */
  if (data.is_active === false) {
    return null;
  }

  const farmerMap =
    new Map<string, FarmerRow>();

  /*
   * Fetch the real farmer belonging to this product.
   */
  if (
    data.farmer_id !== null &&
    data.farmer_id !== undefined
  ) {
    const {
      data: farmer,
      error: farmerError,
    } = await supabase
      .from('farmers')
      .select(
        'id, farm_name, farm_location, city, district, state'
      )
      .eq('id', data.farmer_id)
      .maybeSingle();

    if (farmerError) {
      console.warn(
        `Fasal Setu: farmer details could not be fetched for product ${id}:`,
        farmerError
      );
    } else if (farmer) {
      farmerMap.set(
        String(farmer.id),
        farmer as FarmerRow
      );
    }
  }

  return mapProduct(
    data,
    farmerMap
  );
}

/**
 * Insert customer orders into the REAL Supabase orders table.
 *
 * Local order history is still handled by CartContext.tsx,
 * so the existing customer-side order flow remains unchanged.
 */
export async function placeOrderInDb(
  orderRows: any[]
): Promise<{
  success: boolean;
  error?: any;
}> {
  if (
    !Array.isArray(orderRows) ||
    orderRows.length === 0
  ) {
    return {
      success: false,
      error: 'No order rows supplied.',
    };
  }

  const {
    error,
  } = await supabase
    .from('orders')
    .insert(orderRows);

  if (error) {
    console.error(
      'Fasal Setu: order insert failed:',
      error
    );

    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
  };
}
