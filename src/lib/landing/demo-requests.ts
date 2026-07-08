/** Row shape inserted into `demo_requests` (id/created_at are server-defaulted). */
export interface DemoRequestInsert {
  institute_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  plan_interest: string;
  message: string | null;
}
