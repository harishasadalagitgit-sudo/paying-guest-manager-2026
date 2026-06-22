export interface Room {
  id: string; // matches roomNum, e.g., "101"
  roomNum: string;
  floor: number;
  capacity: number; // default up to 6
  occupiedCount: number;
  status: "vacant" | "partially-occupied" | "fully-occupied";
  acType?: "AC" | "Non-AC"; // defaults to Non-AC
  // Hotel-room specific fields (floor 5 only)
  hasTV?: boolean;
  checkinDate?: string;   // YYYY-MM-DD
  checkoutDate?: string;  // YYYY-MM-DD
  hotelStatus?: "vacant" | "booked" | "occupied";
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  notes: string;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Other";
}

export interface ResidentID {
  id: string; // timestamp or uuid
  type: string; // "Aadhaar Card", "College ID", "Driving License", "Pan Card", "Other"
  idName: string; // file name or label
  fileData: string; // base64 representation of file
  uploadedAt: string;
}

export interface Resident {
  id: string; // auto-generated document ID in firestore
  name: string;
  dob: string; // YYYY-MM-DD
  permanentAddress: string;
  currentWorkingCompanyOrCollege: string;
  parentsInformation: string; // E.g., Father: Kumar, Mother: Rita
  emergencyContact: string;
  mobileNumber: string;
  whatsappNumber: string;
  joiningDate: string; // YYYY-MM-DD
  balanceAmount: number; // outstanding fee
  roomNum: string; // e.g. "101"
  bedNum?: number; // 1-based bed number within the room
  specialNotes?: string;
  paymentHistoryJson?: string; // stringified JSON representing PaymentRecord[]
  idsJson?: string; // stringified JSON representing ResidentID[]
  photo?: string; // base64 profile photo
}

export interface Employee {
  id: string;
  name: string;
  role: "Cook" | "Cleaner" | "Security Guard" | "Manager" | "Other";
  employmentType: "Permanent" | "Temporary";
  mobileNumber: string;
  salary: number;
  advanceAmount: number; // advance taken this month
  joiningDate: string; // YYYY-MM-DD
  permanentAddress: string;
  emergencyContact: string;
  status: "active" | "inactive";
  photo?: string; // base64 encoded photo
  specialNotes?: string;
  idsJson?: string;
}

export type ExpenseType = "Employee Salaries" | "Grocery Bills" | "Utility Bills" | "Vegetables" | "Repairs" | "Advance Return" | "Others";

export interface Expense {
  id: string;
  title: string;
  expenseType: ExpenseType;
  recipient: string;
  recipientCompany: string;
  dateOfPayment: string; // YYYY-MM-DD
  timeOfPayment: string; // HH:MM
  amount: number;
  balancePending: number;
  transactionNumber: string;
  paidInCash: boolean;
  recipientPhone: string;
  paidBy: string;
  notes?: string;
}

export type IncomingPaymentType = "Hostel Resident Monthly" | "Hotel Payment" | "Temporary Accommodation Payment" | "Others";

export interface IncomingPayment {
  id: string;
  title: string;
  paymentType: IncomingPaymentType;
  paymentDate: string;   // YYYY-MM-DD
  payee: string;
  paidInCash: boolean;
  transactionNumber: string;
  phonePayNumber: string;
  residentName: string;
  roomNum: string;
  bedNum?: number;
  amount: number;
  balancePending: number;
  notes?: string;
}

export interface HotelBookingRequest {
  id: string;
  roomNum?: string;        // assigned by admin on confirmation
  guestName: string;
  phone: string;
  email: string;
  checkInDate: string;     // YYYY-MM-DD
  checkOutDate: string;    // YYYY-MM-DD
  numRooms: number;
  numAdults: number;
  numChildren: number;
  hasFemales: boolean;
  notes?: string;
  status: "pending" | "confirmed" | "rejected";
  submittedAt: string;     // ISO string
}

export interface Reminder {
  id: string;
  title: string;
  type: "specific-date" | "sunday" | "monthly-1st";
  date: string; // "YYYY-MM-DD" or "Sunday" or "1st of Month"
  active: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyCollege: string;
  expectedJoiningDate: string; // YYYY-MM-DD
  sharingInterest: "4room share" | "5room share";
  submittedAt: string; // ISO string
  status: "Pending" | "Contacted" | "Closed";
}
