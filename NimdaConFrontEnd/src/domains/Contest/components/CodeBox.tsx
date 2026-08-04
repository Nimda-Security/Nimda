interface CodeBoxProps {
  title?: string;
  code: string;
}

/** 모노스페이스 코드 박스 (입력/출력 예시, 제출 소스 보기) */
const CodeBox = ({ title, code }: CodeBoxProps) => (
  <div className="contest-code">
    {title && <p className="contest-code__title">{title}</p>}
    <pre className="contest-code__box">{code}</pre>
  </div>
);

export default CodeBox;
