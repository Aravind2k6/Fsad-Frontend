import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ArrowRight, Lock, BookOpen, Eye, EyeOff, Mail, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Login = () => {
    const navigate = useNavigate();
    const { loginUser, validateUser, registerUser, findUserByEmail } = useApp();

    const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
    const [role, setRole] = useState('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const resetMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        resetMessages();
        setLoading(true);

        setTimeout(() => {
            const user = validateUser(username, password, role);
            setLoading(false);

            if (user) {
                loginUser(user);
                navigate(role === 'admin' ? '/admin' : '/student');
            } else {
                setError('Invalid credentials for the selected role.');
            }
        }, 800);
    };

    const handleSignup = (e) => {
        e.preventDefault();
        resetMessages();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            // Basic validation
            if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }

            const newUser = registerUser({
                name,
                username: username.toLowerCase().trim(),
                password,
                role: role, // Use selected role
                email: email.toLowerCase().trim(),
                id: `${role === 'admin' ? 'ADM' : 'STU'}-${Math.floor(Math.random() * 100000)}`,
                dept: 'Computer Science', // Placeholder
                semester: '1st Semester'  // Placeholder
            });

            setSuccess('Account created successfully! You can now login.');
            setView('login');
            setUsername(newUser.username);
        }, 1000);
    };

    const handleForgot = (e) => {
        e.preventDefault();
        resetMessages();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            const user = findUserByEmail(email);
            if (user) {
                setSuccess(`A password reset link has been sent to ${email}.`);
            } else {
                setError('No account found with this email address.');
            }
        }, 1200);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', padding: '1.5rem', overflow: 'hidden',
            background: 'linear-gradient(140deg, #fff8f0 0%, #fff3e0 55%, #ffe8cc 100%)',
        }}>
            {/* blobs */}
            <div className="bg-blob blob-1" style={{ opacity: 0.22 }} />
            <div className="bg-blob blob-2" style={{ opacity: 0.18 }} />
            <div className="bg-blob blob-3" style={{ opacity: 0.12 }} />

            {/* Back to home */}
            <a href="/" style={{ position: 'absolute', top: '1.5rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--accent-secondary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <BookOpen size={15} /> EduFeedback
            </a>

            <div className="animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{
                    background: 'rgba(255,251,245,0.98)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(249,115,22,0.20)', borderRadius: 24,
                    padding: '2.5rem', boxShadow: '0 20px 60px rgba(180,80,0,0.14)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }} />

                    {/* View Headings */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 25px rgba(249,115,22,0.40)' }}>
                            <BookOpen size={28} color="#fff" strokeWidth={2.2} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                            {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            {view === 'login' ? 'Sign in to your EduFeedback account' : view === 'signup' ? 'Join our academic community' : 'Enter your email to receive a recovery link'}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '1.75rem', background: 'rgba(124,108,245,0.06)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '0.28rem' }}>
                        {[
                            { r: 'student', label: 'Student', Icon: User },
                            { r: 'admin', label: 'Admin', Icon: ShieldCheck },
                        ].map(({ r, label, Icon }) => (
                            <button key={r} type="button" onClick={() => { setRole(r); resetMessages(); }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.65rem', borderRadius: 9,
                                    fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                                    background: role === r ? 'var(--accent-gradient)' : 'transparent',
                                    color: role === r ? '#fff' : 'var(--text-secondary)',
                                    boxShadow: role === r ? '0 4px 14px rgba(249,115,22,0.40)' : 'none',
                                }}>
                                <Icon size={16} /> {label}
                            </button>
                        ))}
                    </div>

                    {error && <div className="alert alert-error animate-fade" style={{ marginBottom: '1.25rem' }}>{error}</div>}
                    {success && <div className="alert alert-success animate-fade" style={{ marginBottom: '1.25rem' }}>{success}</div>}

                    {/* LOGIN FORM */}
                    {view === 'login' && (
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label className="form-label">Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" className="form-input" placeholder="Enter your username"
                                        style={{ paddingLeft: '2.7rem' }} value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Enter password"
                                        style={{ paddingLeft: '2.7rem', paddingRight: '2.7rem' }} value={password} onChange={e => setPassword(e.target.value)} required />
                                    <button type="button" onClick={() => setShowPass(p => !p)}
                                        style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <span onClick={() => { setView('forgot'); resetMessages(); }} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}>Forgot Password?</span>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Signing in...' : `Sign in as ${role === 'student' ? 'Student' : 'Admin'}`}
                            </button>
                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Don't have an account? <span onClick={() => { setView('signup'); resetMessages(); }} style={{ color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer' }}>Sign up</span>
                            </div>
                        </form>
                    )}

                    {/* SIGNUP FORM */}
                    {view === 'signup' && (
                        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" className="form-input" placeholder="Enter your full name"
                                        style={{ paddingLeft: '2.7rem' }} value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="email" className="form-input" placeholder="name@email.com"
                                        style={{ paddingLeft: '2.7rem' }} value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" className="form-input" placeholder="Choose a username"
                                        style={{ paddingLeft: '2.7rem' }} value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Create a password"
                                        style={{ paddingLeft: '2.7rem' }} value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <span onClick={() => { setView('login'); resetMessages(); }} style={{ color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <ChevronLeft size={16} /> Back to Login
                                </span>
                            </div>
                        </form>
                    )}

                    {/* FORGOT PASSWORD FORM */}
                    {view === 'forgot' && (
                        <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="email" className="form-input" placeholder="Enter your registered email"
                                        style={{ paddingLeft: '2.7rem' }} value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Sending link...' : 'Send Recovery Link'}
                            </button>
                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <span onClick={() => { setView('login'); resetMessages(); }} style={{ color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <ChevronLeft size={16} /> Back to Login
                                </span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
