
'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Smartphone, Shield, Info, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ECITIZEN_MPESA_REGEX = /([A-Z0-9]{10})\s+Confirmed\.\s+Ksh\s*([\d,.]+)\s+paid\s+to\s+STATAREA\s+SYSTEMS/i;

function ECitizenContent() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = searchParams.get('appId');
  
  const [mpesaMessage, setMpesaMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !appId) return;
    setError('');

    const match = mpesaMessage.match(ECITIZEN_MPESA_REGEX);
    if (!match) {
      setError('Invalid format. Please paste the COMPLETE Safaricom confirmation message showing payment to STATAREA SYSTEMS.');
      return;
    }

    const transactionCode = match[1].toUpperCase();
    const paidAmount = match[2].replace(/,/g, '');
    
    if (parseFloat(paidAmount) < 1027) {
      setError('The transaction amount is incorrect. The vetting fee is Ksh 1,027.');
      return;
    }

    setLoading(true);

    try {
      // Check for global uniqueness of the eCitizen payment code
      const q = query(
        collection(firestore, 'global_applications'), 
        where('mpesaCode1027', '==', transactionCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('This transaction code has already been used for another application.');
        setLoading(false);
        return;
      }

      const updateData = {
        status: 'ecitizen_paid',
        mpesaCode1027: transactionCode,
        ecitizenPaymentDate: new Date().toISOString()
      };

      const userRef = doc(firestore, 'users', user.uid, 'applications', appId);
      const globalRef = doc(firestore, 'global_applications', appId);

      updateDocumentNonBlocking(userRef, updateData);
      updateDocumentNonBlocking(globalRef, updateData);

      toast({
        title: "Payment Received",
        description: "Your document verification fee has been submitted for reconciliation.",
      });

      router.push('/status');
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-[#0051B4] p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#0051B4]">e-Citizen</span>
          <span className="text-xs font-bold text-muted-foreground uppercase border-l pl-2 border-slate-300">Gateway</span>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#0051B4] text-white p-6">
            <CardTitle className="text-center text-lg font-bold uppercase italic">Official Document Vetting</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Mandatory Vetting Fee</p>
              <h2 className="text-4xl font-black text-accent">Ksh 1,027.00</h2>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-black text-blue-600">Lipa na M-Pesa Till</p>
                <Smartphone className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-4xl font-black text-blue-900">668526</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-blue-600">Merchant Name</p>
                  <p className="font-bold text-blue-900 text-xs">STATAREA SYSTEMS</p>
                </div>
              </div>
            </div>

            <form onSubmit={validateAndSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Paste Full Confirmation Message</Label>
                <Textarea 
                  placeholder="Paste the message from Safaricom here..." 
                  value={mpesaMessage}
                  onChange={(e) => setMpesaMessage(e.target.value)}
                  className="min-h-[120px] font-mono text-xs uppercase border-2 focus:border-[#0051B4] bg-white"
                />
              </div>

              {error && (
                <div className="flex gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !mpesaMessage}
                className="w-full h-16 bg-[#0051B4] hover:bg-[#003C84] text-white font-black uppercase text-lg italic shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                Verify & Submit
              </Button>
            </form>

            <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl text-[10px] text-slate-500 leading-relaxed">
              <Info className="h-4 w-4 shrink-0 text-blue-500" />
              <p>
                This fee is required for the reconciliation of your academic documents with the <b>Ministry of Education</b> database. 
                Ensure the transaction code is visible. Manual verification takes 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ECitizenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-10 w-10 text-[#0051B4] animate-spin" />
      </div>
    }>
      <ECitizenContent />
    </Suspense>
  );
}
