import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight text-primary">
              Canada Pathway Jobs
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <Link href="/jobs" className="transition-colors hover:text-primary">Available Jobs</Link>
          <Link href="/benefits" className="transition-colors hover:text-primary">Benefits</Link>
          <Link href="/procedure" className="transition-colors hover:text-primary">Procedure</Link>
          <Link href="/apply">
            <Button size="sm" className="bg-accent hover:bg-accent/90">Apply Now</Button>
          </Link>
        </nav>
        <div className="md:hidden">
          {/* Mobile menu could be added here if needed */}
          <Link href="/apply">
            <Button size="sm">Apply</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}