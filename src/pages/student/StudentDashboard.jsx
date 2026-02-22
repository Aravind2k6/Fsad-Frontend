import { useState, useMemo } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, Send, Award, Clock, Bell, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RatingWidget = ({ value, onChange, options }) => {
    // If custom options are provided (length 4), use them, otherwise fallback to default labels
    const labels = (options && options.length === 4)
        ? ['', ...options]
        : ['', 'Poor', 'Average', 'Good', 'Excellent'];

    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <button type="button"
                        onClick={() => onChange(n)}
                        style={{
                            width: 44, height: 44, borderRadius: 10, fontSize: '1.1rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)', cursor: 'pointer',
                            border: `2px solid ${value === n ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                            background: value === n ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                            color: value === n ? '#fff' : 'var(--text-secondary)',
                            boxShadow: value === n ? '0 8px 20px rgba(249,115,22,0.3)' : 'none',
                        }}
                    >
                        {n}
                    </button>
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: value === n ? 800 : 600,
                        color: value === n ? 'var(--accent-secondary)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {labels[n]}
                    </span>
                </div>
            ))}
        </div>
    );
};

const StudentDashboard = () => {
    const {
        publishedForms, submitForm, currentUser, hasStudentSubmitted,
        availableCourses, courseInstructors,
        notifications, markAllRead, clearNotifications
    } = useApp();
    const student = (currentUser && currentUser.name) ? currentUser : { name: 'Student', id: 'STU-DEMO', dept: 'Computer Science', semester: '6th Semester' };

    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [feedbackTab, setFeedbackTab] = useState('active'); // 'active' | 'expired'
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [rating, setRating] = useState(0);
    const [dynamicRatings, setDynamicRatings] = useState({});
    const [remarks, setRemarks] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeForms = useMemo(() =>
        publishedForms.filter(f => !f.deadline || new Date(f.deadline) >= today),
        [publishedForms]
    );

    // Alert logic for deadlines within next 48 hours
    const approachingDeadlines = useMemo(() => {
        return activeForms.filter(f => {
            if (!f.deadline) return false;
            const d = new Date(f.deadline);
            const diff = d.getTime() - today.getTime();
            const days = diff / (1000 * 60 * 60 * 24);
            return days >= 0 && days <= 2;
        });
    }, [activeForms]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const expiredForms = useMemo(() =>
        publishedForms.filter(f => f.deadline && new Date(f.deadline) < today),
        [publishedForms]
    );
    const currentForms = feedbackTab === 'active' ? activeForms : expiredForms;

    const submissionKey = useMemo(() => {
        if (!selectedCampaign || !selectedCourse || !selectedInstructor) return null;
        return `fb-${selectedCampaign.id}-${selectedCourse}-${selectedInstructor}`.toLowerCase().replace(/\s+/g, '-');
    }, [selectedCampaign, selectedCourse, selectedInstructor]);

    const isAlreadySubmitted = useMemo(() => {
        return submissionKey ? hasStudentSubmitted(submissionKey) : false;
    }, [submissionKey, hasStudentSubmitted]);

    const instructors = useMemo(() => {
        if (!selectedCourse) return [];
        return courseInstructors[selectedCourse] || [];
    }, [selectedCourse, courseInstructors]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCourse || !selectedInstructor) {
            setError('Please select Course and Instructor.');
            return;
        }

        const dynamicFields = selectedCampaign.fields || [];
        const missingRating = dynamicFields.some(f => {
            if (!f.required) return false;
            const val = dynamicRatings[f.id];
            if (f.type === 'rating') return !val || val === 0;
            return !val || val === '';
        });

        if (missingRating || (dynamicFields.length === 0 && rating === 0)) {
            setError('Please provide all required ratings.');
            return;
        }

        // Submit using the unique key and pass data for Admin to see
        submitForm(submissionKey, {
            course: selectedCourse,
            instructor: selectedInstructor,
            rating: rating || (dynamicFields.length > 0 ? Object.values(dynamicRatings)[0] : 0),
            dynamicRatings,
            remarks
        });

        setSubmitted(true);
        setError('');

        // Reset after 3 seconds
        setTimeout(() => {
            setSubmitted(false);
            setSelectedCourse('');
            setSelectedInstructor('');
            setRating(0);
            setDynamicRatings({});
            setRemarks('');
        }, 3000);
    };

    return (
        <div>
            {/* Header */}
            <div className="dashboard-header" style={{ position: 'relative', zIndex: 50 }}>
                <div>
                    <h1 className="page-title animate-fade-in">Student Dashboard</h1>
                    <p className="page-subtitle animate-fade-in animate-delay-1" style={{ marginBottom: 0 }}>
                        Welcome back, <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>{student.name}</span>!
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="animate-fade-in animate-delay-2">
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn-ghost"
                            style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications) markAllRead();
                            }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -5, right: -5,
                                    background: 'var(--error)', color: '#fff',
                                    fontSize: '0.6rem', fontWeight: 800,
                                    padding: '0.1rem 0.35rem', borderRadius: 99,
                                    border: '2px solid var(--bg-primary)'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Tray */}
                        {showNotifications && (
                            <div className="glass-panel animate-scale-in" style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: '0.75rem',
                                width: '360px', zIndex: 1000, padding: 0, overflow: 'hidden',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>Notifications</h3>
                                    <button className="btn-ghost" style={{ padding: '0.2rem', color: 'var(--text-muted)' }} onClick={() => setShowNotifications(false)}>
                                        <X size={16} />
                                    </button>
                                </div>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            No notifications.
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} style={{
                                                padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                background: n.read ? 'transparent' : 'rgba(124,108,245,0.05)',
                                                display: 'flex', flexDirection: 'column', gap: '0.25rem'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                                                        {n.type === 'new_campaign' ? '📢 New Feedback' : '🔔 Alert'}
                                                    </span>
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                                        <button
                                            className="btn-ghost"
                                            style={{ fontSize: '0.75rem', color: 'var(--error)', padding: '0.2rem 0.5rem' }}
                                            onClick={clearNotifications}
                                        >
                                            <Trash2 size={13} style={{ marginRight: '0.3rem' }} /> Clear History
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                        <Award size={14} /> {student.semester}
                    </div>
                </div>
            </div>

            {/* Approaching Deadline Alert */}
            {approachingDeadlines.length > 0 && (
                <div className="alert alert-warning animate-fade-in animate-delay-2" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertCircle size={24} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.1rem' }}>Approaching Deadlines!</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            The following forms are closing soon:
                            {approachingDeadlines.map((f, i) => (
                                <strong key={f.id} style={{ color: 'var(--accent-primary)' }}>
                                    {i > 0 ? ', ' : ' '}{f.title} ({new Date(f.deadline).toLocaleDateString()})
                                </strong>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="animate-fade-in animate-delay-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Feedback Selection Widget */}
                <div className="glass-panel">
                    {!selectedCampaign ? (
                        <div>
                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'rgba(79,70,229,0.07)', border: '1px solid var(--glass-border)', padding: '0.25rem', borderRadius: 12, width: 'fit-content' }}>
                                {[{ key: 'active', label: '✅ Active Feedbacks', count: activeForms.length }, { key: 'expired', label: '⏰ Expired Feedbacks', count: expiredForms.length }].map(t => (
                                    <button key={t.key} type="button" onClick={() => setFeedbackTab(t.key)} style={{
                                        padding: '0.45rem 1.1rem', borderRadius: 9, fontSize: '0.85rem', fontWeight: 700,
                                        background: feedbackTab === t.key ? (t.key === 'expired' ? 'linear-gradient(135deg,#ef4444,#f87171)' : 'var(--accent-gradient)') : 'transparent',
                                        color: feedbackTab === t.key ? '#fff' : 'var(--text-secondary)',
                                        border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                                        display: 'flex', alignItems: 'center', gap: '0.4rem'
                                    }}>
                                        {t.label}
                                        <span style={{ background: feedbackTab === t.key ? 'rgba(255,255,255,0.25)' : 'var(--glass-border)', borderRadius: 99, padding: '0 0.45rem', fontSize: '0.75rem', fontWeight: 800 }}>{t.count}</span>
                                    </button>
                                ))}
                            </div>

                            {feedbackTab === 'expired' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.65rem 1rem', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.18)' }}>
                                    <Clock size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>These feedback forms have passed their deadline and are closed for submissions.</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {currentForms.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: 12 }}>
                                        {feedbackTab === 'active' ? 'No active feedbacks at the moment.' : 'No expired feedbacks.'}
                                    </div>
                                ) : (
                                    currentForms.map(form => (
                                        <button
                                            key={form.id}
                                            onClick={() => feedbackTab === 'active' ? setSelectedCampaign(form) : null}
                                            className="card animate-scale-in"
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.25rem', cursor: feedbackTab === 'expired' ? 'not-allowed' : 'pointer', opacity: feedbackTab === 'expired' ? 0.7 : 1 }}
                                        >
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{form.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Launched {new Date(form.createdAt).toLocaleDateString()}</div>
                                                {form.deadline && (
                                                    <div style={{ fontSize: '0.72rem', marginTop: '0.25rem', color: feedbackTab === 'expired' ? '#ef4444' : 'var(--warning)', fontWeight: 600 }}>
                                                        {feedbackTab === 'expired' ? '⏰ Closed' : '📅 Deadline'}:  {new Date(form.deadline).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ color: feedbackTab === 'expired' ? '#ef4444' : 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                {feedbackTab === 'expired' ? 'Closed ✕' : 'Fill Feedback ➜'}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        <ClipboardList size={22} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedCampaign.title}</h2>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Providing feedback for this requirement.</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCampaign(null)} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                                    Switch Feedback
                                </button>
                            </div>

                            {submitted ? (
                                <div className="animate-scale-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,165,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#22d3a5' }}>
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Feedback Submitted!</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Thank you for helping us improve our quality.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                                    <div className="grid-2" style={{ gap: '1.1rem' }}>
                                        <div>
                                            <label className="form-label">Select Course</label>
                                            <select className="form-input" value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedInstructor(''); }}>
                                                <option value="">Choose Course…</option>
                                                {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Select Instructor</label>
                                            <select className="form-input" value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
                                                <option value="">Choose Instructor…</option>
                                                {instructors.map(ins => <option key={ins} value={ins}>{ins}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {isAlreadySubmitted ? (
                                        <div className="glass-panel" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)', padding: '1.5rem', textAlign: 'center' }}>
                                            <div style={{ color: 'var(--error)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                                <AlertCircle size={32} />
                                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Feedback Already Submitted</div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                                                    You have already provided feedback for <strong>{selectedCourse}</strong> with <strong>{selectedInstructor}</strong> in this campaign.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedCampaign.fields && selectedCampaign.fields.length > 0 ? (
                                                selectedCampaign.fields.map(field => {
                                                    // Skip "Full Name", "Student ID", "Email", "Department" as they come from profile
                                                    const profileFields = ['full name', 'student id', 'email', 'email address', 'department', 'course', 'instructor name'];
                                                    if (profileFields.includes(field.label.toLowerCase())) return null;

                                                    return (
                                                        <div key={field.id} style={{ marginBottom: '1.5rem' }}>
                                                            <label className="form-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                                                                {field.label} {field.required && <span style={{ color: 'var(--error)' }}>*</span>}
                                                            </label>

                                                            {field.type === 'rating' && (
                                                                <RatingWidget
                                                                    value={dynamicRatings[field.id] || 0}
                                                                    onChange={(val) => setDynamicRatings(prev => ({ ...prev, [field.id]: val }))}
                                                                    options={field.options}
                                                                />
                                                            )}

                                                            {(field.type === 'text' || field.type === 'email') && (
                                                                <input
                                                                    type={field.type}
                                                                    className="form-input"
                                                                    placeholder={field.placeholder}
                                                                    value={dynamicRatings[field.id] || ''}
                                                                    onChange={(e) => setDynamicRatings(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                                />
                                                            )}

                                                            {field.type === 'textarea' && (
                                                                <textarea
                                                                    className="form-input"
                                                                    style={{ minHeight: 80 }}
                                                                    placeholder={field.placeholder}
                                                                    value={dynamicRatings[field.id] || ''}
                                                                    onChange={(e) => setDynamicRatings(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                                />
                                                            )}

                                                            {field.type === 'yesno' && (
                                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                                    {['Yes', 'No'].map(opt => (
                                                                        <button
                                                                            key={opt}
                                                                            type="button"
                                                                            className={`btn-ghost ${dynamicRatings[field.id] === opt ? 'active' : ''}`}
                                                                            style={{
                                                                                padding: '0.5rem 1.5rem',
                                                                                borderRadius: 10,
                                                                                background: dynamicRatings[field.id] === opt ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                                                                                color: dynamicRatings[field.id] === opt ? '#fff' : 'var(--text-secondary)',
                                                                                borderColor: dynamicRatings[field.id] === opt ? 'var(--accent-primary)' : 'var(--glass-border)',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                            onClick={() => setDynamicRatings(prev => ({ ...prev, [field.id]: opt }))}
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {field.type === 'select' && (
                                                                <select
                                                                    className="form-input"
                                                                    value={dynamicRatings[field.id] || ''}
                                                                    onChange={(e) => setDynamicRatings(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                                >
                                                                    <option value="">Select an option...</option>
                                                                    {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                </select>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div>
                                                    <label className="form-label" style={{ marginBottom: '0.85rem' }}>Your Rating</label>
                                                    <RatingWidget value={rating} onChange={setRating} />
                                                </div>
                                            )}

                                            <div>
                                                <label className="form-label">Additional Remarks / Suggestions</label>
                                                <textarea className="form-input" style={{ minHeight: 100 }}
                                                    placeholder="Share your experience or suggestions for improvement..."
                                                    value={remarks} onChange={e => setRemarks(e.target.value)} />
                                            </div>

                                            {error && (
                                                <div style={{ color: 'var(--error)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <AlertCircle size={14} /> {error}
                                                </div>
                                            )}

                                            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.8rem 2.2rem', gap: '0.6rem' }}>
                                                <Send size={18} /> Submit Feedback
                                            </button>
                                        </>
                                    )}
                                </form>
                            )}
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default StudentDashboard;
