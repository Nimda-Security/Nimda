import type { ReactNode } from 'react';

interface PageHeadProps {
  crumb: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** 대회 페이지 공통 헤드: 브레드크럼 + 제목(+설명) + 우측 액션 버튼 + 구분선 */
const PageHead = ({ crumb, title, description, actions }: PageHeadProps) => (
  <div className="contest-page-head">
    <div className="contest-page-head__top">
      <div>
        <p className="contest-page-head__crumb">{crumb}</p>
        <h1 className="contest-page-head__title">{title}</h1>
        {description && <p className="contest-page-head__desc">{description}</p>}
      </div>
      {actions && <div className="contest-page-head__actions">{actions}</div>}
    </div>
    <hr className="contest-divider" />
  </div>
);

export default PageHead;
