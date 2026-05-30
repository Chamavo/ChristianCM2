import { redirect } from 'next/navigation';

// La création d'apprenant se fait désormais depuis le tableau de bord
// (prénom + PIN auto-généré, bouton « Ajouter un apprenant »).
export default function NouvelEnfantPage() {
  redirect('/dashboard');
}
