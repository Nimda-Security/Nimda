import "@/App.css";
import Layout from "@/components/Layout";
import Banner from "./components/banner";
import NoticeSection from "./components/NoticeSection";
import LatestPostsSection from "./components/LatestPostsSection";
import PhotoGallerySection from "./components/PhotoGallerySection";

function Home() {
  return (
    <Layout>
      <div className="home">
        {/* 배너 영역 */}
        <Banner />

        {/* 공지사항 영역 */}
        <NoticeSection />

        {/* 하단: 전체 최신글 + 사진첩 */}
        <div className="home__bottom">
          <LatestPostsSection />
          <PhotoGallerySection />
        </div>
      </div>
    </Layout>
  );
}

export default Home;
