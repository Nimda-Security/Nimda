import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { ImageResizeHandle, ImageResizeSession } from './constants';

const IMAGE_HANDLES: ImageResizeHandle[] = ['nw', 'ne', 'sw', 'se'];
const MIN_IMAGE_WIDTH = 96;
const MIN_IMAGE_HEIGHT = 64;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function ImageView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const sessionRef = useRef<ImageResizeSession | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [tooltip, setTooltip] = useState('');

  const widthAttr = useMemo(() => {
    const rawWidth = node.attrs.width;
    if (rawWidth == null || rawWidth === '') return null;
    const parsed = Number(rawWidth);
    return Number.isFinite(parsed) ? parsed : null;
  }, [node.attrs.width]);

  const heightAttr = useMemo(() => {
    const rawHeight = node.attrs.height;
    if (rawHeight == null || rawHeight === '') return null;
    const parsed = Number(rawHeight);
    return Number.isFinite(parsed) ? parsed : null;
  }, [node.attrs.height]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const updateTooltip = () => {
      const rect = image.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setTooltip(`${Math.round(rect.width)}×${Math.round(rect.height)}px`);
    };

    updateTooltip();
    image.addEventListener('load', updateTooltip);
    window.addEventListener('resize', updateTooltip);

    return () => {
      image.removeEventListener('load', updateTooltip);
      window.removeEventListener('resize', updateTooltip);
    };
  }, [widthAttr, heightAttr, node.attrs.src]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = sessionRef.current;
      const image = imageRef.current;
      if (!session || !image) return;

      const surface = image.closest('.bw-content-input') as HTMLElement | null;
      const maxWidth = Math.max(
        MIN_IMAGE_WIDTH,
        surface?.clientWidth ?? window.innerWidth
      );

      const deltaX = event.clientX - session.startX;
      const horizontalDelta = session.handle.includes('w') ? -deltaX : deltaX;
      const nextWidth = clamp(
        Math.round(session.startWidth + horizontalDelta),
        MIN_IMAGE_WIDTH,
        maxWidth
      );
      const nextHeight = Math.max(
        MIN_IMAGE_HEIGHT,
        Math.round(nextWidth / Math.max(0.1, session.aspectRatio))
      );

      updateAttributes({
        width: nextWidth,
        height: nextHeight,
      });
      setTooltip(`${nextWidth}×${nextHeight}px`);
    };

    const handlePointerUp = () => {
      if (!sessionRef.current) return;
      sessionRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [updateAttributes]);

  const startResize = (
    handle: ImageResizeHandle,
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const image = imageRef.current;
    if (!image) return;

    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    sessionRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
      aspectRatio: rect.width / rect.height,
    };
    setIsResizing(true);
    setTooltip(`${Math.round(rect.width)}×${Math.round(rect.height)}px`);
  };

  return (
    <NodeViewWrapper
      className={`bw-resize-container ${selected ? 'is-selected' : ''} ${isResizing ? 'is-resizing' : ''}`}
      contentEditable={false}
      data-drag-handle
    >
      <div className="bw-resize-wrapper">
        {(selected || isResizing) && (
          <div className="bw-image-resize-tooltip">{tooltip}</div>
        )}
        <img
          ref={imageRef}
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string | undefined) ?? ''}
          className={node.attrs.class as string | undefined}
          data-emoticon-id={node.attrs['data-emoticon-id'] as string | undefined}
          width={widthAttr ?? undefined}
          height={heightAttr ?? undefined}
          draggable={false}
          style={{
            width: widthAttr ? `${widthAttr}px` : undefined,
            height: heightAttr ? `${heightAttr}px` : undefined,
          }}
        />
        {(selected || isResizing) &&
          IMAGE_HANDLES.map((handle) => (
            <button
              key={handle}
              type="button"
              className={`bw-resize-handle bw-resize-handle--${handle}`}
              onPointerDown={(event) => startResize(handle, event)}
              aria-label={`이미지 크기 조절 (${handle})`}
            />
          ))}
      </div>
    </NodeViewWrapper>
  );
}
