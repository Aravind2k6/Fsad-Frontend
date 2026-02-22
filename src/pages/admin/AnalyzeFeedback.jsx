import { Users, TrendingUp, ClipboardList, ShieldCheck, BarChart3, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AnalyzeFeedback = () => {
    const { feedbacks, availableCourses, availableInstructors } = useApp();

    const getAverage = (feedbackArray) => {
        const validFeedbacks = feedbackArray.filter(f => f.rating && !isNaN(Number(f.rating)));
        if (validFeedbacks.length === 0) return '0';
        return (validFeedbacks.reduce((acc, curr) => acc + Number(curr.rating), 0) / validFeedbacks.length).toFixed(1);
    };

    const downloadCSV = () => {
        if (feedbacks.length === 0) return alert('No feedback data available to export.');

        // Get all unique keys from feedback objects (including dynamic fields)
        const headers = ['id', 'course', 'instructor', 'rating', 'remarks', 'timestamp'];
        
        // Add headers for dynamic ratings if they exist
        const dynamicKeys = new Set();
        feedbacks.forEach(f => {
            if (f.dynamicRatings) {
                Object.keys(f.dynamicRatings).forEach(key => dynamicKeys.add(key));
            }
        });
        const allHeaders = [...headers, ...Array.from(dynamicKeys)];

        // Create CSV rows
        const csvRows = [
            allHeaders.join(','), // Header row
            ...feedbacks.map(f => {
                return allHeaders.map(header => {
                    let val = '';
                    if (header in f) {
                        val = f[header];
                    } else if (f.dynamicRatings && header in f.dynamicRatings) {
                        val = f.dynamicRatings[header];
                    }
                    // Escape commas and quotes
                    const stringVal = String(val).replace(/"/g, '""');
                    return `"${stringVal}"`;
                }).join(',');
            })
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `feedback_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = [
        { label: 'Total Feedbacks', value: feedbacks.length, icon: <Users size={22} />, color: '#22d3a5', bg: 'rgba(34,211,165,0.15)' },
        { label: 'Avg Rating', value: feedbacks.length > 0 ? getAverage(feedbacks) : '—', icon: <TrendingUp size={22} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
        { label: 'Top Course', value: 'FSAD', icon: <ClipboardList size={22} />, color: '#7c6cf5', bg: 'rgba(124,108,245,0.15)' },
        { label: 'Top Instructor', value: 'Ramu', icon: <ShieldCheck size={22} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    ];

    const getStatsBy = (key, value) => {
        const filtered = feedbacks.filter(f => f[key] === value);
        return { avg: getAverage(filtered), count: filtered.length };
    };

    return (
        <div>
            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title animate-fade-in">Feedback Analytics</h1>
                    <p className="page-subtitle animate-fade-in animate-delay-1" style={{ marginBottom: 0 }}>
                        In-depth analysis of student ratings and remarks.
                    </p>
                </div>
                <button 
                    onClick={downloadCSV}
                    className="btn-primary animate-fade-in animate-delay-2" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                >
                    <Download size={16} /> Download CSV
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid-auto animate-fade-in" style={{ marginBottom: '2.5rem' }}>
                {stats.map((s, i) => (
                    <div key={i} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', padding: '1.35rem', animationDelay: `${i * 0.08}s` }}>
                        <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color }}>{s.icon}</span></div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.15rem' }}>{s.label}</div>
                            <div style={{ fontSize: s.value.toString().length > 10 ? '0.9rem' : '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-2 animate-fade-in animate-delay-1" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        <BarChart3 size={18} color="var(--accent-primary)" />
                        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Ratings by Course</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {availableCourses.map((c) => {
                            const { avg, count } = getStatsBy('course', c);
                            const pct = (parseFloat(avg) / 4) * 100;
                            return (
                                <div key={c}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{c} <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({count} samples)</span></span>
                                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>{avg} / 4</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: parseFloat(avg) >= 3 ? 'var(--success)' : parseFloat(avg) >= 2 ? 'var(--warning)' : 'var(--error)' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        <TrendingUp size={18} color="var(--success)" />
                        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Instructor Performance</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {availableInstructors.map((ins, i) => {
                            const { avg, count } = getStatsBy('instructor', ins);
                            return (
                                <div key={ins} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{i + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ins}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{count} feedbacks</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: parseFloat(avg) >= 3 ? '#22d3a5' : '#fbbf24' }}>{avg}</div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Rating</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Remarks */}
            <div className="glass-panel animate-fade-in animate-delay-2">
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>💬 Recent Student Remarks</h3>
                {feedbacks.filter(f => f.remarks).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No written remarks yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {feedbacks.filter(f => f.remarks).slice(0, 5).map(f => (
                            <div key={f.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{f.course} — {f.instructor}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{new Date(f.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{f.remarks}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyzeFeedback;
