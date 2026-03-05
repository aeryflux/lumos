import { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  Apple,
  CheckCircle2,
  Bell,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useWaitlist } from '../hooks/useWaitlist';
import './Download.css';

type Platform = 'mobile' | 'desktop' | 'web';

export function DownloadPage() {
  const { t, tList } = useTranslation();
  const { email, setEmail, submitted, isSubmitting, joinWaitlist } = useWaitlist();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('mobile');

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinWaitlist(selectedPlatform);
  };

  const getPlatformName = () => {
    switch (selectedPlatform) {
      case 'mobile': return 'Atlas Mobile';
      case 'desktop': return 'Atlas Desktop'; // Coming soon
      case 'web': return 'Atlas Web';
    }
  };

  return (
    <div className="download-page">
      <div className="download-container">
        {/* Header */}
        <div className="download-header">
          <div className="download-badge">
            <Sparkles size={14} />
            <span>{t('download.badge')}</span>
          </div>
          <h1>{t('download.title')}</h1>
          <p>{t('download.subtitle')}</p>
        </div>

        {/* Platform Selector */}
        <div className="platform-selector">
          <button
            className={`platform-btn ${selectedPlatform === 'mobile' ? 'active' : ''}`}
            onClick={() => setSelectedPlatform('mobile')}
          >
            <Smartphone size={20} />
            <span>{t('download.platforms.mobile')}</span>
          </button>
          <button
            className={`platform-btn ${selectedPlatform === 'desktop' ? 'active' : ''}`}
            onClick={() => setSelectedPlatform('desktop')}
          >
            <Monitor size={20} />
            <span>{t('download.platforms.desktop')}</span>
          </button>
          <button
            className={`platform-btn ${selectedPlatform === 'web' ? 'active' : ''}`}
            onClick={() => setSelectedPlatform('web')}
          >
            <Globe size={20} />
            <span>{t('download.platforms.web')}</span>
          </button>
        </div>

        {/* Platform Content */}
        <div className="platform-content">
          {selectedPlatform === 'mobile' && (
            <div className="platform-card">
              <h2>{t('download.mobile.title')}</h2>
              <p>{t('download.mobile.desc')}</p>

              <div className="download-options">
                <div className="download-option">
                  <div className="download-option-icon">
                    <Apple size={24} />
                  </div>
                  <div className="download-option-info">
                    <h4>{t('download.mobile.ios')}</h4>
                    <p>{t('download.mobile.iosReq')}</p>
                  </div>
                  <span className="download-status waitlist">{t('download.waitlist')}</span>
                </div>

                <div className="download-option">
                  <div className="download-option-icon android">
                    <Smartphone size={24} />
                  </div>
                  <div className="download-option-info">
                    <h4>{t('download.mobile.android')}</h4>
                    <p>{t('download.mobile.androidReq')}</p>
                  </div>
                  <span className="download-status waitlist">{t('download.waitlist')}</span>
                </div>
              </div>

              <div className="features-list">
                <h4>{t('download.features.title')}</h4>
                <ul>
                  {tList('download.mobile.features').map((feature, i) => (
                    <li key={i}><CheckCircle2 size={16} /> {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedPlatform === 'desktop' && (
            <div className="platform-card">
              <h2>{t('download.desktop.title')}</h2>
              <p>{t('download.desktop.desc')}</p>

              <div className="download-options">
                <div className="download-option">
                  <div className="download-option-icon windows">
                    <Monitor size={24} />
                  </div>
                  <div className="download-option-info">
                    <h4>{t('download.desktop.windows')}</h4>
                    <p>{t('download.desktop.windowsReq')}</p>
                  </div>
                  <span className="download-status waitlist">{t('download.waitlist')}</span>
                </div>

                <div className="download-option">
                  <div className="download-option-icon mac">
                    <Apple size={24} />
                  </div>
                  <div className="download-option-info">
                    <h4>{t('download.desktop.macos')}</h4>
                    <p>{t('download.desktop.macosReq')}</p>
                  </div>
                  <span className="download-status waitlist">{t('download.waitlist')}</span>
                </div>

                <div className="download-option">
                  <div className="download-option-icon linux">
                    <Monitor size={24} />
                  </div>
                  <div className="download-option-info">
                    <h4>{t('download.desktop.linux')}</h4>
                    <p>{t('download.desktop.linuxReq')}</p>
                  </div>
                  <span className="download-status waitlist">{t('download.waitlist')}</span>
                </div>
              </div>

              <div className="features-list">
                <h4>{t('download.features.title')}</h4>
                <ul>
                  {tList('download.desktop.features').map((feature, i) => (
                    <li key={i}><CheckCircle2 size={16} /> {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedPlatform === 'web' && (
            <div className="platform-card">
              <h2>{t('download.web.title')}</h2>
              <p>{t('download.web.desc')}</p>

              <div className="download-options">
                <div className="download-option">
                  <div className="download-option-icon web">
                    <Globe size={24} />
                  </div>
                  <div className="download-option-info">
                    <h4>{t('download.web.browser')}</h4>
                    <p>{t('download.web.browserReq')}</p>
                  </div>
                  <span className="download-status waitlist">{t('download.waitlist')}</span>
                </div>
              </div>

              <div className="features-list">
                <h4>{t('download.features.title')}</h4>
                <ul>
                  {tList('download.web.features').map((feature, i) => (
                    <li key={i}><CheckCircle2 size={16} /> {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Waitlist Form */}
        <div className="waitlist-section">
          <div className="waitlist-card">
            <div className="waitlist-icon">
              <Bell size={24} />
            </div>
            <h3>{t('download.waitlistForm.title')}</h3>
            <p>{t('download.waitlistForm.desc', { platform: getPlatformName() })}</p>

            {!submitted ? (
              <form className="waitlist-form" onSubmit={handleWaitlist}>
                <input
                  type="email"
                  placeholder={t('download.waitlistForm.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Joining...' : t('download.waitlistForm.button')} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div className="waitlist-success">
                <CheckCircle2 size={24} />
                <p>{t('download.waitlistForm.success')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadPage;
