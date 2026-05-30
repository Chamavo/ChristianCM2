import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignupForm } from './SignupForm';

export const metadata = {
  title: 'Inscription parent — Maths à l\'école des sorciers',
};

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Créer un compte parent</CardTitle>
        <CardDescription>
          Tu pourras ensuite ajouter le compte de ton enfant et suivre sa progression.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="text-sm text-amber-200/80">
        Déjà inscrit ?{' '}
        <Link
          href="/login"
          className="ml-1 text-amber-300 underline-offset-2 hover:underline"
        >
          Se connecter
        </Link>
      </CardFooter>
    </Card>
  );
}
