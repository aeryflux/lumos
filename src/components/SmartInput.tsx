import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Newspaper, Cloud, BookOpen, Sparkles } from 'lucide-react';
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
const MODES: { id: SearchMode; label: string; icon: typeof Newspaper; color: string }[] = [
  { id: 'auto', label: 'Auto', icon: Sparkles, color: '#888888' },
  { id: 'news', label: 'News', icon: Newspaper, color: '#ef4444' },
  { id: 'weather', label: 'Weather', icon: Cloud, color: '#3b82f6' },
  { id: 'wiki', label: 'Wiki', icon: BookOpen, color: '#888888' },
];

// Rotating suggestions per mode - simple, direct phrases
const SUGGESTIONS: Record<SearchMode, string[]> = {
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
    'Weather forecast',
  ],
  wiki: [
    'About France',
    'History Japan',
    'Geography Brazil',
    'Culture Egypt',
  ],
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
  const [value, setValue] = useState('');
  const [selectedMode, setSelectedMode] = useState<SearchMode>('auto');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMode = MODES.find(m => m.id === selectedMode) || MODES[0];
  const ModeIcon = currentMode.icon;
  const suggestions = SUGGESTIONS[selectedMode];
  const currentSuggestion = suggestions[suggestionIndex];

  // Track if demo has been triggered for current suggestion to avoid duplicates
  const lastDemoRef = useRef<string | null>(null);

  // Stable callback for triggering demo
  const triggerDemo = useCallback(() => {
    if (!autoDemo || !onDemoChange || isActive || value) return;

    // Create a unique key for this demo state
    const demoKey = `${selectedMode}-${suggestionIndex}`;

    // Skip if we already triggered this exact demo
    if (lastDemoRef.current === demoKey) return;
    lastDemoRef.current = demoKey;

    onDemoChange(currentSuggestion, selectedMode);
  }, [autoDemo, onDemoChange, isActive, value, selectedMode, suggestionIndex, currentSuggestion]);

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

  // Single effect for demo triggers (both mount and suggestion changes)
  useEffect(() => {
    if (!autoDemo || isActive || value) return;

    // Trigger demo after a small delay
    const timeout = setTimeout(() => {
      triggerDemo();
    }, 100);

    return () => clearTimeout(timeout);
  }, [autoDemo, isActive, value, triggerDemo]);

  // Rotate suggestions when idle
  useEffect(() => {
    if (isActive || value) return;

    const interval = setInterval(() => {
      // Reset the demo key to allow next trigger
      lastDemoRef.current = null;
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 8000); // Longer interval for smooth demo experience

    return () => clearInterval(interval);
  }, [isActive, value, suggestions.length]);

  // Reset suggestion index when mode changes
  useEffect(() => {
    lastDemoRef.current = null; // Allow new demo trigger
    setSuggestionIndex(0);
  }, [selectedMode]);

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
              <span>{mode.label}</span>
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
