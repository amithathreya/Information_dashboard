// src/Home.jsx
import { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, UserPlus, Award, Menu, X, Settings, LogOut, Search, ChevronRight, TrendingUp, UserCheckIcon } from 'lucide-react';
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
  { id: 1, title: 'Total Students', value: 1250, change: '+12% since last month', icon: Users, color: 'bg-indigo-600', trend: 'up' },
  { id: 2, title: 'Active Courses', value: 45, change: '15 new courses this year', icon: BookOpen, color: 'bg-emerald-600', trend: 'up' },
  { id: 3, title: 'Attendance', value: 85, change: 'Target met for the month', icon: UserCheckIcon, color: 'bg-amber-500', trend: 'up' },
  { id: 4, title: 'Average Grade', value: 4.1, change: 'Slight increase from Q1', icon: Award, color: 'bg-rose-600', trend: 'up' },
];

const quickActions = [
  { title: 'Student Details', description: 'Student information Access.', icon: UserPlus, color: 'text-indigo-600', link: '/students/add' },
  { title: 'View Academic Reports', description: 'Access and generate performance reports.', icon: Award, color: 'text-emerald-600', link: '/reports' },
  { title: 'Manage Course Catalog', description: 'Edit existing courses or add new ones.', icon: BookOpen, color: 'text-amber-600', link: '/courses' },
];


/**
 * 📊 Key Metric Card Component
 */
const StatCard = ({ title, value, change, icon: Icon, color, trend }) => {
    const TrendIcon = trend === 'up' ? TrendingUp : TrendingUp;
    const trendColor = trend === 'up' ? 'text-emerald-500' : 'text-red-500';
    
    return (
        <div className="flex flex-col p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 transform hover:scale-[1.02]">
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
          Student<span className='text-white'>Portal</span>
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
 * 🏠 Dashboard Content
 */
const DashboardContent = () => (
  <div className="p-4 lg:p-8 space-y-12">
    <div className="p-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-xl border border-indigo-400/50 text-white">
      <h1 className="text-3xl font-bold">Hello, Student 👋</h1>
      <p className="mt-2 text-indigo-100/90 max-w-2xl">
        Welcome to Student Portal, your Student Details Management System. Here's a concise overview of key metrics and actions.
      </p>
    </div>
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 inline-block">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
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
const CoursesPage = () => <div className="p-8 text-2xl font-semibold text-gray-700">📖 Course Catalog Editor (To be built)</div>;
const ReportsPage = () => <div className="p-8 text-2xl font-semibold text-gray-700">📊 Report Generation Tools (To be built)</div>;
const SettingsPage = () => <div className="p-8 text-2xl font-semibold text-gray-700">⚙️ System Configuration (To be built)</div>;


/**
 * 🚀 Home Component (Now the Main Dashboard Container)
 */
const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Students':
        return <StudentsPage />;
      case 'Courses':
        return <CoursesPage />;
      case 'Reports':
        return <ReportsPage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* NOTE: Custom CSS for scrollbar should be in src/index.css, 
        but kept here for completeness if you haven't set up the global CSS file yet.
      */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #818cf8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
      `}</style>
      <div className="flex">
        {/* Sidebar - Desktop & Mobile */}
         <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} currentPage={currentPage} setCurrentPage={setCurrentPage} />

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