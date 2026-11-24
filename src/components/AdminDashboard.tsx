import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  Bell,
  Briefcase,
  Check,
  Copy,
  CopyPlus,
  Download,
  Edit3,
  Eye,
  EyeOff,
  HardDrive,
  Inbox,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  computeDashboardAnalytics,
  DEFAULT_SEED_VACANCIES,
  validateVacancyInput,
} from '../utils/vacancies';
import {
  buildLeadsCsv,
  buildTelHref,
  buildWhatsAppHref,
  filterAdminLeads,
  filterAdminVacancies,
  sanitizeVacancyInput,
  type AdminVacancyStatusFilter,
} from '../utils/adminHelpers';
import { CountryFlag, VacancyJobIcon } from './MigrantIcons';
import { AdminConfirmDialog, AdminVacancyModal } from './AdminVacancyModal';
import { AdminDriveExportTab } from './AdminDriveExportTab';
import { PREMIUM_EASE } from './MotionPrimitives';
import type {
  ApplicationStatus,
  LeadOrApplication,
  LeadType,
  NotificationSettingsSummary,
  UserProfile,
  UserRole,
  UserStatus,
  Vacancy,
  VacancyInput,
} from '../types/migrant';

interface AdminDashboardProps {
  vacancies: Vacancy[];
  hasFirestoreVacancies: boolean;
}

type AdminTab = 'analytics' | 'vacancies' | 'leads' | 'users' | 'notifications' | 'drive';

interface AdminToast {
  id: number;
  message: string;
  undoVacancy?: VacancyInput;
}

interface PendingConfirm {
  title: string;
  description: string;
  confirmLabel: string;
  action: () => Promise<void>;
}

const EMPTY_VACANCY: VacancyInput = {
  title: '',
  country: 'Германия',
  countryCode: 'DE',
  profession: 'Строительство',
  salaryText: '14–16 €/час нетто',
  salaryMonthlyText: 'от 2 600 € / мес.',
  schedule: 'График: 8–10 ч/день',
  housing: 'Проживание: предоставляется',
  contractType: 'Официальное оформление',
  description: '',
  iconType: 'construction',
  active: true,
};

const LEAD_STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  in_progress: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  approved: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
  rejected: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
};

function GoogleMarkSvg() {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="w-5 h-5 shrink-0 block"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function AdminDashboard({
  vacancies,
  hasFirestoreVacancies,
}: AdminDashboardProps) {
  const { user, isAdmin, authReady, authError, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('vacancies');

  // Firestore collections for Admin
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [leadsList, setLeadsList] = useState<LeadOrApplication[]>([]);
  const [appsList, setAppsList] = useState<LeadOrApplication[]>([]);

  // Vacancies CRUD & Filters state
  const [vacancySearch, setVacancySearch] = useState('');
  const [vacancyCountryFilter, setVacancyCountryFilter] = useState('all');
  const [vacancyStatusFilter, setVacancyStatusFilter] = useState<AdminVacancyStatusFilter>('all');
  const [selectedVacancyIds, setSelectedVacancyIds] = useState<Set<string>>(new Set());
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [vacancyForm, setVacancyForm] = useState<VacancyInput>(EMPTY_VACANCY);
  const [vacancyErrors, setVacancyErrors] = useState<Record<string, string>>({});
  const [savingVacancy, setSavingVacancy] = useState(false);
  const [seedingVacancies, setSeedingVacancies] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  // Leads filters & copy feedback
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadTypeFilter, setLeadTypeFilter] = useState<'all' | LeadType>('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [copiedLeadPhoneId, setCopiedLeadPhoneId] = useState<string | null>(null);

  // Users search state
  const [userSearch, setUserSearch] = useState('');

  // Notification settings state
  const [notifSummary, setNotifSummary] = useState<NotificationSettingsSummary | null>(null);
  const [tgToken, setTgToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Confirm Dialog & Floating Undo Toast
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [toast, setToast] = useState<AdminToast | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string, undoVacancy?: VacancyInput) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    const id = Date.now();
    setToast({ id, message, undoVacancy });
    toastTimerRef.current = window.setTimeout(
      () => setToast((curr) => (curr?.id === id ? null : curr)),
      undoVacancy ? 8000 : 3500
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!authReady || !user || !isAdmin) return;

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsersList(snap.docs.map((d) => d.data() as UserProfile));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    const unsubLeads = onSnapshot(
      query(collection(db, 'leads'), orderBy('createdAt', 'desc')),
      (snap) => {
        setLeadsList(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              sourceCollection: 'leads',
              type: data.type,
              vacancyId: data.vacancyId,
              vacancyTitle: data.vacancyTitle,
              fullName: data.fullName,
              phone: data.phone,
              country: data.country,
              companyName: data.companyName,
              staffCount: data.staffCount,
              comment: data.comment,
              status: data.status,
              adminNote: data.adminNote,
              createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'leads')
    );

    const unsubApps = onSnapshot(
      query(collection(db, 'applications'), orderBy('createdAt', 'desc')),
      (snap) => {
        setAppsList(
          snap.docs.map((d) => {
            const data = d.data();
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
              createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'applications')
    );

    return () => {
      unsubUsers();
      unsubLeads();
      unsubApps();
    };
  }, [authReady, user, isAdmin]);

  const loadNotificationSettings = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: NotificationSettingsSummary = await res.json();
        setNotifSummary(data);
        setTgChatId(data.telegramChatId || '');
        setAdminEmailInput(data.adminNotificationEmail || '');
        setSmtpHost(data.smtpHost || '');
        setSmtpPort(String(data.smtpPort || 587));
        setSmtpUser(data.smtpUser || '');
      }
    } catch {
      // ignore initial settings fetch errors
    }
  };

  useEffect(() => {
    if (isAdmin && authReady) {
      loadNotificationSettings();
    }
  }, [isAdmin, authReady]);

  const combinedLeads = useMemo(
    () => [...appsList, ...leadsList].sort((a, b) => b.createdAtMs - a.createdAtMs),
    [appsList, leadsList]
  );

  const analytics = useMemo(
    () => computeDashboardAnalytics(vacancies, combinedLeads, usersList),
    [vacancies, combinedLeads, usersList]
  );

  const vacancyCountries = useMemo(
    () => Array.from(new Set(vacancies.map((v) => v.country))).sort((a, b) => a.localeCompare(b)),
    [vacancies]
  );

  const filteredVacancies = useMemo(
    () =>
      filterAdminVacancies(vacancies, {
        search: vacancySearch,
        country: vacancyCountryFilter,
        status: vacancyStatusFilter,
      }),
    [vacancies, vacancySearch, vacancyCountryFilter, vacancyStatusFilter]
  );

  const filteredLeads = useMemo(
    () =>
      filterAdminLeads(combinedLeads, {
        search: leadSearch,
        status: leadStatusFilter,
        type: leadTypeFilter,
      }),
    [combinedLeads, leadSearch, leadStatusFilter, leadTypeFilter]
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return usersList;
    return usersList.filter((u) =>
      `${u.fullName} ${u.email} ${u.phone || ''} ${u.companyName || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [usersList, userSearch]);

  // Keep selectedVacancyIds pruned to existing vacancies
  const activeSelectedIds = useMemo(() => {
    const existing = new Set(vacancies.map((v) => v.id));
    return Array.from(selectedVacancyIds).filter((id) => existing.has(id));
  }, [vacancies, selectedVacancyIds]);

  const allFilteredSelected =
    filteredVacancies.length > 0 &&
    filteredVacancies.every((v) => selectedVacancyIds.has(v.id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedVacancyIds);
      for (const v of filteredVacancies) next.delete(v.id);
      setSelectedVacancyIds(next);
    } else {
      const next = new Set(selectedVacancyIds);
      for (const v of filteredVacancies) next.add(v.id);
      setSelectedVacancyIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedVacancyIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedVacancyIds(next);
  };

  const handleSeedDefaultVacancies = async () => {
    if (!user) return;
    setSeedingVacancies(true);
    try {
      const batch = writeBatch(db);
      for (const seed of DEFAULT_SEED_VACANCIES) {
        const ref = doc(db, 'vacancies', seed.id);
        batch.set(ref, {
          ...sanitizeVacancyInput({
            title: seed.title,
            country: seed.country,
            countryCode: seed.countryCode,
            profession: seed.profession,
            salaryText: seed.salaryText,
            salaryMonthlyText: seed.salaryMonthlyText,
            schedule: seed.schedule,
            housing: seed.housing,
            contractType: seed.contractType,
            description: seed.description,
            iconType: seed.iconType,
            active: seed.active,
          }),
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      showToast(`Импортировано ${DEFAULT_SEED_VACANCIES.length} базовых вакансий в Firestore`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'vacancies');
    } finally {
      setSeedingVacancies(false);
    }
  };

  const openAddVacancy = () => {
    setEditingVacancy(null);
    setVacancyForm(EMPTY_VACANCY);
    setVacancyErrors({});
    setVacancyModalOpen(true);
  };

  const openEditVacancy = (v: Vacancy) => {
    setEditingVacancy(v);
    setVacancyForm({
      title: v.title,
      country: v.country,
      countryCode: v.countryCode,
      profession: v.profession,
      salaryText: v.salaryText,
      salaryMonthlyText: v.salaryMonthlyText,
      schedule: v.schedule,
      housing: v.housing,
      contractType: v.contractType,
      description: v.description,
      iconType: v.iconType,
      active: v.active,
    });
    setVacancyErrors({});
    setVacancyModalOpen(true);
  };

  const openDuplicateVacancy = (v: Vacancy) => {
    setEditingVacancy(null);
    setVacancyForm({
      title: `${v.title} (копия)`.slice(0, 120),
      country: v.country,
      countryCode: v.countryCode,
      profession: v.profession,
      salaryText: v.salaryText,
      salaryMonthlyText: v.salaryMonthlyText,
      schedule: v.schedule,
      housing: v.housing,
      contractType: v.contractType,
      description: v.description,
      iconType: v.iconType,
      active: true,
    });
    setVacancyErrors({});
    setVacancyModalOpen(true);
  };

  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const sanitized = sanitizeVacancyInput(vacancyForm);
    const validation = validateVacancyInput(sanitized);
    if (!validation.valid) {
      setVacancyErrors(validation.errors);
      return;
    }

    setSavingVacancy(true);
    try {
      if (editingVacancy && hasFirestoreVacancies) {
        await updateDoc(doc(db, 'vacancies', editingVacancy.id), {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
        showToast(`Вакансия «${sanitized.title}» обновлена`);
      } else {
        await addDoc(collection(db, 'vacancies'), {
          ...sanitized,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast(`Вакансия «${sanitized.title}» добавлена в каталог`);
      }
      setVacancyModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'vacancies');
    } finally {
      setSavingVacancy(false);
    }
  };

  const requestDeleteVacancy = (v: Vacancy) => {
    if (!hasFirestoreVacancies) return;
    const backup: VacancyInput = sanitizeVacancyInput({
      title: v.title,
      country: v.country,
      countryCode: v.countryCode,
      profession: v.profession,
      salaryText: v.salaryText,
      salaryMonthlyText: v.salaryMonthlyText,
      schedule: v.schedule,
      housing: v.housing,
      contractType: v.contractType,
      description: v.description,
      iconType: v.iconType,
      active: v.active,
    });

    setPendingConfirm({
      title: 'Удалить вакансию?',
      description: `Вакансия «${v.title}» (${v.country}) будет удалена из каталога. В течение 8 секунд её можно будет восстановить одной кнопкой.`,
      confirmLabel: 'Удалить вакансию',
      action: async () => {
        try {
          await deleteDoc(doc(db, 'vacancies', v.id));
          setSelectedVacancyIds((prev) => {
            const next = new Set(prev);
            next.delete(v.id);
            return next;
          });
          showToast(`Вакансия «${v.title}» удалена`, backup);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `vacancies/${v.id}`);
        }
      },
    });
  };

  const handleRestoreVacancy = async (backup: VacancyInput) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'vacancies'), {
        ...sanitizeVacancyInput(backup),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast(`Вакансия «${backup.title}» восстановлена`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'vacancies');
    }
  };

  const handleToggleVacancyActive = async (v: Vacancy) => {
    if (!hasFirestoreVacancies) return;
    try {
      await updateDoc(doc(db, 'vacancies', v.id), {
        active: !v.active,
        updatedAt: serverTimestamp(),
      });
      showToast(
        !v.active
          ? `Вакансия «${v.title}» опубликована на сайте`
          : `Вакансия «${v.title}» скрыта в черновики`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vacancies/${v.id}`);
    }
  };

  const handleBulkSetActive = async (activeState: boolean) => {
    if (!hasFirestoreVacancies || activeSelectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      const batch = writeBatch(db);
      for (const id of activeSelectedIds) {
        batch.update(doc(db, 'vacancies', id), {
          active: activeState,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      showToast(
        activeState
          ? `Опубликовано вакансий: ${activeSelectedIds.length}`
          : `Скрыто вакансий: ${activeSelectedIds.length}`
      );
      setSelectedVacancyIds(new Set());
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'vacancies');
    } finally {
      setBulkBusy(false);
    }
  };

  const requestBulkDeleteVacancies = () => {
    if (!hasFirestoreVacancies || activeSelectedIds.length === 0) return;
    const idsToDelete = [...activeSelectedIds];
    setPendingConfirm({
      title: `Удалить выбранные вакансии (${idsToDelete.length})?`,
      description: `Выбрано ${idsToDelete.length} вакансий. После подтверждения они будут безвозвратно удалены из базы данных.`,
      confirmLabel: `Удалить (${idsToDelete.length})`,
      action: async () => {
        try {
          const batch = writeBatch(db);
          for (const id of idsToDelete) {
            batch.delete(doc(db, 'vacancies', id));
          }
          await batch.commit();
          setSelectedVacancyIds(new Set());
          showToast(`Удалено вакансий: ${idsToDelete.length}`);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'vacancies');
        }
      },
    });
  };

  const handleUpdateLeadStatus = async (
    item: LeadOrApplication,
    nextStatus: ApplicationStatus
  ) => {
    try {
      await updateDoc(doc(db, item.sourceCollection, item.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      showToast(`Статус заявки «${item.fullName}» обновлён`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${item.sourceCollection}/${item.id}`);
    }
  };

  const handleUpdateLeadNote = async (item: LeadOrApplication, note: string) => {
    try {
      await updateDoc(doc(db, item.sourceCollection, item.id), {
        adminNote: note.trim().slice(0, 500),
        updatedAt: serverTimestamp(),
      });
      showToast(`Заметка по заявке «${item.fullName}» сохранена`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${item.sourceCollection}/${item.id}`);
    }
  };

  const requestDeleteLead = (item: LeadOrApplication) => {
    setPendingConfirm({
      title: 'Удалить заявку?',
      description: `Заявка от ${item.fullName} (${item.phone}) будет удалена из CRM-списка.`,
      confirmLabel: 'Удалить заявку',
      action: async () => {
        try {
          await deleteDoc(doc(db, item.sourceCollection, item.id));
          showToast(`Заявка «${item.fullName}» удалена`);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${item.sourceCollection}/${item.id}`);
        }
      },
    });
  };

  const handleCopyLeadPhone = (item: LeadOrApplication) => {
    navigator.clipboard?.writeText(item.phone);
    setCopiedLeadPhoneId(item.id);
    showToast(`Телефон ${item.phone} скопирован`);
    window.setTimeout(() => {
      setCopiedLeadPhoneId((curr) => (curr === item.id ? null : curr));
    }, 2000);
  };

  const handleExportLeadsCsv = () => {
    const csv = buildLeadsCsv(filteredLeads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migrant-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Экспортировано заявок в CSV: ${filteredLeads.length}`);
  };

  const handleUserRoleChange = async (targetUser: UserProfile, nextRole: UserRole) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', targetUser.uid), {
        role: nextRole,
        updatedAt: serverTimestamp(),
      });
      if (nextRole === 'admin') {
        batch.set(doc(db, 'admins', targetUser.uid), {
          uid: targetUser.uid,
          email: targetUser.email,
          grantedBy: user.uid,
          createdAt: serverTimestamp(),
        });
      } else {
        batch.delete(doc(db, 'admins', targetUser.uid));
      }
      await batch.commit();
      showToast(`Роль пользователя ${targetUser.email} обновлена`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  const handleUserStatusChange = async (targetUser: UserProfile, nextStatus: UserStatus) => {
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      showToast(
        nextStatus === 'active'
          ? `Доступ пользователя ${targetUser.email} восстановлен`
          : `Пользователь ${targetUser.email} заблокирован`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setNotifFeedback(null);
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        telegramBotToken: tgToken,
        telegramChatId: tgChatId,
        adminNotificationEmail: adminEmailInput,
        smtpHost,
        smtpPort: Number(smtpPort || 587),
        smtpUser,
        smtpPass,
      }),
    });
    if (res.ok) {
      setNotifFeedback('Настройки уведомлений сохранены');
      setTgToken('');
      setSmtpPass('');
      await loadNotificationSettings();
      showToast('Настройки уведомлений сохранены');
    } else {
      setNotifFeedback('Ошибка сохранения настроек');
    }
  };

  const handleTestNotification = async () => {
    if (!auth.currentUser) return;
    setNotifFeedback(null);
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('/api/admin/settings/test', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setNotifFeedback(`Тест выполнен: ${json.logEntry?.detail || 'готово'}`);
      await loadNotificationSettings();
    } else {
      setNotifFeedback('Не удалось выполнить тест уведомлений');
    }
  };

  const handleCopyPublicLink = () => {
    const url = notifSummary?.publicAppUrl || window.location.origin;
    navigator.clipboard?.writeText(url);
    setCopiedUrl(true);
    showToast('Публичная ссылка скопирована');
    window.setTimeout(() => setCopiedUrl(false), 2500);
  };

  const executePendingConfirm = async () => {
    if (!pendingConfirm) return;
    setConfirmBusy(true);
    try {
      await pendingConfirm.action();
      setPendingConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  if (!authReady) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10">
        <div className="migrant-card rounded-3xl p-10 text-center text-sm text-[#3B527A]">
          Проверка прав администратора...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="migrant-card rounded-[32px] p-8 sm:p-10 text-center">
          <div className="migrant-icon-pedestal w-16 h-16 rounded-2xl text-[#1448A0] flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] mb-3">
            Вход в панель администратора
          </h1>
          <p className="text-sm text-[#3B527A] mb-6 leading-relaxed">
            Доступ к управлению вакансиями, заявками, пользователями, уведомлениями и выгрузке проекта на Google Диск защищён аутентификацией Google и правилами безопасности Firestore.
          </p>
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
              {authError}
            </div>
          )}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="bg-white hover:bg-[#F8FAFC] text-[#1F1F1F] border border-[#747775]/45 shadow-sm font-semibold px-7 py-3 rounded-full inline-flex items-center gap-3 transition-all cursor-pointer"
          >
            <GoogleMarkSvg />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="migrant-card rounded-[32px] p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-[#0B224C] mb-2">
            Недостаточно прав доступа
          </h1>
          <p className="text-sm text-[#3B527A] leading-relaxed">
            Аккаунт <span className="font-semibold text-[#0B224C]">{user.email}</span> не имеет прав администратора. Обратитесь к главному администратору для выдачи роли.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'vacancies' as const, label: `Вакансии (${vacancies.length})`, icon: Briefcase },
    { id: 'leads' as const, label: `Заявки (${combinedLeads.length})`, icon: Inbox },
    { id: 'analytics' as const, label: 'Аналитика', icon: BarChart3 },
    { id: 'users' as const, label: `Пользователи (${usersList.length})`, icon: Users },
    { id: 'notifications' as const, label: 'Уведомления и SEO', icon: Bell },
    { id: 'drive' as const, label: 'Google Диск', icon: HardDrive },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8 space-y-6">
      {/* Top Admin Header */}
      <div className="migrant-card rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#546B91]">
            Панель управления MIGRANT · {user.email}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B224C] mt-0.5">
            Административная консоль
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className="migrant-btn-secondary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-[#1448A0]" />
            <span>Выгрузить на Google Диск</span>
          </button>
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="migrant-btn-secondary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedUrl ? 'Ссылка скопирована' : 'Публичная ссылка'}</span>
          </button>
          <button
            type="button"
            onClick={openAddVacancy}
            className="migrant-btn-primary text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить вакансию</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs with Animated Indicator */}
      <div
        role="tablist"
        aria-label="Разделы админ-панели"
        className="flex flex-wrap gap-1.5 p-1.5 bg-white/85 backdrop-blur-md rounded-2xl border border-[#DCEBFF] shadow-[0_6px_20px_rgba(11,34,76,0.05)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                active ? 'text-white' : 'text-[#1E355E] hover:bg-[#EFF6FF]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="adminActiveTab"
                  transition={{ duration: 0.24, ease: PREMIUM_EASE }}
                  className="absolute inset-0 rounded-xl bg-[#1448A0] shadow-sm"
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: VACANCIES CRUD (ULTRA-CONVENIENT) */}
      {activeTab === 'vacancies' && (
        <div className="migrant-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Search + Country + Status Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[210px] max-w-sm">
                <Search className="w-4 h-4 text-[#546B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vacancySearch}
                  onChange={(e) => setVacancySearch(e.target.value)}
                  placeholder="Поиск вакансии, страны, профессии..."
                  className="migrant-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <select
                aria-label="Фильтр вакансий по стране"
                value={vacancyCountryFilter}
                onChange={(e) => setVacancyCountryFilter(e.target.value)}
                className="migrant-input px-3.5 py-2.5 rounded-xl text-sm font-medium"
              >
                <option value="all">Все страны ({vacancies.length})</option>
                {vacancyCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <div className="inline-flex p-1 rounded-xl bg-[#EFF6FF] border border-[#DCEBFF]">
                {(
                  [
                    { id: 'all', label: 'Все' },
                    { id: 'active', label: 'Активные' },
                    { id: 'hidden', label: 'Скрытые' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setVacancyStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      vacancyStatusFilter === st.id
                        ? 'bg-white text-[#1448A0] shadow-2xs'
                        : 'text-[#3B527A] hover:text-[#0B224C]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!hasFirestoreVacancies && (
                <button
                  type="button"
                  disabled={seedingVacancies}
                  onClick={handleSeedDefaultVacancies}
                  className="migrant-btn-secondary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full cursor-pointer"
                >
                  {seedingVacancies ? 'Импорт...' : 'Сохранить базовые вакансии в БД'}
                </button>
              )}
              <button
                type="button"
                onClick={openAddVacancy}
                className="migrant-btn-primary text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Создать вакансию</span>
              </button>
            </div>
          </div>

          {!hasFirestoreVacancies && (
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] leading-relaxed">
              Сейчас показаны стартовые вакансии. Нажмите «Сохранить базовые вакансии в БД», либо откройте любую вакансию на редактирование/дублирование — она сразу сохранится в вашу базу Firestore.
            </div>
          )}

          {/* Contextual Bulk Actions Bar */}
          {hasFirestoreVacancies && activeSelectedIds.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#0B224C] text-white flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <span className="text-xs sm:text-sm font-bold pl-1">
                Выбрано вакансий: {activeSelectedIds.length}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkSetActive(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Опубликовать</span>
                </button>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => handleBulkSetActive(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Скрыть</span>
                </button>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={requestBulkDeleteVacancies}
                  className="px-3.5 py-1.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVacancyIds(new Set())}
                  aria-label="Снять выделение"
                  className="p-1.5 rounded-full hover:bg-white/15 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {filteredVacancies.length === 0 ? (
            <div className="py-10 text-center bg-white/70 rounded-2xl border border-[#E2EDFF]">
              <p className="text-sm font-semibold text-[#0B224C]">
                Вакансии по выбранным фильтрам не найдены
              </p>
              <button
                type="button"
                onClick={() => {
                  setVacancySearch('');
                  setVacancyCountryFilter('all');
                  setVacancyStatusFilter('all');
                }}
                className="mt-3 text-xs font-bold text-[#1448A0] hover:underline cursor-pointer"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#DCEBFF] text-xs text-[#546B91]">
                    {hasFirestoreVacancies && (
                      <th className="py-3 pr-3 w-8">
                        <input
                          type="checkbox"
                          aria-label="Выбрать все видимые вакансии"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          className="w-4 h-4 rounded accent-[#1448A0] cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3 pr-4">Вакансия</th>
                    <th className="py-3 pr-4">Страна</th>
                    <th className="py-3 pr-4">Доход</th>
                    <th className="py-3 pr-4">Статус</th>
                    <th className="py-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF5FF]">
                  {filteredVacancies.map((v) => {
                    const checked = selectedVacancyIds.has(v.id);
                    return (
                      <tr
                        key={v.id}
                        className={`transition-colors ${
                          checked ? 'bg-[#EFF6FF]/70' : 'hover:bg-white/75'
                        }`}
                      >
                        {hasFirestoreVacancies && (
                          <td className="py-3 pr-3">
                            <input
                              type="checkbox"
                              aria-label={`Выбрать ${v.title}`}
                              checked={checked}
                              onChange={() => toggleSelectOne(v.id)}
                              className="w-4 h-4 rounded accent-[#1448A0] cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="migrant-icon-pedestal w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                              <VacancyJobIcon type={v.iconType} className="w-8 h-8" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#0B224C] leading-snug">{v.title}</div>
                              <div className="text-xs text-[#546B91]">{v.profession}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#0B224C]">
                            <CountryFlag code={v.countryCode} className="w-4 h-4" />
                            <span>{v.country}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap tabular-nums">
                          <div className="font-bold text-[#1448A0]">{v.salaryMonthlyText}</div>
                          <div className="text-[11px] text-[#546B91]">{v.salaryText}</div>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={!hasFirestoreVacancies}
                            onClick={() => handleToggleVacancyActive(v)}
                            title={
                              hasFirestoreVacancies
                                ? 'Нажмите, чтобы переключить видимость на сайте'
                                : 'Сначала сохраните вакансии в БД'
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors ${
                              v.active
                                ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]'
                                : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                v.active ? 'bg-[#16A34A]' : 'bg-[#64748B]'
                              }`}
                            />
                            <span>{v.active ? 'Активна' : 'Скрыта'}</span>
                          </button>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditVacancy(v)}
                            title="Редактировать"
                            aria-label={`Редактировать ${v.title}`}
                            className="p-2 rounded-lg text-[#1448A0] hover:bg-[#EFF6FF] cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDuplicateVacancy(v)}
                            title="Дублировать вакансию"
                            aria-label={`Дублировать ${v.title}`}
                            className="p-2 rounded-lg text-[#3B527A] hover:bg-[#EFF6FF] hover:text-[#1448A0] cursor-pointer ml-0.5"
                          >
                            <CopyPlus className="w-4 h-4" />
                          </button>
                          {hasFirestoreVacancies && (
                            <button
                              type="button"
                              onClick={() => requestDeleteVacancy(v)}
                              title="Удалить"
                              aria-label={`Удалить ${v.title}`}
                              className="p-2 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer ml-0.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: LEADS & APPLICATIONS (ZERO-FRICTION CRM) */}
      {activeTab === 'leads' && (
        <div className="migrant-card rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[210px] max-w-sm">
                <Search className="w-4 h-4 text-[#546B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Поиск по имени, телефону, компании..."
                  className="migrant-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <select
                aria-label="Фильтр заявок по типу"
                value={leadTypeFilter}
                onChange={(e) => setLeadTypeFilter(e.target.value as 'all' | LeadType)}
                className="migrant-input px-3.5 py-2.5 rounded-xl text-sm font-medium"
              >
                <option value="all">Все типы</option>
                <option value="job_application">Отклики</option>
                <option value="b2b_request">B2B-заявки</option>
                <option value="consultation">Консультации</option>
              </select>

              <select
                aria-label="Фильтр по статусу заявок"
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="migrant-input px-3.5 py-2.5 rounded-xl text-sm font-medium"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новые</option>
                <option value="in_progress">В работе</option>
                <option value="approved">Одобренные</option>
                <option value="rejected">Отклонённые</option>
              </select>
            </div>

            <button
              type="button"
              disabled={filteredLeads.length === 0}
              onClick={handleExportLeadsCsv}
              className="migrant-btn-secondary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#1448A0]" />
              <span>Экспорт CSV ({filteredLeads.length})</span>
            </button>
          </div>

          {filteredLeads.length === 0 ? (
            <p className="text-sm text-[#3B527A] py-8 text-center">
              Заявок по текущему фильтру пока нет.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((item) => {
                const telHref = buildTelHref(item.phone);
                const waHref = buildWhatsAppHref(
                  item.phone,
                  `Здравствуйте, ${item.fullName}! Пишем из агентства MIGRANT по вашей заявке.`
                );
                return (
                  <div
                    key={`${item.sourceCollection}-${item.id}`}
                    className="bg-white/95 rounded-2xl p-4 border border-[#DCEBFF] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#546B91]">
                        <span className="font-bold text-[#1448A0]">
                          {item.type === 'b2b_request'
                            ? 'B2B-заявка'
                            : item.type === 'job_application'
                              ? 'Отклик на вакансию'
                              : 'Консультация'}
                        </span>
                        <span>·</span>
                        <span className="tabular-nums">
                          {new Date(item.createdAtMs).toLocaleString('ru-RU')}
                        </span>
                        {item.country && (
                          <>
                            <span>·</span>
                            <span>{item.country}</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-[#0B224C]">{item.fullName}</p>
                        <span className="text-sm font-semibold text-[#1448A0] tabular-nums">
                          {item.phone}
                        </span>
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyLeadPhone(item)}
                            title="Скопировать телефон"
                            aria-label={`Скопировать телефон ${item.fullName}`}
                            className="p-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DCEBFF] text-[#1448A0] cursor-pointer"
                          >
                            {copiedLeadPhoneId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {telHref && (
                            <a
                              href={telHref}
                              title="Позвонить"
                              aria-label={`Позвонить ${item.fullName}`}
                              className="p-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DCEBFF] text-[#1448A0]"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {waHref && (
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Написать в WhatsApp"
                              aria-label={`Написать ${item.fullName} в WhatsApp`}
                              className="p-1.5 rounded-lg bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D]"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {(item.companyName || item.vacancyTitle) && (
                        <p className="text-xs font-semibold text-[#1E355E]">
                          {item.companyName
                            ? `Компания: ${item.companyName} (${item.staffCount || '—'})`
                            : ''}
                          {item.vacancyTitle ? `Вакансия: ${item.vacancyTitle}` : ''}
                        </p>
                      )}
                      {item.comment && <p className="text-xs text-[#3B527A]">{item.comment}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <select
                        aria-label={`Статус заявки ${item.fullName}`}
                        value={item.status}
                        onChange={(e) =>
                          handleUpdateLeadStatus(item, e.target.value as ApplicationStatus)
                        }
                        className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                          LEAD_STATUS_STYLES[item.status] || LEAD_STATUS_STYLES.new
                        }`}
                      >
                        <option value="new">Новая</option>
                        <option value="in_progress">В работе</option>
                        <option value="approved">Одобрена</option>
                        <option value="rejected">Отклонена</option>
                      </select>
                      <input
                        type="text"
                        defaultValue={item.adminNote || ''}
                        placeholder="Заметка (Enter)..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value !== (item.adminNote || '')) {
                            handleUpdateLeadNote(item, e.target.value);
                          }
                        }}
                        className="migrant-input px-3 py-2 rounded-xl text-xs w-44"
                      />
                      <button
                        type="button"
                        onClick={() => requestDeleteLead(item)}
                        title="Удалить заявку"
                        aria-label={`Удалить заявку ${item.fullName}`}
                        className="p-2 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="migrant-card rounded-3xl p-5">
              <p className="text-xs font-semibold text-[#546B91]">Активные вакансии</p>
              <p className="text-3xl font-extrabold text-[#0B224C] mt-1 tabular-nums">
                {analytics.activeVacancies}
                <span className="text-sm font-medium text-[#546B91] ml-1.5">
                  / {analytics.totalVacancies}
                </span>
              </p>
            </div>
            <div className="migrant-card rounded-3xl p-5">
              <p className="text-xs font-semibold text-[#546B91]">Новые заявки</p>
              <p className="text-3xl font-extrabold text-[#1448A0] mt-1 tabular-nums">
                {analytics.newLeads}
              </p>
            </div>
            <div className="migrant-card rounded-3xl p-5">
              <p className="text-xs font-semibold text-[#546B91]">Одобрено / в работе</p>
              <p className="text-3xl font-extrabold text-[#15803D] mt-1 tabular-nums">
                {analytics.approvedLeads + analytics.inProgressLeads}
              </p>
            </div>
            <div className="migrant-card rounded-3xl p-5">
              <p className="text-xs font-semibold text-[#546B91]">Пользователи</p>
              <p className="text-3xl font-extrabold text-[#0B224C] mt-1 tabular-nums">
                {analytics.totalUsers}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="migrant-card rounded-3xl p-6">
              <h2 className="text-lg font-extrabold text-[#0B224C] mb-4">
                Вакансии по странам
              </h2>
              <div className="space-y-3">
                {analytics.vacanciesByCountry.map((row) => {
                  const pct = Math.max(
                    8,
                    Math.round((row.count / Math.max(1, analytics.totalVacancies)) * 100)
                  );
                  return (
                    <div key={row.country}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#0B224C]">{row.country}</span>
                        <span className="font-mono tabular-nums text-[#1448A0]">{row.count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#E6F0FF] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1448A0]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="migrant-card rounded-3xl p-6">
              <h2 className="text-lg font-extrabold text-[#0B224C] mb-4">
                Заявки по каналам
              </h2>
              <div className="space-y-3">
                {analytics.leadsByType.map((row) => (
                  <div
                    key={row.type}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#E2EDFF]"
                  >
                    <span className="text-sm font-semibold text-[#0B224C]">{row.label}</span>
                    <span className="text-lg font-extrabold font-mono tabular-nums text-[#1448A0]">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="migrant-card rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-[#546B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Поиск пользователя по имени или email..."
              className="migrant-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#DCEBFF] text-xs text-[#546B91]">
                  <th className="py-3 pr-4">Пользователь</th>
                  <th className="py-3 pr-4">Телефон / Страна</th>
                  <th className="py-3 pr-4">Роль</th>
                  <th className="py-3 pr-4">Доступ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5FF]">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-white/70">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-[#0B224C]">{u.fullName}</div>
                      <div className="text-xs text-[#546B91]">{u.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#3B527A] tabular-nums">
                      {u.phone || '—'} · {u.desiredCountry || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        aria-label={`Роль для ${u.email}`}
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u, e.target.value as UserRole)}
                        className="migrant-input px-3 py-1.5 rounded-xl text-xs font-semibold"
                      >
                        <option value="candidate">Соискатель</option>
                        <option value="employer">Работодатель</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleUserStatusChange(
                            u,
                            u.status === 'active' ? 'blocked' : 'active'
                          )
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          u.status === 'active'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}
                      >
                        {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: NOTIFICATIONS & SEO */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveNotifications}
            className="lg:col-span-7 migrant-card rounded-3xl p-6 space-y-4"
          >
            <h2 className="text-lg font-extrabold text-[#0B224C]">
              Уведомления в Telegram и на Email
            </h2>
            <p className="text-xs text-[#3B527A]">
              Секретные токены и пароли сохраняются только на сервере и не передаются обратно в браузер.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  Telegram Bot Token {notifSummary?.telegramConfigured ? '(настроен)' : ''}
                </label>
                <input
                  type="password"
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder="123456:ABC-DEF..."
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  placeholder="-1001234567890"
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6F0FF] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  Email администратора для заявок
                </label>
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="admin@migrant-agency.eu"
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  SMTP Пользователь
                </label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1E355E] mb-1">
                  SMTP Пароль {notifSummary?.emailConfigured ? '(сохранён)' : ''}
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Оставьте пустым, чтобы сохранить текущий"
                  className="migrant-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            {notifFeedback && (
              <p className="text-xs font-semibold text-[#1448A0]">{notifFeedback}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="migrant-btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer"
              >
                Сохранить настройки
              </button>
              <button
                type="button"
                onClick={handleTestNotification}
                className="migrant-btn-secondary text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Отправить тест</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-5 space-y-6">
            <div className="migrant-card rounded-3xl p-6 space-y-3">
              <h2 className="text-lg font-extrabold text-[#0B224C]">SEO и публикация</h2>
              <p className="text-xs text-[#3B527A] leading-relaxed">
                Сайт снабжён динамическими мета-тегами, OpenGraph-разметкой, Schema.org JobPosting JSON-LD, а также автоматически генерирует <code>/sitemap.xml</code> и <code>/robots.txt</code>.
              </p>
              <div className="p-3 rounded-xl bg-white border border-[#DCEBFF] text-xs font-mono break-all text-[#0B224C]">
                {notifSummary?.publicAppUrl || window.location.origin}
              </div>
            </div>

            <div className="migrant-card rounded-3xl p-6">
              <h2 className="text-base font-extrabold text-[#0B224C] mb-3">
                Журнал отправок
              </h2>
              {!notifSummary?.recentLogs?.length ? (
                <p className="text-xs text-[#546B91]">Записей об отправках пока нет.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifSummary.recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-[#E2EDFF] text-xs"
                    >
                      <div className="flex justify-between font-semibold text-[#0B224C]">
                        <span>{log.leadName}</span>
                        <span className="text-[#546B91] tabular-nums">
                          {new Date(log.createdAt).toLocaleTimeString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-[#3B527A] mt-1">{log.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: GOOGLE DRIVE PROJECT EXPORT */}
      {activeTab === 'drive' && (
        <AdminDriveExportTab onNotify={(msg) => showToast(msg)} />
      )}

      {/* Vacancy Create/Edit Modal with Live Preview */}
      <AdminVacancyModal
        open={vacancyModalOpen}
        editingVacancy={editingVacancy}
        hasFirestoreVacancies={hasFirestoreVacancies}
        form={vacancyForm}
        errors={vacancyErrors}
        saving={savingVacancy}
        onChange={setVacancyForm}
        onSave={handleSaveVacancy}
        onClose={() => setVacancyModalOpen(false)}
      />

      {/* Destructive Action Confirmation Dialog */}
      <AdminConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.title || ''}
        description={pendingConfirm?.description || ''}
        confirmLabel={pendingConfirm?.confirmLabel || 'Подтвердить'}
        busy={confirmBusy}
        onConfirm={executePendingConfirm}
        onCancel={() => setPendingConfirm(null)}
      />

      {/* Floating Feedback & Undo Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: PREMIUM_EASE }}
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 max-w-md bg-[#0B224C] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3 text-xs sm:text-sm font-medium"
          >
            <span className="flex-1 leading-snug">{toast.message}</span>
            {toast.undoVacancy && (
              <button
                type="button"
                onClick={() => handleRestoreVacancy(toast.undoVacancy!)}
                className="px-3 py-1.5 rounded-full bg-white text-[#0B224C] hover:bg-[#EFF6FF] text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Восстановить</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Скрыть уведомление"
              className="p-1 rounded-full hover:bg-white/15 text-white/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
