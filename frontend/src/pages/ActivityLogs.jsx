import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './ActivityLogs.module.css';

const fetchActivityLogs = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication token missing. Please log in again.');

  const res = await fetch('http://localhost:5000/api/logs', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Server responded with status ${res.status}`);
  }

  return res.json();
};

export default function ActivityLogs() {
  const { data: logs = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: fetchActivityLogs,
    refetchInterval: 5000,
  });

  if (isLoading) return <div className={styles.status}>Loading activity logs...</div>;
  if (isError) return <div className={styles.error}>Error: {error.message}</div>;

  const getBadgeClass = (action) => {
    if (action.includes('CREATED') || action.includes('REGISTERED') || action.includes('PLACED')) return styles.badgeSuccess;
    if (action.includes('UPDATED')) return styles.badgeWarning;
    if (action.includes('DELETED')) return styles.badgeDanger;
    return styles.badgeDefault;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>System Activity Logs</h1>
          <p className={styles.subtitle}>Track user activities, inventory modifications, and system events in real-time.</p>
        </div>
        <button onClick={() => refetch()} className={styles.refreshBtn}>
          <span>🔄</span> Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Target</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.emptyStatus}>No activity logs recorded yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id || log.id}>
                  <td>
                    <span className={`${styles.badge} ${getBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className={styles.email}>{log.performedBy?.email || 'System'}</div>
                    <div className={styles.role}>{log.performedBy?.role || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={styles.targetType}>
                      {log.targetEntity?.type || 'N/A'}
                    </span>
                    {log.targetEntity?.id && log.targetEntity.id !== 'N/A' && (
                      <span className={styles.targetId}> #{log.targetEntity.id}</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.detailsBox}>
                      {typeof log.details === 'object' && log.details !== null ? (
                        Object.entries(log.details).map(([key, val]) => (
                          <div key={key} className={styles.detailItem}>
                            <span className={styles.detailKey}>{key}:</span>{' '}
                            <span className={styles.detailValue}>{String(val)}</span>
                          </div>
                        ))
                      ) : (
                        <span>{log.details || '-'}</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}