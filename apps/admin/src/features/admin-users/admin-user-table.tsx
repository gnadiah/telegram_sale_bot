import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminRole } from "@/lib/auth";

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
  const [drafts, setDrafts] = useState(adminUsers);

  useEffect(() => {
    setDrafts(adminUsers);
  }, [adminUsers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin access</CardTitle>
        <CardDescription>Adjust role and account status without changing the current operational auth model.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.length ? null : (
              <TableRow>
                <TableCell className="py-10 text-center text-sm text-slate-500" colSpan={4}>
                  No admin accounts yet. Create one to delegate catalog and order operations.
                </TableCell>
              </TableRow>
            )}
            {drafts.map((adminUser) => (
              <TableRow key={adminUser.id}>
                <TableCell className="font-medium text-slate-900">{adminUser.username}</TableCell>
                <TableCell>
                  <Select
                    aria-label={`Admin Role ${adminUser.id}`}
                    value={adminUser.role}
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === adminUser.id ? { ...item, role: event.target.value as AdminRole } : item
                        )
                      );
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super admin</option>
                  </Select>
                </TableCell>
                <TableCell>
                  <label className="inline-flex items-center gap-3">
                    <Switch
                      aria-label={`Admin Active ${adminUser.id}`}
                      checked={adminUser.isActive}
                      onCheckedChange={(checked) => {
                        setDrafts((current) =>
                          current.map((item) =>
                            item.id === adminUser.id ? { ...item, isActive: checked } : item
                          )
                        );
                      }}
                    />
                    <Badge variant={adminUser.isActive ? "success" : "outline"}>
                      {adminUser.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </label>
                </TableCell>
                <TableCell>
                  {currentUserRole === "super_admin" && onUpdate ? (
                    <Button
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
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
