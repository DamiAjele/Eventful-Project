import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="text-2xl font-black text-primary tracking-tight mb-2">
              Eventful
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Securely ticketing your favorite experiences.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2026 Eventful Ticketing. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
