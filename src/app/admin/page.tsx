
'use client';

import React from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, FileText, Loader2, DollarSign, ShieldCheck, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isBootstrapping, setIsBootstrapping] = React.useState(false);

  const appsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'global_applications'), orderBy('submissionDate', 'desc'));
  }, [firestore]);

  const { data: applications, isLoading } = useCollection(appsQuery);

  const handleUpdateStatus = (app: any, newStatus: string) => {
    if (!firestore || !app?.id || !app?.applicantId) {
      toast({ variant: "destructive", title: "Error", description: "Invalid application data." });
      return;
    }
    
    const globalRef = doc(firestore, 'global_applications', app.id);
    const userRef = doc(firestore, 'users', app.applicantId, 'applications', app.id);
    
    const updateData: any = { status: newStatus };
    if (newStatus === 'docs_approved') {
      updateData.finalApprovalDate = new Date().toISOString();
    }

    updateDocumentNonBlocking(globalRef, updateData);
    updateDocumentNonBlocking(userRef, updateData);

    toast({
      title: "Status Updated",
      description: `Application moved to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const handleBootstrapAdmin = async () => {
    if (!firestore || !user) return;
    setIsBootstrapping(true);
    try {
      await setDoc(doc(firestore, 'admins', user.uid), {
        email: user.email,
        role: 'super_admin',
        grantedAt: new Date().toISOString()
      });
      toast({ title: "Admin Access Granted", description: "You now have permission to manage applications." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: err.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  const filteredApps = applications?.filter(app => 
    app.mpesaCode950?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.mpesaCode1027?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobPostingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUserLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="bg-[#EFF1F7] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold text-accent uppercase italic">Recruitment Command Center</h1>
            <p className="text-muted-foreground text-sm">Verify M-Pesa payments and approve final candidate documentation.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleBootstrapAdmin} 
              disabled={isBootstrapping}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              {isBootstrapping ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Setup Admin Permissions
            </Button>
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Transaction Code..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
            <Table>
              <TableHeader className="bg-accent text-white border-none">
                <TableRow className="hover:bg-accent border-none">
                  <TableHead className="text-white font-bold uppercase text-[10px]">Submission</TableHead>
                  <TableHead className="text-white font-bold uppercase text-[10px]">Position</TableHead>
                  <TableHead className="text-white font-bold uppercase text-[10px]">Current Status</TableHead>
                  <TableHead className="text-white font-bold uppercase text-[10px]">Registration (950)</TableHead>
                  <TableHead className="text-white font-bold uppercase text-[10px]">eCitizen (1027)</TableHead>
                  <TableHead className="text-right text-white font-bold uppercase text-[10px]">Workflow Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredApps?.map((app) => (
                  <TableRow key={app.id} className="border-b last:border-none">
                    <TableCell className="text-[10px] font-medium text-muted-foreground">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-black text-accent uppercase italic text-xs">
                      {app.jobPostingId}
                    </TableCell>
                    <TableCell>
                      <Badge className={`uppercase text-[9px] px-3 py-1 font-bold ${
                        app.status === 'docs_approved' ? 'bg-green-600' : 
                        app.status === 'ecitizen_paid' ? 'bg-blue-600' : 'bg-muted text-accent'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-primary">{app.mpesaCode950}</code>
                    </TableCell>
                    <TableCell>
                      {app.mpesaCode1027 ? (
                        <code className="text-[10px] font-bold bg-blue-50 px-2 py-1 rounded text-blue-700">{app.mpesaCode1027}</code>
                      ) : (
                        <span className="text-muted-foreground italic text-[10px]">Not Paid</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {app.status === 'payment_pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(app, 'payment_approved')} 
                          className="bg-green-600 hover:bg-green-700 h-8 font-bold text-[10px] uppercase"
                        >
                          Approve 950
                        </Button>
                      )}
                      {(app.status === 'ecitizen_paid' || app.status === 'docs_uploaded') && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(app, 'docs_approved')} 
                          className="bg-primary hover:bg-primary/90 h-8 font-bold text-[10px] uppercase italic"
                        >
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
            {filteredApps?.length === 0 && (
              <div className="p-12 text-center space-y-2">
                <Search className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                <p className="text-muted-foreground font-medium uppercase text-xs">No matching applications found.</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
