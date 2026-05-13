export interface Category {
  id: string;
  name: string;
  code: string | null;
  code_slug: string | null;
  image_url: string | null;

  grouping?: {
    id: string;
    name: string;
  };

  parent_id: string | null;

  created_at: string;
  updated_at: string;
}