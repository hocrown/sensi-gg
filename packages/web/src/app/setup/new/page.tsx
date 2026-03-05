import { redirect } from 'next/navigation';

export default function NewSetupPage() {
  redirect('/setup/me');
}
