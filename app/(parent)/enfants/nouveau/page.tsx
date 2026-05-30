import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NouvelEnfantForm } from './NouvelEnfantForm';

export const metadata = {
  title: 'Ajouter un enfant — Poudlard Maths',
};

export default function NouvelEnfantPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-amber-50 p-4 sm:p-6">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un enfant</CardTitle>
            <CardDescription>
              Crée un compte pour ton enfant et choisis sa maison de départ.
              Tu pourras la modifier plus tard depuis ses réglages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NouvelEnfantForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
