import React, { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Grow({ userId }) {
  const [activeTab, setActiveTab] = useState('learn');
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses for Learn tab
      const coursesResponse = await fetch(`${BACKEND_URL}/api/grow/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      // Fetch community posts
      const postsResponse = await fetch(`${BACKEND_URL}/api/grow/community/posts`);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/grow/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('Successfully enrolled in course!');
        fetchInitialData(); // Refresh data
      } else {
        alert('Failed to enroll in course');
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      alert('Error enrolling in course');
    }
  };

  const renderLearnTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">📚 Learning Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Courses Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24h</div>
            <div className="text-sm text-gray-600">Learning Time</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">🎯 Recommended Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 6).map((course) => (
            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-2">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">{course.category}</span>
                <button
                  onClick={() => handleEnrollCourse(course.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">📖 All Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{course.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-blue-600">{course.category}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">{course.difficulty}</span>
                </div>
                <button
                  onClick={() => handleEnrollCourse(course.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkillAssessmentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">🎯 Skill Assessments</h3>
        <p className="text-gray-600 mb-4">Test your skills and earn badges</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['React Development', 'Python Programming', 'UI/UX Design', 'Data Analysis'].map((skill) => (
            <div key={skill} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">{skill}</h4>
              <p className="text-sm text-gray-600 mb-3">Test your {skill.toLowerCase()} skills</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Start Assessment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCommunityTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">💬 Community Feed</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700">
          Create New Post
        </button>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">{post.author}</div>
                  <div className="text-sm text-gray-600">{post.createdAt}</div>
                </div>
              </div>
              <h4 className="font-semibold mb-2">{post.title}</h4>
              <p className="text-gray-700 mb-3">{post.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button className="hover:text-blue-600">👍 {post.upvotes || 0}</button>
                <button className="hover:text-blue-600">💬 {post.comments || 0} Comments</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMentorshipTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">🤝 Mentorship</h3>
        <p className="text-gray-600 mb-4">Connect with mentors and grow your career</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Find a Mentor</h4>
            <p className="text-sm text-gray-600 mb-3">Get guidance from experienced professionals</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Browse Mentors
            </button>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Become a Mentor</h4>
            <p className="text-sm text-gray-600 mb-3">Share your knowledge and help others grow</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Apply as Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyProgressTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">📊 My Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Skill Progress</h4>
            {['React', 'Python', 'Design', 'Communication'].map((skill) => (
              <div key={skill} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{skill}</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-3">Recent Activity</h4>
            <div className="space-y-2">
              <div className="text-sm">✅ Completed React Hooks course</div>
              <div className="text-sm">🎯 Passed Python assessment</div>
              <div className="text-sm">💬 Posted in community</div>
              <div className="text-sm">📚 Started new course</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Grow system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchInitialData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Grow</h1>
          <p className="text-gray-600">Develop your skills and advance your career</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'learn', label: 'Learn', icon: '📚' },
                { id: 'assessments', label: 'Skill Assessments', icon: '🎯' },
                { id: 'community', label: 'Community', icon: '💬' },
                { id: 'mentorship', label: 'Mentorship', icon: '🤝' },
                { id: 'progress', label: 'My Progress', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'learn' && renderLearnTab()}
          {activeTab === 'assessments' && renderSkillAssessmentsTab()}
          {activeTab === 'community' && renderCommunityTab()}
          {activeTab === 'mentorship' && renderMentorshipTab()}
          {activeTab === 'progress' && renderMyProgressTab()}
        </div>
      </div>
    </div>
  );
}