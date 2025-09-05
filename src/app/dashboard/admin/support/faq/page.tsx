export default function FAQManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Create and manage FAQ content and help documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
