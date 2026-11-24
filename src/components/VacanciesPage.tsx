import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, CheckCircle2, Headphones, Search, Send } from 'lucide-react';
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
  PREMIUM_EASE,
  ScrollReveal,
} from './MotionPrimitives';
import { IncomeEstimatorSection } from './ConversionSections';
import {
  COUNTRY_OPTIONS,
  filterVacancies,
  getUniqueCountries,
  getUniqueProfessions,
  validateLeadForm,
} from '../utils/vacancies';
import { submitLeadOrApplication } from '../utils/leadSubmit';
import { useAuth } from '../contexts/AuthContext';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { CountryCode, Vacancy } from '../types/migrant';

interface VacanciesPageProps {
  vacancies: Vacancy[];
  onApplyVacancy: (vacancy: Vacancy) => void;
  onOpenConsultation: () => void;
  onOpenLeadWithPrefill: (prefill: { country: string; comment: string }) => void;
}

export function VacanciesPage({
  vacancies,
  onApplyVacancy,
  onOpenConsultation,
  onOpenLeadWithPrefill,
}: VacanciesPageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('Все страны');
  const [selectedProfession, setSelectedProfession] = useState('Все профессии');
  const [searchQuery, setSearchQuery] = useState('');

  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickCountry, setQuickCountry] = useState('Германия');
  const [quickErrors, setQuickErrors] = useState<Record<string, string>>({});
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSent, setQuickSent] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const activeVacancies = useMemo(
    () => vacancies.filter((v) => v.active),
    [vacancies]
  );
  const countries = useMemo(() => getUniqueCountries(activeVacancies), [activeVacancies]);
  const professions = useMemo(() => getUniqueProfessions(activeVacancies), [activeVacancies]);

  const filteredVacancies = useMemo(
    () =>
      filterVacancies(activeVacancies, {
        country: selectedCountry,
        profession: selectedProfession,
        search: searchQuery,
      }),
    [activeVacancies, selectedCountry, selectedProfession, searchQuery]
  );

  const savedSet = useMemo(
    () => new Set(profile?.savedVacancyIds ?? []),
    [profile?.savedVacancyIds]
  );

  const toggleSaveVacancy = async (vacancyId: string) => {
    if (!user || !profile) {
      onApplyVacancy(activeVacancies.find((v) => v.id === vacancyId)!);
      return;
    }
    setSavingId(vacancyId);
    const current = profile.savedVacancyIds ?? [];
    const next = current.includes(vacancyId)
      ? current.filter((id) => id !== vacancyId)
      : [...current, vacancyId].slice(0, 20);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        savedVacancyIds: next,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: 'job_application' as const,
      fullName: quickName,
      phone: quickPhone,
      country: quickCountry,
    };
    const check = validateLeadForm(payload);
    if (!check.valid) {
      setQuickErrors(check.errors);
      return;
    }
    setQuickErrors({});
    setQuickSubmitting(true);
    try {
      await submitLeadOrApplication(payload);
      setQuickSent(true);
      setQuickName('');
      setQuickPhone('');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const getCountryCode = (countryName: string): CountryCode => {
    return COUNTRY_OPTIONS.find((c) => c.country === countryName)?.code ?? 'EU';
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="pt-4 sm:pt-7">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="migrant-hero-surface rounded-[36px] px-6 pt-8 pb-0 sm:px-10 sm:pt-10 lg:px-12 relative overflow-hidden">
            <HeroWaveBackdrop className="absolute inset-x-0 bottom-0 w-full h-[170px] sm:h-[210px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-8">
              <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-start">
                <FloatingDuoStage>
                  <HeroCartoonDuo
                    alt="Кандидаты MIGRANT"
                    className="w-[280px] sm:w-[350px] lg:w-[400px] max-w-full h-auto block"
                  />
                </FloatingDuoStage>
              </div>

              <HeroEntrance delay={0.05} className="lg:col-span-7 order-1 lg:order-2 text-center lg:text-left pb-4 lg:pb-12">
                <h1 className="text-[32px] sm:text-[42px] lg:text-[48px] font-extrabold leading-[1.08] text-[#0B224C] text-balance">
                  Работа за границей для соискателей
                </h1>
                <p className="mt-4 text-base text-[#2C446E] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Официальное трудоустройство за рубежом, проверенные вакансии от надёжных работодателей и полная поддержка на всех этапах.
                </p>
                <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                  <a
                    href="#vacancies-catalog"
                    className="migrant-btn-primary text-white font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    <span>Найти вакансию</span>
                  </a>
                  <button
                    type="button"
                    onClick={onOpenConsultation}
                    className="migrant-btn-secondary font-semibold px-6 py-3 rounded-full text-sm inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Получить консультацию</span>
                  </button>
                </div>
              </HeroEntrance>
            </div>
          </div>
        </div>
      </section>

      <section id="vacancies-catalog" className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="migrant-card rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <p className="text-base font-bold text-[#0B224C] mb-3">
                Быстрый подбор вакансий
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="filter-country" className="sr-only">
                    Страна
                  </label>
                  <select
                    id="filter-country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm font-medium text-[#0B224C]"
                  >
                    <option value="Все страны">Все страны</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-profession" className="sr-only">
                    Профессия
                  </label>
                  <select
                    id="filter-profession"
                    value={selectedProfession}
                    onChange={(e) => setSelectedProfession(e.target.value)}
                    className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm font-medium text-[#0B224C]"
                  >
                    <option value="Все профессии">Все профессии</option>
                    {professions.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label htmlFor="filter-search" className="sr-only">
                    Поиск по названию
                  </label>
                  <Search className="w-4 h-4 text-[#546B91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="filter-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск вакансии..."
                    className="migrant-input w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm text-[#0B224C]"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCountry('Все страны');
                setSelectedProfession('Все профессии');
                setSearchQuery('');
              }}
              className="migrant-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full whitespace-nowrap shrink-0 cursor-pointer"
            >
              Сбросить фильтр ({filteredVacancies.length})
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E6F0FF] flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCountry('Все страны')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedCountry === 'Все страны'
                  ? 'bg-[#1448A0] text-white'
                  : 'bg-[#EFF6FF] text-[#1E355E] hover:bg-[#DCEBFF]'
              }`}
            >
              Все страны
            </button>
            {countries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setSelectedCountry(country)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedCountry === country
                    ? 'bg-[#1448A0] text-white'
                    : 'bg-[#EFF6FF] text-[#1E355E] hover:bg-[#DCEBFF]'
                }`}
              >
                <CountryFlag code={getCountryCode(country)} className="w-4 h-4" />
                <span>{country}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {filteredVacancies.length === 0 ? (
          <div className="migrant-card rounded-3xl p-10 text-center">
            <h2 className="text-xl font-bold text-[#0B224C] mb-2">
              По выбранным параметрам вакансий не найдено
            </h2>
            <p className="text-sm text-[#3B527A] mb-5">
              Попробуйте сбросить фильтры или оставьте заявку — мы подберём предложение индивидуально.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCountry('Все страны');
                setSelectedProfession('Все профессии');
                setSearchQuery('');
              }}
              className="migrant-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer"
            >
              Показать все вакансии
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVacancies.map((vacancy, idx) => {
              const isSaved = savedSet.has(vacancy.id);
              return (
                <motion.article
                  key={vacancy.id}
                  layout="position"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, delay: Math.min(idx * 0.04, 0.2), ease: PREMIUM_EASE }}
                  data-testid="vacancy-card"
                  className="group migrant-card migrant-card-interactive rounded-3xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="inline-flex items-center gap-2 text-sm font-bold text-[#0B224C]">
                        <CountryFlag code={vacancy.countryCode} variant="pill" className="w-7 h-5" />
                        <span>{vacancy.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {user && (
                          <button
                            type="button"
                            disabled={savingId === vacancy.id}
                            onClick={() => toggleSaveVacancy(vacancy.id)}
                            aria-label={
                              isSaved
                                ? `Удалить "${vacancy.title}" из сохранённых`
                                : `Сохранить "${vacancy.title}" в кабинет`
                            }
                            className={`p-2 rounded-full border transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-[#DCEBFF] border-[#93C5FD] text-[#1448A0]'
                                : 'bg-white border-[#E2EDFF] text-[#546B91] hover:text-[#1448A0]'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="migrant-icon-pedestal flex items-center justify-center py-2.5 mb-3.5 rounded-2xl">
                      <VacancyJobIcon type={vacancy.iconType} className="w-18 h-18" />
                    </div>

                    <h2 className="text-xl font-extrabold text-[#0B224C] mb-1">
                      {vacancy.title}
                    </h2>
                    <p className="text-xs font-medium text-[#546B91] mb-3">
                      {vacancy.profession}
                    </p>

                    <ul className="space-y-1.5 text-sm text-[#2C446E] mb-4">
                      <li>{vacancy.contractType}</li>
                      <li>{vacancy.schedule}</li>
                      <li>{vacancy.housing}</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#E2EDFF]">
                    <p className="text-base sm:text-lg font-extrabold text-[#0B224C] tabular-nums">
                      {vacancy.salaryText}
                    </p>
                    <p className="text-sm font-bold text-[#1448A0] tabular-nums mb-4">
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
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <IncomeEstimatorSection onRequestMatch={onOpenLeadWithPrefill} />

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal>
          <div className="migrant-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="migrant-icon-pedestal w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                <BlueFeatureIcon kind="clipboard" className="w-11 h-11" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B224C]">
                  Быстрая заявка — 0 € за подбор
                </h2>
                <p className="text-sm text-[#3B527A] mt-0.5">
                  Оставьте контакты — координатор подберёт 2–3 подходящие вакансии с жильём и свяжется за 15 минут.
                </p>
              </div>
            </div>

            {quickSent ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-[#16A34A]" />
                <div className="text-sm font-medium">
                  Заявка принята! Координатор свяжется с вами в ближайшее время.
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" noValidate>
                <div>
                  <label htmlFor="quick-name" className="sr-only">
                    Имя
                  </label>
                  <input
                    id="quick-name"
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Имя"
                    className="migrant-input w-full px-4 py-3 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                  />
                  {quickErrors.fullName && (
                    <p className="text-xs text-[#DC2626] mt-1">{quickErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-phone" className="sr-only">
                    Телефон
                  </label>
                  <input
                    id="quick-phone"
                    type="tel"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="Телефон"
                    className="migrant-input w-full px-4 py-3 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                  />
                  {quickErrors.phone && (
                    <p className="text-xs text-[#DC2626] mt-1">{quickErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-country" className="sr-only">
                    Желаемая страна
                  </label>
                  <select
                    id="quick-country"
                    value={quickCountry}
                    onChange={(e) => setQuickCountry(e.target.value)}
                    className="migrant-input w-full px-4 py-3 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.country}>
                        {c.country}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="migrant-btn-primary text-white font-semibold py-3 px-6 rounded-full text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{quickSubmitting ? 'Отправка...' : 'Оставить заявку'}</span>
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
