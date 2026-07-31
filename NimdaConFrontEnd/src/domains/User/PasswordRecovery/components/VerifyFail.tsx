function VerifyFail({ message, onRestart }: { message?: string; onRestart: () => void }) {
  return (
    <div className="pr__form pr__form--center">
      <img src="/mail-failed.svg" alt="" className="pr__mail-icon" />
      <p className="pr__msg">{message || "인증에 실패했습니다."}</p>
      <p className="pr__warn">5회 실패시 자정까지 인증이 제한됩니다.</p>

      <div className="pr__actions pr__actions--center">
        <button type="button" className="pr__btn pr__btn--primary" onClick={onRestart}>
          처음으로
        </button>
      </div>
    </div>
  );
}

export default VerifyFail;
