
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Search, FileText, Loader2, Lock, LogIn, LogOut, UserCircle, AlertCircle, GraduationCap, ShieldCheck, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SUPER_ADMIN_EMAIL = 'aicystevens0@gmail.com';

export default function AdminDashboard() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isBootstrapping, setIsBootstrapping] = React.useState(false);
  const [email, setEmail] = React.useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = React.useState('Kipngetich.91!@');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const appsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'global_applications'), orderBy('submissionDate', 'desc'));
  }, [firestore, user]);

  const { data: applications, isLoading: isAppsLoading, error: appsError } = useCollection(appsQuery);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoggingIn(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created", description: "Admin account created successfully." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful", description: "Welcome back, Admin." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  const handleUpdateStatus = (app: any, newStatus: string) => {
    if (!firestore || !app?.id || !app?.applicantId) return;
    const globalRef = doc(firestore, 'global_applications', app.id);
    const userRef = doc(firestore, 'users', app.applicantId, 'applications', app.id);
    const updateData: any = { status: newStatus };
    if (newStatus === 'docs_approved') updateData.finalApprovalDate = new Date().toISOString();
    updateDocumentNonBlocking(globalRef, updateData);
    updateDocumentNonBlocking(userRef, updateData);
    toast({ title: "Updated", description: `Application moved to ${newStatus}.` });
  };

  const handleBootstrapAdmin = async () => {
    if (!firestore || !user) return;
    if (user.email !== SUPER_ADMIN_EMAIL) {
      toast({ variant: "destructive", title: "Denied", description: "Unauthorized email." });
      return;
    }
    setIsBootstrapping(true);
    try {
      await setDoc(doc(firestore, 'admins', user.uid), {
        email: user.email,
        role: 'super_admin',
        grantedAt: new Date().toISOString()
      });
      toast({ title: "Access Granted", description: "Dashboard unlocked." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: err.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  const filteredApps = applications?.filter(app => 
    app.mpesaCode950?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobPostingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUserLoading || isAdminLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  // Show auth/bootstrap if not logged in OR not an admin (and not the super admin by email waiting to bootstrap)
  const isAuthorizedEmail = user?.email === SUPER_ADMIN_EMAIL;
  const isVerifiedAdmin = !!adminData;

  if (!user || (!isVerifiedAdmin && !isAuthorizedEmail)) {
    return (
      <div className="bg-[#EFF1F7] min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 md:p-10 text-center space-y-6 shadow-2xl border-none rounded-3xl">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto"><Lock className="h-8 w-8 text-primary" /></div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-accent uppercase italic">Admin Access</h2>
            <p className="text-muted-foreground text-xs">Sign in to access the Recruitment Command Center.</p>
          </div>
          {!user ? (
            <form onSubmit={handleAuth} className="space-y-4 text-left">
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              <Button type="submit" className="w-full bg-accent h-12 font-bold uppercase italic shadow-lg" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin" /> : (isRegistering ? "Register Admin" : "Sign In")}
              </Button>
              <div className="text-center"><button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-bold uppercase text-primary underline">{isRegistering ? "Back to Login" : "Register Admin"}</button></div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[10px] font-bold">UNAUTHORIZED ACCOUNT</AlertDescription>
              </Alert>
              <p className="text-[10px] text-muted-foreground">This page is restricted to authorized recruitment officers.</p>
              <Button variant="ghost" onClick={handleSignOut} className="w-full text-[10px] uppercase font-bold text-muted-foreground"><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Handle bootstrap for the super admin
  if (isAuthorizedEmail && !isVerifiedAdmin) {
    return (
      <div className="bg-[#EFF1F7] min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-none rounded-3xl">
          <ShieldCheck className="h-16 w-16 text-primary mx-auto" />
          <h2 className="text-2xl font-black text-accent uppercase italic">Initialize System</h2>
          <p className="text-sm text-muted-foreground">Authorized Super Admin detected. Click below to initialize your dashboard access.</p>
          <Button onClick={handleBootstrapAdmin} disabled={isBootstrapping} className="w-full h-14 bg-primary font-bold uppercase italic shadow-xl">
            {isBootstrapping ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            Unlock Command Center
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="w-full text-[10px] uppercase font-bold text-muted-foreground">Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#EFF1F7] min-h-screen py-6 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-headline text-xl md:text-3xl font-bold text-accent uppercase italic">Recruitment Command</h1>
            <p className="text-[10px] text-primary font-bold uppercase truncate max-w-[200px] md:max-w-none">{user?.email}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-10 border-2 text-xs" />
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-accent text-accent font-bold uppercase text-[10px] shrink-0"><LogOut className="mr-1 h-3 w-3" /> Exit</Button>
          </div>
        </div>

        {isAppsLoading ? <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> : (
          <Card className="border-none shadow-xl overflow-hidden rounded-2xl md:rounded-3xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-accent text-white">
                  <TableRow className="hover:bg-accent border-none">
                    <TableHead className="text-white font-bold uppercase text-[9px] px-3">Date</TableHead>
                    <TableHead className="text-white font-bold uppercase text-[9px] px-3">Role</TableHead>
                    <TableHead className="text-white font-bold uppercase text-[9px] px-3">Status</TableHead>
                    <TableHead className="text-white font-bold uppercase text-[9px] px-3">M-Pesa</TableHead>
                    <TableHead className="text-right text-white font-bold uppercase text-[9px] px-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {filteredApps?.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic text-xs">No records found.</TableCell></TableRow> : filteredApps?.map(app => (
                    <TableRow key={app.id} className="border-b last:border-none">
                      <TableCell className="text-[9px] font-medium text-muted-foreground whitespace-nowrap px-3">{new Date(app.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-black text-accent uppercase italic text-[9px] md:text-[10px] px-3 truncate max-w-[80px] md:max-w-none">{app.jobPostingId}</TableCell>
                      <TableCell className="px-3"><Badge className="uppercase text-[7px] md:text-[8px] px-2 py-0.5 font-bold whitespace-nowrap">{app.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="px-3"><code className="text-[8px] md:text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{app.mpesaCode950}</code></TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap px-3">
                        <div className="flex justify-end gap-1">
                          {app.status === 'payment_pending' && <Button size="sm" onClick={() => handleUpdateStatus(app, 'payment_approved')} className="bg-green-600 h-6 md:h-7 px-2 text-[8px] md:text-[9px] uppercase font-bold">Approve</Button>}
                          <Dialog>
                            <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-6 w-6 md:h-7 md:w-7 p-0"><GraduationCap className="h-3.5 w-3.5 md:h-4 md:w-4" /></Button></DialogTrigger>
                            <DialogContent className="max-w-[90vw] md:max-w-md rounded-2xl">
                              <DialogHeader><DialogTitle className="uppercase italic font-headline text-accent text-sm">Academic Dossier</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4 text-xs">
                                <div className="bg-muted/50 p-4 rounded-xl border space-y-2">
                                  <div className="flex justify-between border-b pb-1"><span>KCPE No.</span><span className="font-bold text-accent">{app.certificateNumbers?.kcpe || '---'}</span></div>
                                  <div className="flex justify-between border-b pb-1"><span>KCSE No.</span><span className="font-bold text-accent">{app.certificateNumbers?.kcse || '---'}</span></div>
                                  <div className="flex justify-between"><span>Tertiary</span><span className="font-bold text-accent">{app.certificateNumbers?.tertiary || '---'}</span></div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {(app.status === 'ecitizen_paid' || app.status === 'docs_uploaded') && <Button size="sm" onClick={() => handleUpdateStatus(app, 'docs_approved')} className="bg-primary h-6 md:h-7 px-2 text-[8px] md:text-[9px] uppercase font-bold italic">Finalize</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
