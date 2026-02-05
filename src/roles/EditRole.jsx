import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import rolesApi from "../../api/roles.api";
import PermissionGuard from "../../auth/PermissionGuard";

const EditRole = ({ roleId, onRoleUpdated, onClose }) => {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ROLE DATA ================= */
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await rolesApi.getRoleById(roleId);
        setRoleName(res.data.role.name);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch role");
        onClose?.();
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId, onClose]);

  /* ================= HANDLE UPDATE ================= */
  const handleSave = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      await rolesApi.updateRole(roleId, roleName.trim());
      toast.success("Role updated successfully");

      onRoleUpdated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading role data...</p>;

  return (
    <PermissionGuard module="roles" action="update" fallback={null}>
      <div className="p-4 border rounded shadow-md bg-white">
        <h2 className="text-lg font-semibold mb-3">Edit Role</h2>
        <form onSubmit={handleSave} className="flex space-x-2">
          <input
            type="text"
            placeholder="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </form>
      </div>
    </PermissionGuard>
  );
};

export default EditRole;
