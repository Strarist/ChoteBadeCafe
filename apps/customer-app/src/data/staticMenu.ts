import type { MenuItem as ApiMenuItem } from '@cafe/shared-types'
import { CAFE_MENU_SEED } from '@cafe/shared-types'

/** Bundled menu — instant display while the API wakes (Render free tier). */
export const staticMenu: ApiMenuItem[] = CAFE_MENU_SEED.map((item) => ({
  id: item.petpoojaItemId,
  petpoojaItemId: item.petpoojaItemId,
  name: item.name,
  description: item.description,
  price: item.price,
  category: item.category,
  isAvailable: item.isAvailable,
  syncedAt: null,
}))
