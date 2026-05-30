import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ResetForm } from './ResetForm';

export const metadata = {
  title: 'Mot de passe oublié — Poudlard Maths',
};

export default function ResetPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Réinitialiser le mot de passe</CardTitle>
        <CardDescription>
          Saisis ton adresse e-mail, on t’envoie un lien magique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetForm />
      </CardContent>
      <CardFooter className="text-sm text-amber-200/80">
        <Link
          href="/login"
          className="text-amber-300 underline-offset-2 hover:underline"
        >
          Retour à la connexion
        </Link>
      </CardFooter>
    </Card>
  );
}
