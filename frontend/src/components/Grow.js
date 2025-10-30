import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Grow.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Grow = ({ userId = 'demo-user-123' }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [courses, setCourses] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'learn') {
        const [coursesRes, recommendedRes, analyticsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/grow/courses?limit=8`),
          axios.get(`${BACKEND_URL}/api/grow/recommendations/courses?user_id=${userId}`),
          axios.get(`${BACKEND_URL}/api/grow/progress/analytics?user_id=${userId}`)
        ]);
        
        setCourses(coursesRes.data.data.courses || []);
        setRecommendedCourses(recommendedRes.data.data || []);
        setAnalytics(analyticsRes.data.data || {});
      } else if (activeTab === 'community') {
        const postsRes = await axios.get(`${BACKEND_URL}/api/grow/community/posts?limit=20`);
        setCommunityPosts(postsRes.data.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/grow/courses/${courseId}/enroll?user_id=${userId}`);
      alert('Successfully enrolled in course!');
      loadInitialData();
    } catch (error) {
      alert(`Enrollment failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const createPost = async (content, type) => {
    try {
      await axios.post(`${BACKEND_URL}/api/grow/community/posts?user_id=${userId}`, {
        content,
        type,
        category: 'general'
      });
      alert('Post created successfully!');
      loadInitialData();
    } catch (error) {
      alert(`Post creation failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="grow-container">
      <div className="grow-header">
        <h1>📚 Grow & Learn</h1>
        <p>Develop your skills, connect with experts, and advance your career</p>
      </div>

      <div className="grow-tabs">
        <button 
          className={activeTab === 'learn' ? 'active' : ''}
          onClick={() => setActiveTab('learn')}
        >
          🎓 Learn
        </button>
        <button 
          className={activeTab === 'assess' ? 'active' : ''}
          onClick={() => setActiveTab('assess')}
        >
          🧪 Skill Assessments
        </button>
        <button 
          className={activeTab === 'community' ? 'active' : ''}
          onClick={() => setActiveTab('community')}
        >
          💬 Community
        </button>
        <button 
          className={activeTab === 'mentorship' ? 'active' : ''}
          onClick={() => setActiveTab('mentorship')}
        >
          👥 Mentorship
        </button>
        <button 
          className={activeTab === 'progress' ? 'active' : ''}
          onClick={() => setActiveTab('progress')}
        >
          📊 My Progress
        </button>
      </div>

      <div className="grow-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <>
            {activeTab === 'learn' && (
              <div className="learn-tab">
                {analytics && analytics.overview && (
                  <div className="learning-stats">
                    <div className="stat-card">
                      <div className="stat-icon">🏆</div>
                      <div className="stat-info">
                        <span className="number">{analytics.overview.total_points || 0}</span>
                        <span className="label">Points Earned</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">✅</div>
                      <div className="stat-info">
                        <span className="number">{analytics.overview.completed_courses || 0}</span>
                        <span className="label">Courses Completed</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📈</div>
                      <div className="stat-info">
                        <span className="number">{analytics.overview.passed_assessments || 0}</span>
                        <span className="label">Skills Verified</span>
                      </div>
                    </div>
                  </div>
                )}

                {recommendedCourses.length > 0 && (
                  <div className="recommended-section">
                    <h2>Recommended For You</h2>
                    <div className="courses-grid">
                      {recommendedCourses.map(course => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          onEnroll={enrollInCourse}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="all-courses-section">
                  <h2>All Courses</h2>
                  {courses.length > 0 ? (
                    <div className="courses-grid">
                      {courses.map(course => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          onEnroll={enrollInCourse}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No courses available yet. Check back soon!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="community-tab">
                <div className="create-post-section">
                  <textarea 
                    id="post-content"
                    placeholder="Share your knowledge, ask questions, or post achievements..."
                    rows="4"
                  />
                  <div className="post-actions">
                    <select id="post-type">
                      <option value="discussion">Discussion</option>
                      <option value="question">Question</option>
                      <option value="achievement">Achievement</option>
                      <option value="resource">Resource</option>
                    </select>
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        const content = document.getElementById('post-content').value;
                        const type = document.getElementById('post-type').value;
                        if (content) {
                          createPost(content, type);
                          document.getElementById('post-content').value = '';
                        }
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>

                <div className="posts-feed">
                  {communityPosts.length > 0 ? (
                    communityPosts.map(post => (
                      <CommunityPostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No posts yet. Be the first to start a discussion!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'progress' && analytics && (
              <div className="progress-tab">
                <div className="progress-overview">
                  <h2>Your Learning Journey</h2>
                  
                  {analytics.skillProgress && analytics.skillProgress.length > 0 && (
                    <div className="skill-progress">
                      <h3>Verified Skills</h3>
                      {analytics.skillProgress.map(skill => (
                        <div key={skill.skill} className="skill-item">
                          <span className="skill-name">{skill.skill}</span>
                          <span className="skill-badge">
                            {skill.badge?.icon} {skill.level}
                          </span>
                          <span className="skill-score">{Math.round(skill.score || 0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {analytics.recentActivity && analytics.recentActivity.length > 0 && (
                    <div className="recent-activity">
                      <h3>Recent Activity</h3>
                      {analytics.recentActivity.map(activity => (
                        <div key={activity.id} className="activity-item">
                          <span>Course Progress</span>
                          <span className="progress">{activity.progress || 0}% complete</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!analytics.skillProgress || analytics.skillProgress.length === 0) && 
                   (!analytics.recentActivity || analytics.recentActivity.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Start learning to track your progress!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assess' && (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Skill Assessments</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Test your skills and earn verified badges
                </p>
                <button 
                  className="btn-primary"
                  style={{ padding: '12px 24px' }}
                  onClick={() => alert('Assessment feature coming soon!')}
                >
                  Start Assessment
                </button>
              </div>
            )}

            {activeTab === 'mentorship' && (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Mentorship</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Connect with experts in your field
                </p>
                <button 
                  className="btn-primary"
                  style={{ padding: '12px 24px' }}
                  onClick={() => alert('Mentorship feature coming soon!')}
                >
                  Find a Mentor
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, onEnroll }) => (
  <div className="course-card">
    <div className="course-image">
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} />
      ) : (
        <div className="course-placeholder">📚</div>
      )}
    </div>
    
    <div className="course-content">
      <h3>{course.title}</h3>
      <p className="course-description">{course.description || 'No description available'}</p>
      
      <div className="course-meta">
        <span className="instructor">By Instructor</span>
        <span className="level">{course.level}</span>
      </div>

      <div className="course-stats">
        <span>👥 {course.stats?.enrolled || 0} enrolled</span>
        <span>⭐ {course.stats?.average_rating || 0}/5</span>
      </div>

      <div className="course-actions">
        <button 
          className="btn-primary"
          onClick={() => onEnroll(course.id)}
        >
          {course.price?.is_free ? 'Enroll Free' : `Enroll - $${course.price?.amount || 0}`}
        </button>
      </div>
    </div>
  </div>
);

const CommunityPostCard = ({ post }) => (
  <div className="community-post">
    <div className="post-header">
      <div className="author-info">
        <span className="author-name">User {post.author_id?.substring(0, 8)}</span>
        {post.is_expert_post && (
          <span className="expert-badge">Expert</span>
        )}
      </div>
      <span className="post-date">
        {new Date(post.created_at).toLocaleDateString()}
      </span>
    </div>

    <div className="post-content">
      {post.content}
    </div>

    <div className="post-actions">
      <button className="action-btn">👍 {post.upvotes?.length || 0}</button>
      <button className="action-btn">💬 {post.comments?.length || 0}</button>
      <button className="action-btn">🔗 Share</button>
    </div>

    {post.comments && post.comments.length > 0 && (
      <div className="post-comments">
        {post.comments.slice(0, 2).map(comment => (
          <div key={comment.id} className="comment">
            <strong>User:</strong> {comment.content}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Grow;
