/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTransition } from './components/MotionPrimitives';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { VacanciesPage } from './components/VacanciesPage';
import { BusinessPage } from './components/BusinessPage';
import { AboutPage, ContactsPage } from './components/AboutAndContactsPages';
import { CabinetPage } from './components/CabinetPage';
import { AdminDashboard } from './components/AdminDashboard';
import { LeadModal, type LeadModalPrefill } from './components/LeadModal';
import { DEFAULT_SEED_VACANCIES } from './utils/vacancies';
import { applyRouteSeo } from './utils/seo';
import type { LeadType, PageRoute, Vacancy } from './types/migrant';

const VALID_ROUTES: PageRoute[] = [
  '/',
  '/vacancies',
  '/business',
  '/about',
  '/contacts',
  '/cabinet',
  '/admin',
];

function parseRoute(pathname: string): PageRoute {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return (VALID_ROUTES.includes(clean as PageRoute) ? clean : '/') as PageRoute;
}

function MigrantAppShell() {
  const [route, setRoute] = useState<PageRoute>(() => parseRoute(window.location.pathname));
  const [firestoreVacancies, setFirestoreVacancies] = useState<Vacancy[]>([]);
  const [firestoreLoaded, setFirestoreLoaded] = useState(false);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalType, setLeadModalType] = useState<LeadType>('consultation');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [leadModalPrefill, setLeadModalPrefill] = useState<LeadModalPrefill | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'vacancies'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Vacancy[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            country: data.country,
            countryCode: data.countryCode,
            profession: data.profession,
            salaryText: data.salaryText,
            salaryMonthlyText: data.salaryMonthlyText,
            schedule: data.schedule,
            housing: data.housing,
            contractType: data.contractType,
            description: data.description,
            iconType: data.iconType,
            active: Boolean(data.active),
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setFirestoreVacancies(items);
        setFirestoreLoaded(true);
      },
      () => {
        setFirestoreLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  const hasFirestoreVacancies = firestoreVacancies.length > 0;
  const activeVacanciesList = hasFirestoreVacancies
    ? firestoreVacancies
    : firestoreLoaded
      ? DEFAULT_SEED_VACANCIES
      : DEFAULT_SEED_VACANCIES;

  useEffect(() => {
    applyRouteSeo(route, activeVacanciesList);
  }, [route, activeVacanciesList]);

  const navigate = (nextRoute: PageRoute) => {
    if (nextRoute !== route) {
      window.history.pushState({}, '', nextRoute);
      setRoute(nextRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLeadModal = (
    type: LeadType = 'consultation',
    vacancy: Vacancy | null = null,
    prefill: LeadModalPrefill | null = null
  ) => {
    setLeadModalType(type);
    setSelectedVacancy(vacancy);
    setLeadModalPrefill(prefill);
    setLeadModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentRoute={route}
        onNavigate={navigate}
        onOpenLeadModal={() => openLeadModal('consultation', null)}
      />

      <main className="flex-1 pb-8">
        <PageTransition routeKey={route}>
          {route === '/' && (
            <HomePage
              vacancies={activeVacanciesList}
              onNavigate={navigate}
              onOpenLeadModal={() => openLeadModal('consultation', null)}
              onApplyVacancy={(v) => openLeadModal('job_application', v)}
              onOpenLeadWithPrefill={(prefill) =>
                openLeadModal('job_application', null, prefill)
              }
            />
          )}

          {route === '/vacancies' && (
            <VacanciesPage
              vacancies={activeVacanciesList}
              onApplyVacancy={(v) => openLeadModal('job_application', v)}
              onOpenConsultation={() => openLeadModal('consultation', null)}
              onOpenLeadWithPrefill={(prefill) =>
                openLeadModal('job_application', null, prefill)
              }
            />
          )}

          {route === '/business' && (
            <BusinessPage
              onOpenConsultation={() => openLeadModal('b2b_request', null)}
            />
          )}

          {route === '/about' && (
            <AboutPage
              onNavigate={navigate}
              onOpenLeadModal={() => openLeadModal('consultation', null)}
            />
          )}

          {route === '/contacts' && <ContactsPage />}

          {route === '/cabinet' && (
            <CabinetPage
              vacancies={activeVacanciesList}
              onNavigate={navigate}
              onApplyVacancy={(v) => openLeadModal('job_application', v)}
              onOpenLeadModal={() => openLeadModal('consultation', null)}
            />
          )}

          {route === '/admin' && (
            <AdminDashboard
              vacancies={activeVacanciesList}
              hasFirestoreVacancies={hasFirestoreVacancies}
            />
          )}
        </PageTransition>
      </main>

      <Footer
        onNavigate={navigate}
        onOpenLeadModal={() => openLeadModal('consultation', null)}
      />

      <LeadModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        defaultType={leadModalType}
        vacancy={selectedVacancy}
        prefill={leadModalPrefill}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <MigrantAppShell />
        </AuthProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
