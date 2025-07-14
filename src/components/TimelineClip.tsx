import "@muxit/css/TimelineClip.css";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

function TimelineClip({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition
  };

  return (
    <div
      ref={ setNodeRef }
      className="timeline-item"
      style={ style }
      { ...attributes }
      { ...listeners }
    >
      { name }
    </div>
  );
}

export default TimelineClip;
