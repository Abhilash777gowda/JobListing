const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs (with simple search)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { keyword, location, type } = req.query;
        let query = {};
        
        if (keyword) {
            query.title = { $regex: keyword, $options: 'i' };
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (type) {
            query.type = type;
        }

        const jobs = await Job.find(query).populate('employerId', 'name companyName').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('employerId', 'name companyName companyDescription');
        if (job) {
            res.json(job);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/jobs
// @desc    Create a job
// @access  Private (Employer only)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can create jobs' });
    }

    try {
        const job = new Job({
            title: req.body.title,
            description: req.body.description,
            qualifications: req.body.qualifications,
            responsibilities: req.body.responsibilities,
            location: req.body.location,
            salaryRange: req.body.salaryRange,
            type: req.body.type,
            employerId: req.user._id
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Employer only)
router.put('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this job' });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Employer only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this job' });
        }

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
