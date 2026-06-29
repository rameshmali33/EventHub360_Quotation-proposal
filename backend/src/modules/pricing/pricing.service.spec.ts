import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('1. should calculate normal calculation correctly', () => {
    const result = service.calculateQuotePricing({
      lines: [
        { qty: 2, rate: 100, cost: 50, taxPercent: 10 },
      ],
    });

    // subtotal = 200
    // cost_total = 100
    // tax_total = 20 (10% of 200)
    // total = 200 + 20 = 220
    // margin = 200 - 100 = 100
    // margin_percent = 100 / 200 = 50%

    expect(result.subtotal).toBe(200);
    expect(result.totalCost).toBe(100);
    expect(result.totalTax).toBe(20);
    expect(result.grandTotal).toBe(220);
    expect(result.margin).toBe(100);
    expect(result.marginPercent).toBe(50);
  });

  it('2. should calculate line discount correctly', () => {
    const result = service.calculateQuotePricing({
      lines: [
        { qty: 1, rate: 1000, cost: 500, taxPercent: 5, lineDiscountPercent: 10 },
      ],
    });

    // baseAmount = 1000
    // netAmount = 900
    // taxAmount = 45 (5% of 900)
    // subtotal = 900
    // cost_total = 500
    // total = 945
    // margin = 900 - 500 = 400
    // margin_percent = 400 / 900 = 44.44...

    expect(result.subtotal).toBe(900);
    expect(result.totalCost).toBe(500);
    expect(result.totalTax).toBe(45);
    expect(result.grandTotal).toBe(945);
    expect(result.margin).toBe(400);
    expect(result.marginPercent).toBeCloseTo(44.44, 2);
  });

  it('3. should calculate global discount + service charge correctly', () => {
    const result = service.calculateQuotePricing({
      lines: [
        { qty: 2, rate: 500, cost: 200, taxPercent: 10 }, // 1000 net, 400 cost, 100 tax
      ],
      globalDiscountAmount: 100,
      serviceChargeAmount: 50,
    });

    // subtotal = 1000
    // cost_total = 400
    // tax_total = 100
    // grandTotal = 1000 - 100 + 100 + 50 = 1050
    // margin = 1000 - 400 = 600
    // margin_percent = 600 / 1000 = 60%

    expect(result.subtotal).toBe(1000);
    expect(result.totalTax).toBe(100);
    expect(result.grandTotal).toBe(1050);
    expect(result.totalCost).toBe(400);
    expect(result.margin).toBe(600);
    expect(result.marginPercent).toBe(60);
  });

  it('4. should handle zero subtotal gracefully', () => {
    const result = service.calculateQuotePricing({
      lines: [
        { qty: 0, rate: 100, cost: 50, taxPercent: 10 },
      ],
    });

    expect(result.subtotal).toBe(0);
    expect(result.marginPercent).toBe(0); // Should not be NaN or Infinity
    expect(result.grandTotal).toBe(0);
  });

  it('5. should handle low margin or negative margin case', () => {
    const result = service.calculateQuotePricing({
      lines: [
        { qty: 1, rate: 100, cost: 120, taxPercent: 0 },
      ],
    });

    // subtotal = 100
    // cost_total = 120
    // margin = -20
    // margin_percent = -20%

    expect(result.subtotal).toBe(100);
    expect(result.totalCost).toBe(120);
    expect(result.margin).toBe(-20);
    expect(result.marginPercent).toBe(-20);
  });
});
