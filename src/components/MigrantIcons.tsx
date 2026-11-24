import React, { useId } from 'react';
import type { CountryCode, IconType } from '../types/migrant';

export type FeatureIconKind =
  | 'clipboard'
  | 'shield'
  | 'passport'
  | 'team'
  | 'speed'
  | 'risk'
  | 'search'
  | 'handshake'
  | 'hardhat'
  | 'building'
  | 'calendar'
  | 'chat'
  | 'globe'
  | 'docCheck';

export function MigrantLogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 44 44" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`pinBody-${uid}`} x1="8" y1="3" x2="36" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2B74E4" />
          <stop offset="48%" stopColor="#164BB0" />
          <stop offset="100%" stopColor="#0A2B6B" />
        </linearGradient>
        <linearGradient id={`pinSheen-${uid}`} x1="12" y1="5" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={`pinShadow-${uid}`} x="2" y="2" width="40" height="42" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#0B2E73" floodOpacity="0.24" />
        </filter>
      </defs>
      <g filter={`url(#pinShadow-${uid})`}>
        <path
          d="M22 3C13.163 3 6 10.115 6 18.894c0 10.37 13.53 19.35 15.063 20.33a1.76 1.76 0 0 0 1.874 0C24.47 38.244 38 29.264 38 18.894 38 10.115 30.837 3 22 3Z"
          fill={`url(#pinBody-${uid})`}
        />
        <path
          d="M22 4.2c-8.15 0-14.75 6.55-14.75 14.65 0 4.02 2.27 8.43 5.5 12.1-2.55-3.4-4.2-7.35-4.2-11.2C8.55 11.75 14.6 5.7 22 5.7c5.4 0 10.05 3.18 12.2 7.82C32.45 7.95 27.65 4.2 22 4.2Z"
          fill={`url(#pinSheen-${uid})`}
        />
        <path
          d="M13.6 25.4V13.4h3.55l4.85 7.35 4.85-7.35h3.55v12h-3.4v-6.65l-4.2 6.05h-1.6l-4.2-6.05v6.65h-3.4Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

export function CountryFlag({
  code,
  className = 'w-5 h-5',
  variant = 'circle',
}: {
  code: CountryCode;
  className?: string;
  variant?: 'circle' | 'pill';
}) {
  const uid = useId().replace(/:/g, '');
  const isPill = variant === 'pill';
  const viewBox = isPill ? '0 0 28 20' : '0 0 24 24';

  const renderStripes = () => {
    const w = isPill ? 28 : 24;
    const h = isPill ? 20 : 24;
    switch (code) {
      case 'DE':
        return (
          <>
            <rect width={w} height={h / 3} y={0} fill="#18212F" />
            <rect width={w} height={h / 3} y={h / 3} fill="#DC2626" />
            <rect width={w} height={h / 3 + 0.5} y={(h * 2) / 3} fill="#FACC15" />
          </>
        );
      case 'PL':
        return (
          <>
            <rect width={w} height={h / 2} y={0} fill="#FFFFFF" />
            <rect width={w} height={h / 2 + 0.5} y={h / 2} fill="#DC2626" />
          </>
        );
      case 'CZ':
        return (
          <>
            <rect width={w} height={h / 2} y={0} fill="#FFFFFF" />
            <rect width={w} height={h / 2 + 0.5} y={h / 2} fill="#DC2626" />
            <polygon points={`0,0 ${w * 0.54},${h / 2} 0,${h}`} fill="#1D4ED8" />
          </>
        );
      case 'UA':
        return (
          <>
            <rect width={w} height={h / 2} y={0} fill="#2563EB" />
            <rect width={w} height={h / 2 + 0.5} y={h / 2} fill="#FACC15" />
          </>
        );
      case 'NL':
        return (
          <>
            <rect width={w} height={h / 3} y={0} fill="#DC2626" />
            <rect width={w} height={h / 3} y={h / 3} fill="#FFFFFF" />
            <rect width={w} height={h / 3 + 0.5} y={(h * 2) / 3} fill="#1D4ED8" />
          </>
        );
      case 'LT':
        return (
          <>
            <rect width={w} height={h / 3} y={0} fill="#FACC15" />
            <rect width={w} height={h / 3} y={h / 3} fill="#15803D" />
            <rect width={w} height={h / 3 + 0.5} y={(h * 2) / 3} fill="#DC2626" />
          </>
        );
      default:
        return (
          <>
            <rect width={w} height={h} fill="#1D4ED8" />
            <circle
              cx={w / 2}
              cy={h / 2}
              r={Math.min(w, h) * 0.28}
              stroke="#FACC15"
              strokeWidth="1.6"
              strokeDasharray="1.8 2"
              fill="none"
            />
          </>
        );
    }
  };

  return (
    <svg
      viewBox={viewBox}
      className={`${className} shrink-0 drop-shadow-[0_1px_2px_rgba(11,34,76,0.18)]`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`flagClip-${uid}`}>
          {isPill ? (
            <rect x="0.75" y="0.75" width="26.5" height="18.5" rx="5.5" />
          ) : (
            <circle cx="12" cy="12" r="11" />
          )}
        </clipPath>
        <linearGradient id={`flagGloss-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#flagClip-${uid})`}>
        {renderStripes()}
        <rect
          x="0"
          y="0"
          width={isPill ? 28 : 24}
          height={isPill ? 20 : 24}
          fill={`url(#flagGloss-${uid})`}
        />
      </g>
      {isPill ? (
        <rect
          x="0.75"
          y="0.75"
          width="26.5"
          height="18.5"
          rx="5.5"
          stroke="rgba(15, 42, 96, 0.14)"
          strokeWidth="1"
          fill="none"
        />
      ) : (
        <circle
          cx="12"
          cy="12"
          r="10.75"
          stroke="rgba(15, 42, 96, 0.14)"
          strokeWidth="1"
          fill="none"
        />
      )}
    </svg>
  );
}

export function BlueFeatureIcon({
  kind,
  className = 'w-14 h-14',
}: {
  kind: FeatureIconKind;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 72 72" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`bMain-${uid}`} x1="12" y1="8" x2="60" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="46%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#10398F" />
        </linearGradient>
        <linearGradient id={`bLight-${uid}`} x1="10" y1="6" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`bDeep-${uid}`} x1="16" y1="12" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0A2866" />
        </linearGradient>
        <linearGradient id={`bPaper-${uid}`} x1="18" y1="14" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id={`bGloss-${uid}`} x1="14" y1="8" x2="48" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`skinWarm-${uid}`} x1="28" y1="10" x2="42" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE1C6" />
          <stop offset="100%" stopColor="#F0AE7E" />
        </linearGradient>
        <linearGradient id={`hairDark-${uid}`} x1="26" y1="8" x2="44" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B4F75" />
          <stop offset="100%" stopColor="#162749" />
        </linearGradient>
        <radialGradient id={`floorShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1448A0" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1448A0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft ground contact shadow */}
      <ellipse cx="36" cy="64.5" rx="22" ry="4" fill={`url(#floorShadow-${uid})`} />

      {kind === 'clipboard' && (
        <g transform="rotate(-5 36 36)">
          {/* Back 3D thickness */}
          <rect x="17" y="14" width="40" height="48" rx="9" fill={`url(#bDeep-${uid})`} />
          {/* Main board face */}
          <rect x="15" y="12" width="40" height="48" rx="9" fill={`url(#bMain-${uid})`} />
          {/* Inner glossy paper sheet */}
          <rect x="20" y="19" width="30" height="36" rx="5.5" fill={`url(#bPaper-${uid})`} />
          {/* Specular top edge */}
          <rect x="16.5" y="13.5" width="37" height="14" rx="7.5" fill={`url(#bGloss-${uid})`} opacity="0.4" />
          {/* Top metallic 3D clip */}
          <rect x="25" y="7" width="20" height="10" rx="5" fill={`url(#bDeep-${uid})`} />
          <rect x="26" y="7.8" width="18" height="7.5" rx="3.8" fill={`url(#bLight-${uid})`} />
          <circle cx="35" cy="11.5" r="2.2" fill="#EFF6FF" />
          {/* Checkmark rows */}
          <path d="M24.5 27.5l2.8 2.8 5.2-5.4" stroke="#1D4ED8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="35.5" y="26.5" width="10.5" height="2.8" rx="1.4" fill="#93C5FD" />
          <path d="M24.5 36.5l2.8 2.8 5.2-5.4" stroke="#1D4ED8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="35.5" y="35.5" width="10.5" height="2.8" rx="1.4" fill="#93C5FD" />
          <path d="M24.5 45.5l2.8 2.8 5.2-5.4" stroke="#2563EB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="35.5" y="44.5" width="8.5" height="2.8" rx="1.4" fill="#BFDBFE" />
        </g>
      )}

      {kind === 'shield' && (
        <g>
          {/* Outer rim depth */}
          <path
            d="M36 7L13 15.8v15.4c0 15.2 9.7 26.2 23 30.8 13.3-4.6 23-15.6 23-30.8V15.8L36 7Z"
            fill={`url(#bDeep-${uid})`}
          />
          {/* Left brighter 3D bevel */}
          <path
            d="M36 9.2L15.2 17.2v13.8c0 13.8 8.6 23.9 20.8 28.2V9.2Z"
            fill={`url(#bLight-${uid})`}
          />
          {/* Right richer 3D bevel */}
          <path
            d="M36 9.2v50c12.2-4.3 20.8-14.4 20.8-28.2V17.2L36 9.2Z"
            fill={`url(#bMain-${uid})`}
          />
          {/* Top specular arc */}
          <path
            d="M36 10.6L16.8 18v8c6.2-3.4 13-5.2 19.2-5.2 6.2 0 13 1.8 19.2 5.2v-8L36 10.6Z"
            fill={`url(#bGloss-${uid})`}
            opacity="0.55"
          />
          {/* Checkmark shadow */}
          <path
            d="M25.5 36.2l7.2 7.2L47 29.2"
            stroke="#0A2866"
            strokeOpacity="0.28"
            strokeWidth="5.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sculpted crisp white checkmark */}
          <path
            d="M25.5 34.4l7.2 7.2L47 27.4"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {kind === 'passport' && (
        <g>
          {/* Crisp white official document in back */}
          <rect x="9" y="10" width="32" height="42" rx="6" fill="#CBDDF8" />
          <rect x="8" y="9" width="32" height="42" rx="6" fill={`url(#bPaper-${uid})`} stroke="#93C5FD" strokeWidth="1.4" />
          <rect x="14" y="17" width="18" height="3.2" rx="1.6" fill="#2563EB" />
          <rect x="14" y="24" width="20" height="2.8" rx="1.4" fill="#60A5FA" />
          <rect x="14" y="30.5" width="14" height="2.8" rx="1.4" fill="#93C5FD" />
          <rect x="14" y="37" width="11" height="2.8" rx="1.4" fill="#BFDBFE" />
          {/* Overlapping 3D biometric passport */}
          <g transform="rotate(6 47 41)">
            <rect x="33" y="21" width="30" height="39" rx="6.5" fill={`url(#bDeep-${uid})`} />
            <rect x="31" y="19.5" width="30" height="39" rx="6.5" fill={`url(#bMain-${uid})`} />
            <rect x="32.5" y="21" width="27" height="14" rx="5" fill={`url(#bGloss-${uid})`} opacity="0.4" />
            {/* Gold/white stitched accent line */}
            <rect x="34" y="22.5" width="24" height="33" rx="4" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1" />
            {/* Globe emblem */}
            <circle cx="46" cy="37.5" r="8.5" stroke="#FFFFFF" strokeWidth="1.9" />
            <ellipse cx="46" cy="37.5" rx="3.9" ry="8.5" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M37.5 37.5h17M39 33.2h14M39 41.8h14" stroke="#FFFFFF" strokeWidth="1.35" />
            {/* Bottom bar */}
            <rect x="40" y="49.5" width="12" height="2.4" rx="1.2" fill="#BFDBFE" />
          </g>
        </g>
      )}

      {kind === 'team' && (
        <g>
          {/* Left team member */}
          <path d="M8 55c0-6.8 5.2-11.2 12-11.2S32 48.2 32 55v3.5H8V55Z" fill={`url(#bLight-${uid})`} />
          <path d="M16.5 44l3.5 5 3.5-5" fill="#EFF6FF" />
          <circle cx="20" cy="31" r="7.4" fill={`url(#skinWarm-${uid})`} />
          <path d="M12.6 30c0-4.4 3.3-7.4 7.4-7.4s7.4 3 7.4 7.4c-1.8-2.2-4.4-3-7.4-3s-5.6.8-7.4 3Z" fill={`url(#hairDark-${uid})`} />

          {/* Right team member */}
          <path d="M40 55c0-6.8 5.2-11.2 12-11.2S64 48.2 64 55v3.5H40V55Z" fill={`url(#bLight-${uid})`} />
          <path d="M48.5 44l3.5 5 3.5-5" fill="#EFF6FF" />
          <circle cx="52" cy="31" r="7.4" fill={`url(#skinWarm-${uid})`} />
          <path d="M44.6 30c0-4.4 3.3-7.4 7.4-7.4s7.4 3 7.4 7.4c-1.8-2.2-4.4-3-7.4-3s-5.6.8-7.4 3Z" fill={`url(#hairDark-${uid})`} />

          {/* Center prominent manager */}
          <path d="M19.5 56.5c0-9.2 7.3-14.8 16.5-14.8s16.5 5.6 16.5 14.8v4H19.5v-4Z" fill={`url(#bMain-${uid})`} />
          <path d="M21 56c0-7.6 6.5-12.5 15-12.5 3.2 0 6.2.7 8.6 2-5.4-.5-14.2 1.8-23.6 10.5Z" fill={`url(#bGloss-${uid})`} opacity="0.35" />
          {/* Crisp white shirt V + royal tie */}
          <path d="M31.2 42l4.8 8.2 4.8-8.2h-9.6Z" fill="#FFFFFF" />
          <path d="M34.5 45.2h3l1.2 11.3-2.7 3.2-2.7-3.2 1.2-11.3Z" fill={`url(#bDeep-${uid})`} />
          {/* Head & sculpted hair */}
          <circle cx="36" cy="25.5" r="9.6" fill={`url(#skinWarm-${uid})`} />
          <path d="M26.4 24.4c0-5.8 4.4-9.8 9.8-9.8 5.4 0 9.6 3.8 9.6 9.8-2.4-2.8-5.6-3.8-9.8-3.8-4.2 0-7.2 1-9.6 3.8Z" fill={`url(#hairDark-${uid})`} />
        </g>
      )}

      {kind === 'speed' && (
        <g>
          {/* Motion streaks */}
          <rect x="6" y="26" width="12" height="3.6" rx="1.8" fill="#3B82F6" />
          <rect x="3" y="34.5" width="14" height="3.6" rx="1.8" fill="#1D4ED8" />
          <rect x="8" y="43" width="10" height="3.6" rx="1.8" fill="#60A5FA" />
          {/* Side pusher */}
          <rect x="55" y="17" width="6" height="8" rx="2.5" transform="rotate(35 58 21)" fill={`url(#bDeep-${uid})`} />
          {/* Top crown */}
          <rect x="36" y="9" width="12" height="5" rx="2.5" fill={`url(#bDeep-${uid})`} />
          <rect x="40" y="13.5" width="4" height="5" fill="#1E40AF" />
          {/* Stopwatch 3D case */}
          <circle cx="42" cy="38" r="21" fill={`url(#bDeep-${uid})`} />
          <circle cx="41.5" cy="37.2" r="20.2" fill={`url(#bMain-${uid})`} />
          {/* Crisp dial face */}
          <circle cx="41.5" cy="37.2" r="15" fill={`url(#bPaper-${uid})`} />
          <path d="M29 31a14 14 0 0 1 25 0c-4.5-3.2-9-4.5-12.5-4.5S33.5 27.8 29 31Z" fill={`url(#bGloss-${uid})`} />
          {/* Dial ticks */}
          <path d="M41.5 25v2.4M41.5 47v2.4M29.2 37.2h2.4M51.4 37.2h2.4" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />
          {/* Hands */}
          <path d="M41.5 37.2V28M41.5 37.2l7.2 4.6" stroke="#1448A0" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="41.5" cy="37.2" r="3" fill="#2563EB" />
        </g>
      )}

      {kind === 'risk' && (
        <g>
          {/* 3D descending bars */}
          <rect x="13" y="30" width="12" height="28" rx="3.5" fill={`url(#bMain-${uid})`} />
          <rect x="14.5" y="31.5" width="9" height="8" rx="2" fill={`url(#bGloss-${uid})`} opacity="0.45" />
          <rect x="30" y="38" width="12" height="20" rx="3.5" fill={`url(#bLight-${uid})`} />
          <rect x="47" y="45" width="12" height="13" rx="3.5" fill={`url(#bDeep-${uid})`} />
          {/* Sweeping downward reduction arrow */}
          <path
            d="M13 15l18 11 10-4 17 14"
            stroke={`url(#bDeep-${uid})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M49 36h9.5v-9.5"
            stroke={`url(#bDeep-${uid})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {kind === 'search' && (
        <g>
          {/* Candidate silhouettes inside/behind lens */}
          <circle cx="24" cy="24" r="5" fill="#93C5FD" />
          <path d="M16 37c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5v2H16v-2Z" fill="#60A5FA" />
          {/* 3D Magnifying Glass Handle */}
          <path d="M44 44l15 15" stroke={`url(#bDeep-${uid})`} strokeWidth="8.5" strokeLinecap="round" />
          <path d="M45 43.2l13 13" stroke="#60A5FA" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
          {/* Outer Metallic Ring */}
          <circle cx="31" cy="31" r="19" fill={`url(#bMain-${uid})`} />
          <circle cx="31" cy="31" r="13.5" fill={`url(#bPaper-${uid})`} />
          {/* Candidate silhouette focused inside glass */}
          <circle cx="31" cy="27.5" r="4.8" fill={`url(#bMain-${uid})`} />
          <path d="M23.5 39c1.4-4 4.2-5.6 7.5-5.6s6.1 1.6 7.5 5.6" fill={`url(#bLight-${uid})`} />
          {/* Curved lens reflection */}
          <path d="M21 25a11.5 11.5 0 0 1 11-7" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" />
        </g>
      )}

      {kind === 'handshake' && (
        <g>
          {/* Left cuff */}
          <rect x="6" y="25" width="12" height="19" rx="3.5" transform="rotate(-18 12 34)" fill={`url(#bDeep-${uid})`} />
          {/* Right cuff */}
          <rect x="54" y="25" width="12" height="19" rx="3.5" transform="rotate(18 60 34)" fill={`url(#bDeep-${uid})`} />
          {/* Sculpted palms */}
          <path
            d="M15 31l11-9.5c3.2-2.7 7.8-2.6 10.9.3l3.6 3.4 6.5-4.5 10 9.5-15.5 16.8c-3.2 3.3-8.5 3.4-11.8.2L15 31Z"
            fill={`url(#bMain-${uid})`}
          />
          <path
            d="M27 23c3-2 7-1.6 9.5 1l15 14.5-6.5 6.8L27 23Z"
            fill={`url(#bLight-${uid})`}
            opacity="0.7"
          />
          {/* Crisp finger folds */}
          <path d="M26 42l5.2 5.2M32.5 37.5l5.2 5.2M39 33l5.2 5.2" stroke="#EFF6FF" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}

      {kind === 'hardhat' && (
        <g>
          {/* Back brim shadow */}
          <rect x="9" y="45" width="54" height="8" rx="4" fill={`url(#bDeep-${uid})`} />
          {/* Main dome */}
          <path d="M13 45c0-13.5 10.3-24 23-24s23 10.5 23 24v2H13v-2Z" fill={`url(#bMain-${uid})`} />
          {/* Glossy side shine */}
          <path d="M17.5 41c1.2-9 7.8-15.6 15.5-16.8-5.5 3.4-9.5 9.8-10.5 16.8h-5Z" fill={`url(#bGloss-${uid})`} opacity="0.65" />
          {/* Center protective ridge */}
          <rect x="30.5" y="15.5" width="11" height="30.5" rx="5.5" fill={`url(#bLight-${uid})`} />
          <rect x="33" y="17.5" width="3.5" height="24" rx="1.75" fill="#FFFFFF" opacity="0.35" />
          {/* Front visor rim */}
          <rect x="8" y="44" width="56" height="6.8" rx="3.4" fill={`url(#bDeep-${uid})`} />
        </g>
      )}

      {kind === 'building' && (
        <g>
          {/* Left tall corporate tower */}
          <rect x="13" y="13" width="26" height="46" rx="4.5" fill={`url(#bMain-${uid})`} />
          <rect x="15" y="15" width="10" height="42" rx="3" fill={`url(#bGloss-${uid})`} opacity="0.28" />
          {/* Right modern wing */}
          <rect x="37" y="25" width="22" height="34" rx="4" fill={`url(#bDeep-${uid})`} />
          {/* Windows left tower */}
          {[20, 28, 36, 44].map((y) => (
            <React.Fragment key={y}>
              <rect x="18" y={y} width="5.5" height="4.5" rx="1.2" fill="#EFF6FF" />
              <rect x="27.5" y={y} width="5.5" height="4.5" rx="1.2" fill="#DBEAFE" />
            </React.Fragment>
          ))}
          {/* Windows right wing */}
          {[31, 39, 47].map((y) => (
            <React.Fragment key={y}>
              <rect x="42" y={y} width="5" height="4.5" rx="1.2" fill="#93C5FD" />
              <rect x="50" y={y} width="5" height="4.5" rx="1.2" fill="#BFDBFE" />
            </React.Fragment>
          ))}
          {/* Base ground line */}
          <rect x="9" y="57" width="54" height="3.5" rx="1.75" fill={`url(#bDeep-${uid})`} />
        </g>
      )}

      {kind === 'calendar' && (
        <g>
          <rect x="12" y="16" width="48" height="43" rx="8.5" fill={`url(#bDeep-${uid})`} />
          <rect x="12" y="15" width="48" height="42" rx="8.5" fill={`url(#bPaper-${uid})`} stroke="#93C5FD" strokeWidth="1.5" />
          {/* Header strip */}
          <path d="M12 23.5C12 18.8 15.8 15 20.5 15h31c4.7 0 8.5 3.8 8.5 8.5V28H12v-4.5Z" fill={`url(#bMain-${uid})`} />
          {/* Binding rings */}
          <rect x="22" y="9" width="6" height="12" rx="3" fill={`url(#bDeep-${uid})`} />
          <rect x="44" y="9" width="6" height="12" rx="3" fill={`url(#bDeep-${uid})`} />
          {/* Calendar grid */}
          {[34, 43].map((y, rowIdx) =>
            [19, 30, 41, 49].map((x, colIdx) => (
              <rect
                key={`${rowIdx}-${colIdx}`}
                x={x}
                y={y}
                width={colIdx === 3 ? 5 : 6.5}
                height="5.5"
                rx="1.6"
                fill={rowIdx === 0 && colIdx === 1 ? '#2563EB' : '#93C5FD'}
              />
            ))
          )}
        </g>
      )}

      {kind === 'chat' && (
        <g>
          <path
            d="M12 32c0-11.5 10.7-20.5 24-20.5S60 20.5 60 32s-10.7 20.5-24 20.5c-3.7 0-7.2-.7-10.4-2L14 55l3.6-9.5C14 41.9 12 37.2 12 32Z"
            fill={`url(#bMain-${uid})`}
          />
          <ellipse cx="30" cy="21" rx="14" ry="5.5" fill={`url(#bGloss-${uid})`} opacity="0.45" />
          <circle cx="26" cy="32.5" r="3.4" fill="#FFFFFF" />
          <circle cx="36" cy="32.5" r="3.4" fill="#FFFFFF" />
          <circle cx="46" cy="32.5" r="3.4" fill="#FFFFFF" />
        </g>
      )}

      {kind === 'globe' && (
        <g>
          <circle cx="36" cy="36" r="24" fill={`url(#bMain-${uid})`} />
          <ellipse cx="29" cy="23" rx="12" ry="6" fill={`url(#bGloss-${uid})`} opacity="0.4" />
          <circle cx="36" cy="36" r="19.5" stroke="#FFFFFF" strokeWidth="2.4" />
          <ellipse cx="36" cy="36" rx="9" ry="19.5" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M16.5 36h39M19.5 26.5h33M19.5 45.5h33" stroke="#FFFFFF" strokeWidth="1.9" />
        </g>
      )}

      {kind === 'docCheck' && (
        <g>
          <rect x="14" y="10" width="36" height="46" rx="7" fill={`url(#bPaper-${uid})`} stroke="#93C5FD" strokeWidth="1.6" />
          <rect x="21" y="20" width="22" height="3.2" rx="1.6" fill="#2563EB" />
          <rect x="21" y="28" width="22" height="3" rx="1.5" fill="#60A5FA" />
          <rect x="21" y="36" width="14" height="3" rx="1.5" fill="#93C5FD" />
          {/* Floating glossy check seal */}
          <circle cx="49" cy="48" r="13" fill={`url(#bMain-${uid})`} stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M43.5 48.2l3.8 3.8 7.5-7.8" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

export function VacancyJobIcon({ type, className = 'w-14 h-14' }: { type: IconType; className?: string }) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 76 76" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`jBlue-${uid}`} x1="10" y1="8" x2="66" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#10398F" />
        </linearGradient>
        <linearGradient id={`jSky-${uid}`} x1="8" y1="10" x2="62" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="52%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id={`jNavy-${uid}`} x1="12" y1="12" x2="64" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0B245B" />
        </linearGradient>
        <linearGradient id={`jMetal-${uid}`} x1="10" y1="12" x2="64" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2EEFF" />
          <stop offset="50%" stopColor="#93B4E4" />
          <stop offset="100%" stopColor="#4F74AE" />
        </linearGradient>
        <linearGradient id={`jKraft1-${uid}`} x1="10" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3C892" />
          <stop offset="100%" stopColor="#CE8E4C" />
        </linearGradient>
        <linearGradient id={`jKraft2-${uid}`} x1="14" y1="14" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E7B374" />
          <stop offset="100%" stopColor="#B87635" />
        </linearGradient>
        <linearGradient id={`jWood-${uid}`} x1="8" y1="54" x2="68" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C98A49" />
          <stop offset="100%" stopColor="#854D1E" />
        </linearGradient>
        <linearGradient id={`jAmber-${uid}`} x1="16" y1="16" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id={`jSkin-${uid}`} x1="28" y1="12" x2="46" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE0C2" />
          <stop offset="100%" stopColor="#EDAB7C" />
        </linearGradient>
        <radialGradient id={`jShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1448A0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1448A0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="38" cy="67.5" rx="25" ry="4.2" fill={`url(#jShadow-${uid})`} />

      {type === 'plumbing' && (
        <g>
          {/* Wrench accent curving beneath left */}
          <path
            d="M15 49l13-13c2-2 5-2 7 0l2 2-15 15c-2 2-5 2-7 0s-2-2 0-4Z"
            fill={`url(#jMetal-${uid})`}
          />
          <circle cx="17" cy="49" r="6" fill={`url(#jBlue-${uid})`} />
          <circle cx="17" cy="49" r="2.6" fill="#EFF6FF" />
          {/* Wall flange & pipe body */}
          <rect x="10" y="25" width="7" height="18" rx="3" fill={`url(#jNavy-${uid})`} />
          <path
            d="M17 29h29c7.2 0 13 5.8 13 13v4h-10v-4c0-1.7-1.3-3-3-3H17V29Z"
            fill={`url(#jMetal-${uid})`}
          />
          {/* Pipe specular highlight */}
          <path d="M18 31.5h28c5.2 0 9.5 3.6 10.3 8.5" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="2.2" strokeLinecap="round" />
          {/* Faucet collar */}
          <rect x="29" y="24" width="12" height="17" rx="3.5" fill={`url(#jBlue-${uid})`} />
          {/* Valve stem & cross handle */}
          <rect x="32.5" y="16" width="5" height="9" rx="2" fill={`url(#jNavy-${uid})`} />
          <rect x="23" y="12.5" width="24" height="5.5" rx="2.75" fill={`url(#jBlue-${uid})`} />
          <circle cx="35" cy="15.2" r="3.4" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
          {/* Nozzle ring */}
          <rect x="47.5" y="45" width="13" height="4.2" rx="2.1" fill={`url(#jNavy-${uid})`} />
          {/* Glossy 3D water drop */}
          <path
            d="M54 51.5c0 0 6.5 6.8 6.5 10.6a6.5 6.5 0 1 1-13 0c0-3.8 6.5-10.6 6.5-10.6Z"
            fill={`url(#jBlue-${uid})`}
          />
          <path
            d="M52.2 59.8a2.2 4.2 0 0 1 2-3.4"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      )}

      {type === 'painting' && (
        <g>
          {/* Steel bent wire frame */}
          <path
            d="M54 23h6.5a3 3 0 0 1 3 3v7.5a4 4 0 0 1-3 3.9L41 42.2a3.5 3.5 0 0 0-2.6 3.4V51"
            stroke={`url(#jMetal-${uid})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Plush 3D paint roller cylinder */}
          <rect x="13" y="14" width="42" height="18" rx="6.5" fill={`url(#jBlue-${uid})`} />
          <rect x="15" y="15.5" width="38" height="6.5" rx="3.5" fill="#FFFFFF" opacity="0.32" />
          {/* Roller end cap */}
          <rect x="11" y="17" width="4.5" height="12" rx="2.2" fill={`url(#jNavy-${uid})`} />
          {/* Subtle paint trail highlight */}
          <rect x="19" y="27.5" width="30" height="2.6" rx="1.3" fill="#93C5FD" opacity="0.7" />
          {/* Ergonomic sculpted handle */}
          <rect x="33.5" y="47" width="10" height="18.5" rx="5" fill={`url(#jNavy-${uid})`} />
          <rect x="35" y="48.5" width="4.5" height="14" rx="2.2" fill={`url(#jSky-${uid})`} opacity="0.55" />
          <circle cx="38.5" cy="61.5" r="1.8" fill="#EFF6FF" />
        </g>
      )}

      {type === 'warehouse' && (
        <g>
          {/* Wooden Euro-Pallet */}
          <rect x="10" y="55" width="56" height="5.5" rx="2" fill={`url(#jWood-${uid})`} />
          <rect x="14" y="60.5" width="7.5" height="4.5" rx="1.2" fill="#78350F" />
          <rect x="34.2" y="60.5" width="7.5" height="4.5" rx="1.2" fill="#78350F" />
          <rect x="54.5" y="60.5" width="7.5" height="4.5" rx="1.2" fill="#78350F" />

          {/* Bottom-left kraft box */}
          <rect x="13" y="33" width="23.5" height="22" rx="3.5" fill={`url(#jKraft1-${uid})`} />
          <rect x="21.5" y="33" width="6.5" height="9" rx="1" fill="#FEF3C7" opacity="0.88" />
          <rect x="16.5" y="47.5" width="8" height="3.5" rx="1" fill="#92400E" opacity="0.45" />

          {/* Bottom-right kraft box */}
          <rect x="39.5" y="33" width="23.5" height="22" rx="3.5" fill={`url(#jKraft2-${uid})`} />
          <rect x="48" y="33" width="6.5" height="9" rx="1" fill="#FEF3C7" opacity="0.82" />
          <rect x="43" y="47.5" width="8" height="3.5" rx="1" fill="#78350F" opacity="0.45" />

          {/* Top stacked kraft box */}
          <rect x="25.5" y="12" width="25" height="22" rx="3.5" fill={`url(#jKraft1-${uid})`} stroke="#FDE68A" strokeOpacity="0.45" strokeWidth="1" />
          <rect x="34.5" y="12" width="7" height="9.5" rx="1" fill="#FEF3C7" opacity="0.92" />
          <path d="M29.5 27.5h7M29.5 30h4.5" stroke="#92400E" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}

      {type === 'manufacturing' && (
        <g>
          {/* Spinning 3D industrial precision gear */}
          <g transform="translate(49, 24)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <rect
                key={deg}
                x="-3.4"
                y="-15.5"
                width="6.8"
                height="7"
                rx="2"
                fill={`url(#jBlue-${uid})`}
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="11.5" fill={`url(#jBlue-${uid})`} />
            <circle cx="0" cy="0" r="5.5" fill="#EFF6FF" />
            <circle cx="0" cy="0" r="2.2" fill="#1D4ED8" />
          </g>

          {/* Moving packages on conveyor */}
          <rect x="13" y="29" width="16" height="15" rx="3" fill={`url(#jKraft1-${uid})`} />
          <rect x="18.8" y="29" width="4.4" height="5.5" fill="#FEF3C7" />
          <rect x="32.5" y="32" width="14" height="12" rx="2.5" fill={`url(#jKraft2-${uid})`} />
          <rect x="37.5" y="32" width="4" height="4.8" fill="#FEF3C7" />

          {/* Conveyor belt body */}
          <rect x="8" y="44" width="60" height="15" rx="7.5" fill={`url(#jNavy-${uid})`} />
          <rect x="10" y="45.5" width="56" height="3.2" rx="1.6" fill="#60A5FA" opacity="0.55" />
          {/* Steel rollers */}
          {[17, 27.5, 38, 48.5, 59].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="52" r="3.8" fill="#DBEAFE" />
              <circle cx={cx} cy="52" r="1.6" fill="#2563EB" />
            </g>
          ))}
        </g>
      )}

      {type === 'logistics' && (
        <g>
          {/* Mast & forks */}
          <rect x="46" y="15" width="4.8" height="38" rx="2.2" fill={`url(#jNavy-${uid})`} />
          <path d="M49 51h16.5" stroke={`url(#jNavy-${uid})`} strokeWidth="4.2" strokeLinecap="round" />
          {/* Stacked cargo on forks */}
          <rect x="52" y="35" width="15" height="14" rx="2.5" fill={`url(#jKraft1-${uid})`} />
          <rect x="57.5" y="35" width="4" height="5.2" fill="#FEF3C7" />
          <rect x="54" y="23" width="12" height="11.5" rx="2.2" fill={`url(#jKraft2-${uid})`} />
          {/* Forklift protective cage */}
          <path
            d="M21 34V19a3 3 0 0 1 3-3h12.5a3 3 0 0 1 2.8 2l5.2 16"
            stroke={`url(#jNavy-${uid})`}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Seat */}
          <rect x="24" y="26" width="5" height="10" rx="2" fill="#2563EB" />
          {/* Main chassis */}
          <path
            d="M11 40a5 5 0 0 1 5-5h28a3 3 0 0 1 3 3v14H15a4 4 0 0 1-4-4v-8Z"
            fill={`url(#jAmber-${uid})`}
          />
          <rect x="13" y="37" width="12" height="12" rx="3" fill={`url(#jBlue-${uid})`} />
          {/* Heavy rubber wheels */}
          <circle cx="20" cy="54" r="7.5" fill="#1E293B" />
          <circle cx="20" cy="54" r="3.4" fill="#CBD5E1" />
          <circle cx="39" cy="55" r="6.5" fill="#1E293B" />
          <circle cx="39" cy="55" r="2.8" fill="#CBD5E1" />
        </g>
      )}

      {type === 'support' && (
        <g>
          {/* Coordinator shoulders */}
          <path d="M18 52c0-7.5 6.8-12 16-12s16 4.5 16 12v3H18v-3Z" fill={`url(#jSky-${uid})`} />
          {/* Head */}
          <circle cx="34" cy="26" r="9.5" fill={`url(#jSkin-${uid})`} />
          {/* Hair */}
          <path d="M24.5 25c0-5.8 4.2-9.8 9.5-9.8s9.5 4 9.5 9.8c-2.2-2.6-5.2-3.8-9.5-3.8s-7.3 1.2-9.5 3.8Z" fill="#1E3A5F" />
          {/* Headset band & earcups */}
          <path d="M22.5 26.5a11.5 11.5 0 0 1 23 0" stroke={`url(#jNavy-${uid})`} strokeWidth="3.2" strokeLinecap="round" />
          <rect x="20.5" y="24" width="4.2" height="8" rx="2.1" fill={`url(#jBlue-${uid})`} />
          <rect x="43.3" y="24" width="4.2" height="8" rx="2.1" fill={`url(#jBlue-${uid})`} />
          <path d="M44 30c0 4.2-3 6-7.2 6" stroke={`url(#jNavy-${uid})`} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="36" cy="36" r="1.8" fill="#2563EB" />
          {/* Sleek open 3D laptop */}
          <rect x="19" y="42" width="38" height="20" rx="4" fill={`url(#jBlue-${uid})`} stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="38" cy="52" r="2.8" fill="#EFF6FF" />
          <rect x="13" y="60.5" width="50" height="4.2" rx="2.1" fill={`url(#jNavy-${uid})`} />
        </g>
      )}

      {type === 'construction' && (
        <g>
          {/* Back brim */}
          <rect x="11" y="43" width="54" height="7.5" rx="3.75" fill={`url(#jNavy-${uid})`} />
          {/* Helmet dome */}
          <path d="M15 43c0-13.2 10.3-23.5 23-23.5S61 29.8 61 43v2H15v-2Z" fill={`url(#jBlue-${uid})`} />
          <path d="M20 39c1.2-8.5 7.5-14.8 14.5-16-5 3.2-8.8 9.2-9.8 16h-4.7Z" fill="#FFFFFF" opacity="0.32" />
          {/* Center ridge */}
          <rect x="32.5" y="14.5" width="11" height="29.5" rx="5.5" fill={`url(#jSky-${uid})`} />
          {/* Front visor */}
          <rect x="10" y="42.5" width="56" height="6.8" rx="3.4" fill={`url(#jNavy-${uid})`} />
          {/* Wrench bar beneath */}
          <rect x="24" y="54" width="28" height="5" rx="2.5" fill={`url(#jMetal-${uid})`} />
          <circle cx="24" cy="56.5" r="4" fill={`url(#jBlue-${uid})`} />
          <circle cx="52" cy="56.5" r="4" fill={`url(#jBlue-${uid})`} />
        </g>
      )}
    </svg>
  );
}

/** Flowing layered light-blue wave ribbons matching the client's hero reference mockups */
export function HeroWaveBackdrop({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 1200 260"
      preserveAspectRatio="none"
      className={`pointer-events-none select-none ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wave1-${uid}`} x1="0" y1="0" x2="1200" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.34" />
          <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`wave2-${uid}`} x1="0" y1="80" x2="1200" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#93C5FD" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.34" />
        </linearGradient>
      </defs>
      <path
        d="M0 112C175 68 355 174 585 138C820 100 1005 34 1200 72V260H0V112Z"
        fill={`url(#wave1-${uid})`}
      />
      <path
        d="M0 166C215 112 415 215 675 168C910 126 1070 86 1200 118V260H0V166Z"
        fill={`url(#wave2-${uid})`}
      />
    </svg>
  );
}

/** Reusable resilient 3D cartoon duo image with graceful fallback */
export function HeroCartoonDuo({
  alt = 'Команда специалистов и соискателей MIGRANT',
  className = '',
  variant = 'light',
}: {
  alt?: string;
  className?: string;
  variant?: 'light' | 'cobalt';
}) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-3xl p-8 text-center ${
          variant === 'cobalt'
            ? 'bg-white/10 border border-white/20 text-white'
            : 'bg-gradient-to-br from-[#DCEBFF] to-[#C8DFFE] border border-white/80 text-[#0B224C]'
        } ${className}`}
      >
        <BlueFeatureIcon kind="team" className="w-20 h-20 mb-3" />
        <p className="text-sm font-bold">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src="/assets/migrant/hero-duo-cutout.png"
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`select-none object-contain ${
        variant === 'cobalt'
          ? 'drop-shadow-[0_18px_32px_rgba(6,24,66,0.42)]'
          : 'drop-shadow-[0_20px_34px_rgba(14,59,140,0.18)]'
      } ${className}`}
    />
  );
}
