const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/applications/:jobId
// @desc    Apply for a job
// @access  Private (Job Seeker only)
router.post('/:jobId', protect, async (req, res) => {
    if (req.user.role !== 'job_seeker') {
        return res.status(403).json({ message: 'Only job seekers can apply for jobs' });
    }

    try {
        const job = await Job.findById(req.params.jobId).populate('employerId', 'name companyName email');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            jobId: req.params.jobId,
            applicantId: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        const application = new Application({
            jobId: req.params.jobId,
            applicantId: req.user._id,
            employerId: job.employerId._id,
            coverLetter: req.body.coverLetter || ''
        });

        const createdApplication = await application.save();
        
        // Populate applicant info for the socket event
        const populatedApp = await Application.findById(createdApplication._id)
            .populate('jobId', 'title')
            .populate('applicantId', 'name email resumeUrl skills');

        // Emit real-time event to Employer
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${job.employerId._id.toString()}`).emit('new_application', populatedApp);
        }

        // Send Email Notification to Job Seeker
        const message = `
            <h2>Application Submitted Successfully!</h2>
            <p>Hi ${req.user.name},</p>
            <p>Your application for the position of <strong>${job.title}</strong> at <strong>${job.employerId.companyName || 'Company'}</strong> has been submitted successfully.</p>
            <p>You can track the status of your application on your Dashboard.</p>
            <br/>
            <p>Best regards,</p>
            <p>The JobListingPortal Team</p>
        `;

        try {
            await sendEmail({
                email: req.user.email,
                subject: `Application Submitted: ${job.title}`,
                message
            });
        } catch (error) {
            console.error('Email could not be sent', error);
            // We still return 201 because the application was successful, even if email failed
        }

        res.status(201).json(createdApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/applications/employer
// @desc    Get all applications for an employer's jobs
// @access  Private (Employer only)
router.get('/employer', protect, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can view their applications' });
    }

    try {
        const applications = await Application.find({ employerId: req.user._id })
            .populate('jobId', 'title')
            .populate('applicantId', 'name email resumeUrl skills')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/applications/seeker
// @desc    Get all applications by a job seeker
// @access  Private (Job Seeker only)
router.get('/seeker', protect, async (req, res) => {
    if (req.user.role !== 'job_seeker') {
        return res.status(403).json({ message: 'Only job seekers can view their applications' });
    }

    try {
        const applications = await Application.find({ applicantId: req.user._id })
            .populate({
                path: 'jobId',
                select: 'title companyName location',
                populate: { path: 'employerId', select: 'name companyName' }
            })
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer only)
router.put('/:id/status', protect, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can update application status' });
    }

    try {
        const application = await Application.findById(req.params.id)
            .populate('jobId', 'title')
            .populate('applicantId', 'name email');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.employerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this application' });
        }

        application.status = req.body.status || application.status;
        const updatedApplication = await application.save();

        // Emit real-time event to Job Seeker
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${application.applicantId._id.toString()}`).emit('application_status_update', {
                appId: application._id,
                status: application.status,
                jobTitle: application.jobId.title
            });
        }

        // Optional: Send Email Notification to Job Seeker about status change
        const message = `
            <h2>Application Status Updated</h2>
            <p>Hi ${application.applicantId.name},</p>
            <p>Your application for the position of <strong>${application.jobId.title}</strong> has been updated to: <strong>${application.status}</strong>.</p>
            <p>Check your Dashboard for more details.</p>
            <br/>
            <p>Best regards,</p>
            <p>The JobListingPortal Team</p>
        `;

        try {
            await sendEmail({
                email: application.applicantId.email,
                subject: `Application Update: ${application.jobId.title}`,
                message
            });
        } catch (error) {
            console.error('Email could not be sent', error);
        }

        res.json(updatedApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
