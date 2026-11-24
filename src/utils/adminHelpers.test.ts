import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VACANCY_TEMPLATES,
  buildLeadsCsv,
  buildTelHref,
  buildWhatsAppHref,
  filterAdminLeads,
  filterAdminVacancies,
  sanitizeVacancyInput,
} from './adminHelpers';
import { DEFAULT_SEED_VACANCIES, validateVacancyInput } from './vacancies';
import type { LeadOrApplication } from '../types/migrant';

test('all VACANCY_TEMPLATES satisfy blueprint validation rules cleanly', () => {
  assert.ok(VACANCY_TEMPLATES.length >= 4);
  for (const tpl of VACANCY_TEMPLATES) {
    const sanitized = sanitizeVacancyInput(tpl.data);
    const result = validateVacancyInput(sanitized);
    assert.equal(
      result.valid,
      true,
      `Template ${tpl.id} failed validation: ${JSON.stringify(result.errors)}`
    );
  }
});

test('sanitizeVacancyInput trims strings, clamps blueprint bounds, and syncs countryCode', () => {
  const sanitized = sanitizeVacancyInput({
    title: '  Электрик промышленный  ',
    country: 'Польша',
    countryCode: 'DE',
    profession: '  Строительство  ',
    salaryText: ' 30 zł/час нетто ',
    salaryMonthlyText: ' от 1 600 € / мес. ',
    schedule: ' График: 8–10 ч/день ',
    housing: ' Проживание: предоставляется ',
    contractType: ' Официальное оформление ',
    description: `  ${'A'.repeat(1600)}  `,
    iconType: 'construction',
    active: true,
  });

  assert.equal(sanitized.title, 'Электрик промышленный');
  assert.equal(sanitized.countryCode, 'PL');
  assert.equal(sanitized.description.length, 1500);
});

test('filterAdminVacancies filters by status, country, and search', () => {
  const list = DEFAULT_SEED_VACANCIES.map((v, idx) =>
    idx === 0 ? { ...v, active: false } : v
  );

  const hiddenOnly = filterAdminVacancies(list, {
    search: '',
    country: 'all',
    status: 'hidden',
  });
  assert.equal(hiddenOnly.length, 1);
  assert.equal(hiddenOnly[0].id, list[0].id);

  const deActive = filterAdminVacancies(list, {
    search: '',
    country: 'Германия',
    status: 'active',
  });
  assert.equal(deActive.length, 1);
  assert.equal(deActive[0].title, 'Маляр-отделочник');
});

test('buildTelHref, buildWhatsAppHref, filterAdminLeads, and buildLeadsCsv work reliably', () => {
  assert.equal(buildTelHref('+48 (22) 123-45-67'), 'tel:+48221234567');
  assert.equal(
    buildWhatsAppHref('+48 22 123-45-67', 'Здравствуйте'),
    'https://wa.me/48221234567?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5'
  );
  assert.equal(buildWhatsAppHref('123'), '');

  const leads: LeadOrApplication[] = [
    {
      id: 'l1',
      sourceCollection: 'leads',
      type: 'b2b_request',
      fullName: 'ООО "Строй, Плюс"',
      phone: '+49 30 999 00 11',
      country: 'Германия',
      companyName: 'СтройПлюс',
      staffCount: '15–50 человек',
      comment: 'Нужны маляры\nсрочно',
      status: 'new',
      adminNote: 'Перезвонить в 14:00',
      createdAtMs: Date.UTC(2026, 10, 23, 10, 30),
    },
    {
      id: 'l2',
      sourceCollection: 'applications',
      type: 'job_application',
      fullName: 'Иван Петров',
      phone: '+380 67 111 22 33',
      country: 'Польша',
      vacancyTitle: 'Работник склада',
      status: 'approved',
      createdAtMs: Date.UTC(2026, 10, 23, 11, 0),
    },
  ];

  const b2bOnly = filterAdminLeads(leads, { search: 'маляры', status: 'new', type: 'b2b_request' });
  assert.equal(b2bOnly.length, 1);
  assert.equal(b2bOnly[0].id, 'l1');

  const csv = buildLeadsCsv(leads);
  assert.ok(csv.startsWith('\uFEFFДата,Тип,Статус'));
  assert.ok(csv.includes('"ООО ""Строй, Плюс"""'));
  assert.ok(csv.includes('Нужны маляры срочно'));
});
