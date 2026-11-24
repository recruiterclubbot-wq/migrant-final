import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  Clock,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { BlueFeatureIcon, CountryFlag } from './MigrantIcons';
import { PREMIUM_EASE, ScrollReveal } from './MotionPrimitives';
import {
  B2B_CASE_STUDIES,
  B2B_INDUSTRIES,
  B2B_TEAM_TIERS,
  CANDIDATE_FAQ_ITEMS,
  CANDIDATE_JOURNEY_STEPS,
  ESTIMATOR_COUNTRIES,
  ESTIMATOR_PROFESSIONS,
  calculateB2BStaffingPlan,
  calculateEstimatedIncome,
  type B2BIndustryId,
  type B2BTeamTier,
  type EstimatorProfessionId,
} from '../utils/marketing';
import type { CountryCode } from '../types/migrant';

interface IncomeEstimatorSectionProps {
  onRequestMatch: (prefill: { country: string; comment: string }) => void;
}

export function IncomeEstimatorSection({ onRequestMatch }: IncomeEstimatorSectionProps) {
  const [countryCode, setCountryCode] = useState<Extract<CountryCode, 'DE' | 'PL' | 'CZ'>>('DE');
  const [profession, setProfession] = useState<EstimatorProfessionId>('construction');
  const [weeklyHours, setWeeklyHours] = useState(48);
  const [employerHousing, setEmployerHousing] = useState(true);

  const estimate = useMemo(
    () =>
      calculateEstimatedIncome({
        countryCode,
        profession,
        weeklyHours,
        employerHousing,
      }),
    [countryCode, profession, weeklyHours, employerHousing]
  );

  return (
    <section
      id="income-calculator"
      aria-labelledby="income-calculator-heading"
      className="max-w-[1200px] mx-auto px-4 sm:px-6"
    >
      <ScrollReveal>
        <div className="migrant-card rounded-[32px] p-6 sm:p-9 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Controls Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="migrant-icon-pedestal w-11 h-11 rounded-2xl flex items-center justify-center text-[#1448A0] shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h2
                    id="income-calculator-heading"
                    className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] leading-tight"
                  >
                    Рассчитайте чистый доход в Европе
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#3B527A] leading-relaxed">
                  Прозрачный расчёт зарплаты «на руки» (нетто) с учётом рабочих часов и проживания — без скрытых комиссий агентства.
                </p>
              </div>

              {/* Country Selector */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#546B91] mb-2.5">
                  1. Выберите страну работы
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {ESTIMATOR_COUNTRIES.map((c) => {
                    const active = countryCode === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCountryCode(c.code)}
                        aria-pressed={active}
                        className={`px-3.5 py-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          active
                            ? 'bg-[#EBF3FF] border-[#1448A0] text-[#0B224C] shadow-[0_6px_18px_rgba(20,72,160,0.12)]'
                            : 'bg-white border-[#DCEBFF] text-[#3B527A] hover:border-[#93C5FD]'
                        }`}
                      >
                        <CountryFlag code={c.code} variant="pill" className="w-7 h-5 shrink-0" />
                        <span className="text-sm font-bold truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profession Selector */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#546B91] mb-2.5">
                  2. Направление работы
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ESTIMATOR_PROFESSIONS.map((prof) => {
                    const active = profession === prof.id;
                    return (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => setProfession(prof.id)}
                        aria-pressed={active}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-[#EBF3FF] border-[#1448A0] shadow-[0_6px_18px_rgba(20,72,160,0.1)]'
                            : 'bg-white border-[#DCEBFF] hover:border-[#93C5FD]'
                        }`}
                      >
                        <p className="text-sm font-bold text-[#0B224C] leading-snug">{prof.label}</p>
                        <p className="text-xs text-[#546B91] mt-0.5">{prof.shortHint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours + Housing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-white/90 border border-[#DCEBFF] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="estimator-hours" className="text-xs font-bold text-[#1E355E]">
                      Загрузка в неделю
                    </label>
                    <span className="text-sm font-extrabold text-[#1448A0] tabular-nums">
                      {weeklyHours} ч/нед
                    </span>
                  </div>
                  <input
                    id="estimator-hours"
                    type="range"
                    min={40}
                    max={60}
                    step={2}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full accent-[#1448A0] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#546B91] tabular-nums mt-1">
                    <span>40 ч (стандарт)</span>
                    <span>60 ч (сверхурочные)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEmployerHousing((v) => !v)}
                  aria-pressed={employerHousing}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    employerHousing
                      ? 'bg-[#ECFDF5] border-[#86EFAC]'
                      : 'bg-white border-[#DCEBFF] hover:border-[#93C5FD]'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      employerHousing
                        ? 'bg-[#16A34A] border-[#16A34A] text-white'
                        : 'bg-white border-[#93C5FD] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#0B224C]">
                      Жильё от работодателя
                    </span>
                    <span className="block text-xs text-[#3B527A] mt-0.5 leading-snug">
                      {employerHousing
                        ? `Экономия до ${estimate.housingSavingEur} € / мес.`
                        : 'Учтён средний расход на аренду'}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Live Result Card */}
            <div className="lg:col-span-5 migrant-cobalt-banner rounded-[28px] p-6 sm:p-7 text-white flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#BFDBFE]">
                  Ориентировочный доход «на руки»
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    data-testid="estimator-monthly-eur"
                    className="text-4xl sm:text-[46px] font-extrabold tracking-tight tabular-nums leading-none"
                  >
                    {estimate.monthlyNetEur.toLocaleString('ru-RU')} €
                  </span>
                  <span className="text-sm font-semibold text-[#DCEBFF]">/ мес. нетто</span>
                </div>
                <p className="mt-2 text-sm text-[#DCEBFF] tabular-nums">
                  ≈ {estimate.threeMonthNetEur.toLocaleString('ru-RU')} € за 3 месяца контракта
                </p>

                <div className="mt-6 pt-5 border-t border-white/18 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#BFDBFE]">Средняя ставка</span>
                    <span className="font-bold tabular-nums">
                      ~{estimate.hourlyNetEur.toFixed(1).replace('.', ',')} € / час
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#BFDBFE]">Оформление</span>
                    <span className="font-semibold text-right">{estimate.contractLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#BFDBFE]">Выход на работу</span>
                    <span className="font-bold tabular-nums">{estimate.departureDaysLabel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-white/18 space-y-4">
                <ul className="space-y-2 text-xs text-[#E8F2FF]">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#93C5FD] shrink-0" />
                    <span>0 € за подбор вакансии и консультацию</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#93C5FD] shrink-0" />
                    <span>Подборка проверенных мест за 15 минут</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() =>
                    onRequestMatch({
                      country: estimate.countryName,
                      comment: estimate.formattedSummary,
                    })
                  }
                  className="w-full bg-white text-[#0E3B8C] hover:bg-[#F0F6FF] hover:-translate-y-0.5 active:scale-[0.985] font-bold py-3.5 px-6 rounded-full text-sm inline-flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(6,24,66,0.28)] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Подобрать вакансии на эту сумму</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

export function CandidateRoadmapAndFaqSection({
  onOpenLeadModal,
}: {
  onOpenLeadModal: () => void;
}) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(CANDIDATE_FAQ_ITEMS[0].id);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
      {/* 4-Step Transparent Candidate Roadmap */}
      <div>
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C]">
                Как проходит трудоустройство с MIGRANT
              </h2>
              <p className="text-sm sm:text-base text-[#3B527A] mt-1 max-w-2xl">
                Понятный маршрут от первого звонка до выхода на смену — без предоплат, сюрпризов и скрытых условий.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenLeadModal}
              className="group self-start md:self-auto inline-flex items-center gap-1.5 text-sm font-bold text-[#1448A0] hover:text-[#0B224C] cursor-pointer whitespace-nowrap transition-colors"
            >
              <span>Бесплатная консультация</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANDIDATE_JOURNEY_STEPS.map((item, idx) => (
            <ScrollReveal key={item.step} delay={idx * 0.06} className="h-full">
              <article className="migrant-card migrant-card-interactive rounded-3xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-2xl font-extrabold text-[#1448A0] tabular-nums tracking-tight">
                      {item.step}
                    </span>
                    <span className="text-xs font-bold text-[#3B527A] bg-[#EFF6FF] border border-[#DCEBFF] px-2.5 py-1 rounded-lg tabular-nums">
                      {item.duration}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B224C] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#3B527A] leading-relaxed">{item.description}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Objection-Handling FAQ Accordion */}
      <ScrollReveal>
        <div className="migrant-card rounded-[32px] p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="migrant-icon-pedestal w-14 h-14 rounded-2xl flex items-center justify-center">
              <BlueFeatureIcon kind="chat" className="w-11 h-11" />
            </div>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0B224C] leading-tight">
              Честные ответы на главные вопросы
            </h2>
            <p className="text-sm text-[#3B527A] leading-relaxed">
              Собрали 5 самых частых вопросов о комиссиях, документах, языке и жилье перед выездом за границу.
            </p>
            <button
              type="button"
              onClick={onOpenLeadModal}
              className="migrant-btn-secondary font-semibold px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Задать свой вопрос</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-8 divide-y divide-[#E2EDFF]">
            {CANDIDATE_FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${item.id}-panel`}
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full py-2 flex items-center justify-between gap-4 text-left cursor-pointer group"
                  >
                    <span className="text-base font-bold text-[#0B224C] group-hover:text-[#1448A0] transition-colors">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#1448A0] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`${item.id}-panel`}
                        key="answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: PREMIUM_EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pt-1.5 pb-2 text-sm text-[#3B527A] leading-relaxed max-w-2xl">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

interface B2BSlaAndPlannerSectionProps {
  onApplyPlanToForm: (prefill: { staffCount: string; comment: string }) => void;
}

export function B2BSlaAndPlannerSection({ onApplyPlanToForm }: B2BSlaAndPlannerSectionProps) {
  const [industry, setIndustry] = useState<B2BIndustryId>('warehouse');
  const [countryCode, setCountryCode] = useState<Extract<CountryCode, 'DE' | 'PL' | 'CZ'>>('PL');
  const [teamTier, setTeamTier] = useState<B2BTeamTier>('medium');

  const plan = useMemo(
    () =>
      calculateB2BStaffingPlan({
        industry,
        countryCode,
        teamTier,
      }),
    [industry, countryCode, teamTier]
  );

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
      {/* Interactive B2B Staffing SLA Planner */}
      <ScrollReveal>
        <div className="migrant-card rounded-[32px] p-6 sm:p-9 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] leading-tight">
                  Расчёт сроков комплектации под ваш объект
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#3B527A] leading-relaxed">
                  Укажите отрасль, страну объекта и размер бригады — рассчитаем реальный срок вывода первой волны и состав SLA-сопровождения.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#546B91] mb-2.5">
                  1. Отрасль объекта
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {B2B_INDUSTRIES.map((item) => {
                    const active = industry === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIndustry(item.id)}
                        aria-pressed={active}
                        className={`px-4 py-3 rounded-2xl border text-left text-sm font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#EBF3FF] border-[#1448A0] text-[#0B224C] shadow-[0_6px_18px_rgba(20,72,160,0.1)]'
                            : 'bg-white border-[#DCEBFF] text-[#3B527A] hover:border-[#93C5FD]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#546B91] mb-2.5">
                    2. Страна объекта
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ESTIMATOR_COUNTRIES.map((c) => {
                      const active = countryCode === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCountryCode(c.code)}
                          aria-pressed={active}
                          className={`px-2.5 py-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            active
                              ? 'bg-[#EBF3FF] border-[#1448A0] text-[#0B224C]'
                              : 'bg-white border-[#DCEBFF] text-[#3B527A] hover:border-[#93C5FD]'
                          }`}
                        >
                          <CountryFlag code={c.code} variant="pill" className="w-7 h-5" />
                          <span className="text-xs font-bold">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#546B91] mb-2.5">
                    3. Размер бригады
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {B2B_TEAM_TIERS.map((tier) => {
                      const active = teamTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setTeamTier(tier.id)}
                          aria-pressed={active}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#1448A0] border-[#1448A0] text-white shadow-sm'
                              : 'bg-white border-[#DCEBFF] text-[#1E355E] hover:border-[#93C5FD]'
                          }`}
                        >
                          {tier.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#F4F8FF] to-[#E9F2FF] border border-[#CBDDF7] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1448A0]">
                  Прогноз и гарантии SLA
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-[#DCEBFF]">
                    <p className="text-xs text-[#546B91] font-medium">Первые анкеты</p>
                    <p className="text-2xl font-extrabold text-[#0B224C] tabular-nums mt-1">
                      за {plan.firstShortlistHours} ч
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-[#DCEBFF]">
                    <p className="text-xs text-[#546B91] font-medium">Выход первой волны</p>
                    <p
                      data-testid="b2b-deployment-days"
                      className="text-2xl font-extrabold text-[#1448A0] tabular-nums mt-1"
                    >
                      {plan.deploymentDaysLabel}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E2EDFF]">
                    <dt className="text-xs font-bold text-[#546B91]">Кураторство на объекте</dt>
                    <dd className="text-[#0B224C] font-semibold mt-0.5">{plan.coordinatorLabel}</dd>
                  </div>
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E2EDFF]">
                    <dt className="text-xs font-bold text-[#546B91]">Документальный контур</dt>
                    <dd className="text-[#0B224C] font-semibold mt-0.5">{plan.legalPackage}</dd>
                  </div>
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E2EDFF] flex items-center justify-between">
                    <dt className="text-xs font-bold text-[#546B91]">Бесплатная замена по SLA</dt>
                    <dd className="text-[#16A34A] font-extrabold tabular-nums">
                      {plan.replacementGuaranteeDays} дней
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                type="button"
                onClick={() =>
                  onApplyPlanToForm({
                    staffCount: plan.staffCountOption,
                    comment: plan.formattedSummary,
                  })
                }
                className="mt-6 w-full migrant-btn-primary text-white font-semibold py-3.5 px-6 rounded-full text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Перенести расчёт в заявку</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Quantified Industry Deployment Cases */}
      <div>
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C]">
                Примеры закрытых кадровых задач
              </h2>
              <p className="text-sm sm:text-base text-[#3B527A] mt-1">
                Типовые сроки и результаты комплектации персонала по ключевым отраслям ЕС.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {B2B_CASE_STUDIES.map((cs, idx) => (
            <ScrollReveal key={cs.title} delay={idx * 0.06} className="h-full">
              <article className="migrant-card migrant-card-interactive rounded-3xl p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3B527A] mb-3">
                    <CountryFlag code={cs.countryCode} variant="pill" className="w-6 h-4" />
                    <span>{cs.country}</span>
                  </div>
                  <p className="text-xl font-extrabold text-[#1448A0] tabular-nums mb-2">
                    {cs.metric}
                  </p>
                  <h3 className="text-base font-extrabold text-[#0B224C] leading-snug mb-2">
                    {cs.title}
                  </h3>
                  <p className="text-sm text-[#3B527A] leading-relaxed">{cs.details}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
