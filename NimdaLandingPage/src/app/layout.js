import "./globals.css";

export const metadata = {
  title: "NIMDA",
  description: "동아리 소개 및 지원 페이지",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
