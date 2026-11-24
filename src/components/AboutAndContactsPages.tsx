import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import {
  BlueFeatureIcon,
  CountryFlag,
  HeroCartoonDuo,
  HeroWaveBackdrop,
} from './MigrantIcons';
import {
  AnimatedMetricNumber,
  FloatingDuoStage,
  HeroEntrance,
  ScrollReveal,
} from './MotionPrimitives';
import { validateLeadForm } from '../utils/vacancies';
import { submitLeadOrApplication } from '../utils/leadSubmit';
import type { PageRoute } from '../types/migrant';

export function AboutPage({
  onNavigate,
  onOpenLeadModal,
}: {
  onNavigate: (route: PageRoute) => void;
  onOpenLeadModal: () => void;
}) {
  return (
    <div className="space-y-12 pt-4 sm:pt-7">
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="migrant-hero-surface rounded-[36px] px-6 pt-8 pb-0 sm:px-10 sm:pt-10 relative overflow-hidden">
          <HeroWaveBackdrop className="absolute inset-x-0 bottom-0 w-full h-[170px] sm:h-[210px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <HeroEntrance delay={0.05} className="lg:col-span-7 pb-6 lg:pb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B224C] leading-tight text-balance">
                О компании MIGRANT
              </h1>
              <p className="mt-4 text-base text-[#2C446E] leading-relaxed">
                С 2019 года международное агентство MIGRANT организует легальное трудоустройство специалистов за рубежом и комплектует штат для промышленных, строительных и логистических компаний в Европе и Украине.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/vacancies')}
                  className="migrant-btn-primary text-white text-sm font-semibold px-6 py-3 rounded-full cursor-pointer whitespace-nowrap"
                >
                  Смотреть вакансии
                </button>
                <button
                  type="button"
                  onClick={onOpenLeadModal}
                  className="migrant-btn-secondary text-sm font-semibold px-6 py-3 rounded-full cursor-pointer whitespace-nowrap"
                >
                  Связаться с нами
                </button>
              </div>
            </HeroEntrance>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <FloatingDuoStage>
                <HeroCartoonDuo
                  alt="Международная команда MIGRANT"
                  className="w-[270px] sm:w-[340px] max-w-full h-auto block"
                />
              </FloatingDuoStage>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-3.5">
              <div className="migrant-icon-pedestal w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <BlueFeatureIcon kind="team" className="w-10 h-10" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1448A0]">
                  <AnimatedMetricNumber target={10000} suffix="+" />
                </p>
                <p className="text-xs text-[#3B527A]">трудоустроенных</p>
              </div>
            </div>
            <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-3.5">
              <div className="migrant-icon-pedestal w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <BlueFeatureIcon kind="building" className="w-10 h-10" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1448A0]">
                  <AnimatedMetricNumber target={100} suffix="+" />
                </p>
                <p className="text-xs text-[#3B527A]">компаний-партнёров</p>
              </div>
            </div>
            <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-3.5">
              <div className="migrant-icon-pedestal w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <BlueFeatureIcon kind="calendar" className="w-10 h-10" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1448A0]">
                  <AnimatedMetricNumber target={7} suffix=" лет" />
                </p>
                <p className="text-xs text-[#3B527A]">опыта на рынке</p>
              </div>
            </div>
            <div className="group migrant-card migrant-card-interactive rounded-3xl p-5 flex items-center gap-3.5">
              <div className="migrant-icon-pedestal w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <BlueFeatureIcon kind="globe" className="w-10 h-10" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1448A0]">
                  <AnimatedMetricNumber target={6} suffix="+" />
                </p>
                <p className="text-xs text-[#3B527A]">стран присутствия</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-[#0B224C] mb-8">
            Наши принципы работы
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: 'shield' as const,
              title: 'Только легальные контракты',
              desc: 'Мы проверяем каждого работодателя, лицензии, условия проживания и гарантии своевременной оплаты труда.',
            },
            {
              icon: 'passport' as const,
              title: 'Полная визовая поддержка',
              desc: 'Оформляем рабочие приглашения, страховки, регистрацию и помогаем с переездом и адаптацией.',
            },
            {
              icon: 'team' as const,
              title: 'Персональный куратор',
              desc: 'Сопровождаем кандидатов и корпоративных заказчиков на русском и украинском языках до выхода на объект и далее.',
            },
          ].map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx * 0.06} className="h-full">
              <article className="group migrant-card migrant-card-interactive rounded-3xl p-6 h-full">
                <div className="migrant-icon-pedestal w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                  <BlueFeatureIcon kind={item.icon} className="w-13 h-13" />
                </div>
                <h3 className="text-lg font-bold text-[#0B224C] mb-2">{item.title}</h3>
                <p className="text-sm text-[#3B527A] leading-relaxed">{item.desc}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="migrant-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B224C] mb-4">
              Ключевые направления трудоустройства
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { code: 'DE' as const, name: 'Германия', desc: 'Строительство, монтаж, сервис' },
                { code: 'PL' as const, name: 'Польша', desc: 'Склады, логистика, производство' },
                { code: 'CZ' as const, name: 'Чехия', desc: 'Заводы, операторы линий' },
                { code: 'UA' as const, name: 'Украина', desc: 'Логистика, офисный персонал' },
              ].map((item) => (
                <div key={item.code} className="bg-white/95 rounded-2xl p-4 border border-[#E2EDFF] hover:border-[#93C5FD] transition-all hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-[#0B224C] mb-1.5">
                    <CountryFlag code={item.code} variant="pill" className="w-7 h-5" />
                    <span>{item.name}</span>
                  </div>
                  <p className="text-xs text-[#3B527A]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

export function ContactsPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: 'consultation' as const,
      fullName,
      phone,
      email,
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
      setFullName('');
      setPhone('');
      setEmail('');
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B224C]">
          Контакты агентства MIGRANT
        </h1>
        <p className="mt-3 text-base text-[#3B527A]">
          Ответим на вопросы по вакансиям за рубежом, документам и подбору персонала для вашего бизнеса.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ScrollReveal className="lg:col-span-5 space-y-4">
          <div className="migrant-card rounded-3xl p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="migrant-icon-pedestal w-11 h-11 rounded-xl text-[#1448A0] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B224C]">Телефон и мессенджеры</h2>
                <p className="text-sm text-[#3B527A] tabular-nums mt-0.5">+48 22 000 00 00 · +49 30 000 00 00</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="migrant-icon-pedestal w-11 h-11 rounded-xl text-[#1448A0] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B224C]">Электронная почта</h2>
                <p className="text-sm text-[#3B527A] mt-0.5">info@migrant-agency.eu</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="migrant-icon-pedestal w-11 h-11 rounded-xl text-[#1448A0] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B224C]">Представительства</h2>
                <p className="text-sm text-[#3B527A] mt-0.5">
                  Варшава · Берлин · Прага · Киев (онлайн-сопровождение по всему ЕС)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="migrant-icon-pedestal w-11 h-11 rounded-xl text-[#1448A0] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B224C]">График работы</h2>
                <p className="text-sm text-[#3B527A] mt-0.5">Пн–Сб: 09:00 – 19:00 (CET)</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="lg:col-span-7">
          <div className="migrant-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-extrabold text-[#0B224C] mb-1">
              Напишите нам напрямую
            </h2>
            <p className="text-sm text-[#3B527A] mb-5">
              Все обращения автоматически регистрируются в CRM и отправляются координатору.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto mb-2" />
                <p className="font-bold text-[#065F46]">Сообщение отправлено!</p>
                <p className="text-sm text-[#047857] mt-1">
                  Мы получили ваш запрос и скоро свяжемся с вами.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Имя *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ваше имя"
                      className="migrant-input w-full px-4 py-2.5 rounded-xl text-sm"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Телефон / Telegram *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+380 ..."
                      className="migrant-input w-full px-4 py-2.5 rounded-xl text-sm"
                    />
                    {errors.phone && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-[#1E355E] mb-1">
                    Email (необязательно)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="migrant-input w-full px-4 py-2.5 rounded-xl text-sm"
                  />
                  {errors.email && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-comment" className="block text-xs font-semibold text-[#1E355E] mb-1">
                    Сообщение
                  </label>
                  <textarea
                    id="contact-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Опишите ваш вопрос или запрос..."
                    className="migrant-input w-full px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="migrant-btn-primary text-white font-semibold px-7 py-3 rounded-full text-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Отправка...' : 'Отправить сообщение'}</span>
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
