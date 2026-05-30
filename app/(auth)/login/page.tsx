import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Connexion — Poudlard Maths',
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Entrer à Poudlard</CardTitle>
        <CardDescription>Connecte-toi pour continuer ton parcours.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-amber-200/80">
        <div>
          Pas encore de compte parent ?{' '}
          <Link href="/signup" className="text-amber-300 underline-offset-2 hover:underline">
            Créer un compte
          </Link>
        </div>
        <div>
          <Link href="/reset" className="text-amber-300 underline-offset-2 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
