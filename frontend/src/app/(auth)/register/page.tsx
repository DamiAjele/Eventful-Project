'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { registerSchema, RegisterFormValues } from '@/lib/schemas/auth.schema';

export default function RegisterPage() {
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'EVENTEE',
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    register(values);
  };

  const selectedRole = form.watch('role');

  return (
    <Card className="w-full max-w-lg border-none shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-primary">Join Eventful</CardTitle>
        <CardDescription className="text-center text-balance">
          Discover curated live experiences or host your own unforgettable events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold block text-center mb-4">I want to...</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => form.setValue('role', 'EVENTEE')}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                selectedRole === 'EVENTEE'
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Ticket className={cn("h-6 w-6 mb-2", selectedRole === 'EVENTEE' ? "text-primary" : "text-muted-foreground")} />
              <p className="font-bold text-sm">Attend Events</p>
              <p className="text-xs text-muted-foreground mt-1">Discover and buy tickets.</p>
            </button>
            <button
              type="button"
              onClick={() => form.setValue('role', 'CREATOR')}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                selectedRole === 'CREATOR'
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Users className={cn("h-6 w-6 mb-2", selectedRole === 'CREATOR' ? "text-primary" : "text-muted-foreground")} />
              <p className="font-bold text-sm">Create Events</p>
              <p className="text-xs text-muted-foreground mt-1">Host and manage sales.</p>
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input placeholder="Jane" {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input placeholder="Doe" {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input type="email" placeholder="jane@example.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" placeholder="Min. 8 characters" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button className="w-full h-11 text-base font-semibold" type="submit" disabled={isPending}>
            {isPending ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <p className="text-xs text-center text-muted-foreground px-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
        <div className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
