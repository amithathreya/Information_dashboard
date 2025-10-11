// src/Home.jsx
import { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, UserPlus, Award, Menu, X, Settings, 
  LogOut, Search, ChevronRight, TrendingUp, PlusCircle, Trash2, Edit
} from 'lucide-react';
import React from 'react';

// --- Mock Data ---
const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Students', icon: Users },
  { name: 'Courses', icon: BookOpen },
  { name: 'Reports', icon: Award },
  { name: 'Settings', icon: Settings },
];

const mockStats = [
  { id: 1, title: 'Total Students', value: 1250, change: '+12% since last month', icon: Users, color: 'bg-indigo-600', trend: 'up', actionPage: 'Students' },
  { id: 2, title: 'Active Courses', value: 45, change: '15 new courses this year', icon: BookOpen, color: 'bg-emerald-600', trend: 'up', actionPage: 'Courses' }, // Added actionPage
  { id: 3, title: 'New Enrollment', value: 85, change: 'Target met for the month', icon: UserPlus, color: 'bg-amber-500', trend: 'up', actionPage: 'Students' },
  { id: 4, title: 'Avg. Grade Point', value: 3.7, change: 'Slight increase from Q1', icon: Award, color: 'bg-rose-600', trend: 'up', actionPage: 'Reports' },
];

const quickActions = [
  { title: 'Add New Student', description: 'Quickly register a new student profile.', icon: UserPlus, color: 'text-indigo-600', link: '/students/add' },
  { title: 'View Academic Reports', description: 'Access and generate performance reports.', icon: Award, color: 'text-emerald-600', link: '/reports' },
  { title: 'Manage Course Catalog', description: 'Edit existing courses or add new ones.', icon: BookOpen, color: 'text-amber-600', link: '/courses' },
];

// --- Course Management Mock Data and State (Moved inside CoursesPage for encapsulation) ---

/**
 * 📊 Key Metric Card Component (UPDATED with onClick to change page)
 */
const StatCard = ({ title, value, change, icon: Icon, color, trend, actionPage, setCurrentPage }) => {
    const TrendIcon = trend === 'up' ? TrendingUp : TrendingUp;
    const trendColor = trend === 'up' ? 'text-emerald-500' : 'text-red-500';
    
    const handleClick = () => {
        if (actionPage && setCurrentPage) {
            setCurrentPage(actionPage);
        }
    };

    return (
      <div 
        className={`flex flex-col p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition duration-300 ${
          actionPage ? 'cursor-pointer hover:shadow-xl transform hover:scale-[1.02]' : ''
        }`}
        onClick={handleClick}
        role={actionPage ? "button" : "status"}
        aria-label={actionPage ? `Maps to ${actionPage} page` : title}
      >
        <div className={`p-3 rounded-full ${color} text-white self-start mb-4 shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className="flex items-center mt-3">
          <TrendIcon className={`w-4 h-4 mr-1 ${trendColor}`} />
          <p className={`text-xs font-medium ${trendColor}`}>{change}</p>
        </div>
      </div>
    );
};

/**
 * ⚡ Quick Action Component
 */
const QuickAction = ({ title, description, icon: Icon, color, link }) => (
  <a
    href={link}
    onClick={(e) => e.preventDefault()} // Prevent actual navigation for a full SPA feel
    className="flex items-center justify-between p-6 bg-white border-l-4 border-gray-200 hover:border-indigo-500 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-1 hover:shadow-lg"
    aria-label={`Go to ${title}`}
  >
    <div className="flex items-start space-x-4">
      <Icon className={`w-8 h-8 ${color} flex-shrink-0`} />
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
  </a>
);

/**
 * 🧭 Sidebar Navigation Component
 */
const Sidebar = ({ isOpen, toggleSidebar, currentPage, setCurrentPage }) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 z-20 bg-black bg-opacity-60 lg:hidden"
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>
    )}
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 z-30 flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 lg:h-auto lg:shadow-2xl`}
    >
      <div className="flex items-center justify-between lg:justify-start mb-10 border-b border-gray-700/50 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">
          Edu<span className='text-white'>Track</span>
        </h1>
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.name;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => {
                setCurrentPage(item.name);
                if (isOpen) toggleSidebar();
              }}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/50'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-4" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <button className="flex items-center w-full px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition duration-200">
          <LogOut className="w-5 h-5 mr-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  </>
);

/**
 * 🔝 Main Header Component
 */
const Header = ({ toggleSidebar, currentPage }) => (
  <header className="sticky top-0 z-10 p-4 lg:p-6 bg-white shadow-lg flex items-center justify-between">
    <div className="flex items-center">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 mr-4 text-gray-600 hover:text-indigo-600 rounded-lg transition duration-150 border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      <h2 className="text-xl lg:text-3xl font-extrabold text-gray-900">{currentPage}</h2>
    </div>
    <div className="flex items-center space-x-6">
      <div className="relative hidden sm:block">
        <input
          type="search"
          placeholder="Search students or courses..."
          className="py-2.5 pl-10 pr-4 w-64 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 bg-gray-50"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer shadow-lg hover:shadow-indigo-400/50 transition duration-150" aria-label="User Profile">
        AD
      </div>
    </div>
  </header>
);

/**
 * 🏠 Dashboard Content (UPDATED to pass setCurrentPage)
 */
const DashboardContent = ({ setCurrentPage }) => (
  <div className="p-4 lg:p-8 space-y-12">
    <div className="p-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-xl border border-indigo-400/50 text-white">
      <h1 className="text-3xl font-bold">Hello, Student 👋</h1>
      <p className="mt-2 text-indigo-100/90 max-w-2xl">
        Welcome to EduTrack, your Student Details Management System. Here's a concise overview of key metrics and actions.
      </p>
    </div>
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 inline-block">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <StatCard key={stat.id} {...stat} setCurrentPage={setCurrentPage} />
        ))}
      </div>
    </section>
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 inline-block">Quick Access & Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <QuickAction key={index} {...action} />
        ))}
      </div>
    </section>
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 inline-block">Recent Activity Log</h2>
        <div className="p-8 bg-white rounded-2xl shadow-xl h-full min-h-[250px] flex items-center justify-center border border-gray-100">
          <p className="text-gray-500 font-medium text-lg">Activity Stream: Showing real-time database updates (Feature coming soon!)</p>
        </div>
      </div>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 inline-block">Announcements</h2>
        <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-4">
          <div className="border-l-4 border-yellow-500 pl-3">
            <p className="font-semibold text-gray-800">System Update Notice</p>
            <p className="text-sm text-gray-500">Scheduled maintenance on 25th Oct at 1 AM.</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-3">
            <p className="font-semibold text-gray-800">New Feature Released</p>
            <p className="text-sm text-gray-500">Course enrollment bulk upload is now available.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

// --- Content Placeholders for other Pages ---
const StudentsPage = () => <div className="p-8 text-2xl font-semibold text-gray-700">📚 Student List Management (To be built)</div>;
const ReportsPage = () => <div className="p-8 text-2xl font-semibold text-gray-700">📊 Report Generation Tools (To be built)</div>;
const SettingsPage = () => <div className="p-8 text-2xl font-semibold text-gray-700">⚙️ System Configuration (To be built)</div>;


// 
// ✅ NEW/UPDATED: Fully functional CoursesPage
//

const initialCourses = [
  { id: 101, name: 'Introduction to React', code: 'CS-101', credits: 3, instructor: 'Dr. Jane Doe' },
  { id: 102, name: 'Advanced CSS & Tailwind', code: 'DES-205', credits: 3, instructor: 'Prof. John Smith' },
  { id: 103, name: 'Data Structures in Python', code: 'CS-301', credits: 4, instructor: 'Dr. Alice Johnson' },
  { id: 104, name: 'Database Management Systems', code: 'IT-410', credits: 4, instructor: 'Prof. Bob Williams' },
];

/**
 * 🛠️ Add/Edit Course Modal Component
 */
const CourseModal = ({ isEdit, initialData, onClose, onSave }) => {
  const [course, setCourse] = useState(initialData || { name: '', code: '', credits: 3, instructor: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: name === 'credits' ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(course);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100 duration-300">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
          {isEdit ? 'Edit Course' : 'Add New Course'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <input
              type="text"
              name="name"
              value={course.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Code</label>
              <input
                type="text"
                name="code"
                value={course.code}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credits</label>
              <input
                type="number"
                name="credits"
                value={course.credits}
                onChange={handleChange}
                required
                min="1"
                max="6"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instructor</label>
            <input
              type="text"
              name="instructor"
              value={course.instructor}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              {isEdit ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


/**
 * 📖 Course Catalog Editor (Full Implementation)
 */
const CoursesPage = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleOpenModal = (course = null) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (courseData) => {
    if (editingCourse) {
      // Edit Course
      setCourses(courses.map(c => c.id === courseData.id ? courseData : c));
    } else {
      // Add Course
      const newCourse = { ...courseData, id: Date.now() }; // Simple unique ID
      setCourses([...courses, newCourse]);
    }
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Course Catalog Management</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl shadow-lg border border-gray-100">
          <p className="text-xl text-gray-500">No courses in the catalog. Click "Add New Course" to begin!</p>
        </div>
      ) : (
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.credits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.instructor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleOpenModal(course)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                      aria-label={`Edit ${course.name}`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      aria-label={`Delete ${course.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CourseModal
          isEdit={!!editingCourse}
          initialData={editingCourse}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
};


/**
 * 🚀 Home Component (Main Dashboard Container)
 */
const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardContent setCurrentPage={setCurrentPage} />; // Pass setCurrentPage
      case 'Students':
        return <StudentsPage />;
      case 'Courses':
        return <CoursesPage />; // Use the new component
      case 'Reports':
        return <ReportsPage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <DashboardContent setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Scrollbar styling (best practice is external CSS, but included here for a single-file solution) */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #818cf8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
      `}</style>
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
        />

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          <Header toggleSidebar={toggleSidebar} currentPage={currentPage} />
          <div className="pb-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;