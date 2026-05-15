import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Building, ArrowLeft, Send, X, CheckCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Application Modal State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [applyError, setApplyError] = useState('');
    const [applySuccess, setApplySuccess] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await API.get(`/api/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                setError('Job not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        setApplyError('');
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await API.post(`/api/applications/${id}`, { coverLetter }, config);
            setApplySuccess(true);
            setTimeout(() => {
                setShowApplyModal(false);
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setApplyError(err.response?.data?.message || 'Failed to apply. You might have already applied.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading job details...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#ef4444' }}>{error}</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            {job.title}
                        </h1>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                            <Building size={20} /> {job.employerId?.companyName || 'Unknown Company'}
                        </p>
                    </div>
                    {user?.role === 'job_seeker' ? (
                        <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>
                            Apply Now
                        </button>
                    ) : !user ? (
                        <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>
                            Login to Apply
                        </button>
                    ) : null}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                        <MapPin size={20} color="var(--primary)" />
                        <span style={{ fontWeight: '500' }}>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                        <Briefcase size={20} color="var(--primary)" />
                        <span style={{ fontWeight: '500' }}>{job.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                        <DollarSign size={20} color="var(--primary)" />
                        <span style={{ fontWeight: '500' }}>{job.salaryRange}</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Job Description</h2>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.description}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Qualifications</h2>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.qualifications}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Responsibilities</h2>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.responsibilities}</p>
                </section>
                
                {job.employerId?.companyDescription && (
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>About {job.employerId.companyName}</h2>
                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', lineHeight: 1.7 }}>{job.employerId.companyDescription}</p>
                    </section>
                )}
            </div>

            {/* Application Modal */}
            {showApplyModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Apply for {job.title}</h2>
                            <button className="modal-close" onClick={() => setShowApplyModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        {applySuccess ? (
                            <div className="modal-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '0.5rem' }}>Application Submitted!</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="modal-body">
                                    {applyError && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{applyError}</div>}
                                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                                        You are applying for <strong>{job.title}</strong> at <strong>{job.employerId?.companyName || 'Company'}</strong>. Your profile information and resume will be shared with the employer.
                                    </p>
                                    <div className="input-group">
                                        <label>Cover Letter (Optional but recommended)</label>
                                        <textarea 
                                            className="input" 
                                            value={coverLetter} 
                                            onChange={(e) => setCoverLetter(e.target.value)} 
                                            placeholder="Why are you a great fit for this role?" 
                                            rows="6"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary"><Send size={16} /> Submit Application</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default JobDetails;
