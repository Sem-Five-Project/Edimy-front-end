export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tags & Filters</h1>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Tag Management</h2>
          <p className="text-muted-foreground">
            Manage content tags, filters, and search optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
