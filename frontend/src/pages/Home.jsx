import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { Search, MapPin, Briefcase } from 'lucide-react';

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const query = new URLSearchParams({ keyword, location, type }).toString();
            const res = await API.get(`/api/jobs?${query}`);
            setJobs(res.data);
        } catch (error) {
            console.error('Error fetching jobs', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', margin: '4rem 0' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)' }}>
                    Find Your Dream Job Today
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Connect with top employers and discover opportunities that match your skills.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', maxWidth: '800px', margin: '0 auto', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--border)' }}>
                        <Search size={20} color="var(--text-muted)" />
                        <input 
                            type="text" 
                            placeholder="Job title or keyword" 
                            style={{ border: 'none', width: '100%', outline: 'none', background: 'transparent' }} 
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={20} color="var(--text-muted)" />
                        <input 
                            type="text" 
                            placeholder="Location" 
                            style={{ border: 'none', width: '100%', outline: 'none', background: 'transparent' }}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">Job Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>
            </div>

            {/* Job Listings */}
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Latest Jobs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {jobs.map(job => (
                    <div key={job._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{job.title}</h3>
                                <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    <Briefcase size={16} /> {job.employerId?.companyName || 'Unknown Company'}
                                </p>
                            </div>
                            <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                {job.type}
                            </span>
                        </div>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            <MapPin size={16} /> {job.location}
                        </p>
                        <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', height: '3rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.description}
                        </div>
                        <Link to={`/job/${job._id}`} className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                            View Details
                        </Link>
                    </div>
                ))}
                {jobs.length === 0 && <p>No jobs found.</p>}
            </div>
        </div>
    );
};

export default Home;
