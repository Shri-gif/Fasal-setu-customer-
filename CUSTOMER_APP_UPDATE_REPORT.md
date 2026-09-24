# Fasal Vistaar Customer App — Update Report

## Changes made
1. Rebranded customer-facing `Fasal Setu` text to `Fasal Vistaar`.
2. Updated page metadata/title and package name.
3. Added checkout payment-method selection:
   - Cash on Delivery
   - UPI
   - Card/Netbanking is intentionally disabled until a real payment gateway is configured.
4. Added payment fields to the customer order model:
   - `payment_method`
   - `payment_status`
   - `payment_reference`
5. Added a Supabase migration at:
   `supabase/migrations/202609250001_add_order_payment_fields.sql`
6. Added a compatibility fallback: if the existing `orders` table has not yet received the new payment columns, an order can still be placed using the old schema. The selected payment method remains available in the local customer order cache. Applying the migration makes payment data persist in Supabase.
7. Existing cart, product, profile, order, farmer, platform-fee and navigation logic was otherwise left intact.

## Important payment limitation
This update adds **payment method selection and payment-state tracking**, but it does **not** pretend that a payment gateway exists.

For real online UPI/card collection and automatic verification, a backend/gateway integration (for example a supported payment provider) is still required. Do not collect card numbers or CVV directly in this frontend.

## Validation
A full TypeScript build could not be completed in the isolated environment because the uploaded project dependencies were not installed (`react`, `@supabase/supabase-js`, Vite, etc.). The source changes were inspected statically. Run `npm install`/`bun install` and then `npm run build` in the project environment to perform the real build.
