import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Connexion — Maths à l\'école des sorciers',
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
    </Card>
  );
}
