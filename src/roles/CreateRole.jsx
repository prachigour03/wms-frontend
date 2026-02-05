import { useState } from "react";
import { toast } from "react-hot-toast";
import rolesApi from "../../api/roles.api";
import PermissionGuard from "../../auth/PermissionGuard";

const CreateRole = ({ onRoleCreated }) => {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await rolesApi.createRole(roleName.trim());
      toast.success(`Role "${res.data.role.name}" created successfully`);
      setRoleName("");

      // Optional callback to refresh roles list
      if (onRoleCreated) onRoleCreated();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard module="roles" action="create" fallback={null}>
      <div className="p-4 border rounded shadow-md bg-white mb-4">
        <h2 className="text-lg font-semibold mb-3">Create New Role</h2>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </PermissionGuard>
  );
};

export default CreateRole;
