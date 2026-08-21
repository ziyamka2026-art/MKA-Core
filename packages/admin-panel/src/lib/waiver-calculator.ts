/**
 * Pure Tax Waiver calculator — port of Apps Script step5_Calculate.
 * Output is a SYSTEM SUGGESTION; human review required.
 */

import { CIRCULAR_CONFIG, WAIVER_VERSION } from "./waiver-config";

export type PenaltyRow = {
  type: string;
  amount: number;
  waivable: boolean;
};

export type WaiverInput = {
  year: number;
  appealStages: number;
  reduceDebt30: boolean;
  afterExecutiveOneMonth: boolean;
  payType: "پرداخت نقدی" | "ترتیب پرداخت";
  art190_80: boolean;
  art190_40: boolean;
  isProductionUnit: boolean;
  specialOk: boolean;
  payDate: string; // e.g. 1405/05/28
  penalties: PenaltyRow[];
};

export type WaiverResult = {
  ruleVersion: string;
  circularId: string;
  baseAfterDeductions: number;
  art190Rate: number;
  specialAdd: number;
  finalPct: number;
  waivableSum: number;
  nonWaivableSum: number;
  waivedAmount: number;
  remaining: number;
  humanReviewRequired: true;
  disclaimer: string;
};

function baseRateForYear(year: number): number {
  const circ = CIRCULAR_CONFIG.circulars[CIRCULAR_CONFIG.activeCircularId];
  if (year >= 1403) return circ.baseRates["1403+"];
  if (year === 1402) return circ.baseRates["1402"];
  if (year === 1401) return circ.baseRates["1401"];
  if (year === 1400) return circ.baseRates["1400"];
  return circ.baseRates["1399-"];
}

export function calculateWaiver(input: WaiverInput): WaiverResult {
  const circ = CIRCULAR_CONFIG.circulars[CIRCULAR_CONFIG.activeCircularId];
  const base = baseRateForYear(input.year);

  const dedAppeal = input.reduceDebt30
    ? 0
    : input.appealStages * circ.deductions.perAppealStage;
  const dedExec = input.afterExecutiveOneMonth
    ? circ.deductions.afterExecutiveOneMonth
    : 0;
  const floor =
    input.payType === "پرداخت نقدی" ? circ.floors.cash : circ.floors.installment;
  const afterDed = Math.max(floor, base - dedAppeal - dedExec);

  const art190Rate = input.art190_80
    ? CIRCULAR_CONFIG.art190.exemptionAcceptOrAgreement
    : input.art190_40
      ? CIRCULAR_CONFIG.art190.exemptionWithinOneMonthFinal
      : 0;
  const afterArt = Math.max(afterDed, art190Rate);

  let specialAdd = 0;
  if (input.isProductionUnit && input.specialOk && input.payDate) {
    for (const si of CIRCULAR_CONFIG.specialIncreases) {
      for (const b of si.bands) {
        if (input.payDate >= b.from && input.payDate <= b.to) {
          specialAdd = Math.max(specialAdd, b.rate);
        }
      }
    }
  }

  const finalPct = Math.min(1, afterArt + specialAdd);

  let waivableSum = 0;
  let nonWaivableSum = 0;
  for (const p of input.penalties) {
    const amt = Math.max(0, Number(p.amount) || 0);
    if (p.waivable) waivableSum += amt;
    else nonWaivableSum += amt;
  }

  const waivedAmount = Math.round(waivableSum * finalPct);
  const remaining = waivableSum + nonWaivableSum - waivedAmount;

  return {
    ruleVersion: WAIVER_VERSION,
    circularId: circ.id,
    baseAfterDeductions: afterDed,
    art190Rate,
    specialAdd,
    finalPct,
    waivableSum,
    nonWaivableSum,
    waivedAmount,
    remaining,
    humanReviewRequired: true,
    disclaimer:
      "خروجی سیستمی برای بررسی انسان است و جایگزین رأی سازمان امور مالیاتی یا مشاور رسمی نیست. HUMAN_REVIEW_REQUIRED",
  };
}

/** Fixed scenarios for smoke tests */
export function runWaiverSmokeTests(): { name: string; ok: boolean; detail: string }[] {
  const emptyPenalties: PenaltyRow[] = [
    { type: "جریمه تأخیر ماده ۱۹۰", amount: 10_000_000, waivable: true },
  ];

  const r1 = calculateWaiver({
    year: 1403,
    appealStages: 0,
    reduceDebt30: false,
    afterExecutiveOneMonth: false,
    payType: "پرداخت نقدی",
    art190_80: false,
    art190_40: false,
    isProductionUnit: false,
    specialOk: true,
    payDate: "",
    penalties: emptyPenalties,
  });
  const t1 = Math.abs(r1.finalPct - 1.0) < 1e-9;

  const r2 = calculateWaiver({
    year: 1403,
    appealStages: 2,
    reduceDebt30: false,
    afterExecutiveOneMonth: false,
    payType: "پرداخت نقدی",
    art190_80: false,
    art190_40: false,
    isProductionUnit: false,
    specialOk: true,
    payDate: "",
    penalties: emptyPenalties,
  });
  // base 100% - 10% = 90%, floor 30% → 90%
  const t2 = Math.abs(r2.finalPct - 0.9) < 1e-9;

  const r3 = calculateWaiver({
    year: 1402,
    appealStages: 0,
    reduceDebt30: false,
    afterExecutiveOneMonth: false,
    payType: "پرداخت نقدی",
    art190_80: true,
    art190_40: false,
    isProductionUnit: false,
    specialOk: true,
    payDate: "",
    penalties: emptyPenalties,
  });
  // max(0.95, 0.80) = 0.95
  const t3 = Math.abs(r3.finalPct - 0.95) < 1e-9;

  return [
    { name: "1403 نقدی بدون دادرسی → 100%", ok: t1, detail: String(r1.finalPct) },
    { name: "1403 با ۲ مرحله دادرسی → 90%", ok: t2, detail: String(r2.finalPct) },
    { name: "1402 + ماده190 هشتاد٪ → 95%", ok: t3, detail: String(r3.finalPct) },
  ];
}
