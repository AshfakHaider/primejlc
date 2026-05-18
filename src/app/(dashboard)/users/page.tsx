import { Users } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUsers } from "@/lib/queries";
import { humanize } from "@/lib/utils";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeading
        icon={Users}
        eyebrow="Access"
        title="User Roles"
        description="Role-based access for Super Admin, Branch Manager, Counselor, Teacher, Accountant, and Staff."
      />
      <Card>
        <CardHeader>
          <CardTitle>Team access</CardTitle>
          <CardDescription>Seeded secure-password users are ready for login and permission expansion.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell><Badge variant="outline">{humanize(user.role)}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{user.branch?.name ?? "All branches"}</Badge></TableCell>
                    <TableCell><Badge variant={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
