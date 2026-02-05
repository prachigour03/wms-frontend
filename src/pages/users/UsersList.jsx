import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import usersApi from "../../api/users.api";
import PermissionGuard from "../../auth/PermissionGuard";

const UsersList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= DELETE USER ================= */
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setDeletingId(userId);
      await usersApi.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading users...</p>;

  if (!users.length) return <p>No users found.</p>;

  return (
    <div className="overflow-x-auto border rounded shadow-md bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Permissions</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.Role?.name || "N/A"}</td>
              <td className="px-4 py-2">
                {user.Role?.Permissions?.length
                  ? user.Role.Permissions.map((p) => p.module + ":" + p.action).join(", ")
                  : "No permissions"}
              </td>
              <td className="px-4 py-2 text-center space-x-2">
                <PermissionGuard module="users" action="update" fallback={null}>
                  <button
                    onClick={() => onEdit(user.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </PermissionGuard>

                <PermissionGuard module="users" action="delete" fallback={null}>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </button>
                </PermissionGuard>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
