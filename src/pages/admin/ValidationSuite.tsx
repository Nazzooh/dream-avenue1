import { motion } from 'motion/react';
import { Play, CheckCircle, XCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import AdminLayout from '../../components/admin-v2/AdminLayout';
import { PageHeader } from '../../components/admin-v2/PageHeader';
import { runValidationSuite } from '../../tests/ValidationSuite';

interface TestResult {
  testCase: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

export function AdminValidationSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  } | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      // Capture console logs to display results
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      const report = await runValidationSuite();
      
      // Restore console.log
      console.log = originalLog;

      if (report) {
        setSummary(report);
      }
    } catch (error: any) {
      console.error('Error running validation suite:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle size={20} style={{ color: '#10B981' }} />;
      case 'FAIL':
        return <XCircle size={20} style={{ color: '#EF4444' }} />;
      case 'SKIP':
        return <AlertCircle size={20} style={{ color: '#F59E0B' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return '#D1FAE5';
      case 'FAIL':
        return '#FEE2E2';
      case 'SKIP':
        return '#FEF3C7';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="System Validation Suite"
        description="Automated tests for booking-event sync & calendar integrity"
        icon={<FileText size={24} />}
      />

      <div style={{ padding: '24px' }}>
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white',
          }}
        >
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>
            📊 Validation Test Suite
          </h2>
          <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: '0.95rem' }}>
            This suite validates the trigger-based sync system between bookings, events, and public calendar views.
          </p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.875rem' }}>
            <div>
              <strong>Tests:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Booking creation (pending state)</li>
                <li>Confirmation sync to events</li>
                <li>Price recalculation on extras edit</li>
                <li>Cancellation deactivation</li>
                <li>Reconfirmation reactivation</li>
                <li>Admin notes (non-trigger field)</li>
                <li>Cross-table data consistency</li>
              </ul>
            </div>
            <div>
              <strong>Validates:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>public.bookings</li>
                <li>public.events</li>
                <li>public.admin_events_view</li>
                <li>public.public_calendar_events</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Run Tests Button */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            style={{
              background: isRunning
                ? '#9CA3AF'
                : 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              boxShadow: isRunning ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          >
            {isRunning ? (
              <>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                  <RefreshCw size={20} />
                </motion.div>
                Running Tests...
              </>
            ) : (
              <>
                <Play size={20} />
                Run Validation Suite
              </>
            )}
          </button>
        </div>

        {/* Summary Card */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>
              📊 Test Summary
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {summary.total}
                </div>
                <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  Total Tests
                </div>
              </div>
              <div
                style={{
                  background: '#D1FAE5',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}
                >
                  {summary.passed}
                </div>
                <div style={{ color: '#059669', fontSize: '0.875rem' }}>
                  Passed
                </div>
              </div>
              <div
                style={{
                  background: '#FEE2E2',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444' }}
                >
                  {summary.failed}
                </div>
                <div style={{ color: '#DC2626', fontSize: '0.875rem' }}>
                  Failed
                </div>
              </div>
              <div
                style={{
                  background: '#FEF3C7',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}
                >
                  {summary.skipped}
                </div>
                <div style={{ color: '#D97706', fontSize: '0.875rem' }}>
                  Skipped
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                background:
                  summary.failed === 0
                    ? '#D1FAE5'
                    : '#FEE2E2',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <strong
                style={{
                  color: summary.failed === 0 ? '#059669' : '#DC2626',
                  fontSize: '1.125rem',
                }}
              >
                {summary.failed === 0
                  ? '🎉 All Tests Passed!'
                  : '⚠️ Some Tests Failed'}
              </strong>
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '0.875rem',
                  color: summary.failed === 0 ? '#059669' : '#DC2626',
                }}
              >
                Success Rate:{' '}
                {(
                  (summary.passed / (summary.total - summary.skipped)) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </motion.div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>
              📋 Detailed Results
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: getStatusColor(result.status),
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {getStatusIcon(result.status)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {result.testCase}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        marginBottom: result.details ? '8px' : '0',
                      }}
                    >
                      {result.message}
                    </div>
                    {result.details && (
                      <details style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        <summary
                          style={{ cursor: 'pointer', fontWeight: '500' }}
                        >
                          View Details
                        </summary>
                        <pre
                          style={{
                            marginTop: '8px',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px',
                            overflow: 'auto',
                            maxHeight: '200px',
                          }}
                        >
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        {!isRunning && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center',
              color: '#6B7280',
            }}
          >
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Click "Run Validation Suite" to test the booking-event sync system
            </p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}