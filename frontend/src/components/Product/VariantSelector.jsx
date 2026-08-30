import React from 'react';
import { motion } from 'framer-motion';

/**
 * VariantSelector — Responsive pill-style selector for Weight and Packing options.
 *
 * Features:
 *  • Selected pill: black background + white text (with smooth CSS transition)
 *  • Unselected pill: white background + black border + black text
 *  • On mobile (<= 480 px) the pill row becomes horizontally scrollable so pills
 *    never wrap onto a second line or overflow the viewport.
 *  • Touch-friendly tap targets (min 44 px height).
 *  • Accepts an optional `priceHint` map so each pill can show its price inline.
 *
 * Props:
 *  @param {string}   label         — section label, e.g. "Weight" or "Packing"
 *  @param {string[]} options        — array of option strings, e.g. ['250gm','500gm','1kg']
 *  @param {string}   selectedValue  — currently selected option
 *  @param {Function} onChange       — callback(option: string) when user selects
 *  @param {Object}   [priceHint]   — optional { option: price } map shown below each pill
 */
const VariantSelector = ({ label, options, selectedValue, onChange, priceHint, disabledOptions = [] }) => {
  return (
    <div className="flex flex-col gap-2">

      {/* ── Label row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
          {label}:
        </span>
        <span className="text-sm font-bold text-neutral-900">
          {selectedValue}
        </span>
      </div>

      {/* ── Pill row — horizontally scrollable on mobile ──────────────────── */}
      <div
        className="w-full overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Hide scrollbar cross-browser */}
        <div
          className="flex items-stretch gap-2 pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {options.map((option) => {
            const isSelected = selectedValue === option;
            const isDisabled = disabledOptions.includes(option);

            return (
              <motion.button
                key={option}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onChange(option)}
                whileTap={isDisabled ? {} : { scale: 0.95 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                aria-label={`Select ${label}: ${option}${isDisabled ? ' (Out of stock)' : ''}`}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-xl"
                style={{
                  /* Minimum touch target: 44 px high */
                  minHeight: '44px',
                  minWidth: '72px',
                  /* Padding provides breathing room */
                  padding: priceHint ? '8px 16px' : '10px 18px',
                  /* Smooth background + border + color transitions */
                  transition: 'background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease',
                  backgroundColor: isDisabled ? '#f5f5f5' : (isSelected ? '#000000' : '#ffffff'),
                  color:           isDisabled ? '#a3a3a3' : (isSelected ? '#ffffff' : '#1a1a1a'),
                  border:          isDisabled ? '1.5px dashed #d4d4d4' : (isSelected ? '1.5px solid #000000' : '1.5px solid #d4d4d4'),
                  boxShadow:       isSelected && !isDisabled ? '0 2px 8px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
                  fontWeight:      isSelected ? '700' : '500',
                  fontSize:        '0.875rem',  /* 14px */
                  lineHeight:      1.2,
                  letterSpacing:   '0.01em',
                  cursor:          isDisabled ? 'not-allowed' : 'pointer',
                  opacity:         isDisabled ? 0.6 : 1,
                }}
              >
                <span>{option}</span>
                {isDisabled ? (
                  <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: '700', lineHeight: 1 }}>
                    Out of stock
                  </span>
                ) : priceHint && priceHint[option] != null ? (
                  <span
                    style={{
                      fontSize:   '0.7rem',
                      fontWeight: isSelected ? '600' : '400',
                      opacity:    isSelected ? 0.85 : 0.6,
                      lineHeight: 1,
                    }}
                  >
                    {typeof priceHint[option] === 'number' ? `₹${priceHint[option]}` : priceHint[option]}
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
