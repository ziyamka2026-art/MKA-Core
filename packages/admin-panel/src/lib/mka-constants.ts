export const DOC_TYPES = [
  "قانون",
  "بخشنامه",
  "دستورالعمل",
  "آیین‌نامه",
  "رأی دیوان",
  "ابلاغیه",
  "سایر",
] as const;

export const INDEX_STATUSES = [
  "شناسایی‌شده",
  "دریافت‌شده",
  "در حال ایندکس",
  "ایندکس‌شده",
  "رد‌شده",
] as const;

export const APP_ROLES = ["owner", "manager", "expert", "viewer"] as const;

export const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  manager: "مدیر",
  expert: "کارشناس",
  viewer: "بازدیدکننده",
};

export const LAW_CATEGORIES = [
  { priority: 1, name: "مالیات‌های مستقیم", drive: "1 - قانون مالیات های مستقیم" },
  { priority: 2, name: "مالیات بر ارزش افزوده ۱۴۰۰", drive: "2 - قانون مالیات بر ارزش افزوده" },
  {
    priority: 3,
    name: "پایانه‌های فروشگاهی و سامانه مؤدیان",
    drive: "3 - قانون پایانه های فروشگاهی",
  },
  { priority: 4, name: "مالیات بر سوداگری و سفته‌بازی", drive: "4 - قانون مبارزه با سوداگری" },
  { priority: 5, name: "احکام مالیاتی بودجه + برنامه هفتم", drive: "5 و 6" },
  { priority: 6, name: "آراء دیوان عدالت اداری", drive: "دیوان" },
  { priority: 7, name: "سایر مواد مالیاتی قوانین موضوعه", drive: "ALTIP" },
] as const;

export const TRUSTED_SOURCES = [
  { rank: 1, domain: "regulation.tax.gov.ir", note: "مقررات سازمان امور مالیاتی" },
  { rank: 2, domain: "qavanin.ir / rrk.ir", note: "قوانین و مقررات رسمی" },
  { rank: 3, domain: "intamedia.ir / tax.gov.ir", note: "ابلاغیه‌های سازمان" },
  { rank: 4, domain: "hamrahyaar.com", note: "تجمیع‌کننده — پس از تطبیق رسمی" },
  { rank: 5, domain: "divan-edalat.ir", note: "آراء دیوان عدالت اداری" },
] as const;

export const PHASES = [
  {
    code: "A",
    title: "فاز A — بانک اطلاعاتی",
    items: ["Registry", "ایندکس قوانین", "Citation"],
  },
  {
    code: "B",
    title: "فاز B — کانال‌ها و بازارگاه",
    items: ["تلگرام/بله", "مشاور و مودی"],
  },
  {
    code: "W",
    title: "موتور بخشودگی جرائم",
    items: ["محاسبه‌گر وب مطابق ۲۰۰/۱۴۰۴/۵۰۴", "تأیید انسانی"],
  },
] as const;

export const OWNER_DISPLAY_NAME = "ضیاءالدین موسوی جراحی";

export const ADVISOR = {
  title: "ارتباط با مشاور رسمی مالیاتی",
  name: OWNER_DISPLAY_NAME,
  role: "مشاور رسمی مالیاتی",
  mobile: "09153068322",
  tel: "tel:+989153068322",
  text: "در صورت نیاز به مشاوره آنلاین و تهیه لایحه دفاعی منطبق بر قوانین موضوعه کشور می‌توانید از طریق اپلیکیشن‌های داخلی و خارجی و شماره همراه زیر با مشاور در تماس باشید:",
} as const;

export const PRIMARY_KNOWLEDGE_DRIVE_ID = "1Jx0cipUqQyGnJk4hFCURzWIg1Abo1Del";
export const PRIMARY_KNOWLEDGE_DRIVE_URL = `https://drive.google.com/drive/folders/${PRIMARY_KNOWLEDGE_DRIVE_ID}`;
export const FALLBACK_KNOWLEDGE_DRIVE_ID = "1NcBkZOTemmVfnNKY7FgxuqbIXj6f4Dtl";
export const FALLBACK_KNOWLEDGE_DRIVE_URL = `https://drive.google.com/drive/folders/${FALLBACK_KNOWLEDGE_DRIVE_ID}`;
export const REGISTRY_FOLDER_ID = "1LmVU0WnD_-qlzs8Upv2HkpI-dYrUfkqg";
export const REGISTRY_SHEET_ID = "1nG3HwfhXwJYcUo6ljzXPy9mUv0eebn0B";
export const REGISTRY_SHEET_URL = `https://docs.google.com/spreadsheets/d/${REGISTRY_SHEET_ID}`;

export const ESSENTIAL_LAWS = [
  { priority: 1, name: "مالیات‌های مستقیم" },
  { priority: 2, name: "مالیات بر ارزش افزوده ۱۴۰۰" },
  { priority: 3, name: "پایانه‌های فروشگاهی و سامانه مؤدیان" },
  { priority: 4, name: "مالیات بر سوداگری و سفته‌بازی" },
  { priority: 5, name: "احکام مالیاتی بودجه + برنامه هفتم" },
] as const;

export const KNOWLEDGE_DRIVE_URL = PRIMARY_KNOWLEDGE_DRIVE_URL;
export const REGISTRY_FOLDER_URL = `https://drive.google.com/drive/folders/${REGISTRY_FOLDER_ID}`;
