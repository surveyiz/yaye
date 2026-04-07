
'use client';

import React from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock, Upload, ShieldCheck, FileText, ArrowRight, ExternalLink, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function StatusPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [uploading, setUploading] = React.useState(false);
  const [eduDetails, setEduDetails] = React.useState('');
  const [selectedAppId, setSelectedAppId] = React.useState<string | null>(null);

  const appsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'applications'), orderBy('submissionDate', 'desc'));
  }, [firestore, user]);

  const { data: apps, isLoading: isAppsLoading } = useCollection(appsQuery);

  React.useEffect(() => {
    if (apps?.length && !selectedAppId) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps]);

  if (isUserLoading || isAppsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1F7]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1F7] p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold uppercase text-accent">No Application Found</h2>
          <p className="text-muted-foreground">You haven't submitted any applications yet.</p>
          <Link href="/jobs">
            <Button className="bg-primary hover:bg-primary/90">Browse Jobs</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentApp = apps.find(a => a.id === selectedAppId) || apps[0];

  const handleSimulateUpload = () => {
    if (!firestore || !user || !eduDetails || !currentApp?.id) return;
    setUploading(true);
    
    const updateData = { 
      status: 'docs_uploaded',
      educationDetails: eduDetails,
      documentsUploadedAt: new Date().toISOString()
    };

    const userRef = doc(firestore, 'users', user.uid, 'applications', currentApp.id);
    const globalRef = doc(firestore, 'global_applications', currentApp.id);

    updateDocumentNonBlocking(userRef, updateData);
    updateDocumentNonBlocking(globalRef, updateData);
    
    setTimeout(() => setUploading(false), 1500);
  };

  const steps = [
    { id: 'payment_pending', label: 'Payment (950)', icon: Clock },
    { id: 'payment_approved', label: 'Verification', icon: ShieldCheck },
    { id: 'docs_uploaded', label: 'Document Upload', icon: Upload },
    { id: 'ecitizen_paid', label: 'Processing (1027)', icon: ExternalLink },
    { id: 'docs_approved', label: 'Final Approval', icon: CheckCircle },
  ];

  return (
    <div className="bg-[#EFF1F7] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-black text-xs uppercase tracking-[0.2em] text-accent mb-4">My Applications</h2>
            {apps.map((app) => (
              <Card 
                key={app.id} 
                className={`cursor-pointer transition-all border-none ${selectedAppId === app.id ? 'ring-2 ring-primary shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => setSelectedAppId(app.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedAppId === app.id ? 'bg-primary text-white' : 'bg-muted text-accent'}`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs uppercase truncate text-accent italic">{app.jobPostingId}</p>
                    <Badge variant="outline" className="text-[8px] uppercase px-2 py-0 h-4 border-primary text-primary">
                      {app.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Link href="/jobs" className="block pt-4">
              <Button variant="outline" className="w-full border-dashed border-2 hover:bg-primary/5 text-primary uppercase text-xs font-bold">
                Apply for Another Job
              </Button>
            </Link>
          </div>

          {/* Active Application Detail */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm overflow-x-auto gap-4">
              {steps.map((step, idx) => {
                const isActive = currentApp.status === step.id || 
                  (idx < steps.findIndex(s => s.id === currentApp.status));
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 min-w-fit">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-primary border-primary text-white' : 'bg-muted border-muted text-muted-foreground'}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            <Card className="border-none shadow-xl">
              <CardHeader className="bg-accent text-white rounded-t-lg">
                <CardTitle className="uppercase italic text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Phase: {currentApp.status.replace('_', ' ')}
                </CardTitle>
                <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest">{currentApp.jobPostingId}</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {currentApp.status === 'payment_pending' && (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-muted/50 rounded-2xl border-2 border-dashed">
                      <Clock className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                      <h3 className="font-bold text-xl text-accent">Ksh 950 Verification In Progress</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">Our agents are matching your M-Pesa code <b>{currentApp.mpesaCode950}</b> with Safaricom records. This usually takes 1-2 hours.</p>
                    </div>
                  </div>
                )}

                {currentApp.status === 'payment_approved' && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                      <p className="text-sm text-green-800 font-medium">Payment Verified! You are now eligible to upload your educational documents for vetting.</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-accent font-bold uppercase text-xs">Education Background & Document Verification</Label>
                      <Textarea 
                        placeholder="List your academic qualifications (e.g. KCSE, Diploma, Degree)..." 
                        value={eduDetails}
                        onChange={(e) => setEduDetails(e.target.value)}
                        className="min-h-[150px]"
                      />
                      <div className="bg-muted p-4 rounded-xl border-l-4 border-primary">
                        <p className="text-[10px] uppercase font-black text-accent mb-2">Upload Requirements:</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                          <li>Scanned Application Letter</li>
                          <li>Updated CV / Resume</li>
                          <li>Academic Certificates (PDF/JPG)</li>
                        </ul>
                      </div>
                      <Button 
                        onClick={handleSimulateUpload} 
                        disabled={!eduDetails || uploading}
                        className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase text-lg italic"
                      >
                        {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                        Submit Documents for Review
                      </Button>
                    </div>
                  </div>
                )}

                {currentApp.status === 'docs_uploaded' && (
                  <div className="text-center space-y-6">
                    <div className="p-8 border-2 border-primary/20 bg-primary/5 rounded-3xl">
                      <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-black text-accent uppercase">Stage 3: Document Vetting</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
                        Your documents are being reviewed. To proceed to the final stage, you must pay the <b>Ksh 1027 Document Verification Fee</b> via the official eCitizen gateway.
                      </p>
                    </div>
                    <Link href={`/ecitizen?appId=${currentApp.id}`}>
                      <Button className="w-full h-16 bg-[#0051B4] hover:bg-[#003C84] text-white font-black text-xl flex items-center justify-center gap-3">
                        Proceed to eCitizen Payment <ArrowRight className="h-6 w-6" />
                      </Button>
                    </Link>
                  </div>
                )}

                {currentApp.status === 'ecitizen_paid' && (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                      <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                      <h3 className="font-bold text-xl text-blue-900">Final Verification Pending</h3>
                      <p className="text-sm text-blue-800">Your eCitizen payment <b>{currentApp.mpesaCode1027}</b> is being reconciled. The final document approval takes 24-48 hours.</p>
                    </div>
                  </div>
                )}

                {currentApp.status === 'docs_approved' && (
                  <div className="space-y-6">
                    <div className="p-8 bg-green-600 text-white rounded-3xl text-center space-y-4 shadow-2xl">
                      <CheckCircle className="h-20 w-20 mx-auto" />
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Congratulations!</h2>
                      <p className="font-medium text-green-50">Your application has been fully approved by the Canada Recruitment Board.</p>
                    </div>
                    <Link href="/success-document">
                      <Button variant="outline" className="w-full h-14 border-2 border-accent text-accent font-bold uppercase hover:bg-accent hover:text-white">
                        Download Official Approval Certificate
                      </Button>
                    </Link>
                    <div className="bg-white border-2 border-dashed border-muted p-6 rounded-2xl text-center">
                      <p className="text-xs text-muted-foreground">Please wait for 14 working days to receive your Official Job Offer Letter and Travel Itinerary via courier.</p>
                    </div>
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
