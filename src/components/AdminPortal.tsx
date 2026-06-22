import React, { useState, useEffect, useRef } from "react";
import { 
  Building, 
  MapPin, 
  Users, 
  Bed, 
  Search, 
  Filter, 
  Plus, 
  Bell, 
  Calendar, 
  AlertTriangle, 
  DollarSign, 
  Mail, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle,
  FileText,
  Smartphone,
  MessageCircle,
  UserPlus,
  ArrowUpDown,
  Upload,
  ArrowRight,
  LogOut,
  X,
  CreditCard,
  Notebook,
  Phone,
  Thermometer,
  Hotel,
  Tv,
  CalendarCheck,
  CalendarX,
  UserCheck,
  Briefcase,
  IndianRupee,
  Camera,
  CameraOff,
  FlipHorizontal,
  Receipt,
  Banknote,
  CreditCard as CreditCardIcon,
  TrendingUp
} from "lucide-react";
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Room, Resident, Reminder, Enquiry, PaymentRecord, ResidentID, Employee, Expense, ExpenseType, IncomingPayment, IncomingPaymentType, HotelBookingRequest } from "../types";
import { initialRoomsList, getFloorForRoom, ALL_ROOM_NUMBERS } from "../initialRooms";

const LuxuryHotelSVG = () => (
  <svg viewBox="0 0 80 80" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
    {/* Stars */}
    <text x="40" y="9" textAnchor="middle" fontSize="9" fill="#fbbf24">★ ★ ★</text>
    {/* Flag pinnacle */}
    <line x1="40" y1="10" x2="40" y2="17" stroke="#fbbf24" strokeWidth="1"/>
    <polygon points="40,10 47,13 40,16" fill="#fbbf24"/>
    {/* Roof pediment */}
    <polygon points="40,17 11,32 69,32" fill="#0f2744" stroke="#fbbf24" strokeWidth="0.6"/>
    {/* Building body */}
    <rect x="9" y="31" width="62" height="46" rx="1" fill="#0f2744"/>
    {/* Decorative cornice line */}
    <line x1="9" y1="32" x2="71" y2="32" stroke="#fbbf24" strokeWidth="0.8"/>
    {/* Left column */}
    <rect x="12" y="31" width="5" height="46" fill="#0a1c36"/>
    {/* Right column */}
    <rect x="63" y="31" width="5" height="46" fill="#0a1c36"/>
    {/* Windows row 1 */}
    <rect x="20" y="37" width="12" height="9" rx="1" fill="#fde68a"/>
    <rect x="34" y="37" width="12" height="9" rx="1" fill="#fde68a"/>
    <rect x="48" y="37" width="12" height="9" rx="1" fill="#fde68a"/>
    {/* Windows row 2 */}
    <rect x="20" y="50" width="12" height="9" rx="1" fill="#fde68a" opacity="0.75"/>
    <rect x="34" y="50" width="12" height="9" rx="1" fill="#fde68a"/>
    <rect x="48" y="50" width="12" height="9" rx="1" fill="#fde68a" opacity="0.75"/>
    {/* Grand entrance door */}
    <rect x="31" y="60" width="18" height="17" rx="1" fill="#7c2d12"/>
    {/* Arched top of door */}
    <ellipse cx="40" cy="60" rx="9" ry="4.5" fill="#6b2410"/>
    {/* Door handle */}
    <circle cx="46" cy="69" r="1.3" fill="#fbbf24"/>
    {/* Door center line */}
    <line x1="40" y1="60" x2="40" y2="77" stroke="#5a1e0a" strokeWidth="0.8"/>
    {/* Base line */}
    <line x1="9" y1="77" x2="71" y2="77" stroke="#fbbf24" strokeWidth="0.6"/>
  </svg>
);

interface AdminPortalProps {
  onLogout: () => void;
}

interface DonutSegment { value: number; color: string; label: string; }
const DonutChart = ({ segments, total, centerLabel }: { segments: DonutSegment[]; total: number; centerLabel: string }) => {
  const CX = 64, CY = 64, OR = 56, IR = 36;
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  let startAngle = 0;
  const paths = total === 0 ? (
    <circle cx={CX} cy={CY} r={OR} fill="#e2e8f0" />
  ) : (
    <>
      {segments.map((seg, i) => {
        if (seg.value === 0) return null;
        const angle = (seg.value / total) * 360;
        const end = startAngle + (angle >= 360 ? 359.99 : angle);
        const la = angle > 180 ? 1 : 0;
        const ox1 = CX + OR * Math.cos(toRad(startAngle));
        const oy1 = CY + OR * Math.sin(toRad(startAngle));
        const ox2 = CX + OR * Math.cos(toRad(end));
        const oy2 = CY + OR * Math.sin(toRad(end));
        const ix1 = CX + IR * Math.cos(toRad(startAngle));
        const iy1 = CY + IR * Math.sin(toRad(startAngle));
        const ix2 = CX + IR * Math.cos(toRad(end));
        const iy2 = CY + IR * Math.sin(toRad(end));
        const d = `M ${ox1} ${oy1} A ${OR} ${OR} 0 ${la} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${IR} ${IR} 0 ${la} 0 ${ix1} ${iy1} Z`;
        startAngle = end;
        return <path key={i} d={d} fill={seg.color} />;
      })}
    </>
  );
  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      {paths}
      <circle cx={CX} cy={CY} r={IR} fill="white" />
      <text x={CX} y={CY - 5} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1e293b">{centerLabel}</text>
      <text x={CX} y={CY + 9} textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
    </svg>
  );
};

export default function AdminPortal({ onLogout }: AdminPortalProps) {
  // Database States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [serverEmails, setServerEmails] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomingPayments, setIncomingPayments] = useState<IncomingPayment[]>([]);
  const [hotelBookingRequests, setHotelBookingRequests] = useState<HotelBookingRequest[]>([]);

  // UI Navigation/Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "rooms" | "hotel" | "residents" | "employees" | "expenses" | "incomingPayments" | "reports" | "reminders" | "enquiries">("dashboard");
  
  // Filtering & Selection
  const [selectedFloor, setSelectedFloor] = useState<string>("All");
  const [roomQuery, setRoomQuery] = useState("");
  const [roomStatusFilter, setRoomStatusFilter] = useState("All");
  const [residentSearchQuery, setResidentSearchQuery] = useState("");

  // Drawer / Modals State
  const [selectedRoomNum, setSelectedRoomNum] = useState<string | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [isAddingResident, setIsAddingResident] = useState(false);
  const [isEditingResidentId, setIsEditingResidentId] = useState<string | null>(null);

  // Forms States - Resident
  const [resName, setResName] = useState("");
  const [resDob, setResDob] = useState("");
  const [resJoiningDate, setResJoiningDate] = useState("");
  const [resAddress, setResAddress] = useState("");
  const [resCompany, setResCompany] = useState("");
  const [resParents, setResParents] = useState("");
  const [resEmergency, setResEmergency] = useState("");
  const [resMobile, setResMobile] = useState("");
  const [resWhatsapp, setResWhatsapp] = useState("");
  const [resBalance, setResBalance] = useState<number>(0);
  const [resRoomNum, setResRoomNum] = useState("");
  const [resBedNum, setResBedNum] = useState<number>(0);
  const [resNotes, setResNotes] = useState("");

  // Form State - Employee
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isEditingEmployeeId, setIsEditingEmployeeId] = useState<string | null>(null);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState<Employee["role"]>("Cook");
  const [empMobile, setEmpMobile] = useState("");
  const [empSalary, setEmpSalary] = useState<number>(0);
  const [empAdvance, setEmpAdvance] = useState<number>(0);
  const [empJoining, setEmpJoining] = useState("");
  const [empAddress, setEmpAddress] = useState("");
  const [empEmergency, setEmpEmergency] = useState("");
  const [empStatus, setEmpStatus] = useState<"active" | "inactive">("active");
  const [empEmploymentType, setEmpEmploymentType] = useState<"Permanent" | "Temporary">("Permanent");
  const [empPhoto, setEmpPhoto] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [empNotes, setEmpNotes] = useState("");
  const [empIdsJson, setEmpIdsJson] = useState("[]");

  // Form State - Expense
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingExpenseId, setIsEditingExpenseId] = useState<string | null>(null);
  const [expTitle, setExpTitle] = useState("");
  const [expType, setExpType] = useState<ExpenseType>("Grocery Bills");
  const [expRecipient, setExpRecipient] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expTime, setExpTime] = useState("");
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expBalance, setExpBalance] = useState<number>(0);
  const [expTxn, setExpTxn] = useState("");
  const [expCash, setExpCash] = useState(true);
  const [expPhone, setExpPhone] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expNotes, setExpNotes] = useState("");

  // Form State - Incoming Payment
  const [isAddingIncomingPayment, setIsAddingIncomingPayment] = useState(false);
  const [isEditingIncomingPaymentId, setIsEditingIncomingPaymentId] = useState<string | null>(null);
  const [ipTitle, setIpTitle] = useState("");
  const [ipType, setIpType] = useState<IncomingPaymentType>("Hostel Resident Monthly");
  const [ipDate, setIpDate] = useState("");
  const [ipPayee, setIpPayee] = useState("");
  const [ipCash, setIpCash] = useState(true);
  const [ipTxn, setIpTxn] = useState("");
  const [ipPhonePay, setIpPhonePay] = useState("");
  const [ipResidentName, setIpResidentName] = useState("");
  const [ipRoomNum, setIpRoomNum] = useState("");
  const [ipBedNum, setIpBedNum] = useState<number | "">("");
  const [ipAmount, setIpAmount] = useState<number>(0);
  const [ipBalance, setIpBalance] = useState<number>(0);
  const [ipNotes, setIpNotes] = useState("");

  // Report State
  const BUILDING_RENT = 450000;
  const [reportMode, setReportMode] = useState<"lastWeek" | "lastMonth" | "custom">("lastMonth");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportShowResidents, setReportShowResidents] = useState(false);

  // Form State - Reminder
  const [remTitle, setRemTitle] = useState("");
  const [remType, setRemType] = useState<"specific-date" | "sunday" | "monthly-1st">("specific-date");
  const [remDate, setRemDate] = useState("");

  // Form State - Pay Log
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<"Cash" | "UPI" | "Bank Transfer">("UPI");
  const [payNotes, setPayNotes] = useState("");

  // ID Upload Temp Form
  const [uploadedIdName, setUploadedIdName] = useState("");
  const [uploadedIdType, setUploadedIdType] = useState("Aadhaar Card");
  const [uploadedBase64, setUploadedBase64] = useState("");

  // Seed loading state
  const [isSeeding, setIsSeeding] = useState(false);

  // Real-time Database listeners
  useEffect(() => {
    // 1. Rooms Listener
    const roomsUnsub = onSnapshot(
      collection(db, "rooms"),
      (snapshot) => {
        const roomsDataList: Room[] = [];
        snapshot.forEach((d) => {
          roomsDataList.push({ id: d.id, ...d.data() } as Room);
        });
        roomsDataList.sort((a, b) => parseInt(a.roomNum) - parseInt(b.roomNum));
        setRooms(roomsDataList);
      },
      (err) => console.error("Rooms listener error:", err)
    );

    // 2. Residents Listener
    const residentsUnsub = onSnapshot(
      collection(db, "residents"),
      (snapshot) => {
        const residentsDataList: Resident[] = [];
        snapshot.forEach((d) => {
          residentsDataList.push({ id: d.id, ...d.data() } as Resident);
        });
        setResidents(residentsDataList);
      },
      (err) => console.error("Residents listener error:", err)
    );

    // 3. Reminders Listener
    const remindersUnsub = onSnapshot(
      collection(db, "reminders"),
      (snapshot) => {
        const remindersDataList: Reminder[] = [];
        snapshot.forEach((d) => {
          remindersDataList.push({ id: d.id, ...d.data() } as Reminder);
        });
        setReminders(remindersDataList);
      },
      (err) => console.error("Reminders listener error:", err)
    );

    // 4. Enquiries Listener
    const enquiriesUnsub = onSnapshot(
      collection(db, "enquiries"),
      (snapshot) => {
        const enquiriesDataList: Enquiry[] = [];
        snapshot.forEach((d) => {
          enquiriesDataList.push({ id: d.id, ...d.data() } as Enquiry);
        });
        enquiriesDataList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setEnquiries(enquiriesDataList);
      },
      (err) => console.error("Enquiries listener error:", err)
    );

    // 5. Employees Listener
    const employeesUnsub = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const list: Employee[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Employee));
        list.sort((a, b) => a.name.localeCompare(b.name));
        setEmployees(list);
      },
      (err) => console.error("Employees listener error:", err)
    );

    // 6. Expenses Listener
    const expensesUnsub = onSnapshot(
      collection(db, "expenses"),
      (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Expense));
        list.sort((a, b) => b.dateOfPayment.localeCompare(a.dateOfPayment));
        setExpenses(list);
      },
      (err) => console.error("Expenses listener error:", err)
    );

    // 7. Incoming Payments Listener
    const incomingPaymentsUnsub = onSnapshot(
      collection(db, "incomingPayments"),
      (snapshot) => {
        const list: IncomingPayment[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as IncomingPayment));
        list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
        setIncomingPayments(list);
      },
      (err) => console.error("IncomingPayments listener error:", err)
    );

    // 8. Hotel Booking Requests Listener
    const bookingRequestsUnsub = onSnapshot(
      collection(db, "hotelBookingRequests"),
      (snapshot) => {
        const list: HotelBookingRequest[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as HotelBookingRequest));
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setHotelBookingRequests(list);
      },
      (err) => console.error("HotelBookingRequests listener error:", err)
    );

    // 9. Fetch Server Emails Visual Log
    fetchServerEmails();

    return () => {
      roomsUnsub();
      residentsUnsub();
      remindersUnsub();
      enquiriesUnsub();
      employeesUnsub();
      expensesUnsub();
      incomingPaymentsUnsub();
      bookingRequestsUnsub();
    };
  }, []);

  const fetchServerEmails = async () => {
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        setServerEmails(data);
      }
    } catch (e) {
      console.error("Error fetching emails log:", e);
    }
  };

  // Safe seed: checks if rooms collection is empty on first mount, then populates 53 rooms and 3 mock residents
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      // 1. Seed Rooms
      const batch = writeBatch(db);
      initialRoomsList.forEach((roomItem) => {
        const roomRef = doc(db, "rooms", roomItem.roomNum);
        batch.set(roomRef, {
          roomNum: roomItem.roomNum,
          floor: roomItem.floor,
          capacity: roomItem.capacity,
          occupiedCount: 0,
          status: "vacant"
        });
      });
      await batch.commit();

      // 2. Add some highly realistic default residents to showcase feature instantly
      const mockResidents = [
        {
          name: "Amit Sharma",
          dob: "2001-08-12",
          joiningDate: "2026-02-01",
          permanentAddress: "12, Ring Road, Sector 5, Lucknow, UP - 226001",
          currentWorkingCompanyOrCollege: "RV College of Engineering, Dept of CSE",
          parentsInformation: "Father: Rajesh Sharma (Farmer), Mother: Pushpa Sharma",
          emergencyContact: "+91 99887 76655",
          mobileNumber: "+91 91234 56780",
          whatsappNumber: "9123456780",
          balanceAmount: 2500,
          roomNum: "101",
          specialNotes: "Amit pays via UPI, usually requests early breakfast. Honest and hardworking.",
          paymentHistoryJson: JSON.stringify([
            { id: "p1", date: "2026-02-01", amount: 6500, notes: "Joining deposit + rent", paymentMode: "UPI" },
            { id: "p2", date: "2026-03-02", amount: 4500, notes: "March rent partial", paymentMode: "Cash" }
          ]),
          idsJson: JSON.stringify([])
        },
        {
          name: "Rohan Verma",
          dob: "1999-05-24",
          joiningDate: "2026-01-15",
          permanentAddress: "B-404, Green Meadows, Salt Lake, Kolkata, West Bengal",
          currentWorkingCompanyOrCollege: "Software Engineer at Tech Mahindra",
          parentsInformation: "Father: Sudesh Verma (Govt Servant), Mother: Maya Verma",
          emergencyContact: "+91 88776 65544",
          mobileNumber: "+91 88812 34567",
          whatsappNumber: "8881234567",
          balanceAmount: 0,
          roomNum: "101",
          specialNotes: "Relocated on 1st feb from 204. Likes reading tech blogs.",
          paymentHistoryJson: JSON.stringify([
            { id: "p3", date: "2026-01-15", amount: 8000, notes: "Security deposit and initial monthly pro-rata", paymentMode: "Bank Transfer" },
            { id: "p4", date: "2026-02-02", amount: 6000, notes: "February monthly rent payment", paymentMode: "UPI" },
            { id: "p5", date: "2026-03-01", amount: 6000, notes: "March rent paid on-time", paymentMode: "UPI" }
          ]),
          idsJson: JSON.stringify([])
        },
        {
          name: "Saurabh Mishra",
          dob: "2000-11-02",
          joiningDate: "2026-03-10",
          permanentAddress: "House 52, Kaliasot Nagar, Bhopal, MP - 462001",
          currentWorkingCompanyOrCollege: "Pes University, Bengaluru",
          parentsInformation: "Father: Dr. K.K Mishra (Professor), Mother: Suman Mishra",
          emergencyContact: "+91 77665 54433",
          mobileNumber: "+91 76543 21098",
          whatsappNumber: "7654321098",
          balanceAmount: 6000,
          roomNum: "201",
          specialNotes: "No payments made for March yet. High priority alert on fee reminder.",
          paymentHistoryJson: JSON.stringify([]),
          idsJson: JSON.stringify([])
        }
      ];

      for (const resItem of mockResidents) {
        await addDoc(collection(db, "residents"), resItem);
      }

      // 3. Seed some basic reminders
      const dummyReminders = [
        { title: "Hostel Fee Outstanding Alert check", type: "monthly-1st", date: "1st of Month", active: true },
        { title: "Collect Laundry, checks sanitation reports", type: "sunday", date: "Sunday", active: true },
        { title: "Review Fire Extinguisher system pressure", type: "specific-date", date: "2026-06-30", active: true }
      ];

      for (const rem of dummyReminders) {
        await addDoc(collection(db, "reminders"), rem);
      }

      // Re-trigger rooms occupancy adjust for correctness
      await runOccupancyRebuilder();
      alert("Successfully seeded PG Database with 53 default rooms, 3 active residents, and reference reminders!");
    } catch (e: any) {
      console.error("Error seeding:", e);
      alert("Error seeding initial layout: " + e.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Background recalculator to ensure rooms occupancy counts are always synchronized with residents collection
  const runOccupancyRebuilder = async () => {
    try {
      // Clear all to 0 first
      const roomCounts: { [key: string]: number } = {};
      ALL_ROOM_NUMBERS.forEach(num => roomCounts[num] = 0);

      // Count occupants
      residents.forEach(res => {
        if (roomCounts[res.roomNum] !== undefined) {
          roomCounts[res.roomNum]++;
        }
      });

      // Update room docs in Firestore — preserve existing capacity and acType
      for (const roomNum of ALL_ROOM_NUMBERS) {
        const count = roomCounts[roomNum] || 0;
        const existingRoom = rooms.find(r => r.roomNum === roomNum);
        const capacity = existingRoom?.capacity || 6;
        let status: "vacant" | "partially-occupied" | "fully-occupied" = "vacant";
        if (count >= capacity) status = "fully-occupied";
        else if (count > 0) status = "partially-occupied";

        const roomRef = doc(db, "rooms", roomNum);
        // Only update occupancy fields — never overwrite capacity or acType
        await setDoc(roomRef, {
          roomNum,
          floor: getFloorForRoom(roomNum),
          occupiedCount: count,
          status: status
        }, { merge: true });
      }
      console.log("Recalculated occupancy metrics across 53 rooms.");
    } catch (err) {
      console.error("Error in runOccupancyRebuilder:", err);
    }
  };

  // Re-run builder when residents change — always recalculate regardless of rooms state
  useEffect(() => {
    if (residents.length === 0 && rooms.length > 0) {
      // Reset all rooms to vacant when no residents remain
      const resetAll = async () => {
        for (const roomNum of ALL_ROOM_NUMBERS) {
          const roomRef = doc(db, "rooms", roomNum);
          await setDoc(roomRef, { occupiedCount: 0, status: "vacant" }, { merge: true }); // merge preserves capacity & acType
        }
      };
      resetAll().catch(console.error);
    } else if (residents.length > 0) {
      runOccupancyRebuilder();
    }
  }, [residents.length]);

  // Handle Resident ID File uploading locally via base64 translation
  const handleIdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedIdName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Compress an image File to a small base64 JPEG (max 240px, quality 0.75) to fit Firestore 1MB limit
  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 240;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const startCamera = async (facing: "user" | "environment" = cameraFacing) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    try {
      // Try with ideal facingMode first; fall back to any camera if it fails
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } }
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
        ? "Camera permission denied. Please allow camera access in your browser settings and try again."
        : err?.name === "NotFoundError"
        ? "No camera found on this device."
        : `Camera error: ${err?.message || err}`;
      alert(msg);
    }
  };

  // Attach stream to video element whenever showCamera becomes true
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [showCamera]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const SIZE = 240;
    const scale = Math.min(1, SIZE / Math.min(video.videoWidth || SIZE, video.videoHeight || SIZE));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d")!;
    if (cameraFacing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setEmpPhoto(canvas.toDataURL("image/jpeg", 0.8));
    stopCamera();
  };

  const flipCamera = () => {
    const next = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(next);
    startCamera(next);
  };

  // Save ID document to current resident details
  const submitResidentIdCard = async () => {
    if (!selectedResidentId) return;
    if (!uploadedIdName || !uploadedBase64) {
      alert("Please enter a name or choose a readable file.");
      return;
    }

    try {
      const activeResident = residents.find(r => r.id === selectedResidentId);
      if (!activeResident) return;

      const currentIdsList: ResidentID[] = activeResident.idsJson 
        ? JSON.parse(activeResident.idsJson) 
        : [];

      const newIdRecord: ResidentID = {
        id: "id_" + Date.now(),
        type: uploadedIdType,
        idName: uploadedIdName,
        fileData: uploadedBase64,
        uploadedAt: new Date().toLocaleDateString()
      };

      currentIdsList.push(newIdRecord);

      const residentRef = doc(db, "residents", selectedResidentId);
      await updateDoc(residentRef, {
        idsJson: JSON.stringify(currentIdsList)
      });

      // Clear uploads
      setUploadedIdName("");
      setUploadedBase64("");
      alert("ID successfully uploaded and mapped in Firestore!");
    } catch (e: any) {
      alert("Could not append ID document: " + e.message);
    }
  };

  // Remove existing ID attachment
  const deleteResidentIdCard = async (idCardId: string) => {
    if (!selectedResidentId) return;
    if (!window.confirm("Are you sure you want to delete this resident ID documentation?")) return;

    try {
      const activeResident = residents.find(r => r.id === selectedResidentId);
      if (!activeResident) return;

      const currentIdsList: ResidentID[] = activeResident.idsJson 
        ? JSON.parse(activeResident.idsJson) 
        : [];

      const filtered = currentIdsList.filter(idCard => idCard.id !== idCardId);

      const residentRef = doc(db, "residents", selectedResidentId);
      await updateDoc(residentRef, {
        idsJson: JSON.stringify(filtered)
      });
      alert("ID file attachment successfully removed.");
    } catch (e: any) {
      alert("Error deleting ID attachment: " + e.message);
    }
  };

  // Logging payments
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;
    if (payAmount <= 0) {
      alert("Outstanding payment value must exceed ₹0");
      return;
    }

    try {
      const activeRes = residents.find(r => r.id === selectedResidentId);
      if (!activeRes) return;

      const history: PaymentRecord[] = activeRes.paymentHistoryJson 
        ? JSON.parse(activeRes.paymentHistoryJson) 
        : [];

      const newPayment: PaymentRecord = {
        id: "pay_" + Date.now(),
        date: new Date().toLocaleDateString(),
        amount: payAmount,
        notes: payNotes || "Standard monthly hostel lease installment",
        paymentMode: payMode
      };

      history.push(newPayment);

      const updatedBalance = Math.max(0, activeRes.balanceAmount - payAmount);

      const residentRef = doc(db, "residents", selectedResidentId);
      await updateDoc(residentRef, {
        balanceAmount: updatedBalance,
        paymentHistoryJson: JSON.stringify(history)
      });

      // Reset
      setPayAmount(0);
      setPayNotes("");
      alert(`Successfully logged payment of ₹${payAmount}. Remaining dues: ₹${updatedBalance}`);
    } catch (err: any) {
      alert("Error logging payment transaction: " + err.message);
    }
  };

  // Add a new resident
  const handleAddResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resRoomNum || !resMobile) {
      alert("Name, Room and Mobile details are essential.");
      return;
    }

    try {
      // Check room availability
      const targetRoom = rooms.find(rm => rm.roomNum === resRoomNum);
      if (!targetRoom && rooms.length > 0) {
        alert("This room does not exist.");
        return;
      }
      const roomCap = targetRoom?.capacity || 6;
      if (targetRoom && targetRoom.occupiedCount >= roomCap) {
        alert(`Room has attained max capacity (${roomCap}/${roomCap}). Please choose a different space.`);
        return;
      }

      // Validate bed number not already taken by another resident
      if (resBedNum > 0) {
        const bedTaken = residents.find(r => r.roomNum === resRoomNum && r.bedNum === resBedNum && r.id !== isEditingResidentId);
        if (bedTaken) {
          alert(`Bed ${resBedNum} in Room ${resRoomNum} is already occupied by ${bedTaken.name}. Choose a different bed.`);
          return;
        }
      }

      const activeResidentData = {
        name: resName,
        dob: resDob || "2000-01-01",
        joiningDate: resJoiningDate || new Date().toISOString().split("T")[0],
        permanentAddress: resAddress || "No permanent address submitted",
        currentWorkingCompanyOrCollege: resCompany || "N/A",
        parentsInformation: resParents || "N/A",
        emergencyContact: resEmergency || "N/A",
        mobileNumber: resMobile,
        whatsappNumber: resWhatsapp || resMobile.replace(/[^0-9]/g, ""),
        balanceAmount: Number(resBalance) || 0,
        roomNum: resRoomNum,
        bedNum: resBedNum || null,
        specialNotes: resNotes || "",
        paymentHistoryJson: JSON.stringify([]),
        idsJson: JSON.stringify([])
      };

      if (isEditingResidentId) {
        // Updating existing resident
        const residentDocRef = doc(db, "residents", isEditingResidentId);
        await updateDoc(residentDocRef, activeResidentData);
        alert("Resident profile updated successfully.");
      } else {
        // Creating new resident
        await addDoc(collection(db, "residents"), activeResidentData);
        alert("New resident registered into the PG system successfully.");
      }

      // Cleanup
      setIsAddingResident(false);
      setIsEditingResidentId(null);
      resetResidentForm();
      await runOccupancyRebuilder();
    } catch (err: any) {
      console.error(err);
      alert("Transaction failed: " + err.message);
    }
  };

  const startEditResident = (res: Resident) => {
    setIsEditingResidentId(res.id);
    setResName(res.name);
    setResDob(res.dob);
    setResJoiningDate(res.joiningDate);
    setResAddress(res.permanentAddress);
    setResCompany(res.currentWorkingCompanyOrCollege);
    setResParents(res.parentsInformation);
    setResEmergency(res.emergencyContact);
    setResMobile(res.mobileNumber);
    setResWhatsapp(res.whatsappNumber);
    setResBalance(res.balanceAmount);
    setResRoomNum(res.roomNum);
    setResBedNum(res.bedNum || 0);
    setResNotes(res.specialNotes || "");
    setIsAddingResident(true);
  };

  const deleteResident = async (resId: string) => {
    if (!window.confirm("Are you sure you want to checkout and delete this resident? Outstanding dues must be cleared first.")) return;
    try {
      await deleteDoc(doc(db, "residents", resId));
      setSelectedResidentId(null);
      alert("Resident checked out and profile records archived.");
      await runOccupancyRebuilder();
    } catch (e: any) {
      alert("Error removing resident: " + e.message);
    }
  };

  const resetResidentForm = () => {
    setResName("");
    setResDob("");
    setResJoiningDate("");
    setResAddress("");
    setResCompany("");
    setResParents("");
    setResEmergency("");
    setResMobile("");
    setResWhatsapp("");
    setResBalance(0);
    setResRoomNum("");
    setResBedNum(0);
    setResNotes("");
  };

  // Add a reminder
  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle) {
      alert("Give a valid title to your reminder.");
      return;
    }

    try {
      let calcDate = remDate;
      if (remType === "sunday") calcDate = "Every Sunday";
      else if (remType === "monthly-1st") calcDate = "1st of Every Month";

      const newReminder = {
        title: remTitle,
        type: remType,
        date: calcDate || new Date().toISOString().split("T")[0],
        active: true
      };

      await addDoc(collection(db, "reminders"), newReminder);
      setRemTitle("");
      setRemDate("");
      alert("Alert Reminder added and scheduled into the PG registry system.");
    } catch (e: any) {
      alert("Error adding alert: " + e.message);
    }
  };

  const deleteReminder = async (remId: string) => {
    try {
      await deleteDoc(doc(db, "reminders", remId));
    } catch (e: any) {
      alert("Error deleting reminder: " + e.message);
    }
  };

  // Toggle Reminder Status
  const toggleReminderActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "reminders", id), { active: !current });
    } catch (e: any) {
      alert("Error updating reminder: " + e.message);
    }
  };

  // ── Employee CRUD ──────────────────────────────────────────────────────────
  const resetEmployeeForm = () => {
    setEmpName(""); setEmpRole("Cook"); setEmpMobile(""); setEmpSalary(0);
    setEmpAdvance(0); setEmpJoining(""); setEmpAddress(""); setEmpEmergency("");
    setEmpStatus("active"); setEmpEmploymentType("Permanent"); setEmpPhoto("");
    setEmpNotes(""); setEmpIdsJson("[]");
    setIsEditingEmployeeId(null);
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empMobile) { alert("Name and mobile are required."); return; }
    try {
      const data = {
        name: empName, role: empRole, mobileNumber: empMobile,
        salary: Number(empSalary) || 0, advanceAmount: Number(empAdvance) || 0,
        joiningDate: empJoining || new Date().toISOString().split("T")[0],
        permanentAddress: empAddress || "N/A", emergencyContact: empEmergency || "N/A",
        status: empStatus, employmentType: empEmploymentType,
        photo: empPhoto || null,
        specialNotes: empNotes, idsJson: empIdsJson
      };
      if (isEditingEmployeeId) {
        await updateDoc(doc(db, "employees", isEditingEmployeeId), data);
        alert("Employee record updated.");
      } else {
        await addDoc(collection(db, "employees"), data);
        alert("Employee added successfully.");
      }
      setIsAddingEmployee(false);
      resetEmployeeForm();
    } catch (err: any) {
      alert("Error saving employee: " + err.message);
    }
  };

  const startEditEmployee = (emp: Employee) => {
    setIsEditingEmployeeId(emp.id);
    setEmpName(emp.name); setEmpRole(emp.role); setEmpMobile(emp.mobileNumber);
    setEmpSalary(emp.salary); setEmpAdvance(emp.advanceAmount || 0);
    setEmpJoining(emp.joiningDate); setEmpAddress(emp.permanentAddress);
    setEmpEmergency(emp.emergencyContact); setEmpStatus(emp.status);
    setEmpEmploymentType(emp.employmentType || "Permanent");
    setEmpPhoto(emp.photo || "");
    setEmpNotes(emp.specialNotes || ""); setEmpIdsJson(emp.idsJson || "[]");
    setIsAddingEmployee(true);
  };

  const deleteEmployee = async (empId: string) => {
    if (!window.confirm("Delete this employee record permanently?")) return;
    try {
      await deleteDoc(doc(db, "employees", empId));
    } catch (err: any) {
      alert("Error deleting employee: " + err.message);
    }
  };

  // ── Expense CRUD ───────────────────────────────────────────────────────────
  const resetExpenseForm = () => {
    setExpTitle(""); setExpType("Grocery Bills"); setExpRecipient(""); setExpCompany("");
    setExpDate(""); setExpTime(""); setExpAmount(0); setExpBalance(0);
    setExpTxn(""); setExpCash(true); setExpPhone(""); setExpPaidBy(""); setExpNotes("");
    setIsEditingExpenseId(null);
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expRecipient || !expDate || expAmount <= 0) {
      alert("Title, recipient, date and amount are required.");
      return;
    }
    try {
      const data: Omit<Expense, "id"> = {
        title: expTitle,
        expenseType: expType,
        recipient: expRecipient,
        recipientCompany: expCompany,
        dateOfPayment: expDate,
        timeOfPayment: expTime,
        amount: Number(expAmount),
        balancePending: Number(expBalance),
        transactionNumber: expTxn,
        paidInCash: expCash,
        recipientPhone: expPhone,
        paidBy: expPaidBy,
        notes: expNotes,
      };
      if (isEditingExpenseId) {
        await updateDoc(doc(db, "expenses", isEditingExpenseId), data as any);
        alert("Expense updated.");
      } else {
        await addDoc(collection(db, "expenses"), data);
        alert("Expense recorded.");
      }
      setIsAddingExpense(false);
      resetExpenseForm();
    } catch (err: any) {
      alert("Error saving expense: " + err.message);
    }
  };

  const startEditExpense = (exp: Expense) => {
    setIsEditingExpenseId(exp.id);
    setExpTitle(exp.title || ""); setExpType(exp.expenseType); setExpRecipient(exp.recipient);
    setExpCompany(exp.recipientCompany); setExpDate(exp.dateOfPayment);
    setExpTime(exp.timeOfPayment); setExpAmount(exp.amount);
    setExpBalance(exp.balancePending); setExpTxn(exp.transactionNumber);
    setExpCash(exp.paidInCash); setExpPhone(exp.recipientPhone);
    setExpPaidBy(exp.paidBy); setExpNotes(exp.notes || "");
    setIsAddingExpense(true);
  };

  const deleteExpense = async (id: string) => {
    if (!window.confirm("Delete this expense record?")) return;
    await deleteDoc(doc(db, "expenses", id));
  };

  // ── Incoming Payment CRUD ──────────────────────────────────────────────────
  const resetIncomingPaymentForm = () => {
    setIpTitle(""); setIpType("Hostel Resident Monthly"); setIpDate("");
    setIpPayee(""); setIpCash(true); setIpTxn(""); setIpPhonePay("");
    setIpResidentName(""); setIpRoomNum(""); setIpBedNum("");
    setIpAmount(0); setIpBalance(0); setIpNotes("");
    setIsEditingIncomingPaymentId(null);
  };

  const handleIncomingPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipTitle || !ipDate || ipAmount <= 0) {
      alert("Title, date and amount are required.");
      return;
    }
    try {
      const data: Omit<IncomingPayment, "id"> = {
        title: ipTitle,
        paymentType: ipType,
        paymentDate: ipDate,
        payee: ipPayee,
        paidInCash: ipCash,
        transactionNumber: ipTxn,
        phonePayNumber: ipPhonePay,
        residentName: ipResidentName,
        roomNum: ipRoomNum,
        bedNum: ipBedNum !== "" ? Number(ipBedNum) : undefined,
        amount: Number(ipAmount),
        balancePending: Number(ipBalance),
        notes: ipNotes,
      };
      if (isEditingIncomingPaymentId) {
        await updateDoc(doc(db, "incomingPayments", isEditingIncomingPaymentId), data as any);
      } else {
        await addDoc(collection(db, "incomingPayments"), data);
      }
      setIsAddingIncomingPayment(false);
      resetIncomingPaymentForm();
    } catch (err: any) {
      alert("Error saving payment: " + err.message);
    }
  };

  const startEditIncomingPayment = (p: IncomingPayment) => {
    setIsEditingIncomingPaymentId(p.id);
    setIpTitle(p.title); setIpType(p.paymentType); setIpDate(p.paymentDate);
    setIpPayee(p.payee); setIpCash(p.paidInCash); setIpTxn(p.transactionNumber);
    setIpPhonePay(p.phonePayNumber); setIpResidentName(p.residentName);
    setIpRoomNum(p.roomNum); setIpBedNum(p.bedNum ?? "");
    setIpAmount(p.amount); setIpBalance(p.balancePending); setIpNotes(p.notes || "");
    setIsAddingIncomingPayment(true);
  };

  const deleteIncomingPayment = async (id: string) => {
    if (!window.confirm("Delete this payment record?")) return;
    await deleteDoc(doc(db, "incomingPayments", id));
  };

  // Update Enquiry Status
  const updateEnquiryStatus = async (id: string, newStatus: "Pending" | "Contacted" | "Closed") => {
    try {
      await updateDoc(doc(db, "enquiries", id), { status: newStatus });
      alert(`Enquiry status changed to: ${newStatus}`);
    } catch (e: any) {
      alert("Error updating status: " + e.message);
    }
  };

  // Filtered rooms — hostel only (excludes floor 5 hotel rooms)
  const filteredRooms = rooms.filter((room) => {
    if (room.floor === 5) return false;
    const isFloorMatch = selectedFloor === "All" || room.floor.toString() === selectedFloor;
    const isQueryMatch = roomQuery === "" || room.roomNum.toLowerCase().includes(roomQuery.toLowerCase());

    let isStatusMatch = true;
    if (roomStatusFilter === "Vacant") isStatusMatch = room.occupiedCount === 0;
    else if (roomStatusFilter === "Available Slots") isStatusMatch = room.occupiedCount > 0 && room.occupiedCount < 6;
    else if (roomStatusFilter === "Fully Booked") isStatusMatch = room.occupiedCount >= 6;

    return isFloorMatch && isQueryMatch && isStatusMatch;
  });

  // Hotel rooms (floor 5 only)
  const hotelRooms = rooms.filter(r => r.floor === 5);

  // Filtered residents
  const filteredResidents = residents.filter((res) => {
    return (
      res.name.toLowerCase().includes(residentSearchQuery.toLowerCase()) ||
      res.roomNum.toLowerCase().includes(residentSearchQuery.toLowerCase()) ||
      res.mobileNumber.toLowerCase().includes(residentSearchQuery.toLowerCase())
    );
  });

  // Residents with outstanding balances for notification on the 2nd
  const overdueResidents = residents.filter(r => r.balanceAmount > 0);

  // Total metrics
  const totalSlots = rooms.length * 6; // 53 * 6 = 318
  const activeResidentsCount = residents.length;
  const averageOccupancy = totalSlots > 0 ? Math.round((activeResidentsCount / totalSlots) * 100) : 0;
  const totalDuesAmount = residents.reduce((sum, r) => sum + r.balanceAmount, 0);

  // Open resident modal helper
  const handleOpenResidentProfile = (resId: string) => {
    setSelectedResidentId(resId);
    setSelectedRoomNum(null); // close room view
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans flex flex-col" id="admin-dashboard-root">
      
      {/* Top Admin Navigation bar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md grow-0 shrink-0" id="admin-navbar">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white font-bold shadow-md shadow-indigo-900/30 animate-fade-in">
            <Building className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            {/* — MI SPACE — brand */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-[1.5px] rounded-full flex-shrink-0" style={{ background: "#C9A84C" }} />
              <span className="text-sm font-black uppercase tracking-[0.30em] text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>MI SPACE</span>
              <div className="w-5 h-[1.5px] rounded-full flex-shrink-0" style={{ background: "#C9A84C" }} />
            </div>
            <p className="text-[8px] font-medium uppercase tracking-[0.38em] mt-0.5" style={{ color: "#C9A84C", fontFamily: "Arial, Helvetica, sans-serif" }}>LUXURY CO-LIVING</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">PG Admin Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700/50">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">Firebase Live Connection Sync</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition duration-200 cursor-pointer shadow-sm"
            id="admin-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Admin Content Container */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* Left Side Sidebar / Navigation rail */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
            <div className="text-slate-400 text-[10px] font-bold uppercase px-3.5 pb-2 border-b border-slate-100 tracking-wider">
              Control Panel Navigation
            </div>
            
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "dashboard" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Building className="w-4 h-4 shrink-0" />
              <span>General Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab("rooms"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "rooms"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Bed className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">PG Hostel Rooms</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "rooms" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>{rooms.filter(r => r.floor !== 5).length}</span>
            </button>

            <button
              onClick={() => { setActiveTab("hotel"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "hotel"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <Hotel className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Hotel Rooms</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "hotel" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>{rooms.filter(r => r.floor === 5).length}</span>
            </button>

            <button
              onClick={() => { setActiveTab("residents"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "residents" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Residents Registry</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{activeResidentsCount}</span>
            </button>

            <button
              onClick={() => { setActiveTab("employees"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "employees"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Employees</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "employees" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>{employees.filter(e => e.status === "active").length}</span>
            </button>

            <button
              onClick={() => { setActiveTab("expenses"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "expenses"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Expenses</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "expenses" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>{expenses.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab("incomingPayments"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "incomingPayments"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Incoming Payments</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "incomingPayments" ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>{incomingPayments.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab("reports"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "reports"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Reports</span>
            </button>

            <button
              onClick={() => { setActiveTab("reminders"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "reminders"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Alert Reminders</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{reminders.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab("enquiries"); setSelectedResidentId(null); setSelectedRoomNum(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-150 cursor-pointer ${
                activeTab === "enquiries" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Visitor Enquiries</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {enquiries.filter(e => e.status === "Pending").length}
              </span>
            </button>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Occupancy Metrics</h3>
            
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Occupied Beds ({activeResidentsCount}/{totalSlots})</span>
                  <span>{averageOccupancy}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${averageOccupancy}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Remaining Free Beds:</span>
                <span className="font-bold text-slate-800">{totalSlots - activeResidentsCount} / {totalSlots}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Total Outstanding Fees:</span>
                <span className="font-bold text-red-650 font-mono">₹{totalDuesAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Default Rooms Instantiator */}
            {rooms.length === 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 pt-3.5">
                <div className="text-[11px] font-semibold text-slate-600 leading-relaxed">
                  First launch detected. Instantly seed PG with 53 default rooms (Vite layout), payments log, and alerts.
                </div>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  id="seed-db-btn"
                >
                  {isSeeding ? "Provisioning..." : "Initialize 53 Rooms"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Dynamic Panels Grid */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Active Tab rendering */}
          {activeTab === "dashboard" && (
            <div className="space-y-6" id="dashboard-tab">
              {/* Stat Highlights Card Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="bg-indigo-55/90 p-3 rounded-xl text-indigo-600 bg-indigo-50">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Active Boys</h3>
                    <p className="text-2xl font-black text-slate-800">{activeResidentsCount} PG Residents</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Vacant / Empty Beds</h3>
                    <p className="text-2xl font-black text-slate-800">{totalSlots - activeResidentsCount} Available</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="bg-red-50 p-3 rounded-xl text-red-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Outstanding Dues</h3>
                    <p className="text-2xl font-black text-red-600 font-mono">₹{totalDuesAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Reminders / Overdue Notifications Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 2nd of Month Outstanding Overdue notifications pillar */}
                <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-105 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                      <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">Hostel Fee Overdue Alarms</h3>
                    </div>
                    <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {overdueResidents.length} Overdue
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Under the PG lease policy, monthly outstanding balances should be cleared by the <span className="font-bold text-red-600">2nd of every month</span>. Trigger direct WhatsApp reminders using pre-drafted templates below.
                  </p>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {overdueResidents.length === 0 ? (
                      <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-center text-xs font-semibold">
                        ✓ All residents have cleared outstanding rental balances!
                      </div>
                    ) : (
                      overdueResidents.map((res) => (
                        <div key={res.id} className="p-3 bg-red-50/60 border border-red-150 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{res.name} (Room {res.roomNum})</p>
                            <p className="text-slate-450 text-[10px] font-semibold">Outstanding balance: <span className="text-red-700 font-bold font-mono">₹{res.balanceAmount.toLocaleString()}</span></p>
                          </div>
                          
                          <a 
                            href={`https://wa.me/${res.whatsappNumber}?text=${encodeURIComponent(
                              `Hi ${res.name}, this is a friendly reminder from MiSpace PG regarding your outstanding lease balance of ₹${res.balanceAmount} due on the 2nd of this month. Please clear it today via UPI/Cash. Thank you!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shrink-0 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Alert</span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Left side Scheduled events & reminders */}
                <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider pb-3 border-b border-slate-100">Calendar Agenda & Rules</h3>
                  
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3 p-3 bg-indigo-50/60 rounded-xl">
                      <Clock className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-805">Every Sunday Reminders</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Collect weekly linen, sanitise washroom rows, and plan Sunday Feast food specials.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-xl">
                      <Calendar className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-800">1st of Every Month</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Generate next cycle rent invoice logs, assess pending maintenance files.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("reminders")}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-2 px-3 rounded-lg transition text-center"
                  >
                    View All Reminders Config
                  </button>
                </div>
              </div>

              {/* Active list of 10 rooms quick summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">Quick Room Vacancy Checker</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab("hotel")} className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5" />
                      <span>Hotel Rooms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setActiveTab("rooms")} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                      <span>All Hostel Rooms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {rooms.slice(0, 10).map((room) => {
                    let bg = "bg-slate-50 border-slate-200 text-slate-800";
                    if (room.occupiedCount === 0) bg = "bg-indigo-50/40 border-indigo-200 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50";
                    else if (room.occupiedCount >= 6) bg = "bg-rose-50 border-rose-150 text-rose-700";
                    else bg = "bg-amber-50/50 border-amber-250 text-amber-800";

                    return (
                      <button
                        key={room.roomNum}
                        onClick={() => { setSelectedRoomNum(room.roomNum); setActiveTab("rooms"); }}
                        className={`p-3 border rounded-xl text-center transition cursor-pointer hover:shadow-xs ${bg}`}
                      >
                        <p className="font-extrabold text-sm">Room {room.roomNum}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{room.occupiedCount} / 6 Beds</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PG Rooms List (53) Tab */}
          {activeTab === "rooms" && (
            <div className="space-y-6" id="rooms-tab">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">PG Accommodation Rows - 53 Total Rooms</h3>
                
                {/* Search & filters row */}
                <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Filter Floor</label>
                      <select 
                        value={selectedFloor} 
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none"
                      >
                        <option value="All">All Hostel Floors</option>
                        <option value="1">1st Floor (101-110)</option>
                        <option value="2">2nd Floor (201-210)</option>
                        <option value="3">3rd Floor (301-310)</option>
                        <option value="4">4th Floor (401-410)</option>
                        <option value="6">6th Floor (601-603 Attic)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Occupancy State</label>
                      <select 
                        value={roomStatusFilter} 
                        onChange={(e) => setRoomStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none"
                      >
                        <option value="All">All Rooms Status</option>
                        <option value="Vacant">Fully Vacant (0 Occupants)</option>
                        <option value="Available Slots">Available Beds (1-5 Occupants)</option>
                        <option value="Fully Booked">Fully Occupied (6/6 Beds)</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Room..."
                      value={roomQuery}
                      onChange={(e) => setRoomQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium pl-9 pr-4 py-2 w-48 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Rooms Card layout */}
                {filteredRooms.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl">
                    No rooms match your filter queries.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredRooms.map((room) => {
                      // Hostel room card (hotel rooms are on their own tab)
                      const acType = room.acType || "Non-AC";
                      const capacity = room.capacity || 6;
                      const roomResidents = residents.filter(r => r.roomNum === room.roomNum);
                      const isFull = room.occupiedCount >= capacity;
                      const isEmpty = room.occupiedCount === 0;
                      const unassigned = roomResidents.filter(r => !r.bedNum);
                      const beds = Array.from({ length: capacity }, (_, i) => {
                        const bn = i + 1;
                        return roomResidents.find(r => r.bedNum === bn) || unassigned.shift() || null;
                      });
                      const statusBadge = isFull
                        ? "bg-red-100 text-red-700 border-red-200"
                        : isEmpty
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-amber-100 text-amber-700 border-amber-200";

                      return (
                        <div
                          key={room.roomNum}
                          className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col gap-2"
                        >
                          {/* Header row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">Floor {room.floor}</span>
                              <button
                                onClick={async () => {
                                  const newAc = acType === "AC" ? "Non-AC" : "AC";
                                  await setDoc(doc(db, "rooms", room.roomNum), { acType: newAc }, { merge: true });
                                }}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border cursor-pointer transition ${acType === "AC" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"}`}
                                title="Click to toggle AC/Non-AC"
                              >
                                {acType === "AC" ? "❄ AC" : "Non-AC"}
                              </button>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">Hostel</span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                              {isFull ? "Full" : isEmpty ? "Vacant" : `${capacity - room.occupiedCount} Left`}
                            </span>
                          </div>

                          {/* Room number */}
                          <div className="cursor-pointer" onClick={() => setSelectedRoomNum(room.roomNum)}>
                            <h4 className="text-base font-black text-slate-800">Room {room.roomNum}</h4>
                          </div>

                          {/* Bed cells grid */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {beds.map((resident, i) => (
                              <div
                                key={i}
                                className={`rounded-xl p-1.5 flex flex-col items-center gap-1 border ${resident ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                              >
                                <img
                                  src="/bedimageforicon.png"
                                  alt="bed"
                                  className="w-12 h-9 object-contain"
                                  style={resident ? { filter: "sepia(1) saturate(8) hue-rotate(310deg) brightness(0.9)" } : { filter: "sepia(0.3) saturate(1.5) hue-rotate(80deg) brightness(1.05)" }}
                                />
                                {resident ? (
                                  <div className="flex items-center justify-center gap-1 w-full flex-wrap">
                                    <span className="text-[7px] font-black text-red-400">B{i + 1}</span>
                                    <a href={`tel:${resident.mobileNumber}`} title={resident.mobileNumber} className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                      <Phone className="w-2.5 h-2.5 text-blue-500" />
                                    </a>
                                    <span className={`text-[7px] font-bold ${Number(resident.balanceAmount) === 0 ? "text-yellow-500" : "text-red-600"}`}>₹{resident.balanceAmount}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[7px] font-black text-green-500">B{i + 1}</span>
                                    <span className="text-[7px] text-green-600 font-semibold">Free</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Footer: count + capacity selector */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                            <span className="text-[10px] text-slate-500 font-bold">{room.occupiedCount}/{capacity} occupied</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-slate-400 font-medium">Cap:</span>
                              <select
                                value={capacity}
                                onChange={async (e) => {
                                  const newCap = Number(e.target.value);
                                  await setDoc(doc(db, "rooms", room.roomNum), { capacity: newCap }, { merge: true });
                                }}
                                className="text-[9px] font-bold border border-slate-200 rounded-md px-1 py-0.5 bg-white focus:outline-none cursor-pointer"
                              >
                                {[1,2,3,4,5,6].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Individual Room Occupants list (shown when room is clicked) */}
              {selectedRoomNum && (
                <div className="bg-white p-5 rounded-2xl border border-slate-250 shadow-md space-y-4" id="room-detail-panel">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Occupants inside Room {selectedRoomNum}</h3>
                      <p className="text-xs text-slate-450 mt-0.5">Capacity constraint: {rooms.find(r => r.roomNum === selectedRoomNum)?.occupiedCount || 0} active out of 6 maximum beds</p>
                    </div>
                    <button onClick={() => setSelectedRoomNum(null)} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition">
                      Collapse Window
                    </button>
                  </div>

                  {/* Occupants detailed lists */}
                  {residents.filter(r => r.roomNum === selectedRoomNum).length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl space-y-3">
                      <p>This room is currently fully vacant.</p>
                      <button
                        onClick={() => { setResRoomNum(selectedRoomNum); setIsAddingResident(true); setActiveTab("residents"); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5 transition"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Register First Resident Here</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {residents.filter(r => r.roomNum === selectedRoomNum).map((res) => (
                        <div key={res.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between animate-fade-in">
                          <div className="space-y-1.5">
                            <p className="font-extrabold text-slate-800 text-sm">{res.name}</p>
                            <p className="text-xs text-slate-550 flex items-center gap-1 leading-none">
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>{res.mobileNumber}</span>
                            </p>
                            <p className="text-[11px] text-slate-450">Joined on: <span className="font-bold text-slate-600">{res.joiningDate}</span></p>
                            <p className="text-[11px] text-slate-450 text-ellipsis overflow-hidden font-medium">Company/College: {res.currentWorkingCompanyOrCollege}</p>
                          </div>
                          
                          <button
                            onClick={() => handleOpenResidentProfile(res.id)}
                            className="bg-white hover:bg-slate-100 text-indigo-650 border border-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Show Full Dossier
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hotel Rooms Tab */}
          {activeTab === "hotel" && (
            <div className="space-y-6" id="hotel-tab">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-2xl border border-amber-400/20 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-amber-300 flex items-center gap-2">
                      <Hotel className="w-4 h-4" />
                      Hotel Rooms — Floor 5 (Furnished)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{hotelRooms.length} luxury rooms · individually managed</p>
                  </div>
                  <div className="flex gap-2 text-[9px] font-bold">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-600/30 px-2 py-1 rounded-full">{hotelRooms.filter(r => (r.hotelStatus || "vacant") === "vacant").length} Vacant</span>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-600/30 px-2 py-1 rounded-full">{hotelRooms.filter(r => r.hotelStatus === "booked").length} Booked</span>
                    <span className="bg-red-500/20 text-red-400 border border-red-600/30 px-2 py-1 rounded-full">{hotelRooms.filter(r => r.hotelStatus === "occupied").length} Occupied</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {hotelRooms.map((room) => {
                  const acType = room.acType || "Non-AC";
                  const hotelStatus = room.hotelStatus || "vacant";
                  const hotelStatusStyles = {
                    vacant:   {
                      badge:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                      card:    "from-emerald-950 to-slate-900 border-emerald-600/50 shadow-emerald-900/30",
                      roomNum: "text-emerald-300",
                      label:   "Vacant",
                    },
                    booked:   {
                      badge:   "bg-amber-500/20 text-amber-300 border-amber-500/40",
                      card:    "from-amber-950 to-slate-900 border-amber-500/50 shadow-amber-900/30",
                      roomNum: "text-amber-300",
                      label:   "Booked",
                    },
                    occupied: {
                      badge:   "bg-red-500/20 text-red-300 border-red-500/40",
                      card:    "from-red-950 to-slate-900 border-red-600/50 shadow-red-900/30",
                      roomNum: "text-red-300",
                      label:   "Occupied",
                    },
                  };
                  const hs = hotelStatusStyles[hotelStatus];

                  return (
                    <div key={room.roomNum} className={`bg-gradient-to-b ${hs.card} border-2 rounded-2xl p-3 shadow-lg flex flex-col gap-2`}>
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md">Floor {room.floor}</span>
                          <button
                            onClick={async () => {
                              const newAc = acType === "AC" ? "Non-AC" : "AC";
                              await setDoc(doc(db, "rooms", room.roomNum), { acType: newAc }, { merge: true });
                            }}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border cursor-pointer transition ${acType === "AC" ? "bg-blue-900/50 text-blue-300 border-blue-600 hover:bg-blue-800/50" : "bg-orange-900/30 text-orange-300 border-orange-600 hover:bg-orange-800/30"}`}
                          >
                            {acType === "AC" ? "❄ AC" : "Non-AC"}
                          </button>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${hs.badge}`}>{hs.label}</span>
                      </div>

                      {/* Luxury hotel icon */}
                      <div className="flex justify-center py-1">
                        <LuxuryHotelSVG />
                      </div>

                      {/* Room number */}
                      <div className="text-center">
                        <h4 className={`text-base font-black ${hs.roomNum}`}>Room {room.roomNum}</h4>
                      </div>

                      {/* TV toggle */}
                      <button
                        onClick={async () => {
                          await setDoc(doc(db, "rooms", room.roomNum), { hasTV: !room.hasTV }, { merge: true });
                        }}
                        className="flex items-center justify-between bg-slate-700/60 hover:bg-slate-700 rounded-lg px-2 py-1.5 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Tv className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] font-bold text-slate-300">Television</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${room.hasTV ? "bg-green-500/30 text-green-400" : "bg-slate-600 text-slate-400"}`}>
                          {room.hasTV ? "Available" : "None"}
                        </span>
                      </button>

                      {/* Check-in / Check-out */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-[9px] text-slate-400 font-semibold w-14">Check-in</span>
                          <input
                            type="date"
                            value={room.checkinDate || ""}
                            onChange={async (e) => { await setDoc(doc(db, "rooms", room.roomNum), { checkinDate: e.target.value }, { merge: true }); }}
                            className="text-[9px] font-semibold bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-200 flex-1 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarX className="w-3 h-3 text-red-400 flex-shrink-0" />
                          <span className="text-[9px] text-slate-400 font-semibold w-14">Check-out</span>
                          <input
                            type="date"
                            value={room.checkoutDate || ""}
                            onChange={async (e) => { await setDoc(doc(db, "rooms", room.roomNum), { checkoutDate: e.target.value }, { merge: true }); }}
                            className="text-[9px] font-semibold bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-200 flex-1 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Status selector */}
                      <select
                        value={hotelStatus}
                        onChange={async (e) => {
                          const newStatus = e.target.value as "vacant" | "booked" | "occupied";
                          await setDoc(doc(db, "rooms", room.roomNum), {
                            hotelStatus: newStatus,
                            occupiedCount: newStatus === "occupied" ? 1 : 0,
                            status: newStatus === "occupied" ? "fully-occupied" : "vacant"
                          }, { merge: true });
                        }}
                        className="text-[9px] font-bold border border-slate-600 rounded-lg px-2 py-1.5 bg-slate-700 text-slate-200 focus:outline-none w-full cursor-pointer"
                      >
                        <option value="vacant">🟢 Vacant</option>
                        <option value="booked">🟡 Booked</option>
                        <option value="occupied">🔴 Occupied</option>
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* ── Booking Requests ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Hotel Booking Requests</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Requests from visitors — confirm or reject offline</p>
                  </div>
                  <div className="flex gap-2 text-[9px] font-bold">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{hotelBookingRequests.filter(r => r.status === "pending").length} Pending</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{hotelBookingRequests.filter(r => r.status === "confirmed").length} Confirmed</span>
                  </div>
                </div>

                {hotelBookingRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">No booking requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {hotelBookingRequests.map((req) => (
                      <div key={req.id} className={`rounded-xl border p-4 ${
                        req.status === "pending" ? "bg-amber-50 border-amber-200" :
                        req.status === "confirmed" ? "bg-emerald-50 border-emerald-200" :
                        "bg-slate-50 border-slate-200 opacity-60"
                      }`}>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-slate-800">{req.guestName}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                req.status === "pending" ? "bg-amber-200 text-amber-800" :
                                req.status === "confirmed" ? "bg-emerald-200 text-emerald-800" :
                                "bg-slate-200 text-slate-600"
                              }`}>{req.status.toUpperCase()}</span>
                              {req.hasFemales && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Incl. Females</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500">{req.phone} · {req.email}</p>
                            <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
                              <span>Check-in: <strong>{req.checkInDate}</strong></span>
                              <span>Check-out: <strong>{req.checkOutDate}</strong></span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
                              <span>Rooms: <strong>{req.numRooms}</strong></span>
                              <span>Adults: <strong>{req.numAdults}</strong></span>
                              {req.numChildren > 0 && <span>Children: <strong>{req.numChildren}</strong></span>}
                            </div>
                            {req.notes && <p className="text-[10px] text-slate-400 italic">"{req.notes}"</p>}
                            <p className="text-[9px] text-slate-400">{new Date(req.submittedAt).toLocaleString()}</p>
                          </div>
                          {req.status === "pending" && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={async () => {
                                  await updateDoc(doc(db, "hotelBookingRequests", req.id), { status: "confirmed" });
                                }}
                                className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={async () => {
                                  await updateDoc(doc(db, "hotelBookingRequests", req.id), { status: "rejected" });
                                }}
                                className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Residents Registry Tab */}
          {activeTab === "residents" && (
            <div className="space-y-6" id="residents-tab">
              {/* Form trigger to add a resident */}
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-150 shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Manage PG Residents</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Register, transfer, update balances or view secure dossier records.</p>
                </div>
                
                <button
                  onClick={() => { resetResidentForm(); setIsAddingResident(!isAddingResident); setIsEditingResidentId(null); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-150/40"
                >
                  {isAddingResident ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isAddingResident ? "Cancel Register" : "Register New Resident"}</span>
                </button>
              </div>

              {/* Add/Edit Resident panel */}
              {isAddingResident && (
                <form onSubmit={handleAddResidentSubmit} className="bg-white p-6 rounded-2xl border border-slate-250 shadow-md space-y-6" id="add-resident-form">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
                    {isEditingResidentId ? "Edit Resident Profile Details" : "New PG Resident Registry Form"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        placeholder="Rohan Sharma"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Birth Date (DOB)</label>
                      <input
                        type="date"
                        value={resDob}
                        onChange={(e) => setResDob(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={resJoiningDate}
                        onChange={(e) => setResJoiningDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Permanent Residential Address *</label>
                      <textarea
                        required
                        rows={2}
                        value={resAddress}
                        onChange={(e) => setResAddress(e.target.value)}
                        placeholder="Complete permanent flat, street, district, state address"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Current College / Corporate Company Details</label>
                      <textarea
                        rows={2}
                        value={resCompany}
                        onChange={(e) => setResCompany(e.target.value)}
                        placeholder="E.g., Senior Analyst at TCS, or BTech Student at SRM Bangalore"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Father's & Mother's Names *</label>
                      <input
                        type="text"
                        required
                        value={resParents}
                        onChange={(e) => setResParents(e.target.value)}
                        placeholder="Father: Mohan, Mother: Suman"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Emergency Contact Person & Phone *</label>
                      <input
                        type="text"
                        required
                        value={resEmergency}
                        onChange={(e) => setResEmergency(e.target.value)}
                        placeholder="Uncle: Suresh Sharma (+91 999...)"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={resMobile}
                        onChange={(e) => setResMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">WhatsApp Number *</label>
                      <input
                        type="text"
                        required
                        value={resWhatsapp}
                        onChange={(e) => setResWhatsapp(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Assign Room Number *</label>
                      {rooms.length === 0 ? (
                        <p className="text-red-500 text-xs font-bold pt-2">Seeding suggested first!</p>
                      ) : (
                        <select
                          required
                          value={resRoomNum}
                          onChange={(e) => { setResRoomNum(e.target.value); setResBedNum(0); }}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none"
                        >
                          <option value="">-- Choose Room --</option>
                          {rooms
                            .filter(rm => rm.occupiedCount < (rm.capacity || 6) || rm.roomNum === resRoomNum)
                            .map(rm => (
                              <option key={rm.roomNum} value={rm.roomNum}>
                                Room {rm.roomNum} (Occupied: {rm.occupiedCount}/{rm.capacity || 6})
                              </option>
                            ))}
                        </select>
                      )}
                    </div>

                    {resRoomNum && (() => {
                      const selRoom = rooms.find(r => r.roomNum === resRoomNum);
                      const cap = selRoom?.capacity || 6;
                      const takenBeds = residents
                        .filter(r => r.roomNum === resRoomNum && r.bedNum && r.id !== isEditingResidentId)
                        .map(r => r.bedNum as number);
                      return (
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Assign Bed Number *</label>
                          <select
                            required
                            value={resBedNum || ""}
                            onChange={(e) => setResBedNum(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none"
                          >
                            <option value="">-- Choose Bed --</option>
                            {Array.from({ length: cap }, (_, i) => i + 1).map(n => (
                              <option key={n} value={n} disabled={takenBeds.includes(n)}>
                                Bed {n}{takenBeds.includes(n) ? " (occupied)" : " (free)"}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Pending Balance Amount (INR)</label>
                      <input
                        type="number"
                        value={resBalance}
                        onChange={(e) => setResBalance(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Special Highlight Notes</label>
                      <input
                        type="text"
                        value={resNotes}
                        onChange={(e) => setResNotes(e.target.value)}
                        placeholder="Lactose intolerant, early sleeper..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => { setIsAddingResident(false); resetResidentForm(); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4  py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-indigo-100"
                    >
                      {isEditingResidentId ? "Update Profile Records" : "Register and Post"}
                    </button>
                  </div>
                </form>
              )}

              {/* Residents Profiles search & list container */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Current active PG residents list</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Name, Room..."
                      value={residentSearchQuery}
                      onChange={(e) => setResidentSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium pl-9 pr-4 py-2 w-56 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {filteredResidents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl">
                    No residents registered or found matching search queries.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResidents.map((res) => {
                      const hasDocIds = res.idsJson && JSON.parse(res.idsJson).length > 0;
                      return (
                        <div key={res.id} className="p-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between shadow-sm transition">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{res.name}</h4>
                                <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">Room {res.roomNum}{res.bedNum ? ` · Bed ${res.bedNum}` : ""}</span>
                              </div>
                              {res.balanceAmount > 0 ? (
                                <div className="text-right">
                                  <span className="text-[9.5px] bg-red-105 text-red-750 font-bold px-1.5 py-0.5 rounded border border-red-200 inline-block">₹{res.balanceAmount.toLocaleString()} Due</span>
                                </div>
                              ) : (
                                <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">Paid</span>
                              )}
                            </div>

                            <div className="space-y-1 text-xs text-slate-550 border-t border-slate-100 pt-2.5">
                              <p className="flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{res.mobileNumber}</span>
                              </p>
                              <p className="text-[11px] leading-relaxed truncate text-slate-500">College/Company: {res.currentWorkingCompanyOrCollege}</p>
                              <p className="text-[10px] text-slate-400">Joining Date: <span className="font-semibold text-slate-550">{res.joiningDate}</span></p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center gap-3">
                            <div className="flex gap-1.5 text-xs">
                              <button
                                onClick={() => startEditResident(res)}
                                className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition"
                                title="Edit Resident"
                                type="button"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteResident(res.id)}
                                className="p-2 bg-white hover:bg-red-50 text-red-600 border border-slate-250 rounded-lg transition"
                                title="Checkout / Delete"
                                type="button"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleOpenResidentProfile(res.id)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Show Profile Dossier</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Resident Detailed Dossier Panel (Shown when resident clicked) */}
              {selectedResidentId && (
                <div className="bg-white p-6 rounded-3xl border border-slate-250/90 shadow-lg space-y-6 scroll-mt-6" id="resident-dossier-panel">
                  
                  {/* Master Header */}
                  {(() => {
                    const activeResObj = residents.find(r => r.id === selectedResidentId);
                    if (!activeResObj) return <p className="text-center font-bold">Resident data no longer exists.</p>;

                    const pHistory: PaymentRecord[] = activeResObj.paymentHistoryJson ? JSON.parse(activeResObj.paymentHistoryJson) : [];
                    const idCards: ResidentID[] = activeResObj.idsJson ? JSON.parse(activeResObj.idsJson) : [];

                    return (
                      <>
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-xl font-black text-slate-900">{activeResObj.name}</h3>
                              <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full border border-slate-200">Room {activeResObj.roomNum}</span>
                              {activeResObj.bedNum && <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">Bed {activeResObj.bedNum}</span>}
                            </div>
                            <p className="text-xs text-slate-500">Complete resident file & history dossier. Updated in real time via Firestore.</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { setSelectedResidentId(null); }}
                              className="p-1 px-3.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl shadow-sm transition"
                            >
                              Close File
                            </button>
                          </div>
                        </div>

                        {/* Bento Grid containing demographics, payments log, documents checks */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Demographics row - Column span 5 */}
                          <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Personal Demographics</span>
                            </h4>

                            <div className="space-y-3.5 text-xs">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Birth Date (DOB)</p>
                                <p className="font-semibold text-slate-800">{activeResObj.dob}</p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Mobile Number</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{activeResObj.mobileNumber}</span>
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">WhatsApp Number</p>
                                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>+{activeResObj.whatsappNumber}</span>
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Current Working Company / College</p>
                                <p className="font-semibold text-slate-800 leading-relaxed">{activeResObj.currentWorkingCompanyOrCollege}</p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Parents Info Details</p>
                                <p className="font-semibold text-slate-800 leading-relaxed">{activeResObj.parentsInformation}</p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Emergency contact Person & Ph</p>
                                <p className="font-bold text-red-750 leading-relaxed">{activeResObj.emergencyContact}</p>
                              </div>

                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Permanent Domestic Address</p>
                                <p className="font-semibold text-slate-800 leading-relaxed">{activeResObj.permanentAddress}</p>
                              </div>

                              {activeResObj.specialNotes && (
                                <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl">
                                  <p className="text-[10.5px] text-indigo-850 font-bold uppercase tracking-wide mb-0.5">Special System Notes</p>
                                  <p className="text-[11px] text-slate-650 font-medium leading-relaxed">{activeResObj.specialNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payments manager & log history column row - Column span 7 */}
                          <div className="md:col-span-7 space-y-6">
                            
                            {/* Dues & checkout pay ledger */}
                            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-105 pb-3">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5 text-indigo-650" />
                                  <span>Payment Transactions Ledger</span>
                                </h4>

                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Dues</p>
                                  <p className="text-lg font-black text-red-600 font-mono">₹{activeResObj.balanceAmount.toLocaleString()}</p>
                                </div>
                              </div>

                              {/* Form to subtract/record a payment */}
                              <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-150">
                                <div className="sm:col-span-1">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Payment Mode</label>
                                  <select
                                    value={payMode}
                                    onChange={(e: any) => setPayMode(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1.5 w-full focus:outline-none"
                                  >
                                    <option value="UPI">UPI Sync</option>
                                    <option value="Cash">Physical Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-1">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Amount Paid (₹) *</label>
                                  <input
                                    type="number"
                                    required
                                    value={payAmount === 0 ? "" : payAmount}
                                    onChange={(e) => setPayAmount(Number(e.target.value))}
                                    placeholder="Amount e.g. 2000"
                                    className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1 focus:outline-none w-full"
                                  />
                                </div>

                                <div className="sm:col-span-1">
                                  <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition cursor-pointer"
                                  >
                                    Post Payment
                                  </button>
                                </div>

                                <div className="sm:col-span-3">
                                  <input
                                    type="text"
                                    value={payNotes}
                                    onChange={(e) => setPayNotes(e.target.value)}
                                    placeholder="Payment reference description (e.g. Month April lease payment)"
                                    className="bg-white border border-slate-200 rounded-lg text-xs font-medium px-2.5 py-1 w-full focus:outline-none"
                                  />
                                </div>
                              </form>

                              {/* Payment history listing table */}
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payment Transaction History</p>
                                
                                <div className="border border-slate-150 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                                  {pHistory.length === 0 ? (
                                    <p className="p-3 text-slate-400 text-xs text-center font-medium bg-slate-50">No receipt logs created yet.</p>
                                  ) : (
                                    <table className="w-full text-left text-xs bg-white">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                                          <th className="p-2.5">Date</th>
                                          <th className="p-2.5">Description</th>
                                          <th className="p-2.5">Mode</th>
                                          <th className="p-2.5 text-right">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {pHistory.slice().reverse().map((p, idx) => (
                                          <tr key={p.id || idx} className="border-b border-slate-50 font-semibold text-slate-700">
                                            <td className="p-2.5 text-[11px] font-semibold">{p.date}</td>
                                            <td className="p-2.5 text-[11px] text-slate-500 font-medium truncate max-w-40">{p.notes}</td>
                                            <td className="p-2.5 text-[10px] font-bold"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-655">{p.paymentMode}</span></td>
                                            <td className="p-2.5 text-right text-[11px] font-bold text-indigo-600">₹{p.amount.toLocaleString()}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* ID attachment documentation manager */}
                            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 font-sans">
                              <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5 font-sans">
                                <FileText className="w-3.5 h-3.5 text-indigo-650 font-sans" />
                                <span>Checked ID Documentation Rows</span>
                              </h4>

                              {/* Upload ID form */}
                              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">ID Document Type</label>
                                    <select
                                      value={uploadedIdType}
                                      onChange={(e) => setUploadedIdType(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1.5 w-full focus:outline-none"
                                    >
                                      <option value="Aadhaar Card">Aadhaar National ID</option>
                                      <option value="College ID">College Student ID</option>
                                      <option value="Driving License">Driving License</option>
                                      <option value="Pan Card">Income PAN Card</option>
                                      <option value="Other">Other Docs Attachment</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">ID Card or Reference Label</label>
                                    <input
                                      type="text"
                                      placeholder="Aadhaar _amit.jpg"
                                      value={uploadedIdName}
                                      onChange={(e) => setUploadedIdName(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1 focus:outline-none w-full"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 items-center pt-1.5">
                                  <div className="w-full sm:flex-1 relative border border-dashed border-slate-350 bg-white p-2 text-center rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-slate-50">
                                    <Upload className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500 font-bold overflow-hidden truncate max-w-xs">{uploadedBase64 ? "✓ File chosen (ready)" : "Choose document/pic..."}</span>
                                    <input 
                                      type="file" 
                                      accept="image/*,.pdf"
                                      onChange={handleIdFileUpload}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full" 
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={submitResidentIdCard}
                                    className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm shrink-0 w-full sm:w-auto"
                                  >
                                    Upload Document ID
                                  </button>
                                </div>
                              </div>

                              {/* Displays uploaded IDs attachment */}
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MAPPED RESIDENT ID LOGS</p>
                                
                                {idCards.length === 0 ? (
                                  <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 border border-slate-100 border-dashed rounded-xl font-medium">
                                    No IDs uploaded yet for this resident. Choose image above.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {idCards.map((card) => (
                                      <div key={card.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative flex justify-between items-center group">
                                        <div className="space-y-0.5 max-w-40">
                                          <p className="text-[11px] font-extrabold text-slate-800">{card.type}</p>
                                          <p className="text-[10px] text-slate-450 truncate font-semibold">{card.idName}</p>
                                          <p className="text-[9px] text-slate-400">Uploaded: {card.uploadedAt}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {card.fileData && (
                                            <a 
                                              href={card.fileData} 
                                              download={card.idName} 
                                              className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold p-1 px-2.5 rounded-lg border border-teal-200"
                                            >
                                              View/Get
                                            </a>
                                          )}
                                          <button
                                            onClick={() => deleteResidentIdCard(card.id)}
                                            className="p-1.5 bg-white text-red-650 hover:bg-red-50 border border-slate-150 rounded"
                                            title="Delete document attachment"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div className="space-y-6" id="employees-tab">

              {/* Header + Add button */}
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-150 shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Employee Records</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{employees.filter(e => e.status === "active").length} active · {employees.filter(e => e.status === "inactive").length} inactive</p>
                </div>
                <button
                  onClick={() => { resetEmployeeForm(); setIsAddingEmployee(!isAddingEmployee); }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isAddingEmployee ? "Cancel" : "Add Employee"}
                </button>
              </div>

              {/* Add / Edit Form */}
              {isAddingEmployee && (
                <form onSubmit={handleAddEmployeeSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">
                    {isEditingEmployeeId ? "Edit Employee" : "New Employee"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Photo upload */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Employee Photo</label>
                      <div className="flex items-center gap-5">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                          {empPhoto
                            ? <img src={empPhoto} alt="preview" className="w-full h-full object-cover" />
                            : <UserCheck className="w-8 h-8 text-slate-300" />}
                        </div>
                        {/* Upload + Camera buttons */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition">
                              <Upload className="w-4 h-4 text-indigo-500" />
                              <span className="text-xs font-bold text-indigo-600">Upload file</span>
                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const compressed = await compressImage(file);
                                  setEmpPhoto(compressed);
                                } catch {
                                  alert("Could not process image. Try a different file.");
                                }
                              }} />
                            </label>
                            <button type="button" onClick={() => startCamera()}
                              className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer">
                              <Camera className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-emerald-700">Use Camera</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">Any size — auto-compressed before saving</p>
                          {empPhoto && (
                            <button type="button" onClick={() => setEmpPhoto("")}
                              className="text-[10px] text-red-500 hover:underline font-semibold text-left">
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                      <input required value={empName} onChange={e => setEmpName(e.target.value)} placeholder="e.g. Ramesh Kumar"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Role *</label>
                      <select required value={empRole} onChange={e => setEmpRole(e.target.value as Employee["role"])}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none">
                        <option value="Cook">Cook</option>
                        <option value="Cleaner">Cleaner / Housekeeping</option>
                        <option value="Security Guard">Security Guard</option>
                        <option value="Manager">Manager / Admin</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Employment Type</label>
                      <select value={empEmploymentType} onChange={e => setEmpEmploymentType(e.target.value as "Permanent" | "Temporary")}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none">
                        <option value="Permanent">Permanent</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                      <input required value={empMobile} onChange={e => setEmpMobile(e.target.value)} placeholder="10-digit mobile"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Monthly Salary (₹)</label>
                      <input type="number" value={empSalary} onChange={e => setEmpSalary(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Advance This Month (₹)</label>
                      <input type="number" value={empAdvance} onChange={e => setEmpAdvance(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Joining Date</label>
                      <input type="date" value={empJoining} onChange={e => setEmpJoining(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Permanent Address</label>
                      <input value={empAddress} onChange={e => setEmpAddress(e.target.value)} placeholder="Full address"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Emergency Contact</label>
                      <input value={empEmergency} onChange={e => setEmpEmergency(e.target.value)} placeholder="Name & number"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
                      <select value={empStatus} onChange={e => setEmpStatus(e.target.value as "active" | "inactive")}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive / Left</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Special Notes</label>
                      <input value={empNotes} onChange={e => setEmpNotes(e.target.value)} placeholder="Any notes..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-2">
                    <button type="button" onClick={() => { setIsAddingEmployee(false); resetEmployeeForm(); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm">
                      {isEditingEmployeeId ? "Save Changes" : "Add Employee"}
                    </button>
                  </div>
                </form>
              )}

              {/* Employee Cards Grid */}
              {employees.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
                  No employees added yet. Click "Add Employee" to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {employees.map((emp) => {
                    const roleColors: Record<Employee["role"], string> = {
                      "Cook":           "bg-orange-100 text-orange-700 border-orange-200",
                      "Cleaner":        "bg-teal-100 text-teal-700 border-teal-200",
                      "Security Guard": "bg-blue-100 text-blue-700 border-blue-200",
                      "Manager":        "bg-purple-100 text-purple-700 border-purple-200",
                      "Other":          "bg-slate-100 text-slate-600 border-slate-200",
                    };
                    const hasAdvance = (emp.advanceAmount || 0) > 0;
                    const netSalary = emp.salary - (emp.advanceAmount || 0);
                    const isTemp = (emp.employmentType || "Permanent") === "Temporary";

                    return (
                      <div key={emp.id} className={`bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden ${emp.status === "inactive" ? "opacity-55 border-slate-200" : "border-slate-200"}`}>

                        {/* Photo banner */}
                        <div className="relative flex flex-col items-center pt-5 pb-3 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                          <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200 flex items-center justify-center">
                            {emp.photo
                              ? <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                              : <UserCheck className="w-7 h-7 text-slate-400" />}
                          </div>
                          {/* Status dot */}
                          <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${emp.status === "active" ? "bg-green-500" : "bg-slate-400"}`} title={emp.status} />
                          <h4 className="mt-2 font-extrabold text-slate-800 text-sm leading-tight text-center">{emp.name}</h4>
                        </div>

                        {/* Info section */}
                        <div className="px-3 py-2.5 flex flex-col gap-2 flex-1">
                          {/* Badges row */}
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${roleColors[emp.role]}`}>{emp.role}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isTemp ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 border-green-200"}`}>
                              {isTemp ? "Temporary" : "Permanent"}
                            </span>
                          </div>

                          {/* Phone */}
                          <a href={`tel:${emp.mobileNumber}`} className="flex items-center gap-2 group" onClick={e => e.stopPropagation()}>
                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition">
                              <Phone className="w-3 h-3 text-indigo-600" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition">{emp.mobileNumber}</span>
                          </a>

                          {/* Joining date */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-3 h-3 text-slate-500" />
                            </div>
                            <span className="text-xs text-slate-500">Joined <span className="font-semibold text-slate-700">{emp.joiningDate}</span></span>
                          </div>

                          {/* Salary */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                              <IndianRupee className="w-3 h-3 text-slate-500" />
                            </div>
                            <span className="text-xs text-slate-500">₹<span className="font-bold text-slate-800">{emp.salary.toLocaleString()}</span>/mo</span>
                          </div>

                          {/* Advance this month */}
                          <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${hasAdvance ? "bg-red-50 border border-red-100" : "bg-green-50 border border-green-100"}`}>
                            <Briefcase className={`w-3.5 h-3.5 flex-shrink-0 ${hasAdvance ? "text-red-500" : "text-green-500"}`} />
                            {hasAdvance ? (
                              <span className="text-xs font-bold text-red-600">
                                Advance: ₹{(emp.advanceAmount).toLocaleString()}
                                <span className="font-normal text-red-400 ml-1">(net ₹{netSalary.toLocaleString()})</span>
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-green-600">No advance this month</span>
                            )}
                          </div>
                        </div>

                        {/* Actions footer */}
                        <div className="border-t border-slate-100 px-3 py-2 flex justify-end gap-2">
                          <button onClick={() => startEditEmployee(emp)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition cursor-pointer" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteEmployee(emp.id)}
                            className="p-1.5 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-lg transition cursor-pointer" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Camera capture modal */}
          {showCamera && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 rounded-3xl shadow-2xl p-4 flex flex-col items-center gap-4 w-full max-w-sm mx-4">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    Take Employee Photo
                  </h3>
                  <button type="button" onClick={stopCamera} className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition cursor-pointer">
                    <CameraOff className="w-4 h-4" />
                  </button>
                </div>

                {/* Viewfinder */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-square">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={cameraFacing === "user" ? { transform: "scaleX(-1)" } : undefined}
                  />
                  {/* Guide circle overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border-2 border-white/40 border-dashed" />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 w-full justify-center">
                  <button type="button" onClick={flipCamera}
                    className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition cursor-pointer" title="Flip camera">
                    <FlipHorizontal className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg transition cursor-pointer border-4 border-emerald-400">
                    <Camera className="w-7 h-7 text-slate-800" />
                  </button>
                  <button type="button" onClick={stopCamera}
                    className="p-3 rounded-full bg-slate-700 hover:bg-red-800 text-slate-300 hover:text-red-300 transition cursor-pointer" title="Cancel">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center">Position face inside the circle, then tap the white button</p>
              </div>
            </div>
          )}

          {/* Incoming Payments Tab */}
          {activeTab === "incomingPayments" && (() => {
            const PAYMENT_TYPE_COLORS: Record<IncomingPaymentType, string> = {
              "Hostel Resident Monthly":        "bg-indigo-100 text-indigo-700 border-indigo-200",
              "Hotel Payment":                  "bg-amber-100 text-amber-700 border-amber-200",
              "Temporary Accommodation Payment":"bg-purple-100 text-purple-700 border-purple-200",
              "Others":                         "bg-slate-100 text-slate-600 border-slate-200",
            };
            const now = new Date();
            const thisMonthKey = now.toISOString().slice(0, 7);
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);
            const thisMonthName = now.toLocaleString("default", { month: "long", year: "numeric" });
            const lastMonthName = lastMonthDate.toLocaleString("default", { month: "long", year: "numeric" });

            const thisMonthPayments = incomingPayments.filter(p => p.paymentDate.startsWith(thisMonthKey));
            const lastMonthPayments = incomingPayments.filter(p => p.paymentDate.startsWith(lastMonthKey));

            const totalThisMonth = thisMonthPayments.reduce((s, p) => s + p.amount, 0);
            const totalLastMonth = lastMonthPayments.reduce((s, p) => s + p.amount, 0);

            const pendingThisMonth = thisMonthPayments.reduce((s, p) => s + (p.balancePending || 0), 0);
            const pendingLastMonth = lastMonthPayments.reduce((s, p) => s + (p.balancePending || 0), 0);

            // Outstanding rent = sum of balanceAmount across all hostel residents (floor != 5)
            const hostelResidentRooms = new Set(rooms.filter(r => r.floor !== 5).map(r => r.roomNum));
            const hostelResidents = residents.filter(r => hostelResidentRooms.has(r.roomNum));
            const outstandingRent = hostelResidents.reduce((s, r) => s + (Number(r.balanceAmount) || 0), 0);
            const residentsWithBalance = hostelResidents.filter(r => Number(r.balanceAmount) > 0);

            return (
              <div className="space-y-6" id="incoming-payments-tab">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* This month */}
                  <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Rent Received</p>
                        <p className="text-[11px] font-bold text-slate-500">{thisMonthName}</p>
                      </div>
                    </div>
                    <p className="text-3xl font-black text-emerald-600">₹{totalThisMonth.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-slate-400">{thisMonthPayments.length} payment{thisMonthPayments.length !== 1 ? "s" : ""} recorded</p>
                      {pendingThisMonth > 0 && (
                        <p className="text-[10px] font-bold text-red-500">₹{pendingThisMonth.toLocaleString()} pending</p>
                      )}
                    </div>
                  </div>
                  {/* Last month */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Rent Received</p>
                        <p className="text-[11px] font-bold text-slate-500">{lastMonthName}</p>
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-500">₹{totalLastMonth.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-slate-400">{lastMonthPayments.length} payment{lastMonthPayments.length !== 1 ? "s" : ""} recorded</p>
                      {pendingLastMonth > 0 && (
                        <p className="text-[10px] font-bold text-red-500">₹{pendingLastMonth.toLocaleString()} pending</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Outstanding rent card */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-wider">Total Outstanding Rent</p>
                        <p className="text-[11px] text-red-400 font-medium mt-0.5">Hostel residents only · {hostelResidents.length} resident{hostelResidents.length !== 1 ? "s" : ""} total</p>
                      </div>
                    </div>
                    <p className="text-4xl font-black text-red-600">₹{outstandingRent.toLocaleString()}</p>
                  </div>
                  {residentsWithBalance.length > 0 && (
                    <div className="mt-4 border-t border-red-200 pt-3 flex flex-wrap gap-2">
                      {residentsWithBalance.map(r => (
                        <div key={r.id} className="flex items-center gap-1.5 bg-white border border-red-100 rounded-lg px-2.5 py-1.5 text-[11px]">
                          <span className="font-bold text-slate-700 truncate max-w-[90px]">{r.name}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-xs text-slate-500">R{r.roomNum}</span>
                          {r.bedNum && <><span className="text-slate-400">·</span><span className="text-xs text-slate-500">B{r.bedNum}</span></>}
                          <span className="text-slate-400">·</span>
                          <span className="font-black text-red-600">₹{Number(r.balanceAmount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {residentsWithBalance.length === 0 && outstandingRent === 0 && (
                    <p className="mt-3 text-[11px] font-bold text-emerald-600">All hostel residents are cleared — no outstanding balance.</p>
                  )}
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Incoming Payments</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{incomingPayments.length} total</p>
                  </div>
                  <button
                    onClick={() => { resetIncomingPaymentForm(); setIsAddingIncomingPayment(!isAddingIncomingPayment); }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {isAddingIncomingPayment ? "Cancel" : "Record Payment"}
                  </button>
                </div>

                {/* Add / Edit Form */}
                {isAddingIncomingPayment && (
                  <form onSubmit={handleIncomingPaymentSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
                    <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">
                      {isEditingIncomingPaymentId ? "Edit Payment" : "New Incoming Payment"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Title *</label>
                        <input required value={ipTitle} onChange={e => setIpTitle(e.target.value)} placeholder="e.g. June Rent – Room 201"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-green-500" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Payment Type *</label>
                        <select required value={ipType} onChange={e => setIpType(e.target.value as IncomingPaymentType)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none">
                          {(["Hostel Resident Monthly","Hotel Payment","Temporary Accommodation Payment","Others"] as IncomingPaymentType[]).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Date of Payment *</label>
                        <input required type="date" value={ipDate} onChange={e => setIpDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Amount (₹) *</label>
                        <input required type="number" min="1" value={ipAmount} onChange={e => setIpAmount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Payee *</label>
                        <input required value={ipPayee} onChange={e => setIpPayee(e.target.value)} placeholder="Who made this payment"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Resident Name</label>
                        <input value={ipResidentName} onChange={e => setIpResidentName(e.target.value)} placeholder="Resident name (if applicable)"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Room No.</label>
                        <input value={ipRoomNum} onChange={e => setIpRoomNum(e.target.value)} placeholder="e.g. 201"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Bed No.</label>
                        <input type="number" min="1" max="6" value={ipBedNum} onChange={e => setIpBedNum(e.target.value === "" ? "" : Number(e.target.value))} placeholder="1–6"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Balance Pending (₹)</label>
                        <input type="number" min="0" value={ipBalance} onChange={e => setIpBalance(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">PhonePe / UPI Number</label>
                        <input value={ipPhonePay} onChange={e => setIpPhonePay(e.target.value)} placeholder="UPI / PhonePe number"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Transaction / Ref No.</label>
                        <input value={ipTxn} onChange={e => setIpTxn(e.target.value)} placeholder="UPI ref / receipt no."
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Payment Mode</label>
                        <div className="flex gap-3 mt-2">
                          <button type="button" onClick={() => setIpCash(true)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${ipCash ? "bg-green-100 text-green-700 border-green-300" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                            <Banknote className="w-3.5 h-3.5" /> Cash
                          </button>
                          <button type="button" onClick={() => setIpCash(false)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${!ipCash ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                            <CreditCardIcon className="w-3.5 h-3.5" /> UPI / Online
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                        <input value={ipNotes} onChange={e => setIpNotes(e.target.value)} placeholder="Any additional notes..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-1">
                      <button type="button" onClick={() => { setIsAddingIncomingPayment(false); resetIncomingPaymentForm(); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">Cancel</button>
                      <button type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm">
                        {isEditingIncomingPaymentId ? "Save Changes" : "Record Payment"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Payment Tiles */}
                {incomingPayments.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
                    No payments recorded yet. Click "Record Payment" to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incomingPayments.map((p) => (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        {/* Top */}
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">{p.title}</h4>
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 ${PAYMENT_TYPE_COLORS[p.paymentType]}`}>{p.paymentType}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-black text-green-600">₹{p.amount.toLocaleString()}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${p.paidInCash ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                                {p.paidInCash ? "Cash" : "UPI"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="px-4 py-3 flex flex-col gap-1.5 flex-1">
                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500">{p.paymentDate}</span>
                          </div>
                          {/* Payee */}
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-700 truncate">{p.payee}</span>
                          </div>
                          {/* Room + Bed */}
                          {(p.roomNum || p.bedNum) && (
                            <div className="flex items-center gap-2">
                              <Bed className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="text-xs text-slate-500">
                                {p.roomNum ? `Room ${p.roomNum}` : ""}
                                {p.roomNum && p.bedNum ? " · " : ""}
                                {p.bedNum ? `Bed ${p.bedNum}` : ""}
                              </span>
                            </div>
                          )}
                          {/* PhonePe number */}
                          {p.phonePayNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              <span className="text-xs font-semibold text-slate-600">{p.phonePayNumber}</span>
                            </div>
                          )}
                          {/* Balance pending */}
                          {p.balancePending > 0 && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-2 py-1 mt-0.5">
                              <Receipt className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span className="text-xs font-bold text-red-600">Balance pending: ₹{p.balancePending.toLocaleString()}</span>
                            </div>
                          )}
                          {p.transactionNumber && (
                            <p className="text-[10px] text-slate-400 truncate">Txn: <span className="font-mono text-slate-600">{p.transactionNumber}</span></p>
                          )}
                          {p.notes && <p className="text-[10px] italic text-slate-400 mt-0.5">{p.notes}</p>}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-100 px-4 py-2 flex justify-end gap-2">
                          <button onClick={() => startEditIncomingPayment(p)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteIncomingPayment(p.id)}
                            className="p-1.5 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-lg transition cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Expenses Tab */}
          {activeTab === "expenses" && (() => {
            const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
              "Employee Salaries": "bg-purple-100 text-purple-700 border-purple-200",
              "Grocery Bills":     "bg-emerald-100 text-emerald-700 border-emerald-200",
              "Utility Bills":     "bg-blue-100 text-blue-700 border-blue-200",
              "Vegetables":        "bg-green-100 text-green-700 border-green-200",
              "Repairs":           "bg-orange-100 text-orange-700 border-orange-200",
              "Advance Return":    "bg-amber-100 text-amber-700 border-amber-200",
              "Others":            "bg-slate-100 text-slate-600 border-slate-200",
            };
            const now = new Date();
            const thisMonthKey = now.toISOString().slice(0, 7); // "YYYY-MM"
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);
            const thisMonthName = now.toLocaleString("default", { month: "long", year: "numeric" });
            const lastMonthName = lastMonthDate.toLocaleString("default", { month: "long", year: "numeric" });

            const totalThisMonth = expenses
              .filter(e => e.dateOfPayment.startsWith(thisMonthKey))
              .reduce((s, e) => s + e.amount, 0);
            const totalLastMonth = expenses
              .filter(e => e.dateOfPayment.startsWith(lastMonthKey))
              .reduce((s, e) => s + e.amount, 0);

            return (
              <div className="space-y-6" id="expenses-tab">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{thisMonthName}</p>
                      <p className="text-2xl font-black text-slate-900">₹{totalThisMonth.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {expenses.filter(e => e.dateOfPayment.startsWith(thisMonthKey)).length} expense{expenses.filter(e => e.dateOfPayment.startsWith(thisMonthKey)).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{lastMonthName}</p>
                      <p className="text-2xl font-black text-slate-500">₹{totalLastMonth.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {expenses.filter(e => e.dateOfPayment.startsWith(lastMonthKey)).length} expense{expenses.filter(e => e.dateOfPayment.startsWith(lastMonthKey)).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Expense Records</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{expenses.length} total</p>
                  </div>
                  <button
                    onClick={() => { resetExpenseForm(); setIsAddingExpense(!isAddingExpense); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {isAddingExpense ? "Cancel" : "Add Expense"}
                  </button>
                </div>

                {/* Add / Edit Form */}
                {isAddingExpense && (
                  <form onSubmit={handleAddExpenseSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
                    <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">
                      {isEditingExpenseId ? "Edit Expense" : "New Expense"}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Title *</label>
                        <input required value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="e.g. August Grocery Run"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Expense Type *</label>
                        <select required value={expType} onChange={e => setExpType(e.target.value as ExpenseType)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none">
                          {(["Employee Salaries","Grocery Bills","Utility Bills","Vegetables","Repairs","Advance Return","Others"] as ExpenseType[]).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Recipient *</label>
                        <input required value={expRecipient} onChange={e => setExpRecipient(e.target.value)} placeholder="Person who received payment"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Recipient Company</label>
                        <input value={expCompany} onChange={e => setExpCompany(e.target.value)} placeholder="Company / Shop name"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Recipient Phone</label>
                        <input value={expPhone} onChange={e => setExpPhone(e.target.value)} placeholder="Phone number"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Date of Payment *</label>
                        <input required type="date" value={expDate} onChange={e => setExpDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Time of Payment</label>
                        <input type="time" value={expTime} onChange={e => setExpTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Amount Paid (₹) *</label>
                        <input required type="number" min="1" value={expAmount} onChange={e => setExpAmount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Balance Pending (₹)</label>
                        <input type="number" min="0" value={expBalance} onChange={e => setExpBalance(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Transaction / Reference No.</label>
                        <input value={expTxn} onChange={e => setExpTxn(e.target.value)} placeholder="UPI ref / cheque no."
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Paid By</label>
                        <input value={expPaidBy} onChange={e => setExpPaidBy(e.target.value)} placeholder="Name of person who paid"
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Payment Mode</label>
                        <div className="flex gap-3 mt-2">
                          <button type="button" onClick={() => setExpCash(true)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${expCash ? "bg-green-100 text-green-700 border-green-300" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                            <Banknote className="w-3.5 h-3.5" /> Cash
                          </button>
                          <button type="button" onClick={() => setExpCash(false)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${!expCash ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                            <CreditCardIcon className="w-3.5 h-3.5" /> Online / UPI
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                        <input value={expNotes} onChange={e => setExpNotes(e.target.value)} placeholder="Any additional notes..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-1">
                      <button type="button" onClick={() => { setIsAddingExpense(false); resetExpenseForm(); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
                        Cancel
                      </button>
                      <button type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm">
                        {isEditingExpenseId ? "Save Changes" : "Record Expense"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Expense Tiles */}
                {expenses.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
                    No expenses recorded yet. Click "Add Expense" to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenses.map((exp) => (
                      <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        {/* Color bar + title */}
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">{exp.title}</h4>
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 ${EXPENSE_TYPE_COLORS[exp.expenseType]}`}>{exp.expenseType}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-black text-slate-800">₹{exp.amount.toLocaleString()}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${exp.paidInCash ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                                {exp.paidInCash ? "Cash" : "Online"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="px-4 py-3 flex flex-col gap-1.5 flex-1">
                          {/* Recipient */}
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-700 truncate">{exp.recipient}{exp.recipientCompany ? ` · ${exp.recipientCompany}` : ""}</span>
                          </div>
                          {/* Date + Time */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500">{exp.dateOfPayment}{exp.timeOfPayment ? ` at ${exp.timeOfPayment}` : ""}</span>
                          </div>
                          {/* Phone */}
                          {exp.recipientPhone && (
                            <a href={`tel:${exp.recipientPhone}`} className="flex items-center gap-2 group">
                              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition">
                                <Phone className="w-2.5 h-2.5 text-indigo-600" />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition">{exp.recipientPhone}</span>
                            </a>
                          )}
                          {/* Balance pending */}
                          {exp.balancePending > 0 && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-2 py-1 mt-0.5">
                              <Receipt className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span className="text-xs font-bold text-red-600">Balance pending: ₹{exp.balancePending.toLocaleString()}</span>
                            </div>
                          )}
                          {/* Paid by */}
                          {exp.paidBy && (
                            <p className="text-[10px] text-slate-400">Paid by: <span className="font-semibold text-slate-600">{exp.paidBy}</span></p>
                          )}
                          {exp.transactionNumber && (
                            <p className="text-[10px] text-slate-400 truncate">Txn: <span className="font-mono text-slate-600">{exp.transactionNumber}</span></p>
                          )}
                          {exp.notes && <p className="text-[10px] italic text-slate-400 mt-0.5">{exp.notes}</p>}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-100 px-4 py-2 flex justify-end gap-2">
                          <button onClick={() => startEditExpense(exp)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-lg transition cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Reports Tab */}
          {activeTab === "reports" && (() => {
            // Compute date range from mode
            const today = new Date();
            let rangeStart = "";
            let rangeEnd = "";

            if (reportMode === "lastWeek") {
              const end = new Date(today);
              end.setDate(today.getDate() - 1);
              const start = new Date(end);
              start.setDate(end.getDate() - 6);
              rangeStart = start.toISOString().slice(0, 10);
              rangeEnd = end.toISOString().slice(0, 10);
            } else if (reportMode === "lastMonth") {
              const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lmEnd = new Date(today.getFullYear(), today.getMonth(), 0);
              rangeStart = lm.toISOString().slice(0, 10);
              rangeEnd = lmEnd.toISOString().slice(0, 10);
            } else {
              rangeStart = reportStartDate;
              rangeEnd = reportEndDate;
            }

            const inRange = (date: string) => date >= rangeStart && date <= rangeEnd;

            const filteredExpenses = expenses.filter(e => inRange(e.dateOfPayment));
            const filteredPayments = incomingPayments.filter(p => inRange(p.paymentDate));

            const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
            const totalIncomingRaw = filteredPayments.reduce((s, p) => s + p.amount, 0);

            // June 2026 net profit carried forward into July 2026
            const june2026Incoming = incomingPayments
              .filter(p => p.paymentDate.startsWith("2026-06"))
              .reduce((s, p) => s + p.amount, 0);
            const june2026Expenses = expenses
              .filter(e => e.dateOfPayment.startsWith("2026-06"))
              .reduce((s, e) => s + e.amount, 0);
            const june2026NetProfit = june2026Incoming - june2026Expenses; // no rent in June
            // Apply carry-forward only when the report range overlaps July 2026
            const rangeIncludesJuly2026 = rangeStart <= "2026-07-31" && rangeEnd >= "2026-07-01";
            const carryForward = rangeIncludesJuly2026 ? june2026NetProfit : 0;
            const totalIncoming = totalIncomingRaw + carryForward;

            // Building rent of ₹4.5L/month starts from July 2026
            const RENT_START = "2026-07-01";
            let effectiveBuildingRent = 0;
            if (rangeStart && rangeEnd && rangeEnd >= RENT_START) {
              const effectiveStart = rangeStart < RENT_START ? new Date(RENT_START) : new Date(rangeStart);
              const effectiveEnd = new Date(rangeEnd);
              const rentMonths =
                (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12 +
                (effectiveEnd.getMonth() - effectiveStart.getMonth()) + 1;
              effectiveBuildingRent = Math.max(0, rentMonths) * BUILDING_RENT;
            }
            const netProfit = totalIncoming - totalExpenses - effectiveBuildingRent;

            const rangeLabel = reportMode === "lastWeek"
              ? "Last 7 Days"
              : reportMode === "lastMonth"
              ? new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleString("default", { month: "long", year: "numeric" })
              : (rangeStart && rangeEnd ? `${rangeStart} to ${rangeEnd}` : "Custom Range");

            const canGenerate = reportMode !== "custom" || (reportStartDate && reportEndDate && reportStartDate <= reportEndDate);

            // Expense breakdown by type
            const expenseByType: Record<string, number> = {};
            filteredExpenses.forEach(e => {
              expenseByType[e.expenseType] = (expenseByType[e.expenseType] || 0) + e.amount;
            });

            // Incoming breakdown by type
            const incomeByType: Record<string, number> = {};
            filteredPayments.forEach(p => {
              incomeByType[p.paymentType] = (incomeByType[p.paymentType] || 0) + p.amount;
            });

            // Resident count for the period
            // Hostel residents only (rooms not on floor 5)
            const hostelRoomNums = new Set(rooms.filter(r => r.floor !== 5).map(r => r.roomNum));
            // Present during period = joined on or before rangeEnd
            const residentsPresent = residents.filter(r =>
              hostelRoomNums.has(r.roomNum) && r.joiningDate <= rangeEnd
            );
            // New joinings within the period
            const residentsJoinedInRange = residentsPresent.filter(r => r.joiningDate >= rangeStart);

            return (
              <div className="space-y-6" id="reports-tab">
                {/* Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Generate Report</h3>

                  {/* Quick selectors */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {([["lastWeek", "Last Week"], ["lastMonth", "Last Month"], ["custom", "Custom Range"]] as const).map(([mode, label]) => (
                      <button key={mode} type="button"
                        onClick={() => setReportMode(mode)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          reportMode === mode
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-2 mt-1 mb-3">
                    <button
                      type="button"
                      onClick={() => setReportShowResidents(v => !v)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        reportShowResidents
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Resident Count
                    </button>
                  </div>

                  {/* Custom date range */}
                  {reportMode === "custom" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                        <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                        <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>

                {canGenerate && (
                  <>
                    {/* Period label */}
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{rangeLabel}</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* 4 metric cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Total Incoming */}
                      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Incoming Payments</p>
                        <p className="text-3xl font-black text-emerald-600">₹{totalIncoming.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}</p>
                        {Object.entries(incomeByType).map(([type, amt]) => (
                          <div key={type} className="flex justify-between items-center mt-1.5">
                            <span className="text-[10px] text-slate-500 truncate">{type}</span>
                            <span className="text-[10px] font-bold text-slate-700">₹{amt.toLocaleString()}</span>
                          </div>
                        ))}
                        {carryForward !== 0 && (
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-emerald-100">
                            <span className="text-[10px] text-emerald-700 font-bold">Carried forward (June 2026)</span>
                            <span className={`text-[10px] font-black ${carryForward >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {carryForward >= 0 ? "+" : "−"}₹{Math.abs(carryForward).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total Expenses */}
                      <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Expenses</p>
                        <p className="text-3xl font-black text-red-500">₹{totalExpenses.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}</p>
                        {Object.entries(expenseByType).map(([type, amt]) => (
                          <div key={type} className="flex justify-between items-center mt-1.5">
                            <span className="text-[10px] text-slate-500 truncate">{type}</span>
                            <span className="text-[10px] font-bold text-slate-700">₹{amt.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Building Rent */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Building Rent</p>
                        <p className="text-3xl font-black text-slate-600">₹{effectiveBuildingRent.toLocaleString()}</p>
                        {effectiveBuildingRent === 0
                          ? <p className="text-[10px] text-emerald-600 font-bold mt-1">No rent — starts July 2026</p>
                          : <p className="text-[10px] text-slate-400 mt-1">₹{BUILDING_RENT.toLocaleString()} × {effectiveBuildingRent / BUILDING_RENT} month{effectiveBuildingRent / BUILDING_RENT !== 1 ? "s" : ""}</p>
                        }
                      </div>

                      {/* Net Profit */}
                      <div className={`rounded-2xl p-5 shadow-sm border ${netProfit >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Net Profit</p>
                        <p className={`text-3xl font-black ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {netProfit < 0 ? "-" : ""}₹{Math.abs(netProfit).toLocaleString()}
                        </p>
                        <div className="mt-3 space-y-1 border-t border-slate-200 pt-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Incoming Payments</span>
                            <span className="font-bold text-emerald-600">+ ₹{totalIncomingRaw.toLocaleString()}</span>
                          </div>
                          {carryForward !== 0 && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500">Carried fwd (June '26)</span>
                              <span className={`font-bold ${carryForward >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {carryForward >= 0 ? "+" : "−"}₹{Math.abs(carryForward).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Expenses</span>
                            <span className="font-bold text-red-500">− ₹{totalExpenses.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Building Rent</span>
                            <span className="font-bold text-red-500">− ₹{effectiveBuildingRent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px] border-t border-slate-200 pt-1 mt-1">
                            <span className="font-black text-slate-700">Net</span>
                            <span className={`font-black ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {netProfit < 0 ? "−" : "+"} ₹{Math.abs(netProfit).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Pie Charts */}
                    {(() => {
                      const hostelRooms = rooms.filter(r => r.floor !== 5);
                      const hotelRooms  = rooms.filter(r => r.floor === 5);

                      const hostelTotalBeds    = hostelRooms.reduce((s, r) => s + (r.capacity || 0), 0);
                      const hostelOccupied     = hostelRooms.reduce((s, r) => s + (r.occupiedCount || 0), 0);
                      const hostelVacant       = hostelTotalBeds - hostelOccupied;

                      const hotelTotal    = hotelRooms.length;
                      const hotelOccupied = hotelRooms.filter(r => r.hotelStatus === "occupied").length;
                      const hotelBooked   = hotelRooms.filter(r => r.hotelStatus === "booked").length;
                      const hotelVacant   = hotelRooms.filter(r => !r.hotelStatus || r.hotelStatus === "vacant").length;

                      const hostelPct = hostelTotalBeds > 0 ? Math.round((hostelOccupied / hostelTotalBeds) * 100) : 0;
                      const hotelPct  = hotelTotal > 0 ? Math.round(((hotelOccupied + hotelBooked) / hotelTotal) * 100) : 0;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Hostel Pie */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Hostel Bed Occupancy</p>
                            <div className="flex items-center gap-6">
                              <DonutChart
                                total={hostelTotalBeds}
                                centerLabel={`${hostelPct}%`}
                                segments={[
                                  { value: hostelOccupied, color: "#6366f1", label: "Occupied" },
                                  { value: hostelVacant,   color: "#e2e8f0", label: "Vacant"   },
                                ]}
                              />
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-sm bg-indigo-500 flex-shrink-0" />
                                  <span className="text-xs text-slate-600">Occupied</span>
                                  <span className="ml-auto font-black text-slate-800 text-sm">{hostelOccupied}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-sm bg-slate-200 flex-shrink-0" />
                                  <span className="text-xs text-slate-600">Vacant</span>
                                  <span className="ml-auto font-black text-slate-800 text-sm">{hostelVacant}</span>
                                </div>
                                <div className="border-t border-slate-100 pt-1.5 flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">Total beds</span>
                                  <span className="ml-auto font-black text-slate-700 text-xs">{hostelTotalBeds}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">Rooms</span>
                                  <span className="ml-auto font-black text-slate-700 text-xs">{hostelRooms.length}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hotel Pie */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Hotel Room Occupancy</p>
                            <div className="flex items-center gap-6">
                              <DonutChart
                                total={hotelTotal}
                                centerLabel={`${hotelPct}%`}
                                segments={[
                                  { value: hotelOccupied, color: "#3b82f6", label: "Occupied" },
                                  { value: hotelBooked,   color: "#f59e0b", label: "Booked"   },
                                  { value: hotelVacant,   color: "#e2e8f0", label: "Vacant"   },
                                ]}
                              />
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-sm bg-blue-500 flex-shrink-0" />
                                  <span className="text-xs text-slate-600">Occupied</span>
                                  <span className="ml-auto font-black text-slate-800 text-sm">{hotelOccupied}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-sm bg-amber-400 flex-shrink-0" />
                                  <span className="text-xs text-slate-600">Booked</span>
                                  <span className="ml-auto font-black text-slate-800 text-sm">{hotelBooked}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-sm bg-slate-200 flex-shrink-0" />
                                  <span className="text-xs text-slate-600">Vacant</span>
                                  <span className="ml-auto font-black text-slate-800 text-sm">{hotelVacant}</span>
                                </div>
                                <div className="border-t border-slate-100 pt-1.5 flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">Total rooms</span>
                                  <span className="ml-auto font-black text-slate-700 text-xs">{hotelTotal}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Resident Count Card */}
                    {reportShowResidents && (
                      <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hostel Residents</p>
                            <p className="text-[11px] text-slate-400 font-medium">Joined on or before {rangeEnd}</p>
                          </div>
                        </div>
                        <p className="text-3xl font-black text-indigo-600">{residentsPresent.length}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {residentsJoinedInRange.length > 0
                            ? `${residentsJoinedInRange.length} new joining${residentsJoinedInRange.length !== 1 ? "s" : ""} during this period`
                            : "No new joinings during this period"}
                        </p>
                        {residentsJoinedInRange.length > 0 && (
                          <div className="mt-3 border-t border-indigo-50 pt-3 flex flex-wrap gap-2">
                            {residentsJoinedInRange.map(r => (
                              <div key={r.id} className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-2.5 py-1 text-[11px]">
                                <span className="font-bold text-indigo-700 truncate max-w-[100px]">{r.name}</span>
                                <span className="text-indigo-300">·</span>
                                <span className="text-indigo-500">R{r.roomNum}{r.bedNum ? ` B${r.bedNum}` : ""}</span>
                                <span className="text-indigo-300">·</span>
                                <span className="text-indigo-400">{r.joiningDate}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {!canGenerate && reportMode === "custom" && (
                  <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
                    Select a valid start and end date to generate the report.
                  </div>
                )}
              </div>
            );
          })()}

          {/* Alarm Reminders creator Tab */}
          {activeTab === "reminders" && (
            <div className="space-y-6" id="reminders-tab">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">Configure Event Alarm reminders</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Schedule alerts for individual calendar days or recurring sequences such as <span className="font-bold">Every Sunday</span> and the <span className="font-bold">1st of every Month</span> to systematise PG housekeeping and rental invoice tracking.
                </p>

                {/* Standard form to create new reminder */}
                <form onSubmit={handleAddReminderSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-black text-slate-550 uppercase mb-1">Reminder Action Title *</label>
                    <input
                      type="text"
                      required
                      value={remTitle}
                      onChange={(e) => setRemTitle(e.target.value)}
                      placeholder="e.g. Conduct water tank chlorine treatment"
                      className="w-full bg-white border border-slate-205 rounded-lg text-xs font-semibold px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-black text-slate-550 uppercase mb-1">Frequency Rule</label>
                    <select
                      value={remType}
                      onChange={(e: any) => setRemType(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-lg text-xs font-semibold px-2 py-2 focus:outline-none"
                    >
                      <option value="specific-date">Specific Calendar Date</option>
                      <option value="sunday">Weekly (Every Sunday)</option>
                      <option value="monthly-1st">Monthly (1st of Month)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-550 uppercase mb-1">Date Parameter</label>
                    {remType === "specific-date" ? (
                      <input
                        type="date"
                        required
                        value={remDate}
                        onChange={(e) => setRemDate(e.target.value)}
                        className="w-full bg-white border border-slate-205 rounded-lg text-xs font-semibold px-2 py-1.5 focus:outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={remType === "sunday" ? "Sunday" : "1st of Month"}
                        className="w-full bg-slate-100 text-slate-400 border border-slate-205 rounded-lg text-xs font-bold px-3 py-2"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Add Reminder
                    </button>
                  </div>
                </form>

                {/* Active Reminders List */}
                <div className="pt-3">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">SYSTEM-WIDE LIVE ALARMS ({reminders.length})</p>
                  
                  {reminders.length === 0 ? (
                    <p className="p-6 text-center text-slate-500 font-medium bg-slate-50 border border-slate-100 rounded-xl">
                      No alerts configured currently. Click "Seed database" or add custom ones above.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reminders.map((rem) => (
                        <div key={rem.id} className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center transition">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{rem.title}</h4>
                            <div className="flex gap-2 items-center text-[10.5px] font-bold">
                              <span className={`px-2 py-0.5 rounded uppercase ${
                                rem.type === "sunday" 
                                  ? "bg-purple-50 text-purple-800 border border-purple-200" 
                                  : rem.type === "monthly-1st" 
                                    ? "bg-blue-50 text-blue-800 border border-blue-200" 
                                    : "bg-indigo-50 text-indigo-850 border border-indigo-200"
                              }`}>
                                {rem.type}
                              </span>
                              <span className="text-slate-400">Schedule: {rem.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Toggle checkbox */}
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={rem.active} 
                                onChange={() => toggleReminderActive(rem.id ?? "", rem.active)}
                                className="sr-only peer" 
                              />
                              <div className="w-8 h-4 bg-slate-200 hover:bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>

                            <button
                              onClick={() => deleteReminder(rem.id ?? "")}
                              className="p-1 px-2.5 bg-slate-50 hover:bg-red-50 text-red-650 hover:text-red-700 border border-slate-200 rounded-lg transition"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Visitor Enquiries & outgoing mail Logs tab */}
          {activeTab === "enquiries" && (
            <div className="space-y-6" id="enquiries-tab">
              
              {/* Table of active enquiries */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 font-sans">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-sans">Incoming Room Enquiries logged</h3>
                    <p className="text-xs text-slate-550 mt-1">Directly integrated with student visitor landing forms. Every submission logged here.</p>
                  </div>
                  <span className="bg-amber-50 text-amber-800 border border-amber-250 text-xs font-bold px-3 py-1 rounded-xl">
                    {enquiries.filter(e => e.status === "Pending").length} Action Pending
                  </span>
                </div>

                {enquiries.length === 0 ? (
                  <p className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl font-medium">
                    No enquiries logged yet from the visitor landing page.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs bg-white">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-extrabold text-[9px] uppercase tracking-wide">
                          <th className="p-3">Visitor Details</th>
                          <th className="p-3">Target Sharing preference</th>
                          <th className="p-3">Expected Intake date</th>
                          <th className="p-3 text-center">Inquiry status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.map((e) => (
                          <tr key={e.id} className="border-b border-slate-100 font-semibold text-slate-800">
                            <td className="p-3 leading-relaxed">
                              <p className="font-extrabold text-sm">{e.name}</p>
                              <p className="text-[11px] text-slate-500 font-medium">Email: {e.email}</p>
                              <p className="text-[11px] text-slate-500 font-medium">Ph: {e.phone}</p>
                              <p className="text-[10px] text-slate-400">College: {e.companyCollege || "N/A"}</p>
                            </td>
                            <td className="p-3 font-bold text-slate-650">
                              <span className="bg-indigo-50 text-indigo-950 px-2.5 py-0.5 rounded-lg border border-indigo-150 font-extrabold">{e.sharingInterest}</span>
                            </td>
                            <td className="p-3 font-bold text-slate-600">{e.expectedJoiningDate}</td>
                            <td className="p-3 text-center">
                              <select
                                value={e.status}
                                        onChange={(evt) => updateEnquiryStatus(e.id, evt.target.value as any)}
                                        className={`text-[10.5px] font-black border rounded px-2.5 py-1 focus:outline-none ${
                                          e.status === "Pending" 
                                            ? "bg-amber-5 text-amber-800 border-amber-250" 
                                            : e.status === "Contacted" 
                                              ? "bg-blue-5 text-blue-800 border-blue-200" 
                                              : "bg-emerald-5 text-emerald-850 border-emerald-200"
                                        }`}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Closed">Closed / Booked</option>
                                      </select>
                                    </td>
                                    <td className="p-3 text-right">
                                      <a
                                        href={`mailto:${e.email}?subject=Regarding your MiSpace PG Inquiry&body=Hi ${e.name}, thanks for inquiring regarding the ${e.sharingInterest} spots...`}
                                        className="bg-slate-50 hover:bg-slate-105 text-slate-700 font-bold text-[10.5px] p-1.5 px-3 rounded-lg border border-slate-205 mr-2 inline-block shadow-sm text-center"
                                      >
                                        Reply Mail
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
        
                      {/* Express Server Outgoing Email simulator Logs */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">Transactional Alert Email System Logs</h3>
                            <p className="text-xs text-slate-450 mt-1">Live routing logs fetched directly from Express API route `/api/emails`.</p>
                          </div>
                          <button 
                            onClick={fetchServerEmails}
                            className="p-1 px-3 bg-slate-50 hover:bg-slate-150 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Synchronize Logs</span>
                          </button>
                        </div>
        
                        <div className="space-y-3.5 font-mono max-h-[350px] overflow-y-auto pr-1">
                          {serverEmails.length === 0 ? (
                            <p className="text-xs text-slate-450 p-6 bg-slate-50 rounded-xl text-center">No transactional alerts have fired yet.</p>
                          ) : (
                            serverEmails.map((mail, idx) => (
                              <div key={mail.id || idx} className="p-3.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs space-y-2">
                                <div className="flex justify-between items-center text-[10.5px] border-b border-slate-800 pb-2">
                                  <span className="text-indigo-400 font-black">SMTP TRIGGER DISPATCHED</span>
                                  <span className="text-slate-500 font-bold">Fired: {new Date(mail.timestamp).toLocaleTimeString()}</span>
                                </div>
                        
                        <div className="space-y-1">
                          <p><span className="text-amber-500 font-bold">To:</span> {mail.to}</p>
                          <p><span className="text-amber-500 font-bold">Subject:</span> {mail.subject}</p>
                          <p><span className="text-amber-500 font-bold">Router:</span> Formspree/Mailjet Simulated Relay</p>
                        </div>
                        
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {mail.body}
                        </div>

                        <div className="text-[10px] text-emerald-400 font-black flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Status: {mail.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
