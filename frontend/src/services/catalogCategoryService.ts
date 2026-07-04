import { fetchJson } from './api';

export interface CatalogCategoryItem {
  category_id: number;
  code: string;
  label: string;
  description?: string | null;
  sort_order: number;
  is_system: boolean;
  is_active: boolean;
}

export const defaultCatalogCategories: CatalogCategoryItem[] = [
  { category_id: -1, code: 'VENUES', label: 'Venues', description: '', sort_order: 10, is_system: true, is_active: true },
  { category_id: -2, code: 'PACKAGES', label: 'Packages', description: '', sort_order: 20, is_system: true, is_active: true },
  { category_id: -3, code: 'FLORAL_DECORATION', label: 'Floral & Decoration', description: '', sort_order: 30, is_system: true, is_active: true },
  { category_id: -4, code: 'VENDORS', label: 'Vendors', description: '', sort_order: 40, is_system: true, is_active: true },
  { category_id: -5, code: 'SERVICES', label: 'Services', description: '', sort_order: 50, is_system: true, is_active: true },
];

export const catalogCategoryService = {
  list(includeInactive = false) {
    return fetchJson<{ data: CatalogCategoryItem[]; total: number }>(`/catalog-categories${includeInactive ? '?includeInactive=true' : ''}`);
  },
  create(payload: any) {
    return fetchJson<CatalogCategoryItem>('/catalog-categories', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: number, payload: any) {
    return fetchJson<CatalogCategoryItem>(`/catalog-categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  remove(id: number) {
    return fetchJson<{ message: string }>(`/catalog-categories/${id}`, { method: 'DELETE' });
  },
};