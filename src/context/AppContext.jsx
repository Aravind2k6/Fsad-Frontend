import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ─── Default seed forms so the app has data out of the box ─── */
const SEED_FORMS = [
    {
        id: 'campaign-seed-1',
        title: 'Mid-Semester Course Feedback',
        description: 'Provide feedback on course quality and instructor performance.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        deadline: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now — ACTIVE
        published: true,
        fields: [
            { id: 'f1', label: 'How would you rate the overall quality of the course?', type: 'rating', required: true },
            { id: 'f2', label: 'Was the course content clear and easy to understand?', type: 'rating', required: true },
            { id: 'f3', label: 'How effective was the instructor in explaining the topics?', type: 'rating', required: true },
            { id: 'f4', label: 'Did this course improve your knowledge or skills in the subject?', type: 'rating', required: true },
            { id: 'f5', label: 'What suggestions do you have to improve this course? (Rate the current state)', type: 'rating', required: true },
        ],
    },
    {
        id: 'campaign-seed-2',
        title: 'End-Semester Evaluation',
        description: 'Comprehensive evaluation of the subject and instructor.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        deadline: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago — EXPIRED
        published: true,
        fields: [
            { id: 'f1', label: 'How would you rate the overall quality of the course?', type: 'rating', required: true },
            { id: 'f2', label: 'Was the course content clear and easy to understand?', type: 'rating', required: true },
            { id: 'f3', label: 'How effective was the instructor in explaining the topics?', type: 'rating', required: true },
            { id: 'f4', label: 'Did this course improve your knowledge or skills in the subject?', type: 'rating', required: true },
            { id: 'f5', label: 'What suggestions do you have to improve this course? (Rate the current state)', type: 'rating', required: true },
        ],
    },
];

/* ─── Helpers ─── */
const load = (key, fallback) => {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
};
const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
};

/* ─── Context ─── */
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [forms, setForms] = useState(() => {
        // Clear old broken forms from localStorage and always use seed forms for now
        save('edu_forms', SEED_FORMS);
        return SEED_FORMS;
    });

    const [courseInstructors] = useState({
        'FSAD': ['Ramu'],
        'CIS': ['Ganesh'],
        'DBMS': ['Abhinav'],
        'OS': ['Raghavendra'],
        'AIML': ['Sai']
    });
    const [availableCourses] = useState(Object.keys(courseInstructors));
    const [availableInstructors] = useState(['Ramu', 'Ganesh', 'Abhinav', 'Raghavendra', 'Sai']);

    // Detailed submissions: Array of { id, course, instructor, rating, remarks, timestamp }
    const [feedbacks, setFeedbacks] = useState(() => {
        save('edu_feedbacks', []);
        return [];
    });

    // submissions: { [submissionKey]: number } - kept for backward compatibility and fast "already submitted" checks
    const [submissionCounts, setSubmissionCounts] = useState(() =>
        load('edu_submission_counts', { 'fb-fsad-ramu': 12, 'fb-cis-ganesh': 8 })
    );

    // track which keys this student has already submitted in this session
    const [submittedByStudent, setSubmittedByStudent] = useState(() =>
        load('edu_student_submitted', [])
    );

    // Track the currently logged in user (student or admin)
    const [currentUser, setCurrentUser] = useState(() => load('edu_current_user', null));

    // Notifications state
    const [notifications, setNotifications] = useState(() => {
        const stored = load('edu_notifications', []);
        if (stored.length === 0) {
            const seedNotifs = [
                {
                    id: 'notif-seed-1',
                    type: 'new_campaign',
                    message: 'New feedback form published: "Mid-Semester Course Feedback"',
                    metadata: { formId: 'campaign-seed-1' },
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false
                },
                {
                    id: 'notif-seed-2',
                    type: 'alert',
                    message: 'Reminder: The "End-Semester Evaluation" deadline is approaching!',
                    metadata: { formId: 'campaign-seed-2' },
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: true
                }
            ];
            save('edu_notifications', seedNotifs);
            return seedNotifs;
        }
        return stored;
    });

    // Register of all users (persisted)
    const [users, setUsers] = useState(() => {
        const stored = load('edu_users', []);
        if (stored.length === 0) {
            // Default seed users
            const seedUsers = [
                { id: '2400030040', name: 'Aravind', username: 'aravind', password: 'student123', role: 'student', dept: 'Computer Science', semester: '6th Semester', email: 'aravind@edu.com' },
                { id: '2400030439', name: 'Jaswanth', username: 'jaswanth', password: 'student123', role: 'student', dept: 'Computer Science', semester: '6th Semester', email: 'jaswanth@edu.com' },
                { id: '2400032357', name: 'Anish', username: 'anish', password: 'student123', role: 'student', dept: 'Computer Science', semester: '6th Semester', email: 'anish@edu.com' },
                { id: 'admin-ram', name: 'Ram', username: 'ram', password: 'admin123', role: 'admin', email: 'admin@edu.com' },
            ];
            save('edu_users', seedUsers);
            return seedUsers;
        }
        return stored;
    });

    // Persist whenever state changes
    useEffect(() => { save('edu_forms', forms); }, [forms]);
    useEffect(() => { save('edu_feedbacks', feedbacks); }, [feedbacks]);
    useEffect(() => { save('edu_submission_counts', submissionCounts); }, [submissionCounts]);
    useEffect(() => { save('edu_student_submitted', submittedByStudent); }, [submittedByStudent]);
    useEffect(() => { save('edu_current_user', currentUser); }, [currentUser]);
    useEffect(() => { save('edu_users', users); }, [users]);
    useEffect(() => { save('edu_notifications', notifications); }, [notifications]);

    /* ── Auth: Login / Logout ── */
    const loginUser = useCallback((user) => {
        setCurrentUser(user);
    }, []);

    const logoutUser = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const registerUser = useCallback((userData) => {
        const newUser = {
            ...userData,
            id: userData.id || `user-${Date.now()}`,
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    }, []);

    const deleteUser = useCallback((userId) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, []);

    const findUserByEmail = useCallback((email) => {
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }, [users]);

    const validateUser = useCallback((username, password, role) => {
        return users.find(u =>
            u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password &&
            u.role === role
        );
    }, [users]);

    /* ── Notifications ── */
    const addNotification = useCallback((type, message, metadata = {}) => {
        const newNotif = {
            id: `notif-${Date.now()}`,
            type,
            message,
            metadata,
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 20)); // Keep last 20
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    /* ── Admin: create / delete form ── */
    const createForm = useCallback((formData) => {
        const newForm = {
            ...formData,
            id: `form-${Date.now()}`,
            createdAt: new Date().toISOString(),
            published: true,
        };
        setForms(prev => [newForm, ...prev]);

        // Trigger notification for students
        addNotification('new_campaign', `New feedback form published: "${newForm.title}"`, { formId: newForm.id });

        return newForm.id;
    }, [addNotification]);

    const deleteForm = useCallback((id) => {
        setForms(prev => prev.filter(f => f.id !== id));
        setSubmissionCounts(prev => { const n = { ...prev }; delete n[id]; return n; });
    }, []);

    /* ── Student: submit feedback ── */
    const submitForm = useCallback((submissionKey, feedbackData) => {
        // Increment count
        setSubmissionCounts(prev => ({ ...prev, [submissionKey]: (prev[submissionKey] || 0) + 1 }));

        // Save detailed feedback if provided
        if (feedbackData) {
            setFeedbacks(prev => [{
                id: `fb-${Date.now()}`,
                ...feedbackData,
                timestamp: new Date().toISOString()
            }, ...prev]);
        }

        // Track for the current session/student
        setSubmittedByStudent(prev => [...new Set([...prev, submissionKey])]);
    }, []);

    const hasStudentSubmitted = useCallback(
        (formId) => submittedByStudent.includes(formId),
        [submittedByStudent]
    );

    /* ── Derived stats ── */
    const totalForms = forms.length;
    const totalSubmissions = Object.values(submissionCounts).reduce((a, b) => a + b, 0);
    const publishedForms = forms.filter(f => f.published);

    return (
        <AppContext.Provider value={{
            forms, publishedForms,
            availableCourses, availableInstructors, courseInstructors,
            feedbacks,
            submissionCounts,
            totalForms, totalSubmissions,
            createForm, deleteForm,
            submitForm, hasStudentSubmitted,
            currentUser, loginUser, logoutUser,
            users, registerUser, deleteUser, findUserByEmail, validateUser,
            notifications, markAllRead, clearNotifications,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside AppProvider');
    return ctx;
};
