import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Shield, Edit, AlertCircle } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { adminAPI } from "../../api/admin.js";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const searchInputRef = useRef(null);

  // Keyboard shortcut handler for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        // Add a subtle highlight animation
        searchInputRef.current?.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          searchInputRef.current?.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 1000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch users from API
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await adminAPI.getUsers();
      return response.data;
    },
  });

  const users = usersData?.users || [];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && user.active) ||
                         (statusFilter === 'inactive' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Loading users...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load users
          </p>
        </div>
        <div className="card">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Users
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.response?.status === 401 
                ? "Authentication required - please login as admin"
                : error.response?.status === 403
                ? "Access denied - admin role required"
                : error.response?.data?.message || "Unable to fetch user data"}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users by name or email..."
              className="input pl-10 pr-16 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                Ctrl K
              </kbd>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:min-w-[240px]">
            <select 
              className="input min-w-[120px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="user">User</option>
            </select>
            <select 
              className="input min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && users.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No users found in the system
            </p>
            <p className="text-sm text-gray-400">
              Users will appear here once they register
            </p>
          </div>
        )}
        
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No users match your criteria
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              )}
              {(roleFilter || statusFilter) && (
                <button 
                  onClick={() => {
                    setRoleFilter("");
                    setStatusFilter("");
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserRow = ({ user }) => {
  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: "red", icon: Shield, text: "Admin" },
      editor: { color: "blue", icon: Edit, text: "Editor" },
      user: { color: "gray", icon: UserCheck, text: "User" }
    };

    const config = roleConfig[role] || roleConfig.user;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
        ${config.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : ''}
        ${config.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' : ''}
      `}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${status === 'active' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }
      `}>
        {status === 'active' ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {user.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getRoleBadge(user.role)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(user.active ? 'active' : 'inactive')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        <div>
          <div>{user.questions_created || 0} questions created</div>
          <div>Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
            Edit
          </button>
          <button className="text-red-600 hover:text-red-900 dark:text-red-400">
            {user.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserManagement;