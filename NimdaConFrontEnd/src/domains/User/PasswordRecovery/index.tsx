import "@/App.css";
import "./PasswordRecovery.css";
import { useState } from "react";
import Layout from "@/components/Layout";
import Title from "./components/Title";
import StepIndicator, { type RecoveryStep } from "./components/StepIndicator";
import UserInfoForm from "./components/UserInfoForm";
import AuthCodeForm from "./components/AuthCodeForm";
import VerifySuccess from "./components/VerifySuccess";
import VerifyFail from "./components/VerifyFail";
import NewPasswordForm from "./components/NewPasswordForm";

type Phase = "info" | "verify" | "success" | "fail" | "reset";

const PHASE_TO_STEP: Record<Phase, RecoveryStep> = {
  info: "info",
  verify: "verify",
  success: "result",
  fail: "result",
  reset: "result",
};

function PasswordRecoveryPage() {
  const [phase, setPhase] = useState<Phase>("info");
  const [failMessage, setFailMessage] = useState<string | undefined>(undefined);

  return (
    <Layout hideSidebar>
      <div className="pr">
        <Title />
        <StepIndicator current={PHASE_TO_STEP[phase]} />

        <div className="pr__card">
          {phase === "info" && <UserInfoForm onSent={() => setPhase("verify")} />}

          {phase === "verify" && (
            <AuthCodeForm
              onSuccess={() => setPhase("success")}
              onFail={(message) => {
                setFailMessage(message);
                setPhase("fail");
              }}
            />
          )}

          {phase === "success" && <VerifySuccess onNext={() => setPhase("reset")} />}

          {phase === "fail" && (
            <VerifyFail
              message={failMessage}
              onRestart={() => {
                setFailMessage(undefined);
                setPhase("info");
              }}
            />
          )}

          {phase === "reset" && <NewPasswordForm />}
        </div>
      </div>
    </Layout>
  );
}

export default PasswordRecoveryPage;
