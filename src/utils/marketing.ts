import type { CountryCode } from '../types/migrant';

export type EstimatorProfessionId =
  | 'construction'
  | 'warehouse'
  | 'manufacturing'
  | 'logistics';

export type PreferredChannel = 'Звонок' | 'Telegram' | 'WhatsApp' | 'Viber';

export const PREFERRED_CHANNELS: PreferredChannel[] = [
  'Telegram',
  'WhatsApp',
  'Звонок',
  'Viber',
];

export interface EstimatorCountryConfig {
  code: Extract<CountryCode, 'DE' | 'PL' | 'CZ'>;
  name: string;
  contractLabel: string;
  departureDaysLabel: string;
  housingCostEur: number;
  ratesByProfessionEur: Record<EstimatorProfessionId, number>;
}

export const ESTIMATOR_COUNTRIES: EstimatorCountryConfig[] = [
  {
    code: 'DE',
    name: 'Германия',
    contractLabel: 'Arbeitsvertrag · соцпакет ЕС',
    departureDaysLabel: '10–14 дней',
    housingCostEur: 340,
    ratesByProfessionEur: {
      construction: 15,
      warehouse: 12.8,
      manufacturing: 13.5,
      logistics: 14.2,
    },
  },
  {
    code: 'PL',
    name: 'Польша',
    contractLabel: 'Umowa o pracę / Zlecenie · ZUS',
    departureDaysLabel: '5–8 дней',
    housingCostEur: 180,
    ratesByProfessionEur: {
      construction: 8.4,
      warehouse: 6.7,
      manufacturing: 7.2,
      logistics: 7.9,
    },
  },
  {
    code: 'CZ',
    name: 'Чехия',
    contractLabel: 'Трудовой договор HPP · страховка',
    departureDaysLabel: '7–12 дней',
    housingCostEur: 220,
    ratesByProfessionEur: {
      construction: 9.6,
      warehouse: 7.8,
      manufacturing: 8.6,
      logistics: 8.9,
    },
  },
];

export const ESTIMATOR_PROFESSIONS: Array<{
  id: EstimatorProfessionId;
  label: string;
  shortHint: string;
}> = [
  { id: 'construction', label: 'Строительство и монтаж', shortHint: 'сантехники, маляры, электрики' },
  { id: 'warehouse', label: 'Склад и комплектация', shortHint: 'сканер, упаковка, погрузчик' },
  { id: 'manufacturing', label: 'Производство и заводы', shortHint: 'операторы линий, сборка' },
  { id: 'logistics', label: 'Логистика и транспорт', shortHint: 'водители B/CE, экспедиция' },
];

export interface IncomeEstimateInput {
  countryCode: Extract<CountryCode, 'DE' | 'PL' | 'CZ'>;
  profession: EstimatorProfessionId;
  weeklyHours: number;
  employerHousing: boolean;
}

export interface IncomeEstimateResult {
  countryName: string;
  hourlyNetEur: number;
  monthlyNetEur: number;
  threeMonthNetEur: number;
  housingSavingEur: number;
  contractLabel: string;
  departureDaysLabel: string;
  formattedSummary: string;
}

export function calculateEstimatedIncome(input: IncomeEstimateInput): IncomeEstimateResult {
  const cfg =
    ESTIMATOR_COUNTRIES.find((c) => c.code === input.countryCode) ?? ESTIMATOR_COUNTRIES[0];
  const clampedHours = Math.max(36, Math.min(60, Math.round(input.weeklyHours)));
  const hourlyNetEur = cfg.ratesByProfessionEur[input.profession] ?? cfg.ratesByProfessionEur.warehouse;
  const monthlyHours = clampedHours * 4.33;
  const grossNetBeforeHousing = Math.round(hourlyNetEur * monthlyHours);
  const housingDeduction = input.employerHousing ? 0 : cfg.housingCostEur;
  const monthlyNetEur = Math.max(0, grossNetBeforeHousing - housingDeduction);
  const threeMonthNetEur = monthlyNetEur * 3;
  const housingSavingEur = input.employerHousing ? cfg.housingCostEur : 0;

  const profLabel =
    ESTIMATOR_PROFESSIONS.find((p) => p.id === input.profession)?.label ?? 'Специалист';

  const formattedSummary = `Расчёт дохода: ${cfg.name}, направление «${profLabel}», ${clampedHours} ч/нед, ${
    input.employerHousing ? 'жильё от работодателя' : 'самостоятельное жильё'
  } (~${monthlyNetEur.toLocaleString('ru-RU')} € нетто/мес).`;

  return {
    countryName: cfg.name,
    hourlyNetEur,
    monthlyNetEur,
    threeMonthNetEur,
    housingSavingEur,
    contractLabel: cfg.contractLabel,
    departureDaysLabel: cfg.departureDaysLabel,
    formattedSummary,
  };
}

export type B2BIndustryId = 'construction' | 'warehouse' | 'manufacturing' | 'hospitality';
export type B2BTeamTier = 'small' | 'medium' | 'large' | 'enterprise';

export const B2B_INDUSTRIES: Array<{ id: B2BIndustryId; label: string; baseDays: number }> = [
  { id: 'warehouse', label: 'Склады и логистика', baseDays: 7 },
  { id: 'manufacturing', label: 'Производство и заводы', baseDays: 9 },
  { id: 'construction', label: 'Строительство и монтаж', baseDays: 10 },
  { id: 'hospitality', label: 'Сервис и HoReCa', baseDays: 8 },
];

export const B2B_TEAM_TIERS: Array<{
  id: B2BTeamTier;
  label: string;
  staffCountOption: string;
  extraDays: number;
  coordinatorLabel: string;
}> = [
  {
    id: 'small',
    label: '1–5 человек',
    staffCountOption: '1–5 человек',
    extraDays: 0,
    coordinatorLabel: 'Выделенный рекрутер и проверка навыков',
  },
  {
    id: 'medium',
    label: '5–15 человек',
    staffCountOption: '5–15 человек',
    extraDays: 2,
    coordinatorLabel: 'Персональный куратор + организация жилья',
  },
  {
    id: 'large',
    label: '15–50 человек',
    staffCountOption: '15–50 человек',
    extraDays: 4,
    coordinatorLabel: 'Координатор на объекте + бригадир с языком',
  },
  {
    id: 'enterprise',
    label: '50+ человек',
    staffCountOption: '50+ человек',
    extraDays: 6,
    coordinatorLabel: 'Выделенный проектный офис + ротация смен 24/7',
  },
];

export interface B2BStaffingPlanInput {
  industry: B2BIndustryId;
  countryCode: Extract<CountryCode, 'DE' | 'PL' | 'CZ'>;
  teamTier: B2BTeamTier;
}

export interface B2BStaffingPlanResult {
  firstShortlistHours: number;
  deploymentDaysMin: number;
  deploymentDaysMax: number;
  deploymentDaysLabel: string;
  coordinatorLabel: string;
  replacementGuaranteeDays: number;
  legalPackage: string;
  staffCountOption: string;
  formattedSummary: string;
}

export function calculateB2BStaffingPlan(input: B2BStaffingPlanInput): B2BStaffingPlanResult {
  const industryCfg =
    B2B_INDUSTRIES.find((i) => i.id === input.industry) ?? B2B_INDUSTRIES[0];
  const tierCfg =
    B2B_TEAM_TIERS.find((t) => t.id === input.teamTier) ?? B2B_TEAM_TIERS[1];
  const countryCfg =
    ESTIMATOR_COUNTRIES.find((c) => c.code === input.countryCode) ?? ESTIMATOR_COUNTRIES[0];

  const countryOffset = input.countryCode === 'DE' ? 3 : input.countryCode === 'CZ' ? 2 : 0;
  const deploymentDaysMin = industryCfg.baseDays + tierCfg.extraDays + countryOffset;
  const deploymentDaysMax = deploymentDaysMin + 4;

  const legalPackage =
    input.countryCode === 'DE'
      ? 'Договор, командирование A1 / разрешения, страховка и медосмотр'
      : input.countryCode === 'CZ'
        ? 'Трудовые карты / разрешения, меддопуск, регистрация и страховка'
        : 'Освядчения / разрешения, ZUS, медосмотр BHP и прописка';

  const formattedSummary = `Запрос B2B: отрасль «${industryCfg.label}», объект в стране ${countryCfg.name}, объём ${tierCfg.label}. Ожидаемый вывод первой волны: ${deploymentDaysMin}–${deploymentDaysMax} дн.`;

  return {
    firstShortlistHours: 24,
    deploymentDaysMin,
    deploymentDaysMax,
    deploymentDaysLabel: `${deploymentDaysMin}–${deploymentDaysMax} дней`,
    coordinatorLabel: tierCfg.coordinatorLabel,
    replacementGuaranteeDays: 30,
    legalPackage,
    staffCountOption: tierCfg.staffCountOption,
    formattedSummary,
  };
}

export function formatCommentWithChannel(channel: PreferredChannel, comment: string): string {
  const cleanComment = comment.trim();
  const prefix = `[Связь: ${channel}]`;
  if (!cleanComment) return prefix;
  if (cleanComment.startsWith('[Связь:')) return cleanComment;
  return `${prefix} ${cleanComment}`;
}

export const CANDIDATE_JOURNEY_STEPS = [
  {
    step: '01',
    duration: '15 минут',
    title: 'Подбор и честный расчёт',
    description:
      'Уточняем ваш опыт, документы и желаемый доход. Предлагаем 2–3 актуальные вакансии с точными ставками нетто и условиями жилья.',
  },
  {
    step: '02',
    duration: '3–7 дней',
    title: 'Приглашение и договор',
    description:
      'Готовим официальный пакет документов и трудовой договор до вашего выезда — вы заранее видите ставку, график и адрес объекта.',
  },
  {
    step: '03',
    duration: 'День приезда',
    title: 'Встреча и заселение',
    description:
      'Русскоязычный координатор встречает вас, помогает с заселением, сим-картой, банковским счётом и оформлением на месте.',
  },
  {
    step: '04',
    duration: 'Весь контракт',
    title: 'Выход на смену и поддержка',
    description:
      'Вы приступаете к работе с официальными выплатами на карту. Координатор остаётся на связи по любым бытовым и рабочим вопросам.',
  },
];

export const CANDIDATE_FAQ_ITEMS = [
  {
    id: 'faq-fees',
    question: 'Нужно ли платить агентству за подбор вакансии?',
    answer:
      'Нет. Для соискателей подбор вакансии, консультация и сопровождение оформления стоят 0 €. Услуги рекрутинга оплачивает европейский работодатель по официальному контракту.',
  },
  {
    id: 'faq-language',
    question: 'Можно ли устроиться без знания немецкого или польского языка?',
    answer:
      'Да, большинство вакансий на складах, производстве и в монтажных бригадах доступны без знания языка — на объектах работают русско- и украиноязычные координаторы и бригадиры.',
  },
  {
    id: 'faq-housing',
    question: 'Какие условия проживания предоставляют работодатели?',
    answer:
      'Мы проверяем жильё до отправки кандидатов: это оборудованные квартиры или рабочие хостелы по 2–3 человека в комнате с кухней, интернетом и удобным доездом до объекта.',
  },
  {
    id: 'faq-contract',
    question: 'Как гарантируется своевременная выплата зарплаты?',
    answer:
      'Трудоустройство проходит строго по официальному договору с выплатой на банковскую карту, отчислениями в соцфонды и медицинской страховкой. Условия фиксируются письменно до выезда.',
  },
  {
    id: 'faq-speed',
    question: 'Как быстро можно выехать на работу после заявки?',
    answer:
      'При наличии действующих документов (биометрия, виза, карта побыта или паспорт ЕС) выход на работу в Польше возможен за 5–8 дней, в Германии и Чехии — за 7–14 дней.',
  },
];

export const B2B_CASE_STUDIES = [
  {
    countryCode: 'PL' as const,
    country: 'Польша · Логистика',
    metric: '24 сотрудника за 11 дней',
    title: 'Комплектация распределительного центра перед сезонным пиком',
    details:
      'Закрыли 2 смены операторов сканера и водителей погрузчика с оформлением BHP и прописки. Выход в смену — 96% без простоя линии.',
  },
  {
    countryCode: 'DE' as const,
    country: 'Германия · Строительство',
    metric: '12 мастеров за 14 дней',
    title: 'Бригада сантехников и отделочников на коммерческий объект',
    details:
      'Отобрали специалистов с подтверждённым стажем от 3 лет, организовали командирование, жильё рядом с объектом и русскоязычного бригадира.',
  },
  {
    countryCode: 'CZ' as const,
    country: 'Чехия · Производство',
    metric: '18 операторов за 12 дней',
    title: 'Стабилизация ночной и дневной смен на автокомпонентном заводе',
    details:
      'Снизили текучесть персонала за счёт предварительного тех-интервью и постоянного куратора на заводе. Бесплатная замена по SLA — 0 простоев.',
  },
];
