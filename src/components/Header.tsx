import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Send, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { MigrantLogoMark } from './MigrantIcons';
import { PREMIUM_EASE } from './MotionPrimitives';
import { useAuth } from '../contexts/AuthContext';
import type { PageRoute } from '../types/migrant';

interface HeaderProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
  onOpenLeadModal: () => void;
}

const NAV_ITEMS: Array<{ route: PageRoute; label: string }> = [
  { route: '/', label: 'Главная' },
  { route: '/vacancies', label: 'Вакансии' },
  { route: '/business', label: 'Для бизнеса' },
  { route: '/about', label: 'О компании' },
  { route: '/contacts', label: 'Контакты' },
];

export function Header({ currentRoute, onNavigate, onOpenLeadModal }: HeaderProps) {
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (route: PageRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 pt-3 px-3 sm:px-6">
      <div
        className={`max-w-[1200px] mx-auto migrant-header-glass rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 lg:gap-8 ${
          scrolled ? 'migrant-header-glass-scrolled' : ''
        }`}
      >
        {/* Zone 1: Brand wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="group flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#1448A0] rounded-full pr-1"
        >
          <MigrantLogoMark className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105" />
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0B224C]">
            MIGRANT
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links with gliding sapphire pill */}
        <nav aria-label="Основная навигация" className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = currentRoute === item.route;
            return (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.route);
                }}
                className={`relative px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active ? 'text-[#0E3B8C]' : 'text-[#1E355E] hover:text-[#0E3B8C]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="headerActiveNav"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-[#E5F0FF] to-[#D4E6FF] border border-[#BFD7FC]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Account + Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNav(isAdmin ? '/admin' : '/cabinet')}
            aria-label={isAdmin ? 'Админ-панель' : 'Личный кабинет'}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-all cursor-pointer ${
              currentRoute === '/cabinet' || currentRoute === '/admin'
                ? 'bg-[#DCEBFF] border-[#93C5FD] text-[#0E3B8C] shadow-xs'
                : 'bg-white/90 border-[#D6E6FF] text-[#1E355E] hover:bg-[#EFF6FF] hover:border-[#93C5FD]'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-[#1448A0]" /> : <UserIcon className="w-4 h-4 text-[#1448A0]" />}
            <span>{isAdmin ? 'Админ' : user ? 'Кабинет' : 'Войти'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeadModal}
            className="migrant-btn-primary text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Оставить заявку</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-full text-[#0B224C] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: PREMIUM_EASE }}
            className="md:hidden mt-2.5 max-w-[1200px] mx-auto migrant-card rounded-3xl p-4 shadow-2xl"
          >
            <nav aria-label="Мобильная навигация" className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = currentRoute === item.route;
                return (
                  <a
                    key={item.route}
                    href={item.route}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(item.route);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active ? 'bg-[#DCEBFF] text-[#0E3B8C]' : 'text-[#0B224C] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <div className="border-t border-[#E2EDFF] my-2" />
              <button
                type="button"
                onClick={() => handleNav('/cabinet')}
                className="px-4 py-2.5 rounded-xl text-left text-sm font-semibold text-[#0E3B8C] hover:bg-[#EFF6FF] flex items-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Личный кабинет</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className="px-4 py-2.5 rounded-xl text-left text-sm font-semibold text-[#0E3B8C] hover:bg-[#EFF6FF] flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Админ-панель</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
