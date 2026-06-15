import { DEFAULT_EMBLEM_SVG } from '../../data/templates';
import type { DocumentState } from '../../types';

interface DocumentHeaderProps {
  document: DocumentState;
}

export function DocumentHeader({ document }: DocumentHeaderProps) {
  const emblemSrc = document.useDefaultEmblem
    ? DEFAULT_EMBLEM_SVG
    : document.emblemSrc ?? DEFAULT_EMBLEM_SVG;

  return (
    <header className="doc-header">
      <div className="doc-header__text">
        <h1 className="doc-header__title">{document.title}</h1>
        {document.subtitle && (
          <p className="doc-header__subtitle">{document.subtitle}</p>
        )}
        <p className="doc-header__meta">
          {document.city} &nbsp;·&nbsp; {document.date}
        </p>
      </div>
      <img className="doc-header__emblem" src={emblemSrc} alt="Емблема документа" />
    </header>
  );
}
