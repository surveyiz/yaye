import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Search, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

const mockApplications = [
  { id: 1, name: "David Kariuki", phone: "254704118001", role: "Warehouse Worker", payment: "QXA12BC34", status: "Pending Verification" },
  { id: 2, name: "Sarah Mutua", phone: "254712334455", role: "Registered Nurse", payment: "ZZA89DD11", status: "Payment Verified" },
  { id: 3, name: "John Onyango", phone: "254700998877", role: "Truck Driver", payment: "LLP56GG22", status: "Interview Scheduled" },
  { id: 4, name: "Faith Wanjiru", phone: "254722556677", role: "Accounting Clerk", payment: "RRT00KK99", status: "Offer Sent" },
];

export default function AdminDashboard() {
  return (
    <div className="bg-[#EFF1F7] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl font-bold text-primary">Recruiter Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage job applications and verify payments.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-white">
              <Search className="h-4 w-4" />
              Export List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground">+18% from last week</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Requires manual check</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">For 8th April Intake</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name or phone..." className="pl-8 h-9" />
            </div>
          </CardHeader>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Target Role</TableHead>
                <TableHead>M-Pesa Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {mockApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.phone}</div>
                  </TableCell>
                  <TableCell>{app.role}</TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted p-1 rounded">{app.payment}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'Offer Sent' ? 'default' : 'secondary'} className="font-normal">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}