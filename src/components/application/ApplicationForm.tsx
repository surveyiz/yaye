"use client"

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Personal Details', 'Qualifications', 'Payment', 'Review'];

// Strict regex for Safaricom M-Pesa messages
// Expected: QXA12BC34 Confirmed. Ksh950.00 paid to RECRUITMENT SERVICES on 8/4/25 at 10:00 AM...
const MPESA_MESSAGE_REGEX = /([A-Z0-9]{10})\s+Confirmed\.\s+Ksh\s*([\d,.]+)\s+paid\s+to\s+RECRUITMENT\s+SERVICES/i;

export function ApplicationForm() {
  const { auth, firestore, user } = useFirebase();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialJob = searchParams.get('job') || '';

  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiSuggestions, setAiSuggestions] = React.useState<{recommendedJobs: string[], tailoredStatement: string} | null>(null);
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
        setError("Please fill in all personal details.");
        return false;
      }
    } else if (step === 1) {
      if (!formData.jobRole || !formData.education || !formData.qualifications) {
        setError("Please provide your target role and qualifications.");
        return false;
      }
    } else if (step === 2) {
      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      if (!match) {
        setError("Invalid M-Pesa message. Please paste the ENTIRE confirmation message exactly as received from Safaricom.");
        return false;
      }
      const amount = parseFloat(match[2].replace(/,/g, ''));
      if (amount < 950) {
        setError(`Insufficient amount detected (Ksh ${amount}). The registration fee is Ksh 950.`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setError(null);
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const getAiHelp = async () => {
    if (!formData.qualifications) return;
    setAiLoading(true);
    try {
      const result = await aiAssistedJobApplication({
        applicantQualifications: formData.qualifications,
        desiredJobRole: formData.jobRole
      });
      setAiSuggestions(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setLoading(true);
    setError(null);

    try {
      let currentUser = user;
      if (!currentUser) {
        const authResult = await signInAnonymously(auth);
        currentUser = authResult.user;
      }

      if (!currentUser) throw new Error("Authentication failed");

      const match = formData.mpesaMessage.match(MPESA_MESSAGE_REGEX);
      if (!match) throw new Error("Invalid M-Pesa message format.");
      
      const transactionCode = match[1].toUpperCase();

      // Check uniqueness of M-Pesa code
      const transactionRef = doc(firestore, 'payment_transactions', transactionCode);
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        throw new Error("This M-Pesa transaction code has already been used for another application. Duplicate payments are not accepted.");
      }

      const applicantId = currentUser.uid;
      const applicationId = crypto.randomUUID();
      
      const applicantProfileRef = doc(firestore, 'users', applicantId, 'applicant_profile');
      const applicationRef = doc(firestore, 'users', applicantId, 'applications', applicationId);

      // Save Profile
      await setDoc(applicantProfileRef, {
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

      // Save Transaction
      await setDoc(transactionRef, {
        id: transactionCode,
        mpesaTransactionCode: transactionCode,
        applicantId: applicantId,
        applicationId: applicationId,
        amountPaid: 950,
        currency: 'KSH',
        paymentDateReported: new Date().toISOString(),
        verificationStatus: 'Pending'
      });

      // Save Application
      await setDoc(applicationRef, {
        id: applicationId,
        applicantId: applicantId,
        jobPostingId: formData.jobRole,
        submissionDate: new Date().toISOString(),
        status: 'Pending Payment Verification'
      });

      setStep(STEPS.length);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: err.message || "Failed to submit application."
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === STEPS.length) {
    return (
      <Card className="border-none shadow-xl">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-headline text-accent uppercase">Application Received</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you {formData.name}. Your application for {formData.jobRole} is being processed. 
          </p>
          <div className="bg-muted p-6 rounded-2xl text-sm text-left border-l-4 border-primary">
            <p className="font-bold text-accent mb-2 uppercase">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Our agents will verify your M-Pesa transaction code <strong>({formData.mpesaMessage.match(MPESA_MESSAGE_REGEX)?.[1]})</strong>.</li>
              <li>Verification takes 1-2 hours during working hours.</li>
              <li>You will receive an interview schedule via SMS/Phone.</li>
            </ol>
          </div>
          <div className="pt-4">
            <Button onClick={() => window.location.href = '/'} className="bg-primary hover:bg-primary/90">Return Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 px-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-muted'}`}>
              {i + 1}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8">
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Legal Name</Label>
                  <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="As shown on ID" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (M-Pesa Number)</Label>
                  <Input id="phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="e.g., 2547XXXXXXXX" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="example@mail.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">National ID / Passport Number</Label>
                  <Input id="idNumber" value={formData.idNumber} onChange={e => handleChange('idNumber', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County of Residence</Label>
                  <Input id="county" value={formData.county} onChange={e => handleChange('county', e.target.value)} placeholder="e.g., Nairobi" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input id="ward" value={formData.ward} onChange={e => handleChange('ward', e.target.value)} placeholder="e.g., Kileleshwa" required />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Target Job Role</Label>
                  <Input id="jobRole" value={formData.jobRole} onChange={e => handleChange('jobRole', e.target.value)} placeholder="e.g., Warehouse Worker" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education Level</Label>
                  <Select value={formData.education} onValueChange={val => handleChange('education', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="qualifications">Experience & Skills</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={getAiHelp} 
                      disabled={!formData.qualifications || aiLoading}
                      className="text-primary border-primary gap-2"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      AI Matcher
                    </Button>
                  </div>
                  <Textarea 
                    id="qualifications" 
                    value={formData.qualifications} 
                    onChange={e => handleChange('qualifications', e.target.value)} 
                    placeholder="Briefly describe your work history and skills..." 
                    className="min-h-[120px]"
                    required
                  />
                  {aiSuggestions && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs">
                        <Sparkles className="h-4 w-4" />
                        AI Counselor Suggestions
                      </div>
                      <div className="text-[11px] space-y-2 text-muted-foreground">
                        <p className="font-bold text-accent">Recommended Roles:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiSuggestions.recommendedJobs.map(job => (
                            <Button key={job} variant="secondary" size="sm" onClick={() => handleChange('jobRole', job)} className="h-7 text-[10px]">
                              {job}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-accent rounded-2xl p-6 text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <h3 className="font-bold uppercase tracking-tight">Fee Verification (Ksh 950)</h3>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    The registration fee is mandatory for all applicants. It covers background checks, document verification, and initial screening. This ensures only serious candidates are processed for the recruitment drive.
                  </p>
                </div>

                <div className="bg-white border-2 border-primary rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Lipa na M-Pesa Till</p>
                      <p className="text-3xl font-black text-accent">937226</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Merchant Name</p>
                      <p className="text-sm font-bold text-primary">RECRUITMENT SERVICES</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label htmlFor="mpesaMessage" className="text-accent font-bold uppercase text-xs">Paste Complete Safaricom Message</Label>
                    <Textarea 
                      id="mpesaMessage" 
                      value={formData.mpesaMessage} 
                      onChange={e => handleChange('mpesaMessage', e.target.value)} 
                      placeholder="Paste the FULL confirmation message here..." 
                      className="min-h-[120px] font-mono text-xs border-accent/20"
                      required 
                    />
                    <div className="flex gap-2 text-[10px] text-muted-foreground bg-muted p-3 rounded-lg">
                      <Info className="h-4 w-4 shrink-0 text-primary" />
                      <p>Verification is automated. Ensure the message includes the <strong>Transaction Code, Amount (Ksh 950), and Merchant Name</strong>. Unaltered messages are verified instantly.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-bold text-accent border-b pb-2 uppercase italic">Review Application</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Full Legal Name</p>
                      <p className="font-bold text-lg text-accent">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Contact Details</p>
                      <p className="font-medium text-accent">{formData.phone}</p>
                      <p className="font-medium text-accent">{formData.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Target Position</p>
                      <p className="font-bold text-lg text-primary uppercase italic">{formData.jobRole}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Payment Reference</p>
                      <div className="bg-muted p-3 rounded-xl border border-dashed border-accent/20">
                        <p className="font-mono text-[10px] text-accent break-all">{formData.mpesaMessage.match(MPESA_MESSAGE_REGEX)?.[1] || 'Code Extraction Failed'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Alert className="bg-primary/5 border-primary/20">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-[11px] font-medium italic text-muted-foreground">
                    By submitting, you confirm that all information provided is true. Any discrepancy in the M-Pesa message or ID details will lead to immediate disqualification.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex justify-between items-center mt-12 pt-6 border-t border-muted">
              {step > 0 && (
                <Button type="button" variant="ghost" onClick={handleBack} disabled={loading} className="text-accent hover:text-primary">
                  Go Back
                </Button>
              )}
              <div className="ml-auto">
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 px-10 h-12 font-bold uppercase shadow-lg italic">
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" className="bg-accent hover:bg-accent/90 px-12 h-14 text-lg font-bold uppercase italic shadow-2xl" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Confirm Submission'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}