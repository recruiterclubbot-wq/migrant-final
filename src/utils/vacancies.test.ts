import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDashboardAnalytics,
  DEFAULT_SEED_VACANCIES,
  filterVacancies,
  formatNotificationMessage,
  validateLeadForm,
  validateVacancyInput,
} from './vacancies';
import { buildJobPostingsJsonLd } from './seo';
import type { LeadOrApplication, UserProfile } from '../types/migrant';

test('filterVacancies filters by country, profession, search, and active flag', () => {
  const listWithInactive = [
    ...DEFAULT_SEED_VACANCIES,
    {
      ...DEFAULT_SEED_VACANCIES[0],
      id: 'inactive-1',
      title: 'Скрытая вакансия',
      active: false,
    },
  ];

  const publicAll = filterVacancies(listWithInactive, {});
  assert.equal(publicAll.length, DEFAULT_SEED_VACANCIES.length);

  const germanyOnly = filterVacancies(listWithInactive, { country: 'Германия' });
  assert.equal(germanyOnly.length, 2);
  assert.ok(germanyOnly.every((v) => v.country === 'Германия'));

  const searchPlumber = filterVacancies(listWithInactive, { search: 'Сантехник' });
  assert.equal(searchPlumber.length, 1);
  assert.equal(searchPlumber[0].id, 'seed-plumber-de');

  const adminAll = filterVacancies(listWithInactive, { includeInactive: true });
  assert.equal(adminAll.length, DEFAULT_SEED_VACANCIES.length + 1);
});

test('validateLeadForm rejects empty or invalid inputs and accepts valid job/B2B submissions', () => {
  const emptyJob = validateLeadForm({
    type: 'job_application',
    fullName: '',
    phone: '123',
  });
  assert.equal(emptyJob.valid, false);
  assert.ok(emptyJob.errors.fullName);
  assert.ok(emptyJob.errors.phone);

  const validJob = validateLeadForm({
    type: 'job_application',
    fullName: 'Андрей Коваленко',
    phone: '+380 67 123 45 67',
    country: 'Германия',
  });
  assert.equal(validJob.valid, true);

  const invalidB2b = validateLeadForm({
    type: 'b2b_request',
    companyName: '',
    fullName: 'Иван',
    phone: '+79991112233',
    staffCount: '',
  });
  assert.equal(invalidB2b.valid, false);
  assert.ok(invalidB2b.errors.companyName);
  assert.ok(invalidB2b.errors.staffCount);

  const validB2b = validateLeadForm({
    type: 'b2b_request',
    companyName: 'ООО «СтройАльянс»',
    fullName: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
    staffCount: '10–25 человек',
  });
  assert.equal(validB2b.valid, true);
});

test('validateVacancyInput enforces field constraints matching blueprint', () => {
  const invalid = validateVacancyInput({
    title: 'A',
    country: '',
    countryCode: 'DE',
    profession: '',
    salaryText: '',
    salaryMonthlyText: '',
    schedule: '',
    housing: '',
    contractType: '',
    description: 'short',
    iconType: 'plumbing',
    active: true,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.description);

  const valid = validateVacancyInput({
    title: 'Электрик на стройку',
    country: 'Германия',
    countryCode: 'DE',
    profession: 'Строительство',
    salaryText: '15–18 €/час нетто',
    salaryMonthlyText: 'от 2 800 € / мес.',
    schedule: 'График: 8–10 ч/день',
    housing: 'Проживание: предоставляется',
    contractType: 'Официальное оформление',
    description: 'Монтаж электропроводки на коммерческих объектах в Берлине и Мюнхене.',
    iconType: 'construction',
    active: true,
  });
  assert.equal(valid.valid, true);
});

test('computeDashboardAnalytics aggregates vacancies, leads by status/type, and users', () => {
  const leads: LeadOrApplication[] = [
    {
      id: 'l1',
      sourceCollection: 'leads',
      type: 'job_application',
      fullName: 'Анна',
      phone: '+380501112233',
      status: 'new',
      createdAtMs: 1000,
    },
    {
      id: 'l2',
      sourceCollection: 'applications',
      userId: 'u1',
      type: 'b2b_request',
      fullName: 'Сергей',
      companyName: 'Логистик Про',
      phone: '+48123456789',
      status: 'approved',
      createdAtMs: 2000,
    },
  ];
  const users: UserProfile[] = [
    {
      uid: 'u1',
      email: 'u1@example.com',
      fullName: 'Сергей',
      accountType: 'employer',
      role: 'employer',
      status: 'active',
    },
    {
      uid: 'u2',
      email: 'u2@example.com',
      fullName: 'Олег',
      accountType: 'candidate',
      role: 'candidate',
      status: 'blocked',
    },
  ];

  const stats = computeDashboardAnalytics(DEFAULT_SEED_VACANCIES, leads, users);
  assert.equal(stats.totalVacancies, 6);
  assert.equal(stats.activeVacancies, 6);
  assert.equal(stats.totalLeads, 2);
  assert.equal(stats.newLeads, 1);
  assert.equal(stats.approvedLeads, 1);
  assert.equal(stats.totalUsers, 2);
  assert.equal(stats.blockedUsers, 1);
  assert.ok(stats.vacanciesByCountry.some((c) => c.country === 'Германия' && c.count === 2));
});

test('formatNotificationMessage & buildJobPostingsJsonLd produce valid structured output', () => {
  const msg = formatNotificationMessage({
    type: 'b2b_request',
    companyName: 'СтройАльянс',
    fullName: 'Иван Петров',
    phone: '+79991234567',
    staffCount: '10-20',
  });
  assert.match(msg.subject, /B2B-заявка/);
  assert.match(msg.text, /СтройАльянс/);

  const ld = JSON.parse(buildJobPostingsJsonLd(DEFAULT_SEED_VACANCIES, 'https://migrant.example.com'));
  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@graph'].length, 6);
  assert.equal(ld['@graph'][0]['@type'], 'JobPosting');
});
