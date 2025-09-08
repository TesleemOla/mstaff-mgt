import { useState, useEffect, useCallback } from 'react';
import AddStaffModal from "../AddStaffModal"
import { ArrowUpRightSquare, HelpingHand, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../ChangePasswordModal';
import { API_BASE } from "../../../utils/data";

interface Staff {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
}

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');




  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchStaff = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/staff`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
      } else {
        toast.error('Failed to fetch staff members');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  },[]);

    useEffect(() => {
      fetchStaff();
    }, [fetchStaff]);

    function handleSingle(member: Staff){
      navigate(`/admin/staff/${member?._id}`)
    }
  const handleAddStaff = async (formData:FormData) => {
    try {
      const response = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Staff member added successfully');
        setShowAddForm(false);
        fetchStaff();
      } else {
        toast.error(data.message || 'Failed to add staff member');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    }
  };

  const handleChangePassword=async(formData: FormData)=>{
    try{
      console.log(formData)
      const responseSys = await fetch(`${API_BASE}/auth/change-pwd`,{
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),

      })
      const data = await responseSys.json();
      if(responseSys.ok){
        toast.success(data.message);
      }else{
        toast.error(data.message);
      }
    }catch(error){
      toast.error(error instanceof Error ? error.message : 'Error changing password!');
    }
    
  }
  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const response = await fetch(`${API_BASE}/staff/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success('Staff member deleted successfully');
        fetchStaff();
      } else {
        toast.error('Failed to delete staff member');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    }
  };

  const filteredStaff = staff.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
        <button
          onClick={() => setShowPwdModal(true)}
          className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
        >
          <HelpingHand className="w-4 h-4 mr-2" />
          Change Password
        </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Staff List */}
      <div className="grid lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <div
            key={member._id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition duration-200"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {member.fullName}
                </h3>
                <p className="text-gray-600 text-sm">{member.email}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>
              </div>
              
                {member.role === "staff" && (
                  <div className="flex items-center space-x-2">
                  <button
                  onClick={() => handleDeleteStaff(member._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                  title="Delete staff member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                  <button onClick={() => handleSingle(member)}>
                    <ArrowUpRightSquare />
                  </button>
                  </div>
                )}
              
            </div>
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "No staff members found matching your search."
              : "No staff members found."}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddForm && (
        <AddStaffModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddStaff}
        />
      )}
      {
        showPwdModal && (
          <ChangePasswordModal
            onClose={() => setShowPwdModal(false)}
            onSubmit={handleChangePassword}
          />
        )
      }
    </div>
  );
};


export default StaffManagement;