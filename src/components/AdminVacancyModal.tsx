import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Check, Send, Sparkles, X } from 'lucide-react';
import { CountryFlag, VacancyJobIcon } from './MigrantIcons';
import { PREMIUM_EASE } from './MotionPrimitives';
import {
  COUNTRY_OPTIONS,
  ICON_TYPE_OPTIONS,
  PROFESSION_OPTIONS,
} from '../utils/vacancies';
import {
  QUICK_CONTRACT_CHIPS,
  QUICK_HOUSING_CHIPS,
  QUICK_SCHEDULE_CHIPS,
  VACANCY_TEMPLATES,
} from '../utils/adminHelpers';
import type { CountryCode, IconType, Vacancy, VacancyInput } from '../types/migrant';

interface AdminVacancyModalProps {
  open: boolean;
  editingVacancy: Vacancy | null;
  hasFirestoreVacancies: boolean;
  form: VacancyInput;
  errors: Record<string, string>;
  saving: boolean;
  onChange: (next: VacancyInput) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AdminVacancyModal({
  open,
  editingVacancy,
  hasFirestoreVacancies,
  form,
  errors,
  saving,
  onChange,
  onSave,
  onClose,
}: AdminVacancyModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, saving, onClose]);

  const descLen = form.description.trim().length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-vacancy-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vacancy-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#07183B]/55 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: PREMIUM_EASE }}
            className="bg-gradient-to-b from-white to-[#F7FAFF] rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-[0_30px_80px_rgba(7,24,59,0.35)] border border-white relative max-h-[92vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Закрыть окно вакансии"
              className="absolute top-4 right-4 p-2 rounded-full text-[#3B527A] hover:bg-[#EBF3FF] hover:text-[#0B224C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10 mb-5">
              <h2 id="vacancy-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#0B224C]">
                {editingVacancy ? 'Редактировать вакансию' : 'Добавить новую вакансию'}
              </h2>
              <p className="text-xs sm:text-sm text-[#3B527A] mt-0.5">
                {editingVacancy && !hasFirestoreVacancies
                  ? 'Сохранение создаст эту вакансию в базе Firestore и переведёт каталог в управляемый режим.'
                  : 'Заполните поля вручную или выберите готовый шаблон — справа сразу видно, как карточка отобразится на сайте.'}
              </p>
            </div>

            {/* 1-Click Quick Templates */}
            {!editingVacancy && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#EFF6FF]/90 border border-[#DCEBFF]">
                <p className="text-xs font-bold text-[#1448A0] mb-2 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Быстрые шаблоны (заполнят все поля за 1 клик):</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {VACANCY_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => onChange({ ...tpl.data })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#CBDDF7] hover:border-[#1448A0] hover:bg-[#F5F9FF] text-xs font-semibold text-[#0B224C] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <CountryFlag code={tpl.data.countryCode} className="w-4 h-4" />
                      <span>{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Fields */}
              <form onSubmit={onSave} className="lg:col-span-8 space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label htmlFor="vac-title" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Название вакансии *
                    </label>
                    <input
                      id="vac-title"
                      type="text"
                      maxLength={120}
                      value={form.title}
                      onChange={(e) => onChange({ ...form, title: e.target.value })}
                      placeholder="Например: Сантехник / Монтажник ОВК"
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    {errors.title && <p className="text-xs text-[#DC2626] mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="vac-country" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Страна *
                    </label>
                    <select
                      id="vac-country"
                      value={form.country}
                      onChange={(e) => {
                        const found = COUNTRY_OPTIONS.find((c) => c.country === e.target.value);
                        onChange({
                          ...form,
                          country: e.target.value,
                          countryCode: (found?.code ?? 'EU') as CountryCode,
                        });
                      }}
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.country}>
                          {c.country}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.country}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vac-profession" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Категория профессии *
                    </label>
                    <select
                      id="vac-profession"
                      value={form.profession}
                      onChange={(e) => onChange({ ...form, profession: e.target.value })}
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    >
                      {PROFESSION_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {errors.profession && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.profession}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vac-salary" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Ставка (час / базовая) *
                    </label>
                    <input
                      id="vac-salary"
                      type="text"
                      maxLength={60}
                      value={form.salaryText}
                      onChange={(e) => onChange({ ...form, salaryText: e.target.value })}
                      placeholder="14–16 €/час нетто"
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    {errors.salaryText && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.salaryText}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vac-monthly" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Доход в месяц *
                    </label>
                    <input
                      id="vac-monthly"
                      type="text"
                      maxLength={60}
                      value={form.salaryMonthlyText}
                      onChange={(e) => onChange({ ...form, salaryMonthlyText: e.target.value })}
                      placeholder="от 2 600 € / мес."
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    {errors.salaryMonthlyText && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.salaryMonthlyText}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vac-schedule" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      График работы *
                    </label>
                    <input
                      id="vac-schedule"
                      type="text"
                      maxLength={80}
                      value={form.schedule}
                      onChange={(e) => onChange({ ...form, schedule: e.target.value })}
                      placeholder="График: 8–10 ч/день"
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {QUICK_SCHEDULE_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => onChange({ ...form, schedule: chip })}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#EFF6FF] hover:bg-[#DCEBFF] text-[#1448A0] font-medium cursor-pointer"
                        >
                          {chip.replace('График: ', '')}
                        </button>
                      ))}
                    </div>
                    {errors.schedule && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.schedule}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vac-housing" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Проживание *
                    </label>
                    <input
                      id="vac-housing"
                      type="text"
                      maxLength={80}
                      value={form.housing}
                      onChange={(e) => onChange({ ...form, housing: e.target.value })}
                      placeholder="Проживание: предоставляется"
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {QUICK_HOUSING_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => onChange({ ...form, housing: chip })}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#EFF6FF] hover:bg-[#DCEBFF] text-[#1448A0] font-medium cursor-pointer"
                        >
                          {chip.replace('Проживание: ', '')}
                        </button>
                      ))}
                    </div>
                    {errors.housing && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.housing}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="vac-contract" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Тип оформления / договора *
                    </label>
                    <input
                      id="vac-contract"
                      type="text"
                      maxLength={80}
                      value={form.contractType}
                      onChange={(e) => onChange({ ...form, contractType: e.target.value })}
                      placeholder="Официальное оформление"
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {QUICK_CONTRACT_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => onChange({ ...form, contractType: chip })}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#EFF6FF] hover:bg-[#DCEBFF] text-[#1448A0] font-medium cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    {errors.contractType && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.contractType}</p>
                    )}
                  </div>
                </div>

                {/* Visual 3D Icon Picker */}
                <div>
                  <p className="block text-xs font-semibold text-[#1E355E] mb-2">
                    3D-иконка карточки
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {ICON_TYPE_OPTIONS.map((opt) => {
                      const selected = form.iconType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onChange({ ...form, iconType: opt.value as IconType })}
                          aria-pressed={selected}
                          title={opt.label}
                          className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#EBF3FF] border-[#1448A0] shadow-[0_6px_16px_rgba(20,72,160,0.14)]'
                              : 'bg-white border-[#DCEBFF] hover:border-[#93C5FD]'
                          }`}
                        >
                          <VacancyJobIcon type={opt.value} className="w-10 h-10" />
                          <span className="text-[10px] font-semibold text-[#1E355E] leading-tight text-center line-clamp-1">
                            {opt.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="vac-desc" className="block text-xs font-semibold text-[#1E355E]">
                      Описание и требования *
                    </label>
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        descLen < 10 ? 'text-[#B45309]' : 'text-[#546B91]'
                      }`}
                    >
                      {descLen} / 1500
                    </span>
                  </div>
                  <textarea
                    id="vac-desc"
                    rows={3}
                    maxLength={1500}
                    value={form.description}
                    onChange={(e) => onChange({ ...form, description: e.target.value })}
                    placeholder="Опишите обязанности, требования к опыту, условия проживания и выплаты (минимум 10 символов)..."
                    className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                  {errors.description && (
                    <p className="text-xs text-[#DC2626] mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E6F0FF]">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.active}
                    onClick={() => onChange({ ...form, active: !form.active })}
                    className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#0B224C] cursor-pointer"
                  >
                    <span
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                        form.active ? 'bg-[#16A34A] justify-end' : 'bg-[#CBD5E1] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
                    </span>
                    <span>
                      {form.active ? 'Опубликовать на сайте сразу' : 'Сохранить как черновик (скрыта)'}
                    </span>
                  </button>

                  <div className="flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={saving}
                      className="migrant-btn-secondary px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="migrant-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Check className="w-4 h-4" />
                      <span>{saving ? 'Сохранение...' : 'Сохранить вакансию'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Real-Time Live Card Preview */}
              <div className="lg:col-span-4 lg:sticky lg:top-2 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#546B91]">
                  Предпросмотр на сайте
                </p>
                <div className="migrant-card rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="inline-flex items-center gap-2 text-sm font-bold text-[#0B224C]">
                        <CountryFlag code={form.countryCode} variant="pill" className="w-7 h-5" />
                        <span>{form.country || 'Страна'}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                          form.active
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#F1F5F9] text-[#475569]'
                        }`}
                      >
                        {form.active ? 'На сайте' : 'Скрыта'}
                      </span>
                    </div>

                    <div className="migrant-icon-pedestal flex items-center justify-center py-2.5 mb-3 rounded-2xl">
                      <VacancyJobIcon type={form.iconType} className="w-16 h-16" />
                    </div>

                    <h3 className="text-lg font-extrabold text-[#0B224C] leading-snug">
                      {form.title.trim() || 'Название вакансии'}
                    </h3>
                    <p className="text-xs font-medium text-[#546B91] mt-0.5 mb-3">
                      {form.profession || 'Категория'}
                    </p>

                    <ul className="space-y-1 text-xs text-[#2C446E] mb-4">
                      <li>{form.contractType.trim() || 'Тип оформления'}</li>
                      <li>{form.schedule.trim() || 'График работы'}</li>
                      <li>{form.housing.trim() || 'Условия проживания'}</li>
                    </ul>
                  </div>

                  <div className="pt-3.5 border-t border-[#E2EDFF]">
                    <p className="text-sm font-extrabold text-[#0B224C] tabular-nums">
                      {form.salaryText.trim() || 'Ставка'}
                    </p>
                    <p className="text-xs font-bold text-[#1448A0] tabular-nums mb-3">
                      {form.salaryMonthlyText.trim() || 'Доход в месяц'}
                    </p>
                    <div className="w-full migrant-btn-primary text-white text-xs font-semibold py-2 rounded-full inline-flex items-center justify-center gap-1.5 opacity-90 select-none">
                      <Send className="w-3.5 h-3.5" />
                      <span>Оставить заявку</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Удалить',
  busy = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onCancel]);

  const isPrimary = tone === 'primary';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) onCancel();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07183B]/55 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: PREMIUM_EASE }}
            className={`bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border ${
              isPrimary ? 'border-[#DCEBFF]' : 'border-[#FEE2E2]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                  isPrimary
                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1448A0]'
                    : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                }`}
              >
                {isPrimary ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h2 id="confirm-dialog-title" className="text-lg font-extrabold text-[#0B224C]">
                  {title}
                </h2>
                <p id="confirm-dialog-desc" className="text-sm text-[#3B527A] mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="migrant-btn-secondary px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onConfirm}
                className={`${
                  isPrimary
                    ? 'migrant-btn-primary text-white'
                    : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                } px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60`}
              >
                {busy ? 'Выполнение...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
