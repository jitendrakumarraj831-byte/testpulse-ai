export interface InstitutionalDocument {
  id: string;
  title: string;
  description: string;
  resourceUrl: string;
  createdAt: string;
}

export interface InstitutionalDocumentRow {
  id: string;
  title: string;
  description: string;
  resource_url: string;
  created_at: string;
}

export function rowToDocument(row: InstitutionalDocumentRow): InstitutionalDocument {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    resourceUrl: row.resource_url,
    createdAt: row.created_at,
  };
}
