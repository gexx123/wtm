import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect to the host setup screen
  redirect('/host-screen');
}
