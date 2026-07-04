import { Injectable } from '@nestjs/common';

export interface PricingLineInput {
  qty: number;
  rate: number;
  cost: number;
  taxPercent: number;
  lineDiscountPercent?: number;
}

export interface PricingLineResult {
  baseAmount: number;
  discountAmount: number;
  netAmount: number; // baseAmount - discountAmount
  taxAmount: number;
  totalAmount: number; // netAmount + taxAmount
  totalCost: number;
}

export interface QuotePricingInput {
  lines: PricingLineInput[];
  globalDiscountAmount?: number;
  serviceChargeAmount?: number;
}

export interface QuotePricingResult {
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  totalCost: number;
  margin: number;
  marginPercent: number;
  lines: PricingLineResult[];
}

@Injectable()
export class PricingService {
  calculateQuotePricing(input: QuotePricingInput): QuotePricingResult {
    let subtotal = 0;
    let totalTax = 0;
    let totalCost = 0;

    const lineResults: PricingLineResult[] = input.lines.map((line) => {
      const lineDiscountPercent = line.lineDiscountPercent || 0;

      const baseAmount = line.qty * line.rate;
      const discountAmount = baseAmount * (lineDiscountPercent / 100);
      const netAmount = baseAmount - discountAmount;
      const taxAmount = netAmount * (line.taxPercent / 100);
      const totalAmount = netAmount + taxAmount;
      const itemTotalCost = line.qty * line.cost;

      subtotal += netAmount;
      totalTax += taxAmount;
      totalCost += itemTotalCost;

      return {
        baseAmount,
        discountAmount,
        netAmount,
        taxAmount,
        totalAmount,
        totalCost: itemTotalCost,
      };
    });

    const globalDiscountAmount = input.globalDiscountAmount || 0;
    const serviceChargeAmount = input.serviceChargeAmount || 0;

    const grandTotal =
      subtotal - globalDiscountAmount + totalTax + serviceChargeAmount;
    const margin = subtotal - totalCost;

    let marginPercent = 0;
    if (subtotal > 0) {
      marginPercent = (margin / subtotal) * 100;
    }

    return {
      subtotal,
      totalTax,
      grandTotal,
      totalCost,
      margin,
      marginPercent,
      lines: lineResults,
    };
  }
}
