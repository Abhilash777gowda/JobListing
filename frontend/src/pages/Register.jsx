import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('job_seeker');
    const [error, setError] = useState('');
    
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register({ name, email, password, role });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                        <UserPlus size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Create an Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join JobConnect today</p>
                </div>

                {error && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name or Company Name</label>
                        <input 
                            type="text" 
                            className="input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="input" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            minLength="6"
                        />
                    </div>
                    <div className="input-group">
                        <label>I am a...</label>
                        <select 
                            className="input" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="job_seeker">Job Seeker</option>
                            <option value="employer">Employer</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Create Account
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
