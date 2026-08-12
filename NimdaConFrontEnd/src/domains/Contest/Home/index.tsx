import Layout from '@/components/Layout';
import Countdown from './components/Countdown';
import { QuickLinks } from './components/QuickLinks';

function ContestHome() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full pt-12">
        <Countdown />
        <div className="flex gap-4 mt-8">
          <QuickLinks />
        </div>
      </div>
    </Layout>
  );
}

export default ContestHome;
