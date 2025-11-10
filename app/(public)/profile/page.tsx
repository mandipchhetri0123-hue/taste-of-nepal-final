import AuthGate from "@/components/AuthGate";

export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <h1 className="font-heading text-2xl">Profile</h1>
      <AuthGate />
    </section>
  );
}
