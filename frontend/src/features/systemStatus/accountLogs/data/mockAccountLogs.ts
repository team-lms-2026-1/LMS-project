// import type { AccountLogDetail, AccountSummary } from "../types";

// export const mockAccounts: AccountSummary[] = [
//   {
//     accountId: "A1800001",
//     role: "관리자",
//     name: "김관리",
//     department: "행정지원팀",
//     lastAccessAt: "2026.01.09 20:30:00",
//     status: "LOGGED_IN",
//   },
//   {
//     accountId: "P1000023",
//     role: "교수",
//     name: "김교수",
//     department: "컴퓨터공학과",
//     lastAccessAt: "2026.01.09 20:30:00",
//     status: "LOGGED_IN",
//   },
//   {
//     accountId: "P1200031",
//     role: "교수",
//     name: "나교수",
//     department: "전자공학과",
//     lastAccessAt: "2026.01.09 20:30:00",
//     status: "LOGGED_IN",
//   },
//   {
//     accountId: "S201064",
//     role: "학생",
//     name: "최학생",
//     department: "컴퓨터공학과",
//     lastAccessAt: "2026.01.09 20:30:00",
//     status: "LOGGED_OUT",
//   },
// ];

// export const mockAccountDetails: Record<string, AccountLogDetail> = {
//   A1800001: {
//     account: mockAccounts[0],
//     logs: [
//       { seq: 5555555, at: "2026.01.09 20:30:00", url: "/admin/login", ip: "200.001.43.435", userAgent: "Windows 10 (Chrome)" },
//       { seq: 5555554, at: "2026.01.09 20:30:00", url: "/admin/notices", ip: "200.041.94.195", userAgent: "Windows 10 (Chrome)" },
//       { seq: 5555553, at: "2026.01.09 20:30:00", url: "/admin/account-logs", ip: "200.882.03.045", userAgent: "Windows 10 (Chrome)" },
//     ],
//   },
//   P1000023: {
//     account: mockAccounts[1],
//     logs: [
//       { seq: 5555555, at: "2026.01.09 20:30:00", url: "/professor/login", ip: "120.001.43.435", userAgent: "macOS (Safari)" },
//       { seq: 5555554, at: "2026.01.09 20:30:00", url: "/professor/course/list", ip: "120.041.94.195", userAgent: "macOS (Safari)" },
//     ],
//   },
//   P1200031: {
//     account: mockAccounts[2],
//     logs: [
//       { seq: 5555555, at: "2026.01.09 20:30:00", url: "/professor/login", ip: "121.001.43.435", userAgent: "iOS 17 (Safari)" },
//     ],
//   },
//   S201064: {
//     account: mockAccounts[3],
//     logs: [
//       { seq: 5555555, at: "2026.01.09 20:30:00", url: "/student/login", ip: "200.001.43.435", userAgent: "Android 13 (Chrome)" },
//       { seq: 5555554, at: "2026.01.09 20:30:00", url: "/student/logout", ip: "200.041.94.195", userAgent: "Android 13 (Chrome)" },
//       { seq: 5555553, at: "2026.01.09 20:30:00", url: "/student/mypage", ip: "200.882.03.045", userAgent: "iOS 17 (Safari)" },
//       { seq: 5555552, at: "2026.01.09 20:30:00", url: "/student/course/list", ip: "200.331.79.982", userAgent: "Windows 10 (Chrome)" },
//     ],
//   },
// };

// export function getAccountDetail(accountId: string) {
//   return mockAccountDetails[accountId] ?? null;
// }
