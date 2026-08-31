export interface Product {
  id: string | number;
  farmer_id?: string | number | null;
  farmer_name?: string;
  category_id?: string | number | null;
  name: string;
  description?: string;
  price_per_unit: number;
  unit: string;
  image_url?: string | null;
  is_active?: boolean;
  is_available?: boolean;
  stock: number;
  farm_location?: string | null;
  harvest_date?: string | null;
  created_at?: string;
}

export interface ProductCategory {
  id: string | number;
  name: string;
  slug?: string;
  icon?: string;
}

export interface CartItem {
  id: string | number;
  farmer_id?: string | number | null;
  farmer_name?: string;
  category_id?: string | number | null;
  name: string;
  description?: string;
  price_per_unit: number;
  unit: string;
  image_url?: string | null;
  stock: number;
  farm_location?: string | null;
  quantity: number;
}

export interface CustomerProfile {
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  updatedAt?: string;
}

export interface Order {
  id: string | number;
  product_id?: string | number;
  farmer_id?: string | number | null;
  product_name?: string;
  customer_name: string;
  customer_mobile: string;
  delivery_address: string;
  city: string;
  pincode: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  created_at?: string;
}

export interface PlacedOrderSummary {
  orderIds: (string | number)[];
  orderCount: number;
  totalAmount: number;
  customerName: string;
  mobile: string;
  createdAt: string;
}
