import "./globals.css";

export const metadata = {
  title: "NIMDA",
  description: "동아리 소개 및 지원 페이지",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="true" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
