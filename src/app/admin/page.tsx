
'use client';

import React from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  const { firestore, user } = useFirebase();
  const [searchTerm, setSearchTerm] = React.useState('');

  const appsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'global_applications'), orderBy('submissionDate', 'desc'));
  }, [firestore]);

  const { data: applications, isLoading } = useCollection(appsQuery);

  const handleUpdateStatus = (app: any, newStatus: string) => {
    if (!firestore) return;
    const globalRef = doc(firestore, 'global_applications', app.id);
    const userRef = doc(firestore, 'users', app.applicantId, 'applications', app.id);
    
    const updateData = { status: newStatus };
    if (newStatus === 'docs_approved') {
      (updateData as any).finalApprovalDate = new Date().toISOString();
    }

    updateDocumentNonBlocking(globalRef, updateData);
    updateDocumentNonBlocking(userRef, updateData);
  };

  const filteredApps = applications?.filter(app => 
    app.mpesaCode950?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobPostingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#EFF1F7] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold text-accent uppercase">Admin Control Panel</h1>
            <p className="text-muted-foreground">Manage recruitment stages and document verification.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search M-Pesa Code..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-white border-b">
                <TableRow>
                  <TableHead>Submission</TableHead>
                  <TableHead>Target Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment (950)</TableHead>
                  <TableHead>Payment (1027)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredApps?.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="text-xs">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold text-accent">{app.jobPostingId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] bg-muted px-2 py-1 rounded">{app.mpesaCode950}</code>
                    </TableCell>
                    <TableCell>
                      {app.mpesaCode1027 ? (
                        <code className="text-[10px] bg-blue-50 px-2 py-1 rounded text-blue-700">{app.mpesaCode1027}</code>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {app.status === 'payment_pending' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(app, 'payment_approved')} className="bg-green-600 hover:bg-green-700 h-8">
                          Approve 950
                        </Button>
                      )}
                      {app.status === 'ecitizen_paid' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(app, 'docs_approved')} className="bg-primary hover:bg-primary/90 h-8">
                          Final Approval
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
