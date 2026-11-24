import React from 'react';
import { MigrantLogoMark } from './MigrantIcons';
import type { PageRoute } from '../types/migrant';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
  onOpenLeadModal: () => void;
}

export function Footer({ onNavigate, onOpenLeadModal }: FooterProps) {
  const linkClass =
    'inline-block text-sm text-[#3B527A] hover:text-[#0E3B8C] hover:translate-x-0.5 transition-all whitespace-nowrap';

  return (
    <footer className="mt-16 border-t border-white/90 bg-gradient-to-b from-white/85 to-[#EDF4FF]/90 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-11">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <MigrantLogoMark className="w-8 h-8" />
              <span className="text-lg font-extrabold tracking-tight text-[#0B224C]">
                MIGRANT
              </span>
            </div>
            <p className="text-sm text-[#3B527A] max-w-md leading-relaxed">
              Международное агентство занятости: официальное трудоустройство за рубежом, проверенные вакансии в Европе и комплектация персонала для бизнеса.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#0B224C] mb-3">Разделы</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} className={linkClass}>
                  Главная
                </a>
              </li>
              <li>
                <a href="/vacancies" onClick={(e) => { e.preventDefault(); onNavigate('/vacancies'); }} className={linkClass}>
                  Вакансии за границей
                </a>
              </li>
              <li>
                <a href="/business" onClick={(e) => { e.preventDefault(); onNavigate('/business'); }} className={linkClass}>
                  Для бизнеса
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('/about'); }} className={linkClass}>
                  О компании
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#0B224C] mb-3">Сервис и доступ</h3>
            <ul className="space-y-2">
              <li>
                <a href="/cabinet" onClick={(e) => { e.preventDefault(); onNavigate('/cabinet'); }} className={linkClass}>
                  Личный кабинет
                </a>
              </li>
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); onNavigate('/admin'); }} className={linkClass}>
                  Админ-панель
                </a>
              </li>
              <li>
                <a href="/contacts" onClick={(e) => { e.preventDefault(); onNavigate('/contacts'); }} className={linkClass}>
                  Контакты
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLeadModal}
                  className="text-sm font-semibold text-[#1448A0] hover:underline cursor-pointer"
                >
                  Оставить заявку
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E6F0FF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#546B91]">
          <p>© {new Date().getFullYear()} MIGRANT. Международное агентство занятости.</p>
          <p>Официальное трудоустройство · Германия · Польша · Чехия · Украина</p>
        </div>
      </div>
    </footer>
  );
}
