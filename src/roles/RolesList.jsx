import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import rolesApi from "../../api/roles.api";
import PermissionGuard from "../../auth/PermissionGuard";
import AssignPermissions from "./AssignPermissions";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  /* ================= FETCH ROLES ================= */
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await rolesApi.getAllRoles();
      setRoles(res.data.roles);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ================= DELETE ROLE ================= */
  const handleDelete = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await rolesApi.deleteRole(roleId);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete role");
    }
  };

  /* ================= OPEN ASSIGN PERMISSIONS ================= */
  const handleAssignPermissions = (role) => {
    setSelectedRole(role);
    setShowAssignModal(true);
  };

  /* ================= CLOSE MODAL ================= */
  const handleCloseModal = () => {
    setSelectedRole(null);
    setShowAssignModal(false);
    fetchRoles(); // refresh roles/permissions
  };

  if (loading) return <p>Loading roles...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Roles List</h2>

      <table className="w-full border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Permissions</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="px-4 py-2 border">{role.name}</td>
              <td className="px-4 py-2 border">
                {role.Permissions?.map((p) => (
                  <span
                    key={`${p.module}:${p.action}`}
                    className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-1 mb-1 text-xs"
                  >
                    {p.module}:{p.action}
                  </span>
                )) || <span className="text-gray-400">No permissions</span>}
              </td>
              <td className="px-4 py-2 border space-x-2">
                <PermissionGuard module="roles" action="update">
                  <button
                    onClick={() => handleAssignPermissions(role)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Assign Permissions
                  </button>
                </PermissionGuard>

                <PermissionGuard module="roles" action="delete">
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </PermissionGuard>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {showAssignModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="float-right text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <AssignPermissions roleId={selectedRole.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;
