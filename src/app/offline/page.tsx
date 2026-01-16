export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-foreground">Hors connexion</h1>
      <p className="mt-4 text-center text-muted">
        Vous êtes actuellement hors ligne.
        <br />
        Z-Scanner fonctionne en mode offline.
      </p>
    </main>
  );
}
