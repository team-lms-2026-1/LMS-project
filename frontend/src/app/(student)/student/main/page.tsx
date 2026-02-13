import { Metadata } from "next";
import MypageContainer from "@/features/student/mypage/components/MypageContainer";

export const metadata: Metadata = {
  title: "메인 - 학생",
  description: "학생 메인 페이지",
};

export default function StudentHome() {
  return (
    <MypageContainer />
  );
}
