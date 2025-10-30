import "@/App.css";
import Layout from "@/components/Layout";
import Countdown from "./components/Countdown";

function ContestHome() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full pt-16">
        <Countdown />
      </div>
    </Layout>
  );
}

export default ContestHome;
