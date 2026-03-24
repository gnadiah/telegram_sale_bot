import type { AdminRole } from "../../lib/auth";

type AdminUserRow = {
  id: string;
  isActive: boolean;
  role: AdminRole;
  username: string;
};

type AdminUserTableProps = {
  adminUsers: AdminUserRow[];
  currentUserRole: AdminRole;
  onUpdate?: (adminUserId: string, input: { isActive: boolean; role: AdminRole }) => Promise<void>;
};

export function AdminUserTable({ adminUsers, currentUserRole, onUpdate }: AdminUserTableProps) {
  return (
    <table>
      <tbody>
        {adminUsers.map((adminUser) => (
          <tr key={adminUser.id}>
            <td>{adminUser.username}</td>
            <td>
              <select
                aria-label={`Admin Role ${adminUser.id}`}
                defaultValue={adminUser.role}
                onChange={(event) => {
                  adminUser.role = event.target.value as AdminRole;
                }}
              >
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
            </td>
            <td>
              <input
                aria-label={`Admin Active ${adminUser.id}`}
                defaultChecked={adminUser.isActive}
                type="checkbox"
                onChange={(event) => {
                  adminUser.isActive = event.target.checked;
                }}
              />
            </td>
            <td>
              {currentUserRole === "super_admin" && onUpdate ? (
                <button
                  type="button"
                  aria-label={`Save Admin ${adminUser.id}`}
                  onClick={() =>
                    onUpdate(adminUser.id, {
                      isActive: adminUser.isActive,
                      role: adminUser.role
                    })
                  }
                >
                  Save
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
