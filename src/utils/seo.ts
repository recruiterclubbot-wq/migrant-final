import type { PageRoute, Vacancy } from '../types/migrant';

export interface RouteSeoMeta {
  title: string;
  description: string;
  indexable: boolean;
}

export const PAGE_SEO_META: Record<PageRoute, RouteSeoMeta> = {
  '/': {
    title: 'MIGRANT — Работа и персонал без границ | Агентство занятости',
    description:
      'Международное агентство занятости MIGRANT: официальное трудоустройство за рубежом, проверенные вакансии и подбор персонала для бизнеса.',
    indexable: true,
  },
  '/vacancies': {
    title: 'Актуальные вакансии за границей — Германия, Польша, Чехия | MIGRANT',
    description:
      'Проверенные вакансии с официальным оформлением, жильём и поддержкой куратора. Подбор работы в Европе и Украине.',
    indexable: true,
  },
  '/business': {
    title: 'Подбор персонала для вашего бизнеса — Аутстаффинг и рекрутинг | MIGRANT',
    description:
      'Поставляем надёжный персонал для строительства, складов, производства, логистики и сферы услуг с полным оформлением документов.',
    indexable: true,
  },
  '/about': {
    title: 'О компании MIGRANT — 7 лет международного трудоустройства',
    description:
      'Более 10 000 трудоустроенных сотрудников и 100+ компаний-партнёров. Узнайте о стандартах безопасности и лицензиях MIGRANT.',
    indexable: true,
  },
  '/contacts': {
    title: 'Контакты агентства MIGRANT — Связаться с нами и оставить заявку',
    description:
      'Прямая связь с международным агентством MIGRANT: консультации по трудоустройству за рубежом и подбору персонала для компаний.',
    indexable: true,
  },
  '/cabinet': {
    title: 'Личный кабинет — MIGRANT',
    description: 'Управление профилем соискателя или работодателя, статус заявок и сохранённые вакансии.',
    indexable: false,
  },
  '/admin': {
    title: 'Панель администратора — MIGRANT',
    description: 'Управление вакансиями, пользователями, заявками, аналитикой и уведомлениями.',
    indexable: false,
  },
};

export function buildJobPostingsJsonLd(vacancies: Vacancy[], baseUrl: string): string {
  const postings = vacancies
    .filter((v) => v.active)
    .slice(0, 12)
    .map((v) => ({
      '@type': 'JobPosting',
      title: v.title,
      description: v.description,
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'MIGRANT',
        sameAs: baseUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: v.countryCode,
          addressLocality: v.country,
        },
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        value: {
          '@type': 'QuantitativeValue',
          unitText: 'MONTH',
          value: v.salaryMonthlyText,
        },
      },
    }));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': postings,
  });
}

export function applyRouteSeo(route: PageRoute, vacancies: Vacancy[]): void {
  if (typeof document === 'undefined') return;
  const meta = PAGE_SEO_META[route] ?? PAGE_SEO_META['/'];
  document.title = meta.title;

  const setMetaTag = (selector: string, attr: string, value: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute(attr, value);
    }
  };

  setMetaTag('meta[name="description"]', 'content', meta.description);
  setMetaTag('meta[property="og:title"]', 'content', meta.title);
  setMetaTag('meta[property="og:description"]', 'content', meta.description);
  setMetaTag('meta[name="twitter:title"]', 'content', meta.title);
  setMetaTag('meta[name="twitter:description"]', 'content', meta.description);
  setMetaTag('meta[name="robots"]', 'content', meta.indexable ? 'index, follow' : 'noindex, nofollow');

  const canonicalUrl = `${window.location.origin}${route}`;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);

  const scriptId = 'migrant-dynamic-jobs-jsonld';
  let ldEl = document.getElementById(scriptId);
  if (route === '/vacancies' || route === '/') {
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.id = scriptId;
      ldEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(ldEl);
    }
    ldEl.textContent = buildJobPostingsJsonLd(vacancies, window.location.origin);
  } else if (ldEl) {
    ldEl.remove();
  }
}
