import { VehicleModel, PriceHistoryEntry } from '../types';
import { vehicleModelCatalog } from '../data/catalog';

const PRICING_STORAGE_PREFIX = 'dealer_app_pricing_';

export const dealerPricingService = {
  /**
   * Get models and prices for a specific dealer.
   * If dealer has custom pricing saved in localStorage, return it.
   * Otherwise, initialize their baseline catalog and return it.
   */
  getDealerModels(dealerCode?: string): VehicleModel[] {
    const code = (dealerCode || 'C-DAR-N00988').toUpperCase().trim();
    const storageKey = `${PRICING_STORAGE_PREFIX}${code}`;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: VehicleModel[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(`Error loading pricing for dealer ${code}:`, e);
    }

    // Baseline catalog for this dealer
    const baseline = this.createBaselineCatalog(code);
    this.saveDealerModels(code, baseline);
    return baseline;
  },

  /**
   * Save models and prices for a specific dealer.
   */
  saveDealerModels(dealerCode: string, models: VehicleModel[]): void {
    const code = dealerCode.toUpperCase().trim();
    const storageKey = `${PRICING_STORAGE_PREFIX}${code}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(models));
    } catch (e) {
      console.error(`Error saving pricing for dealer ${code}:`, e);
    }
  },

  /**
   * Update a model's buying and selling price for a specific dealer.
   */
  updateDealerModelPrice(
    dealerCode: string,
    modelId: string,
    newBuyingPrice: number,
    newSellingPrice: number,
    startDate?: string,
    endDate?: string,
    updatedBy?: string
  ): VehicleModel[] {
    const code = dealerCode.toUpperCase().trim();
    const currentModels = this.getDealerModels(code);
    const today = new Date().toISOString().split('T')[0];

    const updated = currentModels.map((m) => {
      if (m.id === modelId) {
        const effectiveStart = startDate || m.startDate || '2026-01-01';
        const effectiveEnd = endDate || m.endDate || '2026-12-31';

        const existingHistory = m.priceHistory || [
          {
            id: `ph-init-${m.id}`,
            buyingPrice: m.buyingPrice,
            startDate: m.startDate || '2025-01-01',
            endDate: m.endDate || '2025-12-31',
            updatedAt: m.lastUpdated || '2025-01-01',
            updatedBy: 'Mfumo',
            status: 'EXPIRED' as const,
            notes: 'Bei ya awali',
          },
        ];

        const newEntry: PriceHistoryEntry = {
          id: `ph-${Date.now()}`,
          buyingPrice: newBuyingPrice,
          startDate: effectiveStart,
          endDate: effectiveEnd,
          updatedAt: today,
          updatedBy: updatedBy || 'Msimamizi',
          status: 'ACTIVE',
          notes: 'Marekebisho ya bei ya Dealer',
        };

        const updatedHistory: PriceHistoryEntry[] = [
          ...existingHistory.map((h) => ({
            ...h,
            status: (h.endDate < effectiveStart ? 'EXPIRED' : 'EXPIRED') as 'ACTIVE' | 'EXPIRED' | 'UPCOMING',
          })),
          newEntry,
        ];

        return {
          ...m,
          buyingPrice: newBuyingPrice,
          defaultPrice: newSellingPrice || m.defaultPrice,
          startDate: effectiveStart,
          endDate: effectiveEnd,
          lastUpdated: today,
          priceHistory: updatedHistory,
        };
      }
      return m;
    });

    this.saveDealerModels(code, updated);
    return updated;
  },

  /**
   * Create baseline catalog for a dealer.
   */
  createBaselineCatalog(dealerCode: string): VehicleModel[] {
    return vehicleModelCatalog.map((m) => ({
      ...m,
      name: m.name.replace(/^(TVS|Bajaj|Honda)\s+/i, ''),
      inStockCount: 0,
      priceHistory: m.priceHistory ? [...m.priceHistory] : undefined,
    }));
  },
};

