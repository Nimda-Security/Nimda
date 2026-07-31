function VerifySuccess({ onNext }: { onNext: () => void }) {
  return (
    <div className="pr__form pr__form--center">
      <img src="/mail-verified.svg" alt="" className="pr__mail-icon" />
      <p className="pr__msg">인증이 완료되었습니다.</p>

      <div className="pr__actions pr__actions--center">
        <button type="button" className="pr__btn pr__btn--primary pr__btn--wide" onClick={onNext}>
          비밀번호 변경
        </button>
      </div>
    </div>
  );
}

export default VerifySuccess;
