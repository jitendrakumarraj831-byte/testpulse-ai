export interface PromotionalOffer {
  id: string;
  title: string;
  description: string;
  resourceUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface PromotionalOfferRow {
  id: string;
  title: string;
  description: string;
  resource_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export function rowToOffer(row: PromotionalOfferRow): PromotionalOffer {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    resourceUrl: row.resource_url,
    isActive: row.is_active,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
  };
}
