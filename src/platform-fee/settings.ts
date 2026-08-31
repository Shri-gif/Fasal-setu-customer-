import { supabase } from '../lib/supabase';
import { PlatformFeeSettings } from './types';
import { normalizeFeeType } from './calculations';

export const DEFAULT_PLATFORM_FEE_SETTINGS: PlatformFeeSettings = {
  platform_fee: 0,
  platform_fee_type: 'percentage',
};

export const loadPlatformFeeSettings = async (): Promise<PlatformFeeSettings> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('platform_fee, platform_fee_type')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_PLATFORM_FEE_SETTINGS;

    return {
      platform_fee: Math.max(0, Number(data.platform_fee) || 0),
      platform_fee_type: normalizeFeeType(data.platform_fee_type),
    };
  } catch (error) {
    console.error('Failed to load platform fee settings:', error);
    return DEFAULT_PLATFORM_FEE_SETTINGS;
  }
};
