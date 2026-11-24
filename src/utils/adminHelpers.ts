import { COUNTRY_OPTIONS } from './vacancies';
import type {
  CountryCode,
  LeadOrApplication,
  LeadType,
  Vacancy,
  VacancyInput,
} from '../types/migrant';

export interface VacancyTemplate {
  id: string;
  label: string;
  data: VacancyInput;
}

export const VACANCY_TEMPLATES: VacancyTemplate[] = [
  {
    id: 'tpl-plumber-de',
    label: 'Сантехник · Германия',
    data: {
      title: 'Сантехник / Монтажник ОВК',
      country: 'Германия',
      countryCode: 'DE',
      profession: 'Сантехника и монтаж',
      salaryText: '15–17 €/час нетто',
      salaryMonthlyText: 'от 2 800 € / мес.',
      schedule: 'График: 8–10 ч/день, Пн–Пт',
      housing: 'Проживание: предоставляется',
      contractType: 'Официальное оформление (Arbeitsvertrag)',
      description:
        'Монтаж систем отопления, водоснабжения и вентиляции на жилых и коммерческих объектах в Германии. Инструмент, спецодежда, жильё рядом с объектом и поддержка куратора.',
      iconType: 'plumbing',
      active: true,
    },
  },
  {
    id: 'tpl-warehouse-pl',
    label: 'Склад · Польша',
    data: {
      title: 'Работник склада (сканер)',
      country: 'Польша',
      countryCode: 'PL',
      profession: 'Склад и логистика',
      salaryText: '26–30 zł/час нетто',
      salaryMonthlyText: 'от 1 400 € / мес.',
      schedule: 'График: 8–12 ч/день, смены',
      housing: 'Проживание: предоставляется',
      contractType: 'Официальное оформление (Umowa zlecenie)',
      description:
        'Сбор и упаковка заказов со сканером на современном логистическом складе в Польше. Без требования к знанию языка, обучение с первого дня, жильё и доезд до работы.',
      iconType: 'warehouse',
      active: true,
    },
  },
  {
    id: 'tpl-factory-cz',
    label: 'Оператор завода · Чехия',
    data: {
      title: 'Оператор производственной линии',
      country: 'Чехия',
      countryCode: 'CZ',
      profession: 'Производство',
      salaryText: '165–185 Kč/час нетто',
      salaryMonthlyText: 'от 1 550 € / мес.',
      schedule: 'График: 8–12 ч/день',
      housing: 'Проживание: предоставляется',
      contractType: 'Официальное оформление (HPP)',
      description:
        'Контроль работы автоматизированной линии и сборка узлов на современном заводе в Чехии. Официальный трудовой договор, медицинская страховка, бесплатное обучение и куратор.',
      iconType: 'manufacturing',
      active: true,
    },
  },
  {
    id: 'tpl-painter-de',
    label: 'Маляр-отделочник · Германия',
    data: {
      title: 'Маляр-отделочник',
      country: 'Германия',
      countryCode: 'DE',
      profession: 'Отделочные работы',
      salaryText: '14–16 €/час нетто',
      salaryMonthlyText: 'от 2 600 € / мес.',
      schedule: 'График: 8–10 ч/день',
      housing: 'Проживание: предоставляется',
      contractType: 'Официальное оформление',
      description:
        'Внутренняя отделка помещений, шпаклёвка и покраска на объектах в Германии. Выплаты 2 раза в месяц на банковскую карту, рабочая форма и помощь с заселением.',
      iconType: 'painting',
      active: true,
    },
  },
  {
    id: 'tpl-logistics-nl',
    label: 'Погрузчик · Нидерланды',
    data: {
      title: 'Водитель погрузчика / Логистика',
      country: 'Нидерланды',
      countryCode: 'NL',
      profession: 'Склад и логистика',
      salaryText: '14,5–16 €/час нетто',
      salaryMonthlyText: 'от 2 450 € / мес.',
      schedule: 'График: 8–10 ч/день, Пн–Пт',
      housing: 'Проживание: предоставляется',
      contractType: 'Официальное оформление (ABU)',
      description:
        'Перемещение паллет и погрузка товаров на распределительном центре в Нидерландах. Еженедельные выплаты, страховка, организованное жильё и транспорт до склада.',
      iconType: 'logistics',
      active: true,
    },
  },
];

export const QUICK_SCHEDULE_CHIPS = [
  'График: 8–10 ч/день',
  'График: 8–12 ч/день',
  'График: 5/2, 8 ч/день',
];

export const QUICK_HOUSING_CHIPS = [
  'Проживание: предоставляется',
  'Проживание: бесплатное',
  'Проживание: помощь с арендой',
];

export const QUICK_CONTRACT_CHIPS = [
  'Официальное оформление',
  'Официальный контракт (Arbeitsvertrag)',
  'Umowa o pracę / Zlecenie',
];

/** Clamps and trims all VacancyInput fields to match firebase-blueprint.json limits */
export function sanitizeVacancyInput(input: VacancyInput): VacancyInput {
  const country = input.country.trim().slice(0, 60);
  const matchedCountry = COUNTRY_OPTIONS.find((c) => c.country === country);
  const countryCode: CountryCode = matchedCountry?.code ?? input.countryCode ?? 'EU';

  return {
    title: input.title.trim().slice(0, 120),
    country,
    countryCode,
    profession: input.profession.trim().slice(0, 80),
    salaryText: input.salaryText.trim().slice(0, 60),
    salaryMonthlyText: input.salaryMonthlyText.trim().slice(0, 60),
    schedule: input.schedule.trim().slice(0, 80),
    housing: input.housing.trim().slice(0, 80),
    contractType: input.contractType.trim().slice(0, 80),
    description: input.description.trim().slice(0, 1500),
    iconType: input.iconType,
    active: Boolean(input.active),
  };
}

export type AdminVacancyStatusFilter = 'all' | 'active' | 'hidden';

export function filterAdminVacancies(
  vacancies: Vacancy[],
  criteria: {
    search: string;
    country: string;
    status: AdminVacancyStatusFilter;
  }
): Vacancy[] {
  const q = criteria.search.trim().toLowerCase();
  return vacancies.filter((v) => {
    if (criteria.status === 'active' && !v.active) return false;
    if (criteria.status === 'hidden' && v.active) return false;
    if (criteria.country !== 'all' && v.country !== criteria.country) return false;
    if (q) {
      const hay = `${v.title} ${v.country} ${v.profession} ${v.salaryMonthlyText}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterAdminLeads(
  leads: LeadOrApplication[],
  criteria: {
    search: string;
    status: string;
    type: 'all' | LeadType;
  }
): LeadOrApplication[] {
  const q = criteria.search.trim().toLowerCase();
  return leads.filter((item) => {
    if (criteria.status !== 'all' && item.status !== criteria.status) return false;
    if (criteria.type !== 'all' && item.type !== criteria.type) return false;
    if (q) {
      const hay = `${item.fullName} ${item.phone} ${item.email || ''} ${item.companyName || ''} ${item.vacancyTitle || ''} ${item.comment || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function buildTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
}

export function buildWhatsAppHref(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return '';
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${query}`;
}

function escapeCsvCell(value: string): string {
  const safe = value.replace(/\r?\n/g, ' ');
  if (/[",;]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

/** Builds an Excel-friendly UTF-8 BOM CSV export for admin leads */
export function buildLeadsCsv(leads: LeadOrApplication[]): string {
  const headers = [
    'Дата',
    'Тип',
    'Статус',
    'Имя / Контакт',
    'Телефон',
    'Email',
    'Страна',
    'Компания',
    'Сотрудников',
    'Вакансия',
    'Комментарий',
    'Заметка менеджера',
  ];

  const typeMap: Record<LeadType, string> = {
    job_application: 'Отклик на вакансию',
    b2b_request: 'B2B-заявка',
    consultation: 'Консультация',
  };

  const statusMap: Record<string, string> = {
    new: 'Новая',
    in_progress: 'В работе',
    approved: 'Одобрена',
    rejected: 'Отклонена',
  };

  const rows = leads.map((item) => [
    new Date(item.createdAtMs).toISOString().slice(0, 16).replace('T', ' '),
    typeMap[item.type] || item.type,
    statusMap[item.status] || item.status,
    item.fullName || '',
    item.phone || '',
    item.email || '',
    item.country || '',
    item.companyName || '',
    item.staffCount || '',
    item.vacancyTitle || '',
    item.comment || '',
    item.adminNote || '',
  ]);

  const csvBody = [headers, ...rows]
    .map((cols) => cols.map((c) => escapeCsvCell(String(c))).join(','))
    .join('\n');

  return `\uFEFF${csvBody}`;
}
