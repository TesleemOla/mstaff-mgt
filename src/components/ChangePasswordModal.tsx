import { useEffect, useState } from "react"

  interface Staff {
    _id: string;
    email: string;
    fullName: string;
    role: string;
  }

const ChangePasswordModal: React.FC<{
  onClose: () => void,
  onSubmit: (data: any) => void,
}> = ({ onClose, onSubmit }) => {
const [staff, setStaff] = useState<Staff[]>([]);
const API_BASE = "http://localhost:5000/api";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPwd: ""
  });

  useEffect(()=>{
      const fetchStaff = async () => {
        try {
          const response = await fetch(`${API_BASE}/staff`, {
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            setStaff(
              data.staff.filter((member: Staff) => member.role === "staff")
            );
          }
        } catch (error) {
          console.error("Failed to fetch staff:", error);
        }
      };
      fetchStaff()
  },[])
  const [error, setError] = useState("");

    const handleConfirmBlur=()=>{
      if(formData.confirmPwd !== formData.password){
        setError("Passwords do not match");
      }else{
        setError("");
      }
    }
  const handleSubmit = (e: React.FormEvent) => {
    console.log(staff)
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Change Staff Password
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="staffId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Staff Member
              </label>
              <select
                id="staffId"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select staff member</option>
                {staff.map((member) => (
                  <option key={member._id} value={member.email}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={6}
                required
              />
            </div>
            <p>
              {error && (
                <span className="text-red-700 bg-red-100 rounded-lg p-2">
                  {error}
                </span>
              )}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                onBlur={handleConfirmBlur}
                value={formData.confirmPwd}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPwd: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength={6}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Add Staff
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;


