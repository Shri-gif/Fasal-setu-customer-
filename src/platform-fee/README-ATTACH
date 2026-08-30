CUSTOMER MODULE

Paste folder: src/platform-fee/

RULE: product.price_per_unit is the FARMER BASE PRICE.
Calculate final customer price dynamically:

const breakdown = calculatePlatformPrice(
  product.price_per_unit,
  platformSettings
);

Display breakdown.customerPrice.

For checkout/order:
buildPlatformFeeOrderSnapshot(basePrice, platformSettings)

Do not overwrite the original product.price_per_unit.
