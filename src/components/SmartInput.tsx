import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Newspaper, Cloud, BookOpen, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import { useTranslation } from '../i18n';
import type { SearchMode } from '../services/searchService';
import './SmartInput.css';

interface SmartInputProps {
  onSubmit?: (query: string, mode: SearchMode) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isActive?: boolean;
  className?: string;
  /** Auto-demo mode: automatically trigger searches when suggestions cycle */
  autoDemo?: boolean;
  /** Callback when demo suggestion changes (for globe preview) */
  onDemoChange?: (query: string, mode: SearchMode) => void;
}

// Mode configuration
const MODES: { id: SearchMode; icon: typeof Newspaper; color: string }[] = [
  { id: 'auto', icon: Sparkles, color: '#888888' },
  { id: 'news', icon: Newspaper, color: '#ef4444' },
  { id: 'weather', icon: Cloud, color: '#3b82f6' },
  { id: 'wiki', icon: BookOpen, color: '#888888' },
  { id: 'sports', icon: Trophy, color: '#f59e0b' },
  { id: 'economy', icon: TrendingUp, color: '#10b981' },
];

// Rotating suggestions per mode - localized
const SUGGESTIONS: Record<'en' | 'fr', Record<SearchMode, string[]>> = {
  en: {
    auto: [
      'World news',
      'Global weather',
      'About France',
      'News Japan',
    ],
    news: [
      'World news',
      'Asia news',
      'Europe updates',
      'Americas headlines',
    ],
    weather: [
      'Global weather',
      'Temperature worldwide',
      'Climate today',
      'Weather Europe',
    ],
    wiki: [
      'About France',
      'History Japan',
      'Geography Brazil',
      'Culture Egypt',
    ],
    sports: [
      'Champions League results',
      'NBA standings',
      'World Cup news',
      'Football Europe',
    ],
    economy: [
      'Global markets today',
      'Inflation rates',
      'GDP comparison',
      'Stock market news',
    ],
  },
  fr: {
    auto: [
      'Actualités mondiales',
      'Météo globale',
      'À propos de la France',
      'News Japon',
    ],
    news: [
      'Actualités mondiales',
      'News Asie',
      'Actualités Europe',
      'News Amériques',
    ],
    weather: [
      'Météo globale',
      'Température mondiale',
      'Climat aujourd\'hui',
      'Météo Europe',
    ],
    wiki: [
      'À propos de la France',
      'Histoire Japon',
      'Géographie Brésil',
      'Culture Égypte',
    ],
    sports: [
      'Résultats Ligue des Champions',
      'Classement NBA',
      'Actualités Coupe du Monde',
      'Football Europe',
    ],
    economy: [
      'Marchés mondiaux',
      'Taux d\'inflation',
      'Comparaison PIB',
      'Actualités bourse',
    ],
  },
};

export function SmartInput({
  onSubmit,
  onFocus,
  onBlur,
  isActive = false,
  className = '',
  autoDemo = false,
  onDemoChange,
}: SmartInputProps) {
  const { t, language } = useTranslation();
  const [value, setValue] = useState('');
  const [selectedMode, setSelectedMode] = useState<SearchMode>('auto');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMode = MODES.find(m => m.id === selectedMode) || MODES[0];
  const ModeIcon = currentMode.icon;
  const langSuggestions = SUGGESTIONS[language] || SUGGESTIONS.en;
  const suggestions = langSuggestions[selectedMode];
  const currentSuggestion = suggestions[suggestionIndex];

  // Track last triggered demo to avoid rapid duplicates
  const lastDemoRef = useRef<{ key: string; time: number } | null>(null);

  // Stable callback for triggering demo
  const triggerDemo = useCallback(() => {
    if (!autoDemo || !onDemoChange || isActive || value) return;

    // Create a unique key including language for this demo state
    const demoKey = `${language}-${selectedMode}-${suggestionIndex}`;
    const now = Date.now();

    // Skip only if same demo was triggered less than 500ms ago (debounce)
    if (lastDemoRef.current?.key === demoKey && now - lastDemoRef.current.time < 500) {
      return;
    }
    lastDemoRef.current = { key: demoKey, time: now };

    onDemoChange(currentSuggestion, selectedMode);
  }, [autoDemo, onDemoChange, isActive, value, language, selectedMode, suggestionIndex, currentSuggestion]);

  // Typing effect for placeholder
  useEffect(() => {
    if (isActive || value || !autoDemo) {
      setTypedText(currentSuggestion);
      return;
    }

    setTypedText('');
    setIsTyping(true);
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < currentSuggestion.length) {
        setTypedText(currentSuggestion.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50); // 50ms per character

    return () => clearInterval(typeInterval);
  }, [currentSuggestion, isActive, value, autoDemo]);

  // Rotate suggestions when idle
  useEffect(() => {
    if (isActive || value) return;

    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 8000); // Longer interval for smooth demo experience

    return () => clearInterval(interval);
  }, [isActive, value, suggestions.length]);

  // Reset suggestion index when mode or language changes
  useEffect(() => {
    setSuggestionIndex(0);
  }, [selectedMode, language]);

  // Trigger demo whenever suggestion changes (including after rotation)
  useEffect(() => {
    if (!autoDemo || isActive || value) return;

    // Small delay to let the typing effect start
    const timeout = setTimeout(() => {
      triggerDemo();
    }, 150);

    return () => clearTimeout(timeout);
  }, [autoDemo, isActive, value, currentSuggestion, triggerDemo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim() || currentSuggestion;
    if (!query) return;
    onSubmit?.(query, selectedMode);
    setValue('');
  };

  const handleModeSelect = (mode: SearchMode) => {
    setSelectedMode(mode);
    inputRef.current?.focus();
  };

  return (
    <div className={`smart-input ${isActive ? 'smart-input--active' : ''} ${className}`}>
      {/* Mode selector chips */}
      <div className="smart-input-modes">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-chip ${isSelected ? 'mode-chip--active' : ''}`}
              style={{ '--mode-color': mode.color } as React.CSSProperties}
              onClick={() => handleModeSelect(mode.id)}
            >
              <Icon size={14} />
              <span>{t(`search.modes.${mode.id}`)}</span>
            </button>
          );
        })}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="smart-input-form">
        <div className="smart-input-container">
          <ModeIcon
            size={18}
            className="smart-input-icon"
            style={{ color: currentMode.color }}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={autoDemo ? typedText + (isTyping ? '|' : '') : currentSuggestion}
            className={`smart-input-field ${isTyping ? 'smart-input-field--typing' : ''}`}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="smart-input-btn"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Suggestion hint */}
      {!isActive && !value && (
        <div className="smart-input-hint">
          <span>Press Enter to try</span>
        </div>
      )}
    </div>
  );
}

export default SmartInput;
