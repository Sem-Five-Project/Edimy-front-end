export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subjects & Categories</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Subject Management</h2>
          <p className="text-muted-foreground">
            Manage educational subjects, categories, and course classifications.
          </p>
        </div>
      </div>
    </div>
  );
}
