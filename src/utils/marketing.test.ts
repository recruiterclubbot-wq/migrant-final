import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateB2BStaffingPlan,
  calculateEstimatedIncome,
  formatCommentWithChannel,
} from './marketing';

test('calculateEstimatedIncome scales with hours, country, and employer housing', () => {
  const deWithHousing = calculateEstimatedIncome({
    countryCode: 'DE',
    profession: 'construction',
    weeklyHours: 48,
    employerHousing: true,
  });
  const deWithoutHousing = calculateEstimatedIncome({
    countryCode: 'DE',
    profession: 'construction',
    weeklyHours: 48,
    employerHousing: false,
  });
  const plWarehouse = calculateEstimatedIncome({
    countryCode: 'PL',
    profession: 'warehouse',
    weeklyHours: 45,
    employerHousing: true,
  });

  assert.equal(deWithHousing.countryName, 'Германия');
  assert.equal(deWithHousing.housingSavingEur, 340);
  assert.equal(deWithHousing.monthlyNetEur - deWithoutHousing.monthlyNetEur, 340);
  assert.equal(deWithHousing.threeMonthNetEur, deWithHousing.monthlyNetEur * 3);
  assert.ok(deWithHousing.monthlyNetEur > plWarehouse.monthlyNetEur);
  assert.ok(deWithHousing.formattedSummary.includes('Германия'));
});

test('calculateB2BStaffingPlan returns realistic timelines and matching staff tier', () => {
  const smallPl = calculateB2BStaffingPlan({
    industry: 'warehouse',
    countryCode: 'PL',
    teamTier: 'small',
  });
  const largeDe = calculateB2BStaffingPlan({
    industry: 'construction',
    countryCode: 'DE',
    teamTier: 'large',
  });

  assert.equal(smallPl.firstShortlistHours, 24);
  assert.equal(smallPl.replacementGuaranteeDays, 30);
  assert.equal(smallPl.staffCountOption, '1–5 человек');
  assert.equal(largeDe.staffCountOption, '15–50 человек');
  assert.ok(largeDe.deploymentDaysMin > smallPl.deploymentDaysMin);
  assert.ok(largeDe.legalPackage.includes('A1'));
});

test('formatCommentWithChannel prefixes channel without duplicating existing prefix', () => {
  assert.equal(formatCommentWithChannel('Telegram', ''), '[Связь: Telegram]');
  assert.equal(
    formatCommentWithChannel('WhatsApp', 'Нужна работа в Берлине'),
    '[Связь: WhatsApp] Нужна работа в Берлине'
  );
  assert.equal(
    formatCommentWithChannel('Viber', '[Связь: Telegram] Уже указано'),
    '[Связь: Telegram] Уже указано'
  );
});
