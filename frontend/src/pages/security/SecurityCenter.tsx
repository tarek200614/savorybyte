import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Key,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useTranslation } from '@/i18n/LanguageContext';
import { securityApi } from '@/services/securityApi';
import {
  ArchitectureNode,
  SecurityControlStatus,
  SecurityEvent,
  SecurityStats,
  SecurityStatusResponse,
  SecurityTestItem,
  SecurityTestResult,
  ThreatVector,
} from '@/types/security';

export const SecurityCenter: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'threats' | 'events' | 'docs'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [statusData, setStatusData] = useState<SecurityStatusResponse | null>(null);
  const [threats, setThreats] = useState<ThreatVector[]>([]);
  const [testsCatalog, setTestsCatalog] = useState<SecurityTestItem[]>([]);
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<ThreatVector | null>(null);
  const [selectedControl, setSelectedControl] = useState<SecurityControlStatus | null>(null);

  // Events & Telemetry
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [eventSearch, setEventSearch] = useState<string>('');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureNode[]>([]);

  // Action messages
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, threatsRes, catalogRes, archRes] = await Promise.all([
        securityApi.getStatus(),
        securityApi.getThreatMatrix(),
        securityApi.getTestsCatalog(),
        securityApi.getArchitecture(),
      ]);

      setStatusData(statusRes);
      setThreats(threatsRes);
      setTestsCatalog(catalogRes);
      setArchitecture(archRes.layers);
    } catch (err: unknown) {
      console.error('Failed to load security status:', err);
      setError(t.security.loadError || 'Failed to load security status telemetry.');
    } finally {
      setLoading(false);
    }
  }, [t.security.loadError]);

  const loadEvents = useCallback(async (page: number, severity: string, search: string) => {
    try {
      const res = await securityApi.getEvents({
        page,
        pageSize: 15,
        severity: severity || undefined,
        search: search || undefined,
      });
      setEvents(res.items);
      setEventsTotal(res.total);
    } catch (err) {
      console.error('Failed to load security events:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await securityApi.getEventStats();
      setStats(res);
    } catch (err) {
      console.error('Failed to load security stats:', err);
    }
  }, []);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  useEffect(() => {
    if (activeTab === 'events' && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
      loadEvents(eventsPage, severityFilter, eventSearch);
      loadStats();
    }
  }, [activeTab, eventsPage, severityFilter, eventSearch, user?.role, loadEvents, loadStats]);

  const handleRunAllTests = async () => {
    try {
      setRunningTests(true);
      setActionSuccess(null);
      const res = await securityApi.runTests();
      setTestResults(res.results);
      setActionSuccess(res.summary);
      if (activeTab === 'events') {
        loadEvents(1, severityFilter, eventSearch);
      }
    } catch (err: unknown) {
      console.error('Test execution failed:', err);
      setError('Test execution failed. Verify administrative token permissions.');
    } finally {
      setRunningTests(false);
    }
  };

  const handleRunSingleTest = async (testId: string) => {
    try {
      setRunningTests(true);
      setActionSuccess(null);
      const res = await securityApi.runTests(testId);
      setTestResults((prev) => {
        const others = prev.filter((r) => r.test_id !== testId);
        return [...others, ...res.results];
      });
      setActionSuccess(`Completed test: ${testId}`);
    } catch (err) {
      console.error('Single test execution failed:', err);
    } finally {
      setRunningTests(false);
    }
  };

  const handleResetBruteForce = async () => {
    try {
      const res = await securityApi.resetBruteForce();
      setActionSuccess(res.message);
      loadStats();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-terracotta-900/60 text-terracotta-200 border border-terracotta-700/50';
      case 'HIGH':
        return 'bg-saffron-900/60 text-saffron-200 border border-saffron-700/50';
      case 'WARNING':
        return 'bg-amber-900/50 text-amber-200 border border-amber-700/40';
      case 'NOTICE':
        return 'bg-blue-900/40 text-blue-200 border border-blue-700/40';
      default:
        return 'bg-slate-800/80 text-stone-300 border border-slate-700/50';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PROTECTED':
        return 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50';
      case 'CONFIGURED':
        return 'bg-saffron-950/60 text-saffron-300 border border-saffron-800/50';
      case 'MONITORED':
        return 'bg-blue-950/60 text-blue-300 border border-blue-800/50';
      default:
        return 'bg-amber-950/60 text-amber-300 border border-amber-800/50';
    }
  };

  if (loading && !statusData) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-2xl bg-charcoal border border-saffron-500/30 text-saffron-400 animate-pulse shadow-2xl">
            <Shield className="w-10 h-10 animate-spin" />
          </div>
          <p className="text-sm font-medium text-stone-300 font-sans tracking-wide">
            {t.common?.loading || 'Initializing SavoryByte Security Lab & Telemetry...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-stone-100 pb-24 pt-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-saffron-500/20 bg-gradient-to-b from-charcoal/90 via-midnight/95 to-midnight p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-terracotta-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 text-xs font-medium tracking-wide uppercase mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>{t.security.badge || 'Application Security Lab & Defense Center'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-ivory tracking-tight">
                {t.security.title || 'SavoryByte Cybersecurity Center'}
              </h1>
              <p className="mt-2 text-stone-400 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
                {t.security.subtitle ||
                  'Enterprise-grade AppSec posture, threat mitigation modeling, server-side brute-force defense, and real-time defensive test suite.'}
              </p>
            </div>

            {/* Overall Posture Card */}
            <div className="flex items-center gap-4 bg-charcoal/80 border border-stone-800/80 rounded-xl p-4 shadow-inner">
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                  {t.security.postureStatus || 'Defensive Posture'}
                </div>
                <div className="text-sm font-semibold text-emerald-300">
                  {statusData?.active_defensive_controls || 10} / {statusData?.total_evaluated_controls || 10}{' '}
                  {t.security.controlsActive || 'Active Controls'}
                </div>
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t.security.liveInspection || 'Live Verification Active'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap gap-2 sm:gap-3">
            {[
              { id: 'overview', label: t.security.tabs?.overview || 'Security Overview', icon: Shield },
              { id: 'tests', label: t.security.tabs?.tests || 'Defensive Test Lab', icon: Activity },
              { id: 'threats', label: t.security.tabs?.threats || 'Threat Knowledge Center', icon: ShieldAlert },
              { id: 'events', label: t.security.tabs?.events || 'Audit Trail & Telemetry', icon: Terminal },
              { id: 'docs', label: t.security.tabs?.docs || 'Architecture & Model', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-saffron-600 text-ivory shadow-lg shadow-saffron-900/40 border border-saffron-400/40'
                      : 'bg-charcoal/60 text-stone-300 hover:text-ivory hover:bg-charcoal border border-stone-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-ivory' : 'text-saffron-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Action Notifications */}
        {actionSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-terracotta-950/40 border border-terracotta-500/30 text-terracotta-200 text-sm flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-terracotta-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── TAB 1: SECURITY OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-charcoal/70 border border-stone-800 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-stone-400">
                    {t.security.overview?.authDefense || 'Auth & Session Guard'}
                  </span>
                  <Key className="w-4 h-4 text-saffron-400" />
                </div>
                <div className="text-2xl font-serif text-ivory mt-2">Argon2id + Lockout</div>
                <p className="text-xs text-stone-400 mt-1">
                  {t.security.overview?.authDefenseDesc || '5-Attempt Threshold & Short-Lived JWT'}
                </p>
              </div>

              <div className="bg-charcoal/70 border border-stone-800 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-stone-400">
                    {t.security.overview?.authorization || 'RBAC Boundary'}
                  </span>
                  <Lock className="w-4 h-4 text-saffron-400" />
                </div>
                <div className="text-2xl font-serif text-ivory mt-2">Strict Multi-Tenant</div>
                <p className="text-xs text-stone-400 mt-1">
                  {t.security.overview?.authorizationDesc || 'Declarative FastAPI Dependencies'}
                </p>
              </div>

              <div className="bg-charcoal/70 border border-stone-800 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-stone-400">
                    {t.security.overview?.database || 'Database Querying'}
                  </span>
                  <Server className="w-4 h-4 text-saffron-400" />
                </div>
                <div className="text-2xl font-serif text-ivory mt-2">100% Parameterized</div>
                <p className="text-xs text-stone-400 mt-1">
                  {t.security.overview?.databaseDesc || 'Zero Raw Concatenations (SQLi Proof)'}
                </p>
              </div>

              <div className="bg-charcoal/70 border border-stone-800 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-stone-400">
                    {t.security.overview?.webDefense || 'Security Headers'}
                  </span>
                  <FileCheck className="w-4 h-4 text-saffron-400" />
                </div>
                <div className="text-2xl font-serif text-ivory mt-2">CSP + Frame Deny</div>
                <p className="text-xs text-stone-400 mt-1">
                  {t.security.overview?.webDefenseDesc || 'Strict Ingress Header Filter'}
                </p>
              </div>
            </div>

            {/* Evaluated Controls Master List */}
            <div className="bg-charcoal/80 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-serif text-ivory">
                    {t.security.overview?.controlsRegistry || 'Evaluated Defensive Controls Registry'}
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    {t.security.overview?.controlsSubtitle ||
                      'Real-world implementation evidence across SavoryByte security layers.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadSecurityData}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.common?.retry || 'Refresh Registry'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statusData?.controls.map((ctrl) => (
                  <div
                    key={ctrl.control_id}
                    onClick={() => setSelectedControl(ctrl)}
                    className="group p-4 rounded-xl bg-midnight/60 hover:bg-midnight/90 border border-stone-800/80 hover:border-saffron-500/40 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-saffron-400/90 font-medium">
                            {ctrl.control_id}
                          </span>
                          <span className="text-xs text-stone-400">• {ctrl.category}</span>
                        </div>
                        <h3 className="text-sm font-medium text-ivory mt-1 group-hover:text-saffron-200 transition-colors">
                          {ctrl.name}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(ctrl.status)}`}>
                        {ctrl.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">{ctrl.summary}</p>
                    <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                      <span className="truncate max-w-[240px] font-mono">{ctrl.technical_implementation}</span>
                      <span className="text-saffron-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: DEFENSIVE TEST LAB ─── */}
        {activeTab === 'tests' && (
          <div className="mt-8 space-y-6">
            <div className="bg-charcoal/80 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-serif text-ivory flex items-center gap-2">
                    <Activity className="w-5 h-5 text-saffron-400" />
                    <span>{t.security.tests?.labTitle || 'Automated Defensive Control Test Lab'}</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    {t.security.tests?.labSubtitle ||
                      'Safely test and verify active defenses against simulated attack vectors in real-time.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={handleResetBruteForce}
                      className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
                    >
                      {t.security.tests?.resetLockouts || 'Reset Brute-Force State'}
                    </button>
                  )}
                  <button
                    onClick={handleRunAllTests}
                    disabled={runningTests}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron-600 hover:bg-saffron-500 disabled:opacity-50 text-ivory text-xs sm:text-sm font-medium shadow-lg shadow-saffron-900/30 transition-all"
                  >
                    {runningTests ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>{runningTests ? 'Running Suite...' : t.security.tests?.runAll || 'Run Defensive Suite'}</span>
                  </button>
                </div>
              </div>

              {/* Test Catalog & Live Results Grid */}
              <div className="space-y-4">
                {testsCatalog.map((item) => {
                  const result = testResults.find((r) => r.test_id === item.test_id);
                  return (
                    <div
                      key={item.test_id}
                      className="p-5 rounded-xl bg-midnight/70 border border-stone-800/80 hover:border-stone-700 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-saffron-400 font-medium">{item.test_id}</span>
                            <span className="text-xs text-stone-400">• {item.category}</span>
                            <span className="text-xs text-stone-400 font-mono">[{item.target_defense}]</span>
                          </div>
                          <h3 className="text-base font-medium text-ivory">{item.name}</h3>
                          <p className="text-xs text-stone-400 leading-relaxed">
                            <span className="text-stone-400 font-medium">Attack Simulation: </span>
                            {item.attack_simulation}
                          </p>
                          <p className="text-xs text-stone-400 leading-relaxed">
                            <span className="text-stone-400 font-medium">Expected Defense: </span>
                            {item.expected_outcome}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          {result ? (
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  result.passed
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                                    : 'bg-terracotta-950/80 text-terracotta-300 border border-terracotta-700/50'
                                }`}
                              >
                                {result.passed ? 'PASSED (VERIFIED)' : 'FAILED'}
                              </span>
                              <div className="text-right text-[11px] text-stone-400 font-mono">
                                <div>HTTP {result.status_code}</div>
                                <div>{result.execution_time_ms}ms</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 italic">Ready to run</span>
                          )}

                          <button
                            onClick={() => handleRunSingleTest(item.test_id)}
                            disabled={runningTests}
                            className="p-2 rounded-lg bg-charcoal hover:bg-stone-800 text-saffron-300 border border-stone-700 hover:border-saffron-500/40 transition-colors"
                            title="Run This Test"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Evidence Card if Executed */}
                      {result && (
                        <div className="mt-4 pt-3 border-t border-stone-800/80 text-xs font-mono bg-charcoal/80 p-3 rounded-lg text-stone-300">
                          <div className="text-stone-400 text-[11px] font-sans font-semibold mb-1">
                            Defensive Verification Evidence:
                          </div>
                          <div className="text-emerald-300 break-all">{result.evidence}</div>
                          <div className="text-stone-400 text-[10px] mt-1">
                            Correlation ID: {result.request_id} • Target: {result.simulated_payload}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: THREAT KNOWLEDGE CENTER ─── */}
        {activeTab === 'threats' && (
          <div className="mt-8 space-y-6">
            <div className="bg-charcoal/80 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-xl font-serif text-ivory flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-saffron-400" />
                  <span>{t.security.threats?.knowledgeTitle || 'Threat Knowledge Center & Mitigation Matrix'}</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  {t.security.threats?.knowledgeSubtitle ||
                    'Comprehensive index of application vulnerability classes, impact surfaces, and SavoryByte defense controls.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {threats.map((tv) => (
                  <div
                    key={tv.id}
                    onClick={() => setSelectedThreat(tv)}
                    className="p-5 rounded-xl bg-midnight/70 hover:bg-midnight/90 border border-stone-800/80 hover:border-saffron-500/40 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-saffron-400 font-medium">{tv.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(tv.severity)}`}>
                          {tv.severity}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-ivory mt-2 line-clamp-1">{tv.name}</h3>
                      <p className="text-xs text-stone-400 mt-1.5 line-clamp-3 leading-relaxed">{tv.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/70 flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-mono text-[11px]">{tv.cwe_reference || 'CWE'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(tv.status)}`}>
                        {tv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: AUDIT TRAIL & TELEMETRY ─── */}
        {activeTab === 'events' && (
          <div className="mt-8 space-y-6">
            {/* Stats Counter */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-charcoal/70 border border-stone-800">
                  <div className="text-xs text-stone-400 uppercase font-medium">Total Events</div>
                  <div className="text-2xl font-serif text-ivory mt-1">{stats.total_events}</div>
                </div>
                <div className="p-4 rounded-xl bg-charcoal/70 border border-stone-800">
                  <div className="text-xs text-stone-400 uppercase font-medium">Last 24 Hours</div>
                  <div className="text-2xl font-serif text-saffron-300 mt-1">{stats.events_last_24h}</div>
                </div>
                <div className="p-4 rounded-xl bg-charcoal/70 border border-stone-800">
                  <div className="text-xs text-stone-400 uppercase font-medium">High / Critical</div>
                  <div className="text-2xl font-serif text-terracotta-300 mt-1">{stats.high_critical_count}</div>
                </div>
                <div className="p-4 rounded-xl bg-charcoal/70 border border-stone-800">
                  <div className="text-xs text-stone-400 uppercase font-medium">Active Lockouts</div>
                  <div className="text-2xl font-serif text-amber-300 mt-1">{stats.active_lockouts_count}</div>
                </div>
              </div>
            )}

            {/* Filter Bar & Event Table */}
            <div className="bg-charcoal/80 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-serif text-ivory flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-saffron-400" />
                    <span>{t.security.events?.auditTitle || 'Security Audit Trail & Telemetry'}</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    {t.security.events?.auditSubtitle ||
                      'Persistent chronological log of authentication, authorization, and defensive events.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Search IP, actor, details..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-lg bg-midnight border border-stone-700 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-saffron-500"
                    />
                  </div>

                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-midnight border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-saffron-500"
                  >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="WARNING">Warning</option>
                    <option value="NOTICE">Notice</option>
                    <option value="INFO">Info</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-midnight/80 text-stone-400 uppercase font-mono text-[11px] border-b border-stone-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Actor / IP</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Correlation ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-mono">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-500 font-sans">
                          No security events found matching current criteria.
                        </td>
                      </tr>
                    ) : (
                      events.map((ev) => (
                        <tr key={ev.id} className="hover:bg-midnight/50 transition-colors">
                          <td className="p-3 text-stone-400 whitespace-nowrap">
                            {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3 font-semibold text-ivory">{ev.event_type}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(ev.severity)}`}>
                              {ev.severity}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="text-stone-300 font-sans">{ev.actor_email || 'Anonymous'}</div>
                            <div className="text-[10px] text-stone-500">{ev.actor_ip || 'N/A'}</div>
                          </td>
                          <td className="p-3 text-stone-300 max-w-xs truncate font-sans">{ev.details || '-'}</td>
                          <td className="p-3 text-stone-500 text-[10px] truncate max-w-[120px]">{ev.request_id || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {eventsTotal > 15 && (
                <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <div>
                    Showing {(eventsPage - 1) * 15 + 1} - {Math.min(eventsPage * 15, eventsTotal)} of {eventsTotal} events
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                      disabled={eventsPage === 1}
                      className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setEventsPage((p) => p + 1)}
                      disabled={eventsPage * 15 >= eventsTotal}
                      className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 5: ARCHITECTURE & DOCS ─── */}
        {activeTab === 'docs' && (
          <div className="mt-8 space-y-6">
            <div className="bg-charcoal/80 border border-stone-800/90 rounded-2xl p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-xl font-serif text-ivory flex items-center gap-2">
                  <Layers className="w-5 h-5 text-saffron-400" />
                  <span>{t.security.docs?.archTitle || 'Multi-Tier Defense-in-Depth Architecture'}</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  {t.security.docs?.archSubtitle ||
                    'Comprehensive architectural model and control boundaries from client ingress to data persistence.'}
                </p>
              </div>

              <div className="space-y-4">
                {architecture.map((layer, idx) => (
                  <div key={layer.id} className="p-5 rounded-xl bg-midnight/70 border border-stone-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 flex items-center justify-center font-mono text-xs font-bold">
                          0{idx + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-ivory">{layer.title}</h3>
                          <div className="text-xs text-saffron-400/90 font-mono">{layer.layer}</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 mt-3 leading-relaxed">{layer.description}</p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-charcoal/60 p-3 rounded-lg border border-stone-800">
                        <div className="text-stone-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Active Defensive Controls</span>
                        </div>
                        <ul className="space-y-1 text-stone-300 text-[11px]">
                          {layer.active_controls.map((ctrl, cidx) => (
                            <li key={cidx}>• {ctrl}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-charcoal/60 p-3 rounded-lg border border-stone-800">
                        <div className="text-stone-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-terracotta-400" />
                          <span>Threats Neutralized</span>
                        </div>
                        <ul className="space-y-1 text-stone-300 text-[11px]">
                          {layer.threats_addressed.map((th, tidx) => (
                            <li key={tidx}>• {th}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: CONTROL DETAILS ─── */}
        {selectedControl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-charcoal border border-stone-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedControl(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-ivory"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 text-xs font-mono text-saffron-400">
                <span>{selectedControl.control_id}</span>
                <span>• {selectedControl.category}</span>
              </div>
              <h3 className="text-lg font-serif text-ivory mt-1">{selectedControl.name}</h3>
              <div className="mt-4 space-y-3 text-xs text-stone-300 leading-relaxed font-sans">
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">Summary:</div>
                  <p>{selectedControl.summary}</p>
                </div>
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">Technical Implementation:</div>
                  <p className="font-mono bg-midnight p-2.5 rounded border border-stone-800 text-stone-200">
                    {selectedControl.technical_implementation}
                  </p>
                </div>
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">Verification Evidence:</div>
                  <p className="text-emerald-300 font-mono bg-midnight p-2.5 rounded border border-stone-800">
                    {selectedControl.evidence}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: THREAT DETAILS ─── */}
        {selectedThreat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-charcoal border border-stone-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedThreat(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-ivory"
              >
                ✕
              </button>
              <div className="flex items-center justify-between pr-8">
                <span className="text-xs font-mono text-saffron-400">{selectedThreat.id} ({selectedThreat.cwe_reference})</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(selectedThreat.severity)}`}>
                  {selectedThreat.severity}
                </span>
              </div>
              <h3 className="text-lg font-serif text-ivory mt-1">{selectedThreat.name}</h3>
              <div className="mt-4 space-y-3 text-xs text-stone-300 leading-relaxed font-sans">
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">Threat Description:</div>
                  <p>{selectedThreat.description}</p>
                </div>
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">Impact Surface:</div>
                  <p className="font-mono bg-midnight p-2 rounded border border-stone-800 text-saffron-300">
                    {selectedThreat.impact_surface}
                  </p>
                </div>
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">SavoryByte Defense Mechanism:</div>
                  <p className="text-emerald-300 bg-midnight p-2.5 rounded border border-stone-800">
                    {selectedThreat.savorybyte_defense}
                  </p>
                </div>
                <div>
                  <div className="text-stone-400 font-semibold mb-0.5">Detection & Log Behavior:</div>
                  <p className="text-stone-300 bg-midnight p-2 rounded border border-stone-800">
                    {selectedThreat.detection_behavior}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
