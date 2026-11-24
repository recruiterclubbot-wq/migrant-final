import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  LogIn,
  LogOut,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRY_OPTIONS } from '../utils/vacancies';
import { CountryFlag } from './MigrantIcons';
import type {
  AccountType,
  ApplicationStatus,
  LeadOrApplication,
  PageRoute,
  Vacancy,
} from '../types/migrant';

interface CabinetPageProps {
  vacancies: Vacancy[];
  onNavigate: (route: PageRoute) => void;
  onApplyVacancy: (vacancy: Vacancy) => void;
  onOpenLeadModal: () => void;
}

const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string }> = {
  new: { label: 'Новая', color: 'text-[#1D4ED8] bg-[#EFF6FF]' },
  in_progress: { label: 'В работе', color: 'text-[#B45309] bg-[#FEF3C7]' },
  approved: { label: 'Одобрена', color: 'text-[#15803D] bg-[#DCFCE7]' },
  rejected: { label: 'Отклонена', color: 'text-[#B91C1C] bg-[#FEE2E2]' },
};

export function CabinetPage({
  vacancies,
  onNavigate,
  onApplyVacancy,
  onOpenLeadModal,
}: CabinetPageProps) {
  const { user, profile, isAdmin, authReady, authError, signInWithGoogle, signOutUser, refreshProfile } =
    useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('candidate');
  const [desiredCountry, setDesiredCountry] = useState('Германия');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [myApplications, setMyApplications] = useState<LeadOrApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || '');
    setPhone(profile.phone || '');
    setCompanyName(profile.companyName || '');
    setAccountType(profile.accountType || 'candidate');
    setDesiredCountry(profile.desiredCountry || 'Германия');
    setBio(profile.bio || '');
  }, [profile]);

  useEffect(() => {
    if (!authReady || !user) {
      setMyApplications([]);
      return;
    }

    setAppsLoading(true);
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: LeadOrApplication[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          return {
            id: d.id,
            sourceCollection: 'applications',
            userId: data.userId,
            type: data.type,
            vacancyId: data.vacancyId,
            vacancyTitle: data.vacancyTitle,
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            country: data.country,
            companyName: data.companyName,
            staffCount: data.staffCount,
            comment: data.comment,
            status: data.status,
            adminNote: data.adminNote,
            createdAtMs: ts,
          };
        });
        setMyApplications(items);
        setAppsLoading(false);
      },
      (error) => {
        setAppsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'applications');
      }
    );

    return () => unsub();
  }, [authReady, user]);

  const savedVacancies = useMemo(() => {
    const ids = new Set(profile?.savedVacancyIds ?? []);
    return vacancies.filter((v) => ids.has(v.id));
  }, [vacancies, profile?.savedVacancyIds]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setSavedNotice(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: fullName.trim() || user.displayName || 'Пользователь',
        phone: phone.trim(),
        companyName: companyName.trim(),
        accountType,
        desiredCountry,
        bio: bio.trim(),
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      setSavedNotice(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSavingProfile(false);
    }
  };

  if (!authReady) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10">
        <div className="migrant-card rounded-3xl p-10 text-center text-sm text-[#3B527A]">
          Загрузка профиля...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="migrant-card rounded-[32px] p-8 sm:p-10 text-center">
          <div className="migrant-icon-pedestal w-16 h-16 rounded-2xl text-[#1448A0] flex items-center justify-center mx-auto mb-5">
            <UserIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] mb-3">
            Личный кабинет MIGRANT
          </h1>
          <p className="text-sm sm:text-base text-[#3B527A] mb-6 leading-relaxed">
            Войдите через защищённый аккаунт Google, чтобы отслеживать статус ваших заявок, сохранять вакансии и управлять профилем соискателя или работодателя.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={signInWithGoogle}
            className="migrant-btn-primary text-white font-semibold px-8 py-3.5 rounded-full inline-flex items-center gap-2.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Войти через Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8 space-y-8">
      {/* Header strip */}
      <div className="migrant-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#546B91]">
            Личный кабинет · {profile?.role === 'employer' ? 'Работодатель' : 'Соискатель'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] mt-0.5">
            {profile?.fullName || user.displayName || user.email}
          </h1>
          <p className="text-sm text-[#3B527A]">{user.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="migrant-btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Открыть админ-панель</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenLeadModal}
            className="bg-white border border-[#BBD4FA] text-[#1448A0] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#EFF6FF] cursor-pointer"
          >
            Новая заявка
          </button>
          <button
            type="button"
            onClick={signOutUser}
            className="bg-white border border-[#E2EDFF] text-[#3B527A] text-sm font-semibold px-4 py-2.5 rounded-full hover:text-[#B91C1C] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {profile?.status === 'blocked' && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
          Ваш аккаунт временно ограничен администратором. Для уточнения деталей свяжитесь со службой поддержки MIGRANT.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Form */}
        <section className="lg:col-span-5 migrant-card rounded-3xl p-6">
          <h2 className="text-lg font-extrabold text-[#0B224C] mb-4">
            Данные профиля
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label htmlFor="cab-type" className="block text-xs font-semibold text-[#1E355E] mb-1">
                Тип профиля
              </label>
              <select
                id="cab-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              >
                <option value="candidate">Соискатель (ищу работу)</option>
                <option value="employer">Работодатель (нужен персонал)</option>
              </select>
            </div>

            <div>
              <label htmlFor="cab-name" className="block text-xs font-semibold text-[#1E355E] mb-1">
                Имя и фамилия
              </label>
              <input
                id="cab-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            <div>
              <label htmlFor="cab-phone" className="block text-xs font-semibold text-[#1E355E] mb-1">
                Телефон / Telegram
              </label>
              <input
                id="cab-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380 ..."
                className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {accountType === 'employer' && (
              <div>
                <label htmlFor="cab-company" className="block text-xs font-semibold text-[#1E355E] mb-1">
                  Название компании
                </label>
                <input
                  id="cab-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            )}

            <div>
              <label htmlFor="cab-country" className="block text-xs font-semibold text-[#1E355E] mb-1">
                Предпочтительная страна
              </label>
              <select
                id="cab-country"
                value={desiredCountry}
                onChange={(e) => setDesiredCountry(e.target.value)}
                className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cab-bio" className="block text-xs font-semibold text-[#1E355E] mb-1">
                Опыт / специализация
              </label>
              <textarea
                id="cab-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Кратко опишите ваш опыт работы, наличие документов или потребности компании..."
                className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {savedNotice && (
              <p className="text-xs font-semibold text-[#15803D] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Профиль сохранён</span>
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile || profile?.status === 'blocked'}
              className="w-full migrant-btn-primary text-white font-semibold py-2.5 rounded-full text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Сохранение...' : 'Сохранить профиль'}</span>
            </button>
          </form>
        </section>

        {/* Applications & Saved Vacancies */}
        <div className="lg:col-span-7 space-y-6">
          <section className="migrant-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-[#0B224C] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1448A0]" />
                <span>Мои заявки и отклики</span>
              </h2>
              <span className="text-xs font-mono tabular-nums text-[#546B91]">
                Всего: {myApplications.length}
              </span>
            </div>

            {appsLoading ? (
              <p className="text-sm text-[#3B527A]">Загрузка заявок...</p>
            ) : myApplications.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-[#E2EDFF] text-center">
                <p className="text-sm text-[#3B527A] mb-4">
                  Вы ещё не отправляли заявок через личный кабинет.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/vacancies')}
                  className="migrant-btn-primary text-white text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer"
                >
                  Выбрать вакансию
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myApplications.map((app) => {
                  const statusMeta = STATUS_LABELS[app.status] ?? STATUS_LABELS.new;
                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-2xl p-4 border border-[#E2EDFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-sm text-[#0B224C]">
                          {app.vacancyTitle || (app.type === 'b2b_request' ? `B2B: ${app.companyName || 'Подбор персонала'}` : 'Консультация')}
                        </p>
                        <p className="text-xs text-[#546B91] mt-0.5 tabular-nums">
                          {new Date(app.createdAtMs).toLocaleDateString('ru-RU')} · {app.country || 'Любая страна'}
                        </p>
                        {app.adminNote && (
                          <p className="text-xs text-[#1E355E] mt-1.5">
                            Комментарий менеджера: {app.adminNote}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap self-start sm:self-center ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="migrant-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-[#0B224C] flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#1448A0]" />
                <span>Сохранённые вакансии</span>
              </h2>
              <span className="text-xs font-mono tabular-nums text-[#546B91]">
                {savedVacancies.length}
              </span>
            </div>

            {savedVacancies.length === 0 ? (
              <p className="text-sm text-[#3B527A]">
                Нажмите на иконку закладки в каталоге вакансий, чтобы сохранить интересные предложения здесь.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedVacancies.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl p-4 border border-[#E2EDFF] flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#3B527A]">
                        <CountryFlag code={v.countryCode} className="w-4 h-4" />
                        <span>{v.country}</span>
                      </div>
                      <h3 className="font-bold text-[#0B224C] mt-1">{v.title}</h3>
                      <p className="text-xs font-bold text-[#1448A0] tabular-nums mt-0.5">
                        {v.salaryMonthlyText}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onApplyVacancy(v)}
                      className="migrant-btn-primary text-white text-xs font-semibold py-2 rounded-full cursor-pointer"
                    >
                      Откликнуться
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
