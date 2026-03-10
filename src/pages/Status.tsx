import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Server,
  Globe,
  Package,
  Zap,
} from 'lucide-react';
import './Status.css';

interface ServiceStatus {
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'down' | 'checking';
  latency?: number;
  icon: React.ReactNode;
  url?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version?: string;
}

const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export function Status() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Lumos',
      description: 'Landing page and documentation',
      status: 'operational', // Always operational if you can see this
      icon: <Globe size={20} />,
      url: 'https://aeryflux.com'
    },
    {
      name: 'API',
      description: 'Backend services (Pythagoras)',
      status: 'checking',
      icon: <Server size={20} />,
      url: 'https://api.aeryflux.com'
    },
    {
      name: '@aeryflux/globe',
      description: 'npm package',
      status: 'operational',
      icon: <Package size={20} />,
      url: 'https://www.npmjs.com/package/@aeryflux/globe'
    },
    {
      name: 'CDN',
      description: 'Static assets delivery',
      status: 'operational',
      icon: <Zap size={20} />
    },
  ]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServices = async () => {
    setIsRefreshing(true);

    // Check API health
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      const latency = Date.now() - start;

      if (response.ok) {
        const data: HealthResponse = await response.json();
        updateService('API', data.status === 'ok' ? 'operational' : 'degraded', latency);
      } else {
        updateService('API', 'degraded');
      }
    } catch {
      updateService('API', 'down');
    }

    setLastCheck(new Date());
    setIsRefreshing(false);
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
      default: return <RefreshCw className="status-icon checking" />;
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Checking...';
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') ? 'operational'
    : services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <div className="status-page">
      <div className="status-container">
        {/* Header */}
        <div className="status-header">
          <h1>System Status</h1>
          <p>Real-time status of AeryFlux services</p>
        </div>

        {/* Overall Status */}
        <div className={`status-overall status-overall-${overallStatus}`}>
          {getStatusIcon(overallStatus)}
          <div className="status-overall-text">
            <h2>
              {overallStatus === 'operational' && 'All Systems Operational'}
              {overallStatus === 'degraded' && 'Partial Outage'}
              {overallStatus === 'down' && 'Major Outage'}
            </h2>
            {lastCheck && (
              <p>Last checked: {lastCheck.toLocaleTimeString()}</p>
            )}
          </div>
          <button
            className="status-refresh-btn"
            onClick={checkServices}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? 'spinning' : ''} size={18} />
            Refresh
          </button>
        </div>

        {/* Services Grid */}
        <div className="status-services">
          <h3>Services</h3>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.name} className={`service-card service-${service.status}`}>
                <div className="service-icon">{service.icon}</div>
                <div className="service-info">
                  <h4>
                    {service.url ? (
                      <a href={service.url} target="_blank" rel="noopener noreferrer">
                        {service.name}
                      </a>
                    ) : service.name}
                  </h4>
                  <p>{service.description}</p>
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
          <h3>Recent Incidents</h3>
          <div className="incidents-list">
            <div className="incident-empty">
              <CheckCircle2 size={24} />
              <p>No incidents reported</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="status-links">
          <h3>Resources</h3>
          <div className="links-grid">
            <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer" className="status-link">
              GitHub Organization
            </a>
            <a href="https://www.npmjs.com/package/@aeryflux/globe" target="_blank" rel="noopener noreferrer" className="status-link">
              npm Package
            </a>
            <a href="/docs" className="status-link">
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Status;
