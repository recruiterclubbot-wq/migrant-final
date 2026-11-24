import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Send, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRY_OPTIONS, validateLeadForm } from '../utils/vacancies';
import {
  PREFERRED_CHANNELS,
  formatCommentWithChannel,
  type PreferredChannel,
} from '../utils/marketing';
import { submitLeadOrApplication } from '../utils/leadSubmit';
import { PREMIUM_EASE } from './MotionPrimitives';
import type { LeadType, Vacancy } from '../types/migrant';

export interface LeadModalPrefill {
  country?: string;
  comment?: string;
  staffCount?: string;
}

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: LeadType;
  vacancy?: Vacancy | null;
  prefill?: LeadModalPrefill | null;
}

const MODAL_TABS: Array<{ id: LeadType; label: string }> = [
  { id: 'job_application', label: 'Ищу работу' },
  { id: 'b2b_request', label: 'Для бизнеса' },
  { id: 'consultation', label: 'Консультация' },
];

export function LeadModal({
  open,
  onClose,
  defaultType = 'consultation',
  vacancy = null,
  prefill = null,
}: LeadModalProps) {
  const { user, profile } = useAuth();
  const [leadType, setLeadType] = useState<LeadType>(defaultType);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Германия');
  const [companyName, setCompanyName] = useState('');
  const [staffCount, setStaffCount] = useState('5–15 человек');
  const [preferredChannel, setPreferredChannel] = useState<PreferredChannel>('Telegram');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const syncKey = open
    ? `${defaultType}|${vacancy?.id ?? ''}|${prefill?.country ?? ''}|${prefill?.comment ?? ''}|${prefill?.staffCount ?? ''}|${user?.uid ?? ''}`
    : 'closed';
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey);

  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open) {
      setLeadType(vacancy ? 'job_application' : defaultType);
      setFullName(profile?.fullName || user?.displayName || '');
      setPhone(profile?.phone || '');
      setEmail(profile?.email || user?.email || '');
      setCountry(prefill?.country || vacancy?.country || profile?.desiredCountry || 'Германия');
      setCompanyName(profile?.companyName || '');
      setStaffCount(prefill?.staffCount || '5–15 человек');
      setPreferredChannel('Telegram');
      setComment(prefill?.comment || '');
      setErrors({});
      setSubmitError(null);
      setSubmitted(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: leadType,
      fullName,
      phone,
      email,
      country,
      companyName: leadType === 'b2b_request' ? companyName : undefined,
      staffCount: leadType === 'b2b_request' ? staffCount : undefined,
      comment: formatCommentWithChannel(preferredChannel, comment),
      vacancyId: vacancy?.id,
      vacancyTitle: vacancy?.title,
    };

    const validation = validateLeadForm(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitLeadOrApplication(payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Не удалось отправить заявку. Попробуйте ещё раз.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lead-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07183B]/50 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: PREMIUM_EASE }}
            className="bg-gradient-to-b from-white to-[#F7FAFF] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_28px_72px_rgba(7,24,59,0.34)] border border-white relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть окно заявки"
              className="absolute top-4 right-4 p-2 rounded-full text-[#3B527A] hover:bg-[#EBF3FF] hover:text-[#0B224C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: PREMIUM_EASE }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#16A34A] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 id="lead-modal-title" className="text-2xl font-bold text-[#0B224C] mb-2">
                  Заявка успешно отправлена
                </h2>
                <p className="text-sm text-[#3B527A] mb-6 leading-relaxed">
                  Мы получили ваше обращение и передали его координатору MIGRANT. Менеджер свяжется с вами в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="migrant-btn-primary text-white font-semibold px-7 py-3 rounded-full cursor-pointer"
                >
                  Вернуться на сайт
                </button>
              </motion.div>
            ) : (
              <>
                <h2 id="lead-modal-title" className="text-2xl font-bold text-[#0B224C] pr-8">
                  {vacancy
                    ? `Отклик: ${vacancy.title}`
                    : leadType === 'b2b_request'
                      ? 'Заявка на подбор персонала'
                      : 'Оставить заявку в MIGRANT'}
                </h2>
                <p className="text-sm text-[#3B527A] mt-1 mb-5">
                  {vacancy
                    ? `${vacancy.country} · ${vacancy.salaryMonthlyText}`
                    : 'Заполните контакты — мы подберём вакансию или сотрудников под ваши задачи.'}
                </p>

                {!vacancy && (
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EBF3FF] border border-[#DCEBFF] rounded-xl mb-5">
                    {MODAL_TABS.map((tab) => {
                      const active = leadType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLeadType(tab.id)}
                          className={`relative py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                            active ? 'text-[#0E3B8C]' : 'text-[#3B527A] hover:text-[#0B224C]'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="leadModalTab"
                              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                              className="absolute inset-0 bg-white rounded-lg shadow-xs border border-[#DCEBFF]"
                            />
                          )}
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {leadType === 'b2b_request' && (
                    <div>
                      <label htmlFor="modal-company" className="block text-xs font-semibold text-[#1E355E] mb-1">
                        Название компании *
                      </label>
                      <input
                        id="modal-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Например, СтройГрупп"
                        className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                      />
                      {errors.companyName && (
                        <p className="text-xs text-[#DC2626] mt-1">{errors.companyName}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="modal-fullname" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      {leadType === 'b2b_request' ? 'Контактное лицо *' : 'Ваше имя *'}
                    </label>
                    <input
                      id="modal-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Иван Петров"
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-[#DC2626] mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-phone" className="block text-xs font-semibold text-[#1E355E] mb-1">
                        Телефон / Telegram *
                      </label>
                      <input
                        id="modal-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+380 67 000 00 00"
                        className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                      />
                      {errors.phone && (
                        <p className="text-xs text-[#DC2626] mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="modal-country" className="block text-xs font-semibold text-[#1E355E] mb-1">
                        Интересующая страна
                      </label>
                      <select
                        id="modal-country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] text-sm bg-white"
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.country}>
                            {c.country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {leadType === 'b2b_request' && (
                    <div>
                      <label htmlFor="modal-staff" className="block text-xs font-semibold text-[#1E355E] mb-1">
                        Количество сотрудников *
                      </label>
                      <select
                        id="modal-staff"
                        value={staffCount}
                        onChange={(e) => setStaffCount(e.target.value)}
                        className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] text-sm bg-white"
                      >
                        <option value="1–5 человек">1–5 человек</option>
                        <option value="5–15 человек">5–15 человек</option>
                        <option value="15–50 человек">15–50 человек</option>
                        <option value="50+ человек">50+ человек</option>
                      </select>
                      {errors.staffCount && (
                        <p className="text-xs text-[#DC2626] mt-1">{errors.staffCount}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="block text-xs font-semibold text-[#1E355E] mb-1.5">
                      Где удобнее ответить?
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PREFERRED_CHANNELS.map((ch) => {
                        const active = preferredChannel === ch;
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setPreferredChannel(ch)}
                            aria-pressed={active}
                            className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-[#EBF3FF] border-[#1448A0] text-[#0E3B8C]'
                                : 'bg-white border-[#CBDDF7] text-[#3B527A] hover:border-[#93C5FD]'
                            }`}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="modal-comment" className="block text-xs font-semibold text-[#1E355E] mb-1">
                      Комментарий или опыт работы
                    </label>
                    <textarea
                      id="modal-comment"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Укажите желаемую профессию, сроки выезда или требования к кандидатам..."
                      className="migrant-input w-full px-3.5 py-2.5 rounded-xl border border-[#CBDDF7] bg-white text-sm"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full migrant-btn-primary text-white font-semibold py-3 rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Отправка заявки...' : 'Отправить заявку'}</span>
                  </button>
                  <p className="text-[11px] text-center text-[#546B91]">
                    {leadType === 'b2b_request'
                      ? 'Первая подборка профилей кандидатов — за 24 часа · Официальный B2B-договор'
                      : 'Отвечаем в течение 15 минут в рабочее время · Подбор вакансий — 0 €'}
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
