import type {
  CountryCode,
  DashboardAnalytics,
  IconType,
  LeadFormInput,
  LeadOrApplication,
  LeadType,
  UserProfile,
  Vacancy,
  VacancyInput,
} from '../types/migrant';

export const COUNTRY_OPTIONS: Array<{ country: string; code: CountryCode }> = [
  { country: 'Германия', code: 'DE' },
  { country: 'Польша', code: 'PL' },
  { country: 'Чехия', code: 'CZ' },
  { country: 'Украина', code: 'UA' },
  { country: 'Нидерланды', code: 'NL' },
  { country: 'Литва', code: 'LT' },
];

export const PROFESSION_OPTIONS: string[] = [
  'Сантехника и монтаж',
  'Отделочные работы',
  'Склад и логистика',
  'Производство',
  'Управление логистикой',
  'Строительство',
];

export const ICON_TYPE_OPTIONS: Array<{ value: IconType; label: string }> = [
  { value: 'plumbing', label: 'Сантехника' },
  { value: 'painting', label: 'Малярные работы' },
  { value: 'warehouse', label: 'Склад' },
  { value: 'manufacturing', label: 'Производство' },
  { value: 'logistics', label: 'Погрузчик / Логистика' },
  { value: 'support', label: 'Офис / Менеджмент' },
  { value: 'construction', label: 'Строительство' },
];

export const DEFAULT_SEED_VACANCIES: Vacancy[] = [
  {
    id: 'seed-plumber-de',
    title: 'Сантехник',
    country: 'Германия',
    countryCode: 'DE',
    profession: 'Сантехника и монтаж',
    salaryText: '14–16 €/час нетто',
    salaryMonthlyText: 'от 2 600 € / мес.',
    schedule: 'График: 8–10 ч/день',
    housing: 'Проживание: предоставляется',
    contractType: 'Официальное оформление',
    description:
      'Официальное трудоустройство в строительных и монтажных компаниях Германии. Предоставляется жильё, рабочая форма, инструмент и полное сопровождение куратора.',
    iconType: 'plumbing',
    active: true,
    createdBy: 'system',
  },
  {
    id: 'seed-painter-de',
    title: 'Маляр-отделочник',
    country: 'Германия',
    countryCode: 'DE',
    profession: 'Отделочные работы',
    salaryText: '13–15 €/час нетто',
    salaryMonthlyText: 'от 2 500 € / мес.',
    schedule: 'График: 8–10 ч/день',
    housing: 'Проживание: предоставляется',
    contractType: 'Официальное оформление',
    description:
      'Внутренняя и фасадная отделка жилых и коммерческих объектов в Германии. Официальный контракт, проживание рядом с объектом, стабильные выплаты два раза в месяц.',
    iconType: 'painting',
    active: true,
    createdBy: 'system',
  },
  {
    id: 'seed-warehouse-pl',
    title: 'Работник склада',
    country: 'Польша',
    countryCode: 'PL',
    profession: 'Склад и логистика',
    salaryText: '25–29 zł/час нетто',
    salaryMonthlyText: 'от 1 300 € / мес.',
    schedule: 'График: 8–12 ч/день',
    housing: 'Проживание: предоставляется',
    contractType: 'Официальное оформление',
    description:
      'Комплектация заказов и упаковка товаров на современных автоматизированных складах в Польше. Удобный график, бесплатный доезд и комфортное жильё.',
    iconType: 'warehouse',
    active: true,
    createdBy: 'system',
  },
  {
    id: 'seed-operator-cz',
    title: 'Оператор производства',
    country: 'Чехия',
    countryCode: 'CZ',
    profession: 'Производство',
    salaryText: '160 Kč/час нетто',
    salaryMonthlyText: 'от 1 400 € / мес.',
    schedule: 'График: 8–12 ч/день',
    housing: 'Проживание: предоставляется',
    contractType: 'Официальное оформление',
    description:
      'Работа на современном европейском производстве в Чехии. Обучение на месте, медицинская страховка, оформление рабочей карты и поддержка русскоговорящего куратора.',
    iconType: 'manufacturing',
    active: true,
    createdBy: 'system',
  },
  {
    id: 'seed-logistics-ua',
    title: 'Работник склада / логистики',
    country: 'Украина',
    countryCode: 'UA',
    profession: 'Склад и логистика',
    salaryText: '25 000–30 000 грн',
    salaryMonthlyText: 'от 30 000 грн / мес.',
    schedule: 'График: 5/2, 8 ч/день',
    housing: 'Склад в крупных городах',
    contractType: 'Официальное оформление',
    description:
      'Приём, сортировка и отгрузка товаров на распределительных центрах в крупных городах Украины. Официальное оформление, стабильная оплата и удобный график 5/2.',
    iconType: 'logistics',
    active: true,
    createdBy: 'system',
  },
  {
    id: 'seed-manager-ua',
    title: 'Менеджер по логистике',
    country: 'Украина',
    countryCode: 'UA',
    profession: 'Управление логистикой',
    salaryText: '30 000–38 000 грн',
    salaryMonthlyText: 'от 35 000 грн / мес.',
    schedule: 'График: 5/2, 8 ч/день',
    housing: 'Работа в офисе / гибрид',
    contractType: 'Официальное оформление',
    description:
      'Координация международных перевозок, ведение документации и взаимодействие с европейскими партнёрами. Официальное оформление, премии по KPI и гибридный формат.',
    iconType: 'support',
    active: true,
    createdBy: 'system',
  },
];

export interface VacancyFilterCriteria {
  country?: string;
  profession?: string;
  search?: string;
  includeInactive?: boolean;
}

export function filterVacancies(
  vacancies: Vacancy[],
  criteria: VacancyFilterCriteria
): Vacancy[] {
  const countryFilter = (criteria.country ?? '').trim();
  const professionFilter = (criteria.profession ?? '').trim();
  const searchLower = (criteria.search ?? '').trim().toLowerCase();

  return vacancies.filter((item) => {
    if (!criteria.includeInactive && !item.active) {
      return false;
    }
    if (countryFilter && countryFilter !== 'Все страны' && item.country !== countryFilter) {
      return false;
    }
    if (
      professionFilter &&
      professionFilter !== 'Все профессии' &&
      item.profession !== professionFilter
    ) {
      return false;
    }
    if (searchLower) {
      const haystack = `${item.title} ${item.country} ${item.profession} ${item.description}`.toLowerCase();
      if (!haystack.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });
}

export function getUniqueCountries(vacancies: Vacancy[]): string[] {
  const seen = new Set<string>();
  for (const v of vacancies) {
    if (v.country) seen.add(v.country);
  }
  return Array.from(seen);
}

export function getUniqueProfessions(vacancies: Vacancy[]): string[] {
  const seen = new Set<string>();
  for (const v of vacancies) {
    if (v.profession) seen.add(v.profession);
  }
  return Array.from(seen);
}

export function computeDashboardAnalytics(
  vacancies: Vacancy[],
  leads: LeadOrApplication[],
  users: UserProfile[]
): DashboardAnalytics {
  const countryMap = new Map<string, number>();
  let activeVacancies = 0;
  for (const v of vacancies) {
    if (v.active) activeVacancies += 1;
    countryMap.set(v.country, (countryMap.get(v.country) ?? 0) + 1);
  }

  let newLeads = 0;
  let inProgressLeads = 0;
  let approvedLeads = 0;
  let rejectedLeads = 0;

  const typeCounts: Record<LeadType, number> = {
    job_application: 0,
    b2b_request: 0,
    consultation: 0,
  };

  for (const lead of leads) {
    if (lead.status === 'new') newLeads += 1;
    else if (lead.status === 'in_progress') inProgressLeads += 1;
    else if (lead.status === 'approved') approvedLeads += 1;
    else if (lead.status === 'rejected') rejectedLeads += 1;

    typeCounts[lead.type] = (typeCounts[lead.type] ?? 0) + 1;
  }

  const blockedUsers = users.filter((u) => u.status === 'blocked').length;

  return {
    totalVacancies: vacancies.length,
    activeVacancies,
    totalLeads: leads.length,
    newLeads,
    inProgressLeads,
    approvedLeads,
    rejectedLeads,
    totalUsers: users.length,
    blockedUsers,
    vacanciesByCountry: Array.from(countryMap.entries()).map(([country, count]) => ({
      country,
      count,
    })),
    leadsByType: [
      { type: 'job_application', label: 'Отклики на вакансии', count: typeCounts.job_application },
      { type: 'b2b_request', label: 'Заявки бизнеса', count: typeCounts.b2b_request },
      { type: 'consultation', label: 'Консультации', count: typeCounts.consultation },
    ],
  };
}

export function validateLeadForm(input: LeadFormInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const name = input.fullName.trim();
  const phone = input.phone.trim();

  if (input.type === 'b2b_request') {
    const company = (input.companyName ?? '').trim();
    if (company.length < 2) {
      errors.companyName = 'Укажите название компании (минимум 2 символа)';
    }
    if (name.length < 2) {
      errors.fullName = 'Укажите контактное лицо (минимум 2 символа)';
    }
    if (!(input.staffCount ?? '').trim()) {
      errors.staffCount = 'Выберите количество сотрудников';
    }
  } else {
    if (name.length < 2 || name.length > 120) {
      errors.fullName = 'Введите ваше имя (от 2 до 120 символов)';
    }
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || phone.length > 40) {
    errors.phone = 'Введите корректный номер телефона';
  }

  if (input.email && input.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      errors.email = 'Введите корректный адрес электронной почты';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateVacancyInput(input: VacancyInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (input.title.trim().length < 2 || input.title.trim().length > 120) {
    errors.title = 'Название вакансии должно содержать от 2 до 120 символов';
  }
  if (input.country.trim().length < 2 || input.country.trim().length > 60) {
    errors.country = 'Укажите страну';
  }
  if (input.profession.trim().length < 2 || input.profession.trim().length > 80) {
    errors.profession = 'Укажите категорию профессии';
  }
  if (input.salaryText.trim().length < 2 || input.salaryText.trim().length > 60) {
    errors.salaryText = 'Укажите ставку (например: 14–16 €/час нетто)';
  }
  if (input.salaryMonthlyText.trim().length < 2 || input.salaryMonthlyText.trim().length > 60) {
    errors.salaryMonthlyText = 'Укажите доход в месяц (например: от 2 600 € / мес.)';
  }
  if (input.schedule.trim().length < 2 || input.schedule.trim().length > 80) {
    errors.schedule = 'Укажите график работы';
  }
  if (input.housing.trim().length < 2 || input.housing.trim().length > 80) {
    errors.housing = 'Укажите условия проживания';
  }
  if (input.contractType.trim().length < 2 || input.contractType.trim().length > 80) {
    errors.contractType = 'Укажите тип оформления';
  }
  if (input.description.trim().length < 10 || input.description.trim().length > 1500) {
    errors.description = 'Описание должно содержать от 10 до 1500 символов';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatNotificationMessage(payload: LeadFormInput): {
  subject: string;
  text: string;
} {
  const typeLabel =
    payload.type === 'b2b_request'
      ? 'B2B-заявка на подбор персонала'
      : payload.type === 'job_application'
        ? 'Отклик соискателя на вакансию'
        : 'Запрос на консультацию';

  const lines: string[] = [
    `MIGRANT — ${typeLabel}`,
    `Контакт: ${payload.fullName}`,
    `Телефон: ${payload.phone}`,
  ];

  if (payload.email) lines.push(`Email: ${payload.email}`);
  if (payload.companyName) lines.push(`Компания: ${payload.companyName}`);
  if (payload.staffCount) lines.push(`Количество сотрудников: ${payload.staffCount}`);
  if (payload.country) lines.push(`Страна: ${payload.country}`);
  if (payload.vacancyTitle) lines.push(`Вакансия: ${payload.vacancyTitle}`);
  if (payload.comment) lines.push(`Комментарий: ${payload.comment}`);

  return {
    subject: `[MIGRANT] ${typeLabel}: ${payload.fullName}`,
    text: lines.join('\n'),
  };
}
