import { fetchJson } from './api';

export const catalogService = {
  async getPriceBooks(includeInactive = false) {
    return fetchJson(`/price-books${includeInactive ? '?includeInactive=true&limit=100' : '?limit=100'}`);
  },
  async createPriceBook(payload: any) {
    return fetchJson('/price-books', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updatePriceBook(priceBookId: number, payload: any) {
    return fetchJson(`/price-books/${priceBookId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async deletePriceBook(priceBookId: number) {
    return fetchJson(`/price-books/${priceBookId}`, { method: 'DELETE' });
  },
  async getRateCards(priceBookId: number) {
    return fetchJson(`/price-books/${priceBookId}/rate-cards`);
  },
  async getPackages() {
    return fetchJson('/packages');
  },
  async updatePackage(packageId: number, payload: any) {
    return fetchJson(`/packages/${packageId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async deletePackage(packageId: number) {
    return fetchJson(`/packages/${packageId}`, {
      method: 'DELETE',
    });
  },
  async createRateCard(priceBookId: number, payload: any) {
    return fetchJson(`/price-books/${priceBookId}/rate-cards`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateRateCard(rateCardId: number, payload: any) {
    return fetchJson(`/rate-cards/${rateCardId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async deleteRateCard(rateCardId: number) {
    return fetchJson(`/rate-cards/${rateCardId}`, {
      method: 'DELETE',
    });
  },
};
