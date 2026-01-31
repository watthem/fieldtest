# Pricing Specification

This document specifies the pricing calculation behavior.

## Examples

Here are some pricing examples:

| Quantity | Unit Price |
|----------|------------|
| [2](!set:quantity) | [$10.00](!set:unitPrice) |

After calculation, the total should be [$20.00](!verify:total).

## Discount Rules

When quantity is greater than 10, a discount SHOULD be applied.

For [15](!set:quantity) items at [$5.00](!set:unitPrice):
- [calculate](!execute:pricing)
- Expected discount: [10%](!verify:discount)
- Expected total: [$67.50](!verify:total)

## Edge Cases

For zero quantity:
- Quantity: [0](!set:quantity)
- Price: [$10.00](!set:unitPrice)
- Total MUST be [$0.00](!verify:total)
