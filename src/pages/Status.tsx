import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Server,
  Globe,
  Database,
  Smartphone,
  Monitor,
  Zap,
  Clock,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import './Status.css';

interface ServiceStatus {
  name: string;
  nameKey: string;
  descriptionKey: string;
  status: 'operational' | 'degraded' | 'down' | 'checking' | 'standby';
  latency?: number;
  icon: React.ReactNode;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version?: string;
}

// Use production API URL when deployed, localhost for development
const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const API_BASE = import.meta.env.VITE_API_URL || (isProduction ? 'https://api.aeryflux.com' : 'http://localhost:3000');

// Service endpoints for real-time health checks
// Note: Lumos not included - if you can see this page, it's working
const SERVICE_ENDPOINTS = {
  pythagoras: { url: 'https://api.aeryflux.com', healthPath: '/health' },
  atlas: { url: 'https://atlas.aeryflux.com', healthPath: '/' },
  holocron: { url: 'https://holocron.aeryflux.com', healthPath: '/' },
};

export function Status() {
  const { t } = useTranslation();
  // Note: Lumos is always 'operational' - if you can see this page, it's working
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API (Pythagoras)', nameKey: 'status.services.api', descriptionKey: 'status.services.apiDesc', status: 'checking', icon: <Server size={20} /> },
    { name: 'Database', nameKey: 'status.services.database', descriptionKey: 'status.services.databaseDesc', status: 'checking', icon: <Database size={20} /> },
    { name: 'Atlas Web', nameKey: 'status.services.web', descriptionKey: 'status.services.webDesc', status: 'checking', icon: <Globe size={20} /> },
    { name: 'Atlas Mobile', nameKey: 'status.services.mobile', descriptionKey: 'status.services.mobileDesc', status: 'standby', icon: <Smartphone size={20} /> },
    { name: 'Holocron Backoffice', nameKey: 'status.services.holocron', descriptionKey: 'status.services.holocronDesc', status: 'checking', icon: <Monitor size={20} /> },
    { name: 'CDN', nameKey: 'status.services.cdn', descriptionKey: 'status.services.cdnDesc', status: 'operational', icon: <Zap size={20} /> },
  ]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServices = async () => {
    setIsRefreshing(true);

    // Try the detailed status endpoint first
    try {
      const response = await fetch(`${API_BASE}/api/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        // Update all services from API response
        setServices(prev => prev.map(service => {
          const apiService = data.services.find((s: { name: string }) => s.name === service.name);
          if (apiService) {
            return {
              ...service,
              status: apiService.status,
              latency: apiService.latency,
            };
          }
          return service;
        }));
      } else {
        // Fallback to basic health check
        await checkBasicHealth();
      }
    } catch {
      // Fallback to basic health check on error
      await checkBasicHealth();
    }

    setLastCheck(new Date());
    setIsRefreshing(false);
  };

  const checkBasicHealth = async () => {
    // Check all Railway services in parallel
    const checks = [
      // Pythagoras API
      (async () => {
        try {
          const start = Date.now();
          const response = await fetch(`${SERVICE_ENDPOINTS.pythagoras.url}${SERVICE_ENDPOINTS.pythagoras.healthPath}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          const latency = Date.now() - start;
          if (response.ok) {
            const data: HealthResponse = await response.json();
            updateService('API (Pythagoras)', data.status === 'ok' ? 'operational' : 'degraded', latency);
            updateService('Database', 'operational', latency + 10);
          } else {
            updateService('API (Pythagoras)', 'degraded');
            updateService('Database', 'degraded');
          }
        } catch {
          updateService('API (Pythagoras)', 'down');
          updateService('Database', 'down');
        }
      })(),

      // Atlas Web
      (async () => {
        try {
          const start = Date.now();
          await fetch(SERVICE_ENDPOINTS.atlas.url, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: AbortSignal.timeout(5000)
          });
          const latency = Date.now() - start;
          // no-cors mode always returns opaque response, so we just check if it didn't throw
          updateService('Atlas Web', 'operational', latency);
        } catch {
          updateService('Atlas Web', 'down');
        }
      })(),

      // Holocron Backoffice
      (async () => {
        try {
          const start = Date.now();
          await fetch(SERVICE_ENDPOINTS.holocron.url, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: AbortSignal.timeout(5000)
          });
          const latency = Date.now() - start;
          updateService('Holocron Backoffice', 'operational', latency);
        } catch {
          updateService('Holocron Backoffice', 'down');
        }
      })(),
    ];

    await Promise.all(checks);
  };

  const updateService = (name: string, status: ServiceStatus['status'], latency?: number) => {
    setServices(prev => prev.map(s =>
      s.name === name ? { ...s, status, latency } : s
    ));
  };

  useEffect(() => {
    checkServices();
    // Refresh every 30 seconds
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className="status-icon operational" />;
      case 'degraded': return <AlertCircle className="status-icon degraded" />;
      case 'down': return <XCircle className="status-icon down" />;
      case 'standby': return <Clock className="status-icon standby" />;
      default: return <RefreshCw className="status-icon checking" />;
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return t('status.operational');
      case 'degraded': return t('status.degraded');
      case 'down': return t('status.down');
      case 'standby': return t('status.standby');
      default: return t('status.checking');
    }
  };

  const overallStatus = services.every(s => s.status === 'operational' || s.status === 'standby') ? 'operational'
    : services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <div className="status-page">
      <div className="status-container">
        {/* Header */}
        <div className="status-header">
          <h1>{t('status.title')}</h1>
          <p>{t('status.subtitle')}</p>
        </div>

        {/* Overall Status */}
        <div className={`status-overall status-overall-${overallStatus}`}>
          {getStatusIcon(overallStatus)}
          <div className="status-overall-text">
            <h2>
              {overallStatus === 'operational' && t('status.allOperational')}
              {overallStatus === 'degraded' && t('status.someIssues')}
              {overallStatus === 'down' && t('status.down')}
            </h2>
            {lastCheck && (
              <p>{t('status.lastChecked')}: {lastCheck.toLocaleTimeString()}</p>
            )}
          </div>
          <button
            className="status-refresh-btn"
            onClick={checkServices}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? 'spinning' : ''} size={18} />
            {t('status.refresh')}
          </button>
        </div>

        {/* Services Grid */}
        <div className="status-services">
          <h3>{t('status.services.title')}</h3>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.name} className={`service-card service-${service.status}`}>
                <div className="service-icon">{service.icon}</div>
                <div className="service-info">
                  <h4>{t(service.nameKey)}</h4>
                  <p>{t(service.descriptionKey)}</p>
                </div>
                <div className="service-status">
                  {getStatusIcon(service.status)}
                  <span>{getStatusText(service.status)}</span>
                  {service.latency !== undefined && service.status === 'operational' && (
                    <span className="service-latency">{service.latency}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="status-incidents">
          <h3>{t('status.incidents.title')}</h3>
          <div className="incidents-list">
            <div className="incident-empty">
              <CheckCircle2 size={24} />
              <p>{t('status.incidents.noIncidents')}</p>
            </div>
          </div>
        </div>

        {/* Subscribe */}
        <div className="status-subscribe">
          <h3>{t('status.subscribe.title')}</h3>
          <p>{t('status.subscribe.desc')}</p>
          <div className="subscribe-form">
            <input type="email" placeholder={t('status.subscribe.placeholder')} />
            <button className="btn btn-primary">{t('status.subscribe.button')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Status;
