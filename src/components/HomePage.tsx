import React from 'react';
import { ArrowRight, Check, Globe, Send } from 'lucide-react';
import {
  BlueFeatureIcon,
  CountryFlag,
  HeroCartoonDuo,
  HeroWaveBackdrop,
  VacancyJobIcon,
} from './MigrantIcons';
import {
  FloatingDuoStage,
  HeroEntrance,
  ScrollReveal,
} from './MotionPrimitives';
import {
  CandidateRoadmapAndFaqSection,
  IncomeEstimatorSection,
} from './ConversionSections';
import type { PageRoute, Vacancy } from '../types/migrant';

interface HomePageProps {
  vacancies: Vacancy[];
  onNavigate: (route: PageRoute) => void;
  onOpenLeadModal: () => void;
  onApplyVacancy: (vacancy: Vacancy) => void;
  onOpenLeadWithPrefill: (prefill: { country: string; comment: string }) => void;
}

const CAPABILITY_CARDS = [
  {
    icon: 'clipboard' as const,
    title: 'Проверенные вакансии',
    description: 'Актуальные и надёжные предложения от зарубежных работодателей.',
  },
  {
    icon: 'shield' as const,
    title: 'Официальное трудоустройство',
    description: 'Работа по договору в полном соответствии с законодательством страны трудоустройства.',
  },
  {
    icon: 'passport' as const,
    title: 'Сопровождение документов',
    description: 'Помощь с визами, разрешениями на работу и всеми необходимыми документами.',
  },
  {
    icon: 'team' as const,
    title: 'Подбор персонала для бизнеса',
    description: 'Оперативный поиск и подбор квалифицированных сотрудников из разных стран.',
  },
];

export function HomePage({
  vacancies,
  onNavigate,
  onOpenLeadModal,
  onApplyVacancy,
  onOpenLeadWithPrefill,
}: HomePageProps) {
  const featured = vacancies.filter((v) => v.active).slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section with sculpted studio lighting and floating 3D duo */}
      <section className="relative pt-4 sm:pt-7 pb-2">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="migrant-hero-surface rounded-[36px] px-6 pt-8 pb-0 sm:px-10 sm:pt-10 lg:px-12 lg:pt-10 relative overflow-hidden">
            <HeroWaveBackdrop className="absolute inset-x-0 bottom-0 w-full h-[180px] sm:h-[220px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-8">
              <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center lg:justify-start">
                <FloatingDuoStage>
                  <HeroCartoonDuo
                    alt="Команда специалистов и соискателей MIGRANT"
                    className="w-[300px] sm:w-[390px] lg:w-[445px] max-w-full h-auto block"
                  />
                </FloatingDuoStage>
              </div>

              <HeroEntrance delay={0.05} className="lg:col-span-6 order-1 lg:order-2 text-center lg:text-left pb-4 lg:pb-12">
                <h1 className="text-[36px] sm:text-[46px] lg:text-[54px] font-extrabold leading-[1.06] tracking-tight text-[#0B224C] text-balance">
                  Работа и персонал без границ
                </h1>
                <p className="mt-4 text-base sm:text-lg text-[#2C446E] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Международный подбор персонала, официальное трудоустройство за рубежом и комплектация кадрами для бизнеса.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('/vacancies')}
                    className="w-full sm:w-auto migrant-btn-primary text-white font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <SearchIcon className="w-4 h-4" />
                    <span>Ищу работу</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/business')}
                    className="w-full sm:w-auto migrant-btn-secondary font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <UsersIcon className="w-4 h-4" />
                    <span>Нужны сотрудники</span>
                  </button>
                </div>

                <ul className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-semibold text-[#1E355E]">
                  <li className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#1448A0]" strokeWidth={2.8} />
                    <span>0 € за подбор вакансии</span>
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#1448A0]" strokeWidth={2.8} />
                    <span>Официальный контракт ЕС</span>
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#1448A0]" strokeWidth={2.8} />
                    <span>Подбор за 15 минут</span>
                  </li>
                </ul>
              </HeroEntrance>
            </div>
          </div>
        </div>
      </section>

      {/* О компании MIGRANT */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="migrant-card rounded-[32px] p-6 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-7">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-7">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] whitespace-nowrap">
                О компании MIGRANT
              </h2>
              <div className="hidden md:block w-px h-9 bg-[#CBDDF7]" aria-hidden="true" />
              <p className="text-sm sm:text-base text-[#3B527A] max-w-xl leading-relaxed">
                Международное агентство занятости, которое соединяет специалистов и работодателей по всему миру.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/about')}
              className="group self-start md:self-center inline-flex items-center gap-1.5 text-sm font-bold text-[#1448A0] hover:text-[#0B224C] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <span>Подробнее о нас</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAPABILITY_CARDS.map((card, idx) => (
            <ScrollReveal key={card.title} delay={idx * 0.06} className="h-full">
              <article className="group migrant-card migrant-card-interactive rounded-3xl p-6 h-full flex flex-col items-center text-center">
                <div className="migrant-icon-pedestal w-18 h-18 rounded-2xl flex items-center justify-center mb-4">
                  <BlueFeatureIcon kind={card.icon} className="w-14 h-14" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B224C] mb-2 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm text-[#3B527A] leading-relaxed">
                  {card.description}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Top Active Vacancies Preview */}
      {featured.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C]">
                  Актуальные вакансии
                </h2>
                <p className="text-sm text-[#3B527A] mt-1">
                  Проверенные предложения от международных работодателей с официальным трудоустройством.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/vacancies')}
                className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#1448A0] hover:text-[#0B224C] cursor-pointer whitespace-nowrap transition-colors"
              >
                <span>Все вакансии</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((vacancy, idx) => (
              <ScrollReveal key={vacancy.id} delay={idx * 0.07} className="h-full">
                <article className="group migrant-card migrant-card-interactive rounded-3xl p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#0B224C]">
                        <CountryFlag code={vacancy.countryCode} variant="pill" className="w-7 h-5" />
                        <span>{vacancy.country}</span>
                      </div>
                      <div className="migrant-icon-pedestal w-16 h-16 rounded-2xl flex items-center justify-center">
                        <VacancyJobIcon type={vacancy.iconType} className="w-13 h-13" />
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0B224C] mb-3">
                      {vacancy.title}
                    </h3>
                    <ul className="space-y-1.5 text-sm text-[#3B527A]">
                      <li>{vacancy.contractType}</li>
                      <li>{vacancy.schedule}</li>
                      <li>{vacancy.housing}</li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E2EDFF]">
                    <p className="text-base sm:text-lg font-extrabold text-[#0B224C] tabular-nums">
                      {vacancy.salaryText}
                    </p>
                    <p className="text-sm font-bold text-[#1448A0] tabular-nums mb-3.5">
                      {vacancy.salaryMonthlyText}
                    </p>
                    <button
                      type="button"
                      onClick={() => onApplyVacancy(vacancy)}
                      className="w-full migrant-btn-primary text-white text-sm font-semibold py-2.5 rounded-full inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Оставить заявку</span>
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Net Income Calculator */}
      <IncomeEstimatorSection onRequestMatch={onOpenLeadWithPrefill} />

      {/* 4-Step Candidate Roadmap & Objection-Crushing FAQ */}
      <CandidateRoadmapAndFaqSection onOpenLeadModal={onOpenLeadModal} />

      {/* Bottom Cobalt Banner */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="migrant-cobalt-banner rounded-[32px] p-7 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
              <div className="w-15 h-15 rounded-2xl bg-white/14 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <Globe className="w-8 h-8 text-white" strokeWidth={1.75} />
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/25" aria-hidden="true" />
              <div>
                <h2 className="text-2xl sm:text-[28px] font-extrabold leading-tight text-balance">
                  Начните сотрудничество с MIGRANT уже сегодня
                </h2>
                <p className="mt-1.5 text-sm sm:text-base text-[#DCEBFF] max-w-xl">
                  Работа за рубежом или подбор персонала для вашего бизнеса — быстро, надёжно, официально.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenLeadModal}
              className="bg-white text-[#0E3B8C] hover:bg-[#F0F6FF] hover:-translate-y-0.5 active:scale-[0.98] font-bold px-8 py-3.5 rounded-full inline-flex items-center gap-2.5 shadow-[0_12px_28px_rgba(6,24,66,0.28)] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Оставить заявку</span>
            </button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
