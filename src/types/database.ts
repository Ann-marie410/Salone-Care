export type UserRole = "patient" | "doctor" | "pharmacy" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type PrescriptionStatus = "valid" | "invalid" | "expired" | "used";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  hospital_affiliation: string;
  license_url: string | null;
  stamp_url: string | null;
  license_number: string | null;
  approval_status: ApprovalStatus;
  bio: string | null;
  availability: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
}

export interface Pharmacy {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  stamp_url: string | null;
  pharmacy_identification_number: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  reason: string | null;
  ai_summary: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  prescription_code: string;
  status: PrescriptionStatus;
  stamp_url: string | null;
  notes: string | null;
  expires_at: string | null;
  verified_at: string | null;
  verified_by_pharmacy_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  pharmacy_id: string | null;
  name: string;
  generic_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  price: number;
  in_stock: boolean;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  medicine_id: string | null;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
  created_at: string;
}

export interface EmailVerification {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  verified: boolean;
  created_at: string;
}

export type OrderStatus = "pending" | "paid" | "delivered" | "cancelled";

export interface Order {
  id: string;
  pharmacy_id: string;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string | null;
  medicine_name: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  contact_type: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      doctors: {
        Row: Doctor;
        Insert: Omit<Doctor, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Doctor, "id">>;
      };
      pharmacies: {
        Row: Pharmacy;
        Insert: Omit<Pharmacy, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Pharmacy, "id">>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Appointment, "id">>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Conversation, "id">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Message, "id">>;
      };
      prescriptions: {
        Row: Prescription;
        Insert: Omit<Prescription, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Prescription, "id">>;
      };
      medicines: {
        Row: Medicine;
        Insert: Omit<Medicine, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Medicine, "id">>;
      };
      prescription_medicines: {
        Row: PrescriptionMedicine;
        Insert: Omit<PrescriptionMedicine, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PrescriptionMedicine, "id">>;
      };
      email_verifications: {
        Row: EmailVerification;
        Insert: Omit<EmailVerification, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EmailVerification, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrderItem, "id">>;
      };
      emergency_contacts: {
        Row: EmergencyContact;
        Insert: Omit<EmergencyContact, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EmergencyContact, "id">>;
      };
    };
    Enums: {
      user_role: UserRole;
      approval_status: ApprovalStatus;
      appointment_status: AppointmentStatus;
      prescription_status: PrescriptionStatus;
      order_status: OrderStatus;
    };
  };
}
