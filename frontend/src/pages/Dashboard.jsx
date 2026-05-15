import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Briefcase, FileText, CheckCircle, Clock, XCircle, Plus, X } from 'lucide-react';

const Dashboard = () => {
    const { user, loading, socket } = useContext(AuthContext);
    const navigate = useNavigate();

    const [employerJobs, setEmployerJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        qualifications: '',
        responsibilities: '',
        location: '',
        salaryRange: '',
        type: 'Full-time'
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (user) {
            fetchDashboardData();
        }

        // Real-time socket listeners
        if (socket) {
            socket.on('new_application', (newApp) => {
                setApplications((prev) => [newApp, ...prev]);
                // Optional: You could show a toast notification here
            });

            socket.on('application_status_update', ({ appId, status, jobTitle }) => {
                setApplications((prev) => 
                    prev.map(app => app._id === appId ? { ...app, status } : app)
                );
                // Optional: Show toast notification for status update
            });

            return () => {
                socket.off('new_application');
                socket.off('application_status_update');
            };
        }
    }, [user, loading, navigate, socket]);

    const fetchDashboardData = async () => {
        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        };

        try {
            if (user.role === 'employer') {
                const resJobs = await API.get('/api/jobs', config);
                const myJobs = resJobs.data.filter(job => job.employerId?._id === user._id);
                setEmployerJobs(myJobs);

                const resApps = await API.get('/api/applications/employer', config);
                setApplications(resApps.data);
            } else {
                const resApps = await API.get('/api/applications/seeker', config);
                setApplications(resApps.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        }
    };

    const handlePostJobChange = (e) => {
        setNewJob({ ...newJob, [e.target.name]: e.target.value });
    };

    const handlePostJobSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await API.post('/api/jobs', newJob, config);
            setShowPostJobModal(false);
            setNewJob({
                title: '', description: '', qualifications: '', responsibilities: '', location: '', salaryRange: '', type: 'Full-time'
            });
            fetchDashboardData(); // Refresh the job list
        } catch (error) {
            console.error('Error posting new job', error);
            alert('Failed to post job: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await API.put(`/api/applications/${appId}/status`, { status }, config);
            fetchDashboardData(); // Refresh applications list
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading || !user) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Welcome, {user.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{user.role === 'employer' ? 'Employer Dashboard' : 'Job Seeker Dashboard'}</p>
                </div>
                {user.role === 'employer' && (
                    <button className="btn btn-primary" onClick={() => setShowPostJobModal(true)}>
                        <Plus size={16} /> Post New Job
                    </button>
                )}
            </div>

            {user.role === 'employer' ? (
                // Employer Dashboard View
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={20} /> My Job Listings
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {employerJobs.length === 0 ? <p>No jobs posted yet.</p> : employerJobs.map(job => (
                                <div key={job._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '600' }}>{job.title}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{job.location} • {job.type}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Edit</button>
                                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#b91c1c' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} /> Recent Applications
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {applications.length === 0 ? <p>No applications received yet.</p> : applications.map(app => (
                                <div key={app._id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: '600' }}>{app.applicantId?.name}</h3>
                                        <span style={{ fontSize: '0.875rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                                            {app.jobId?.title}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{app.applicantId?.email}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {app.status === 'Pending' ? (
                                            <>
                                                <button onClick={() => handleUpdateStatus(app._id, 'Accepted')} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Accept</button>
                                                <button onClick={() => handleUpdateStatus(app._id, 'Rejected')} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Reject</button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: app.status === 'Accepted' ? '#10b981' : '#ef4444' }}>
                                                {app.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // Job Seeker Dashboard View
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> My Applications
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {applications.length === 0 ? <p>You haven't applied to any jobs yet.</p> : applications.map(app => (
                            <div key={app._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>{app.jobId?.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0.5rem 0' }}>
                                        <Briefcase size={16} /> {app.jobId?.employerId?.companyName || 'Company'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    {app.status === 'Pending' && <Clock size={18} color="#f59e0b" />}
                                    {app.status === 'Accepted' && <CheckCircle size={18} color="#10b981" />}
                                    {app.status === 'Rejected' && <XCircle size={18} color="#ef4444" />}
                                    {app.status === 'Reviewed' && <FileText size={18} color="#3b82f6" />}
                                    <span style={{ fontWeight: '500' }}>Status: {app.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Post Job Modal */}
            {showPostJobModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in">
                        <div className="modal-header">
                            <h2>Post New Job</h2>
                            <button className="modal-close" onClick={() => setShowPostJobModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handlePostJobSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Job Title</label>
                                        <input type="text" className="input" name="title" value={newJob.title} onChange={handlePostJobChange} placeholder="e.g. Senior Frontend Developer" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Job Type</label>
                                        <select className="input" name="type" value={newJob.type} onChange={handlePostJobChange} required>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Location</label>
                                        <input type="text" className="input" name="location" value={newJob.location} onChange={handlePostJobChange} placeholder="e.g. Remote, San Francisco" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Salary Range</label>
                                        <input type="text" className="input" name="salaryRange" value={newJob.salaryRange} onChange={handlePostJobChange} placeholder="e.g. $120,000 - $150,000" required />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Job Description</label>
                                        <textarea className="input" name="description" value={newJob.description} onChange={handlePostJobChange} placeholder="Describe the role and company..." rows="4" required></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Qualifications</label>
                                        <textarea className="input" name="qualifications" value={newJob.qualifications} onChange={handlePostJobChange} placeholder="List required skills and experience..." rows="3" required></textarea>
                                    </div>
                                    <div className="input-group full-width" style={{ marginBottom: 0 }}>
                                        <label>Key Responsibilities</label>
                                        <textarea className="input" name="responsibilities" value={newJob.responsibilities} onChange={handlePostJobChange} placeholder="What will they be doing day-to-day?" rows="3" required></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPostJobModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Briefcase size={16} /> Publish Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Dashboard;
