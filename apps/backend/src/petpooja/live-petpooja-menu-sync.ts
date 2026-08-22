import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MenuItem } from '@cafe/shared-types';
import type { PetPoojaMenuSync } from './petpooja-menu-sync.interface';
import {
  PETPOOJA_MAPPED_MENU_URL,
  isPetPoojaSuccess,
  petpoojaAuthHeaders,
  rupeeStringToPaise,
  type PetPoojaCredentials,
} from './petpooja-api';

interface PetPoojaMenuCategory {
  categoryid?: string;
  categoryname?: string;
  active?: string;
}

interface PetPoojaMenuItemRow {
  itemid?: string;
  itemname?: string;
  item_name?: string;
  itemcategoryid?: string;
  categoryid?: string;
  price?: string | number;
  in_stock?: string | number | boolean;
  itemdescription?: string;
  item_description?: string;
  description?: string;
  active?: string | number | boolean;
}

interface PetPoojaMenuResponse {
  success?: string | number | boolean;
  message?: string;
  categories?: PetPoojaMenuCategory[];
  items?: PetPoojaMenuItemRow[];
}

/**
 * Live menu pull via `mapped_restaurant_menus`.
 * Maps PetPooja itemid → our petpoojaItemId for order push.
 */
@Injectable()
export class LivePetPoojaMenuSync implements PetPoojaMenuSync {
  private readonly logger = new Logger(LivePetPoojaMenuSync.name);

  constructor(private readonly config: ConfigService) {}

  async pull(): Promise<Array<Omit<MenuItem, 'id' | 'syncedAt'>>> {
    const creds = this.requireCredentials();

    let res: Response;
    try {
      res = await fetch(PETPOOJA_MAPPED_MENU_URL, {
        method: 'POST',
        headers: petpoojaAuthHeaders(creds),
        body: JSON.stringify({ restID: creds.restId }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableException(
        `PetPooja menu sync network error: ${message}`,
      );
    }

    const text = await res.text();
    let body: PetPoojaMenuResponse = {};
    try {
      body = text ? (JSON.parse(text) as PetPoojaMenuResponse) : {};
    } catch {
      throw new ServiceUnavailableException(
        `PetPooja menu sync returned non-JSON (HTTP ${res.status})`,
      );
    }

    if (!res.ok || !isPetPoojaSuccess(body)) {
      const detail = body.message || text.slice(0, 240) || `HTTP ${res.status}`;
      throw new ServiceUnavailableException(
        `PetPooja menu sync failed: ${detail}`,
      );
    }

    const categoryById = new Map<string, string>();
    for (const cat of body.categories ?? []) {
      if (cat.categoryid && cat.categoryname) {
        categoryById.set(String(cat.categoryid), cat.categoryname);
      }
    }

    const rows = body.items ?? [];
    const mapped = rows
      .map((row) => this.mapItem(row, categoryById))
      .filter((item): item is Omit<MenuItem, 'id' | 'syncedAt'> => item !== null);

    this.logger.log(
      `PetPooja menu pull: ${mapped.length} item(s) from restID=${creds.restId}`,
    );
    return mapped;
  }

  private mapItem(
    row: PetPoojaMenuItemRow,
    categoryById: Map<string, string>,
  ): Omit<MenuItem, 'id' | 'syncedAt'> | null {
    const petpoojaItemId = row.itemid ? String(row.itemid) : null;
    const name = (row.itemname ?? row.item_name ?? '').trim();
    if (!petpoojaItemId || !name) return null;

    const categoryId = String(row.itemcategoryid ?? row.categoryid ?? '');
    const category = categoryById.get(categoryId) || 'Uncategorized';
    const description =
      (row.itemdescription ?? row.item_description ?? row.description ?? '')
        .trim() || null;
    const price = rupeeStringToPaise(row.price);
    const inStock = parseTruthy(row.in_stock, true);
    const active = parseTruthy(row.active, true);

    return {
      petpoojaItemId,
      name,
      description,
      price,
      category,
      isAvailable: inStock && active,
    };
  }

  private requireCredentials(): PetPoojaCredentials {
    const appKey = this.config.get<string>('PETPOOJA_APP_KEY')?.trim();
    const appSecret = this.config.get<string>('PETPOOJA_APP_SECRET')?.trim();
    const accessToken = this.config.get<string>('PETPOOJA_ACCESS_TOKEN')?.trim();
    const restId = this.config.get<string>('PETPOOJA_REST_ID')?.trim();
    if (!appKey || !appSecret || !accessToken || !restId) {
      throw new ServiceUnavailableException(
        'PetPooja live credentials incomplete. Set PETPOOJA_APP_KEY, PETPOOJA_APP_SECRET, PETPOOJA_ACCESS_TOKEN, PETPOOJA_REST_ID.',
      );
    }
    return { appKey, appSecret, accessToken, restId };
  }
}

function parseTruthy(
  value: string | number | boolean | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const s = String(value).trim().toLowerCase();
  if (['0', 'false', 'no', 'n', 'out'].includes(s)) return false;
  if (['1', 'true', 'yes', 'y', 'in'].includes(s)) return true;
  return defaultValue;
}
