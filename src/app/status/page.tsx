
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock, Hash, ShieldCheck, FileText, ArrowRight, ExternalLink, Briefcase, LogOut, User, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function StatusPage() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedAppId, setSelectedAppId] = React.useState<string | null>(null);
  
  // Certificate number states
  const [certNumbers, setCertNumbers] = React.useState({
    kcpe: '',
    kcse: '',
    tertiary: ''
  });

  const appsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'applications'), orderBy('submissionDate', 'desc'));
  }, [firestore, user]);

  const { data: apps, isLoading: isAppsLoading } = useCollection(appsQuery);

  React.useEffect(() => {
    if (apps?.length && !selectedAppId) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps, selectedAppId]);

  const handleSignOut = async () => {
    if (!auth) return;
    await auth.signOut();
    router.push('/');
  };

  if (isUserLoading || isAppsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1F7]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1F7] p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <User className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold uppercase text-accent">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view your application status and progress.</p>
          <Link href="/auth">
            <Button className="bg-primary hover:bg-primary/90 w-full font-bold uppercase italic h-12">Login / Register</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EFF1F7]">
        <div className="p-4 flex justify-end">
          <Button variant="ghost" onClick={handleSignOut} className="text-xs uppercase font-bold text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8 space-y-4">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold uppercase text-accent">No Application Found</h2>
            <p className="text-muted-foreground">You haven't submitted any applications yet.</p>
            <Link href="/jobs">
              <Button className="bg-primary hover:bg-primary/90 font-bold uppercase italic">Browse Jobs & Apply</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const currentApp = apps.find(a => a.id === selectedAppId) || apps[0];

  const handleUpdateCerts = () => {
    if (!firestore || !user || !currentApp?.id) return;
    
    if (!certNumbers.kcpe || !certNumbers.kcse) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both KCPE and KCSE certificate numbers."
      });
      return;
    }

    setIsSubmitting(true);
    
    const updateData = { 
      status: 'docs_uploaded',
      certificateNumbers: certNumbers,
      documentsUploadedAt: new Date().toISOString()
    };

    const userRef = doc(firestore, 'users', user.uid, 'applications', currentApp.id);
    const globalRef = doc(firestore, 'global_applications', currentApp.id);

    updateDocumentNonBlocking(userRef, updateData);
    updateDocumentNonBlocking(globalRef, updateData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Verification Submitted",
        description: "Your academic certificate numbers have been received for vetting."
      });
    }, 1500);
  };

  const steps = [
    { id: 'payment_pending', label: 'Payment', icon: Clock },
    { id: 'payment_approved', label: 'Certs', icon: Hash },
    { id: 'docs_uploaded', label: 'Vetting', icon: ShieldCheck },
    { id: 'ecitizen_paid', label: 'Citizen', icon: ExternalLink },
    { id: 'docs_approved', label: 'Final', icon: CheckCircle },
  ];

  return (
    <div className="bg-[#EFF1F7] min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <div className="min-w-0">
            <h1 className="font-headline text-lg md:text-2xl font-bold text-accent uppercase italic truncate">Applicant Command Center</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-bold truncate">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="border-accent text-accent hover:bg-accent hover:text-white font-bold uppercase text-[9px] shrink-0">
            <LogOut className="mr-1 h-3 w-3" /> Sign Out
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-accent mb-2">My Portfolio</h2>
            <div className="flex flex-col gap-2">
              {apps.map((app) => (
                <Card 
                  key={app.id} 
                  className={`cursor-pointer transition-all border-none ${selectedAppId === app.id ? 'ring-2 ring-primary shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                  onClick={() => setSelectedAppId(app.id)}
                >
                  <CardContent className="p-3 md:p-4 flex items-center gap-3">
                    <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shrink-0 ${selectedAppId === app.id ? 'bg-primary text-white' : 'bg-muted text-accent'}`}>
                      <Briefcase className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[10px] md:text-xs uppercase truncate text-accent italic">{app.jobPostingId}</p>
                      <Badge variant="outline" className="text-[7px] md:text-[8px] uppercase px-1.5 py-0 h-4 border-primary text-primary">
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Link href="/jobs" className="block pt-2">
              <Button variant="outline" className="w-full border-dashed border-2 hover:bg-primary/5 text-primary uppercase text-[10px] font-bold h-10 md:h-12">
                Apply for Another Job
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm overflow-x-auto scrollbar-hide">
              <div className="flex justify-between items-center min-w-[360px] gap-2">
                {steps.map((step, idx) => {
                  const stepIndex = steps.findIndex(s => s.id === currentApp.status);
                  const isActive = currentApp.status === step.id || (idx < stepIndex);
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`h-7 w-7 md:h-10 md:w-10 rounded-full flex items-center justify-center border-2 shrink-0 ${isActive ? 'bg-primary border-primary text-white' : 'bg-muted border-muted text-muted-foreground'}`}>
                        <step.icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
                      </div>
                      <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-accent text-white p-4 md:p-6">
                <CardTitle className="uppercase italic text-sm md:text-lg flex items-center gap-2 font-headline">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Workflow: {currentApp.status.replace('_', ' ')}
                </CardTitle>
                <p className="text-[9px] md:text-[10px] text-blue-200 uppercase font-bold tracking-widest truncate">{currentApp.jobPostingId}</p>
              </CardHeader>
              <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
                {currentApp.status === 'payment_pending' && (
                  <div className="text-center space-y-4">
                    <div className="p-4 md:p-6 bg-muted/50 rounded-2xl border-2 border-dashed">
                      <Clock className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto mb-3 md:mb-4 animate-pulse" />
                      <h3 className="font-bold text-lg md:text-xl text-accent uppercase italic">Ksh 950 Vetting Phase</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground max-w-sm mx-auto">Our agents are matching your M-Pesa code <b>{currentApp.mpesaCode950}</b> with Safaricom records. Expected completion: 1-2 hours.</p>
                    </div>
                  </div>
                )}

                {currentApp.status === 'payment_approved' && (
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-green-50 border border-green-200 p-3 md:p-4 rounded-xl flex gap-3">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 shrink-0" />
                      <p className="text-[11px] md:text-sm text-green-800 font-medium">Payment Validated! Please provide your academic certificate numbers for verification.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-1 md:space-y-2">
                        <Label className="text-[9px] md:text-[10px] uppercase font-bold text-accent">KCPE Index / Certificate No.</Label>
                        <Input 
                          placeholder="Enter KCPE Number" 
                          value={certNumbers.kcpe}
                          onChange={(e) => setCertNumbers(prev => ({ ...prev, kcpe: e.target.value }))}
                          className="h-10 md:h-12 border-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <Label className="text-[9px] md:text-[10px] uppercase font-bold text-accent">KCSE Index / Certificate No.</Label>
                        <Input 
                          placeholder="Enter KCSE Number" 
                          value={certNumbers.kcse}
                          onChange={(e) => setCertNumbers(prev => ({ ...prev, kcse: e.target.value }))}
                          className="h-10 md:h-12 border-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      <Label className="text-[9px] md:text-[10px] uppercase font-bold text-accent">Tertiary/University Certificate No. (Optional)</Label>
                      <Input 
                        placeholder="Degree/Diploma Cert Number" 
                        value={certNumbers.tertiary}
                        onChange={(e) => setCertNumbers(prev => ({ ...prev, tertiary: e.target.value }))}
                        className="h-10 md:h-12 border-2 text-xs"
                      />
                    </div>

                    <div className="bg-muted p-3 md:p-4 rounded-xl border-l-4 border-primary flex gap-3 md:gap-4 items-start">
                      <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase font-black text-accent mb-1">Academic Dossier Notice:</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                          By submitting these numbers, you authorize the <b>Canada Pathway Authority</b> to reconcile your results with the KNEC and Ministry of Education databases.
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleUpdateCerts} 
                      disabled={isSubmitting || !certNumbers.kcpe || !certNumbers.kcse}
                      className="w-full h-12 md:h-14 bg-primary hover:bg-primary/90 font-bold uppercase text-sm md:text-lg italic shadow-lg"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-4 w-4 md:h-5 md:w-5" />}
                      Submit Certificate Numbers
                    </Button>
                  </div>
                )}

                {currentApp.status === 'docs_uploaded' && (
                  <div className="text-center space-y-4 md:space-y-6">
                    <div className="p-6 md:p-8 border-2 border-primary/20 bg-primary/5 rounded-2xl md:rounded-3xl">
                      <ShieldCheck className="h-10 w-10 md:h-16 md:w-16 text-primary mx-auto mb-3 md:mb-4" />
                      <h3 className="text-xl md:text-2xl font-black text-accent uppercase italic">Ministry Vetting Stage</h3>
                      <p className="text-muted-foreground text-[10px] md:text-sm max-w-md mx-auto mt-2">
                        Your academic records are being reconciled with the Ministry of Education database. Pay the <b>Ksh 1,027 Vetting Fee</b> via eCitizen to finalize.
                      </p>
                    </div>
                    <Link href={`/ecitizen?appId=${currentApp.id}`}>
                      <Button className="w-full h-14 md:h-16 bg-[#0051B4] hover:bg-[#003C84] text-white font-black text-base md:text-xl flex items-center justify-center gap-3 shadow-2xl italic">
                        Access eCitizen Gateway <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                      </Button>
                    </Link>
                  </div>
                )}

                {currentApp.status === 'ecitizen_paid' && (
                  <div className="text-center space-y-4">
                    <div className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                      <Clock className="h-8 w-8 md:h-12 md:w-12 text-blue-600 mx-auto mb-3 md:mb-4 animate-spin" />
                      <h3 className="font-bold text-lg md:text-xl text-blue-900 uppercase italic">Final Document Review</h3>
                      <p className="text-[10px] md:text-sm text-blue-800">Your vetting payment <b>{currentApp.mpesaCode1027}</b> is being verified against Treasury records. Expected final approval within 24 hours.</p>
                    </div>
                  </div>
                )}

                {currentApp.status === 'docs_approved' && (
                  <div className="space-y-4 md:space-y-6">
                    <div className="p-6 md:p-8 bg-green-600 text-white rounded-2xl md:rounded-3xl text-center space-y-3 md:space-y-4 shadow-2xl">
                      <CheckCircle className="h-12 w-12 md:h-20 md:w-20 mx-auto" />
                      <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter font-headline">Selection Finalized</h2>
                      <p className="font-medium text-[10px] md:text-base text-green-50">Congratulations! Your selection for the 2025 intake has been ratified by the recruitment board.</p>
                    </div>
                    <Link href="/success-document">
                      <Button className="w-full h-12 md:h-14 bg-accent text-white font-bold uppercase italic hover:bg-accent/90 shadow-lg text-xs md:text-base">
                        Download Selection Certificate
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
