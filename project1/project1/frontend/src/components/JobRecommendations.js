import React, { useState, useEffect } from 'react';

export default function JobRecommendations({ user, skills = [] }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [successModal, setSuccessModal] = useState({ open: false, job: null });

  // Job categories
  const categories = [
    { id: 'all', name: 'All Jobs', icon: '💼' },
    { id: 'software', name: 'Software Development', icon: '💻' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'design', name: 'UI/UX Design', icon: '🎨' },
    { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
    { id: 'sales', name: 'Sales', icon: '💰' },
    { id: 'product', name: 'Product Management', icon: '📋' },
    { id: 'internship', name: 'Internships', icon: '🎓' }
  ];

  // Sample job data (in real implementation, this would come from APIs like Indeed, LinkedIn, etc.)
  const sampleJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Bangalore, India',
      type: 'Full-time',
      salary: '₹8-15 LPA',
      category: 'software',
      skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      description: 'We are looking for a skilled Frontend Developer to join our team...',
      postedDate: '2024-01-15',
      experience: '2-4 years',
      remote: true
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'DataFlow Inc',
      location: 'Mumbai, India',
      type: 'Full-time',
      salary: '₹12-20 LPA',
      category: 'data',
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      description: 'Join our data science team to build innovative ML solutions...',
      postedDate: '2024-01-14',
      experience: '3-5 years',
      remote: false
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      location: 'Delhi, India',
      type: 'Full-time',
      salary: '₹6-12 LPA',
      category: 'design',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      description: 'Create beautiful and intuitive user experiences...',
      postedDate: '2024-01-13',
      experience: '1-3 years',
      remote: true
    },
    {
      id: 4,
      title: 'Software Engineer Intern',
      company: 'StartupXYZ',
      location: 'Hyderabad, India',
      type: 'Internship',
      salary: '₹25-35k/month',
      category: 'internship',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Git'],
      description: 'Great opportunity for students to learn and grow...',
      postedDate: '2024-01-12',
      experience: '0-1 years',
      remote: false
    },
    {
      id: 5,
      title: 'Product Manager',
      company: 'ProductHub',
      location: 'Pune, India',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      category: 'product',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      description: 'Lead product development and strategy...',
      postedDate: '2024-01-11',
      experience: '4-6 years',
      remote: true
    },
    {
      id: 6,
      title: 'Digital Marketing Specialist',
      company: 'MarketingPro',
      location: 'Chennai, India',
      type: 'Full-time',
      salary: '₹5-10 LPA',
      category: 'marketing',
      skills: ['SEO', 'Google Ads', 'Social Media', 'Analytics'],
      description: 'Drive digital marketing campaigns and growth...',
      postedDate: '2024-01-10',
      experience: '2-4 years',
      remote: false
    },
    {
      id: 7,
      title: 'Backend Developer',
      company: 'CodeCraft',
      location: 'Bangalore, India',
      type: 'Full-time',
      salary: '₹10-18 LPA',
      category: 'software',
      skills: ['Node.js', 'Python', 'MongoDB', 'AWS'],
      description: 'Build scalable backend systems and APIs...',
      postedDate: '2024-01-09',
      experience: '3-5 years',
      remote: true
    },
    {
      id: 8,
      title: 'Sales Executive',
      company: 'SalesForce',
      location: 'Mumbai, India',
      type: 'Full-time',
      salary: '₹4-8 LPA + Commission',
      category: 'sales',
      skills: ['Sales', 'CRM', 'Communication', 'Negotiation'],
      description: 'Drive sales and build client relationships...',
      postedDate: '2024-01-08',
      experience: '1-3 years',
      remote: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(sampleJobs);
      setLoading(false);
    }, 1000);
  }, []);

  // Initialize applied jobs based on localStorage for this user
  useEffect(() => {
    try {
      const existingApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      const userApplied = existingApplied
        .filter(a => a.userEmail === (user?.email || ''))
        .map(a => a.jobId);
      setAppliedJobs(userApplied);
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedCategory, searchTerm, skills]);

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by skill match (if skills are provided)
    if (skills.length > 0) {
      filtered = filtered.map(job => {
        const matchingSkills = job.skills.filter(skill =>
          skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        return {
          ...job,
          skillMatch: matchingSkills.length,
          matchPercentage: (matchingSkills.length / job.skills.length) * 100
        };
      }).sort((a, b) => b.skillMatch - a.skillMatch);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (job) => {
    try {
      if (!user || !user.email) {
        alert('Please login to apply.');
        return;
      }

      const application = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: Date.now(),
        userEmail: user.email,
        status: 'Applied'
      };

      const existingApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      // Prevent duplicates
      const alreadyApplied = existingApplied.some(a => a.userEmail === user.email && a.jobId === job.id);
      if (alreadyApplied) {
        setAppliedJobs(prev => Array.from(new Set([...prev, job.id])));
        setSuccessModal({ open: true, job });
        return;
      }
      const updated = [...existingApplied, application];
      localStorage.setItem('appliedJobs', JSON.stringify(updated));

      setAppliedJobs(prev => Array.from(new Set([...prev, job.id])));
      setSuccessModal({ open: true, job });

      // Also notify backend so providers can see applications
      try {
        await fetch('http://localhost:8001/apply_job/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: job.id, user_email: user.email })
        });
      } catch (_) {}
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Error applying to job. Please try again.');
    }
  };

  const getSkillMatchColor = (matchPercentage) => {
    if (matchPercentage >= 80) return 'text-emerald-600 bg-emerald-100';
    if (matchPercentage >= 60) return 'text-blue-600 bg-blue-100';
    if (matchPercentage >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-8 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-6">
            Job Recommendations
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Discover personalized opportunities that perfectly match your skills and experience
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl mb-10">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
              />
              <svg className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl'
                    : 'bg-white/20 text-gray-700 hover:bg-white/30 shadow-lg hover:shadow-xl'
                }`}
              >
                <span className="mr-3 text-xl">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h3>
                      <p className="text-xl text-gray-600 font-medium">{job.company}</p>
                      <p className="text-gray-500">{job.location}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                    job.type === 'Internship' ? 'bg-purple-100 text-purple-700' :
                    job.type === 'Full-time' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {job.type}
                  </span>
                  {job.remote && (
                    <span className="block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium">
                      Remote
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 text-lg leading-relaxed mb-4">{job.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-white/20 rounded-xl">
                    <span className="text-2xl mr-3">💰</span>
                    <div>
                      <div className="font-semibold text-gray-800">{job.salary}</div>
                      <div className="text-sm text-gray-600">Salary</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-white/20 rounded-xl">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <div className="font-semibold text-gray-800">{job.experience}</div>
                      <div className="text-sm text-gray-600">Experience</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Match */}
              {job.skillMatch !== undefined && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-800">Skill Match</span>
                    <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${getSkillMatchColor(job.matchPercentage)}`}>
                      {job.skillMatch}/{job.skills.length} skills ({Math.round(job.matchPercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-2000 shadow-lg"
                      style={{ width: `${job.matchPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Required Skills */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 rounded-full text-sm font-medium border border-purple-500/30 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApply(job)}
                disabled={appliedJobs.includes(job.id)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                  appliedJobs.includes(job.id)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                }`}
              >
                {appliedJobs.includes(job.id) ? 'Applied ✓' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Success Modal */}
        {successModal.open && successModal.job && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-slideUp">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Successfully Applied!</h3>
              <p className="text-center text-gray-600 mb-6">You applied to <b>{successModal.job.title}</b> at <b>{successModal.job.company}</b>. You can view this in Activities.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessModal({ open: false, job: null })}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                >
                  Close
                </button>
                <a
                  href="/activities"
                  className="flex-1 text-center py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700"
                  onClick={() => setSuccessModal({ open: false, job: null })}
                >
                  View Activities
                </a>
              </div>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No jobs found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
