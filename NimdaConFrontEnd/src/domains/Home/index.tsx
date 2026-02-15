import "@/App.css";
import Layout from "@/components/Layout";
import Banner from "./components/banner";
import NoticeSection from "./components/NoticeSection";
import PopularPostsSection from "./components/PopularPostsSection";
import PhotoGallerySection from "./components/PhotoGallerySection";

function Home() {
  return (
    <Layout>
      <div className="home">
        {/* 배너 영역 */}
        <Banner />

        {/* 공지사항 영역 */}
        <NoticeSection />

        {/* 하단: 전체 인기글 + 사진첩 */}
        <div className="home__bottom">
          <PopularPostsSection />
          <PhotoGallerySection />
        </div>
      </div>
    </Layout>
  );
}

export default Home;
