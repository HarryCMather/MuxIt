import "@muxit/css/Timeline.css";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import type { TimelineProps } from "@muxit/models/timelineProps";
import type { Video } from "@muxit/models/video";
import TimelineClip from "@muxit/components/TimelineClip";

function Timeline({ videos, onReorder }: TimelineProps) {
  const mouseSensor = useSensor(PointerSensor, {
    activationConstraint: { 
      distance: 5
    }
  });

  const sensors: SensorDescriptor<SensorOptions>[] = useSensors(mouseSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    // Some context for this:
    //  - Over refers to the item that dragged item has been dropped on-top of.
    //  - Active refers to the item that is being dragged.
    const { active, over } = event;
    if (!over || over.id === active.id) {
      return;
    }

    // TODO: Test the memory footprint here, since arrayMove is a pure function and doesn't mutate the existing array:
    const oldIndex: number = videos.findIndex((video) => video.file.name === active.id);
    const newIndex: number = videos.findIndex((video) => video.file.name === over.id);
    const newOrder: Video[] = arrayMove(videos, oldIndex, newIndex);

    onReorder(newOrder);
  };

  return (
    <DndContext
      sensors={ sensors }
      collisionDetection={ closestCenter }
      onDragEnd={ handleDragEnd }
    >
      <SortableContext
        items={ videos.map((video) => video.file.name) }
        strategy={ verticalListSortingStrategy }
      >
        <div className="timeline">
          { videos.map( (video) => (
              <TimelineClip
                key={ video.file.name }
                id={ video.file.name }
                name={ video.file.name }
              />
            ))
          }
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default Timeline;
