export const safeId = (id: string) => (
  id.replace(/[^a-zA-Z0-9_-]/g, "_")
)