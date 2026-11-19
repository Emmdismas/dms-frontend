import { VehicleModel } from '../types';

/**
 * Product master data (vehicle model catalog + default prices).
 * This is reference data, not business data: no stock, sales, customers or transfers live here.
 */
export const vehicleModelCatalog: VehicleModel[] = [
  {
    id: 'mod-1',
    name: 'HLX 125',
    type: '2W',
    brand: 'TVS',
    buyingPrice: 2850000,
    defaultPrice: 3450000,
    engineCapacity: '125cc',
    inStockCount: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lastUpdated: '2026-09-20',
    priceHistory: [
      {
        id: 'ph-1-1',
        buyingPrice: 2650000,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Bei ya kiwanda awamu ya kwanza 2025'
      },
      {
        id: 'ph-1-2',
        buyingPrice: 2750000,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Marekebisho ya bei kutokana na kodi ya forodha'
      },
      {
        id: 'ph-1-3',
        buyingPrice: 2850000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        updatedAt: '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: 'Bei halisi inayotumika kiwandani sasa'
      },
    ]
  },
  {
    id: 'mod-2',
    name: 'Boxer BM150',
    type: '2W',
    brand: 'Bajaj',
    buyingPrice: 2950000,
    defaultPrice: 3550000,
    engineCapacity: '150cc',
    inStockCount: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lastUpdated: '2026-09-20',
    priceHistory: [
      {
        id: 'ph-2-1',
        buyingPrice: 2750000,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Bei ya msambazaji mkuu'
      },
      {
        id: 'ph-2-2',
        buyingPrice: 2850000,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Ongezeko la gharama za usafirishaji'
      },
      {
        id: 'ph-2-3',
        buyingPrice: 2950000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        updatedAt: '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: 'Bei inayotumika mwaka 2026'
      },
    ]
  },
  {
    id: 'mod-3',
    name: 'Star City+ 110',
    type: '2W',
    brand: 'TVS',
    buyingPrice: 3050000,
    defaultPrice: 3650000,
    engineCapacity: '110cc',
    inStockCount: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lastUpdated: '2026-09-18',
    priceHistory: [
      {
        id: 'ph-3-1',
        buyingPrice: 2850000,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Mkataba wa awamu ya kwanza'
      },
      {
        id: 'ph-3-2',
        buyingPrice: 2950000,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Marekebisho ya nusu mwaka'
      },
      {
        id: 'ph-3-3',
        buyingPrice: 3050000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        updatedAt: '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: 'Mkataba wa bei mwaka 2026'
      },
    ]
  },
  {
    id: 'mod-4',
    name: 'Apache RTR 160',
    type: '2W',
    brand: 'TVS',
    buyingPrice: 4050000,
    defaultPrice: 4850000,
    engineCapacity: '160cc 4V',
    inStockCount: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lastUpdated: '2026-09-15',
    priceHistory: [
      {
        id: 'ph-4-1',
        buyingPrice: 3800000,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Bei ya uzinduzi'
      },
      {
        id: 'ph-4-2',
        buyingPrice: 3950000,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Marekebisho ya bei kiwandani'
      },
      {
        id: 'ph-4-3',
        buyingPrice: 4050000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        updatedAt: '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: 'Bei ya sasa 2026'
      },
    ]
  },
  {
    id: 'mod-5',
    name: 'King Deluxe',
    type: '3W',
    brand: 'TVS',
    buyingPrice: 8700000,
    defaultPrice: 10200000,
    engineCapacity: '200cc 4S EFI',
    inStockCount: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lastUpdated: '2026-09-21',
    priceHistory: [
      {
        id: 'ph-5-1',
        buyingPrice: 8200000,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Bei ya mkataba 2025 H1'
      },
      {
        id: 'ph-5-2',
        buyingPrice: 8450000,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Kodi ya uagizaji nje (Import Tariff)'
      },
      {
        id: 'ph-5-3',
        buyingPrice: 8700000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        updatedAt: '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: 'Bei ya kiwanda inayotumika 2026'
      },
    ]
  },
  {
    id: 'mod-6',
    name: 'Maxima Z',
    type: '3W',
    brand: 'Bajaj',
    buyingPrice: 9100000,
    defaultPrice: 10800000,
    engineCapacity: '236cc',
    inStockCount: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lastUpdated: '2026-09-19',
    priceHistory: [
      {
        id: 'ph-6-1',
        buyingPrice: 8600000,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        updatedAt: '2025-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Bei ya awali'
      },
      {
        id: 'ph-6-2',
        buyingPrice: 8850000,
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        updatedAt: '2025-07-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'EXPIRED',
        notes: 'Marekebisho ya gharama ya kontena'
      },
      {
        id: 'ph-6-3',
        buyingPrice: 9100000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        updatedAt: '2026-01-01',
        updatedBy: 'Nassor Salum Abdallah',
        status: 'ACTIVE',
        notes: 'Bei ya kiwanda 2026'
      },
    ]
  },
];


