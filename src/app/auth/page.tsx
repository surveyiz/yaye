
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/status';

  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      router.push(redirect);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      toast({ title: "Account Created", description: "Welcome to the Canada Pathway recruitment portal." });
      router.push(redirect);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#EFF1F7] min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <Globe className="h-10 w-10 text-primary" />
        <div className="flex flex-col">
          <span className="font-headline text-2xl font-bold tracking-tighter leading-none text-accent">CANADA PATHWAY</span>
          <span className="text-[10px] tracking-[0.3em] font-bold text-primary uppercase">Official Portal</span>
        </div>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-muted">
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-accent font-bold uppercase italic text-xs">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-accent font-bold uppercase italic text-xs">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="p-8 mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-accent hover:bg-accent/90 font-bold uppercase italic">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 h-5 w-5" />}
                Sign In to My Account
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="p-8 mt-0">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Legal Name</Label>
                <Input id="reg-name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="As it appears on your ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Create Password</Label>
                <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 font-bold uppercase italic">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-5 w-5" />}
                Create Secure Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      <p className="mt-8 text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest max-w-xs">
        Secure authentication ensures your recruitment data and payment records are protected.
      </p>
    </div>
  );
}
