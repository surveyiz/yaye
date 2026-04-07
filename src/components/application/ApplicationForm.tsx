
"use client"

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, Sparkles, Smartphone, Info, AlertCircle, ShieldCheck } from 'lucide-react';
import { aiAssistedJobApplication } from '@/ai/flows/ai-assisted-job-application';
import { useFirebase } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Personal Details', 'Qualifications', 'Payment', 'Review'];
const MPESA_MESSAGE_REGEX = /([A-Z0-9]{10})\s+Confirmed\.\s+Ksh\s*([\d,.]+)\s+paid\s+to\s+RECRUITMENT\s+SERVICES/i;

export function ApplicationForm() {
  const { auth, firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJob = searchParams.get('job') || '';

  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiSuggestions, setAiSuggestions] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    county: '',
    ward: '',
    jobRole: initialJob,
    education: '',
    qualifications: '',
    mpesaMessage: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!formData.name || !formData.phone || !formData.email || !formData.idNumber || !formData.county || !formData.ward) {
        setError("All personal fields are mandatory.");
        return false;
      }
    } else if (step === 1) {
      if (!formData.jobRole || !formData.education || !formData.qualifications) {
        setError("Target role and qualifications must be provided.");
        return false;
      }
    } else if (step === 2) {
      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      if (!match) {
        setError("Invalid M-Pesa format. Paste the complete confirmation message.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);

    try {
      let currentUser = user;
      if (!currentUser) {
        const authResult = await signInAnonymously(auth);
        currentUser = authResult.user;
      }

      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      const transactionCode = match![1].toUpperCase();
      const applicantId = currentUser.uid;
      const applicationId = crypto.randomUUID();

      const appData = {
        id: applicationId,
        applicantId: applicantId,
        jobPostingId: formData.jobRole,
        submissionDate: new Date().toISOString(),
        status: 'payment_pending',
        mpesaCode950: transactionCode
      };

      await setDoc(doc(firestore, 'users', applicantId, 'applicant_profile'), {
        id: applicantId,
        fullName: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        nationalIdNumber: formData.idNumber,
        county: formData.county,
        ward: formData.ward,
        highestEducationQualification: formData.education,
        registrationDate: new Date().toISOString()
      });

      await setDoc(doc(firestore, 'users', applicantId, 'applications', applicationId), appData);
      await setDoc(doc(firestore, 'global_applications', applicationId), appData);

      router.push('/status');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-muted'}`}>
              {i + 1}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      <Card className="border-none shadow-xl">
        <CardContent className="p-8">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={e => handleChange('name', e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={formData.email} onChange={e => handleChange('email', e.target.value)} /></div>
              <div className="space-y-2"><Label>ID Number</Label><Input value={formData.idNumber} onChange={e => handleChange('idNumber', e.target.value)} /></div>
              <div className="space-y-2"><Label>County</Label><Input value={formData.county} onChange={e => handleChange('county', e.target.value)} /></div>
              <div className="space-y-2"><Label>Ward</Label><Input value={formData.ward} onChange={e => handleChange('ward', e.target.value)} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2"><Label>Target Role</Label><Input value={formData.jobRole} onChange={e => handleChange('jobRole', e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select value={formData.education} onValueChange={v => handleChange('education', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience & Skills</Label>
                <Textarea value={formData.qualifications} onChange={e => handleChange('qualifications', e.target.value)} className="min-h-[120px]" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-accent rounded-2xl p-6 text-white space-y-4">
                <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-primary" /><h3 className="font-bold uppercase tracking-tight">Ksh 950 Fee (Processing & Vetting)</h3></div>
                <p className="text-xs text-blue-100 italic leading-relaxed">This fee is mandatory for background verification and initial screening. It ensures only committed applicants are prioritized.</p>
              </div>
              <div className="bg-white border-2 border-primary rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1"><p className="text-[10px] uppercase font-bold text-muted-foreground">Till Number</p><p className="text-3xl font-black text-accent">937226</p></div>
                  <div className="space-y-1"><p className="text-[10px] uppercase font-bold text-muted-foreground">Merchant</p><p className="text-sm font-bold text-primary uppercase">RECRUITMENT SERVICES</p></div>
                </div>
                <Textarea 
                  value={formData.mpesaMessage} 
                  onChange={e => handleChange('mpesaMessage', e.target.value)} 
                  placeholder="Paste FULL Safaricom message here..." 
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-headline text-xl font-bold text-accent border-b pb-2 uppercase italic">Review Details</h3>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div><p className="text-muted-foreground text-[10px] uppercase font-black mb-1">Name</p><p className="font-bold">{formData.name}</p></div>
                <div><p className="text-muted-foreground text-[10px] uppercase font-black mb-1">Position</p><p className="font-bold text-primary">{formData.jobRole}</p></div>
              </div>
              <Alert className="bg-primary/5 border-primary/20"><ShieldCheck className="h-4 w-4 text-primary" /><AlertDescription className="text-[11px] font-medium italic">By confirming, you certify that all ID and payment details are accurate. False information leads to disqualification.</AlertDescription></Alert>
            </div>
          )}

          <div className="flex justify-between items-center mt-12 pt-6 border-t">
            {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
            <div className="ml-auto">
              {step < 3 ? (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 px-10 font-bold uppercase italic h-12">Next Step</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-accent hover:bg-accent/90 px-12 font-bold uppercase italic h-14">
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirm Submission'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
