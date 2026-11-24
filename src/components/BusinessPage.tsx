import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, PhoneCall, Search, Send } from 'lucide-react';
import { BlueFeatureIcon, HeroCartoonDuo, HeroWaveBackdrop } from './MigrantIcons';
import {
  AnimatedMetricNumber,
  FloatingDuoStage,
  HeroEntrance,
  ScrollReveal,
} from './MotionPrimitives';
import { B2BSlaAndPlannerSection } from './ConversionSections';
import { validateLeadForm } from '../utils/vacancies';
import { submitLeadOrApplication } from '../utils/leadSubmit';

interface BusinessPageProps {
  onOpenConsultation: () => void;
}

const B2B_BENEFITS = [
  {
    icon: 'speed' as const,
    title: 'Быстрый подбор',
    description: 'Закрываем кадровые потребности в сжатые сроки с отбором по специальности.',
  },
  {
    icon: 'shield' as const,
    title: 'Проверенные кандидаты',
    description: 'Отбираем специалистов с подтверждённым опытом и проверкой документов.',
  },
  {
    icon: 'passport' as const,
    title: 'Оформление документов',
    description: 'Берём на себя оформление виз, разрешений и юридическое сопровождение.',
  },
  {
    icon: 'team' as const,
    title: 'Сопровождение',
    description: 'Персональный координатор курирует персонал на всём сроке контракта.',
  },
  {
    icon: 'risk' as const,
    title: 'Снижение кадровых рисков',
    description: 'Оперативная замена при необходимости и минимизация простоев производства.',
  },
];

const WORKFLOW_STEPS = [
  { num: '1', icon: 'clipboard' as const, title: 'Заявка', desc: 'Оставьте заявку и опишите профиль персонала' },
  { num: '2', icon: 'search' as const, title: 'Подбор', desc: 'Отбираем подходящих кандидатов из базы' },
  { num: '3', icon: 'handshake' as const, title: 'Согласование', desc: 'Утверждаем условия и оформляем документы' },
  { num: '4', icon: 'hardhat' as const, title: 'Выход на работу', desc: 'Персонал приступает к работе на объекте' },
];

export function BusinessPage({ onOpenConsultation }: BusinessPageProps) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [staffCount, setStaffCount] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleApplyPlanToForm = (prefill: { staffCount: string; comment: string }) => {
    setStaffCount(prefill.staffCount);
    setComment(prefill.comment);
    setSubmitted(false);
    setErrors({});
    const formSection = document.getElementById('b2b-request-form');
    formSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      document.getElementById('b2b-company')?.focus();
    }, 350);
  };

  const handleB2BSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: 'b2b_request' as const,
      companyName,
      fullName: contactPerson,
      phone,
      staffCount,
      comment,
    };
    const check = validateLeadForm(payload);
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await submitLeadOrApplication(payload);
      setSubmitted(true);
      setCompanyName('');
      setContactPerson('');
      setPhone('');
      setStaffCount('');
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="pt-4 sm:pt-7">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="migrant-hero-surface rounded-[36px] px-6 pt-8 pb-0 sm:px-10 sm:pt-10 lg:px-12 relative overflow-hidden">
            <HeroWaveBackdrop className="absolute inset-x-0 bottom-0 w-full h-[170px] sm:h-[210px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-8">
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-start">
                <FloatingDuoStage>
                  <HeroCartoonDuo
                    alt="Подбор персонала MIGRANT"
                    className="w-[280px] sm:w-[350px] lg:w-[400px] max-w-full h-auto block"
                  />
                </FloatingDuoStage>
              </div>

              <HeroEntrance delay={0.05} className="lg:col-span-7 order-1 lg:order-2 text-center lg:text-left pb-4 lg:pb-12">
                <h1 className="text-[32px] sm:text-[42px] lg:text-[48px] font-extrabold leading-[1.08] text-[#0B224C] text-balance">
                  Подбираем персонал для вашего бизнеса
                </h1>
                <p className="mt-4 text-base text-[#2C446E] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Поставляем надёжный персонал для строительства, складов, производства, логистики и сферы услуг.
                </p>
                <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                  <a
                    href="#b2b-request-form"
                    className="migrant-btn-primary text-white font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    <span>Оставить заявку</span>
                  </a>
                  <button
                    type="button"
                    onClick={onOpenConsultation}
                    className="migrant-btn-secondary font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Получить консультацию</span>
                  </button>
                </div>
              </HeroEntrance>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {B2B_BENEFITS.map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx * 0.05} className="h-full">
              <article className="group migrant-card migrant-card-interactive rounded-3xl p-5 h-full text-center flex flex-col items-center">
                <div className="migrant-icon-pedestal w-16 h-16 rounded-2xl flex items-center justify-center mb-3.5">
                  <BlueFeatureIcon kind={item.icon} className="w-13 h-13" />
                </div>
                <h2 className="text-base font-bold text-[#0B224C] mb-1.5 leading-snug">{item.title}</h2>
                <p className="text-xs text-[#3B527A] leading-relaxed">{item.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] whitespace-nowrap">
              Как мы работаем
            </h2>
            <div className="hidden md:block w-px h-7 bg-[#CBDDF7]" aria-hidden="true" />
            <p className="text-sm text-[#3B527A]">
              Простой и прозрачный процесс подбора персонала для вашего бизнеса.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step, index) => (
            <ScrollReveal key={step.num} delay={index * 0.06} className="h-full">
              <div className="group relative migrant-card migrant-card-interactive rounded-3xl p-6 h-full flex flex-col items-center text-center">
                <span className="absolute left-4 top-4 w-7 h-7 rounded-full bg-gradient-to-b from-[#60A5FA] to-[#2563EB] text-white text-xs font-extrabold inline-flex items-center justify-center shadow-[0_4px_10px_rgba(37,99,235,0.3)] tabular-nums">
                  {step.num}
                </span>
                <div className="migrant-icon-pedestal w-16 h-16 rounded-2xl flex items-center justify-center mb-3.5">
                  <BlueFeatureIcon kind={step.icon} className="w-13 h-13" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0B224C] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[#3B527A] leading-relaxed">{step.desc}</p>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden lg:block w-5 h-5 text-[#1448A0] absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-0.5 shadow"
                  />
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-5">
            <div className="lg:col-span-3 text-center lg:text-left">
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#0B224C] leading-tight">
                Нам доверяют компании по всему миру
              </h2>
            </div>

            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-4">
                <div className="migrant-icon-pedestal w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                  <BlueFeatureIcon kind="team" className="w-11 h-11" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0B224C]">
                    <AnimatedMetricNumber target={10000} suffix="+" />
                  </p>
                  <p className="text-xs font-medium text-[#3B527A] leading-snug">трудоустроенных сотрудников</p>
                </div>
              </div>
              <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-4">
                <div className="migrant-icon-pedestal w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                  <BlueFeatureIcon kind="building" className="w-11 h-11" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0B224C]">
                    <AnimatedMetricNumber target={100} suffix="+" />
                  </p>
                  <p className="text-xs font-medium text-[#3B527A] leading-snug">компаний-партнёров из разных стран</p>
                </div>
              </div>
              <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-4">
                <div className="migrant-icon-pedestal w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                  <BlueFeatureIcon kind="calendar" className="w-11 h-11" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0B224C]">
                    <AnimatedMetricNumber target={7} suffix=" лет" />
                  </p>
                  <p className="text-xs font-medium text-[#3B527A] leading-snug">опыта международного рекрутинга</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <B2BSlaAndPlannerSection onApplyPlanToForm={handleApplyPlanToForm} />

      <section id="b2b-request-form" className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="migrant-cobalt-banner rounded-[32px] p-6 sm:p-10 pb-0 lg:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end overflow-hidden">
            <div className="lg:col-span-6 text-white flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-balance">
                  Подберите сотрудников для вашего бизнеса уже сегодня
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#DCEBFF]">
                  Оставьте заявку на персонал и наш координатор подготовит подборку кандидатов в течение 24 часов.
                </p>
              </div>
              <div className="mt-6 flex justify-center lg:justify-start">
                <HeroCartoonDuo
                  variant="cobalt"
                  alt="Персонал для бизнеса MIGRANT"
                  className="w-[260px] sm:w-[320px] max-w-full h-auto block"
                />
              </div>
            </div>

            <div className="lg:col-span-6 bg-white/98 rounded-3xl p-6 sm:p-7 mb-6 sm:mb-10 text-[#0B224C] shadow-[0_20px_50px_rgba(6,24,66,0.3)] border border-white">
            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Заявка компании получена</h3>
                <p className="text-sm text-[#3B527A] mb-5">
                  Менеджер корпоративного отдела свяжется с вами в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="migrant-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={handleB2BSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label htmlFor="b2b-company" className="sr-only">
                    Название компании
                  </label>
                  <input
                    id="b2b-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Название компании *"
                    className="migrant-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="b2b-contact" className="sr-only">
                    Контактное лицо
                  </label>
                  <input
                    id="b2b-contact"
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Контактное лицо *"
                    className="migrant-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="b2b-phone" className="sr-only">
                    Телефон
                  </label>
                  <input
                    id="b2b-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон *"
                    className="migrant-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                  {errors.phone && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="b2b-staff" className="sr-only">
                    Количество сотрудников
                  </label>
                  <select
                    id="b2b-staff"
                    value={staffCount}
                    onChange={(e) => setStaffCount(e.target.value)}
                    className="migrant-input w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="">Количество сотрудников *</option>
                    <option value="1–5 человек">1–5 человек</option>
                    <option value="5–15 человек">5–15 человек</option>
                    <option value="15–50 человек">15–50 человек</option>
                    <option value="50+ человек">50+ человек</option>
                  </select>
                  {errors.staffCount && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.staffCount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="b2b-comment" className="sr-only">
                    Комментарий
                  </label>
                  <textarea
                    id="b2b-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Комментарий (отрасль, страна объекта, сроки)"
                    className="migrant-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full migrant-btn-primary text-white font-semibold py-3.5 rounded-full text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Отправка...' : 'Оставить заявку'}</span>
                </button>
              </form>
            )}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
