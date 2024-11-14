/* eslint-disable jsx-a11y/no-static-element-interactions */
import useTabDrag from "@/components/commons/Tab/useTabDrag";
import { Resource, RoomReservation } from "@/lib/api/amplify/helper";
import { createTimeSlots } from "@/lib/utils/createTime";
import * as timeUtils from "@/lib/utils/timeUtils";
import { targetRefAtom } from "@/store/scrollAtom";
import clsx from "clsx";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import { useRef } from "react";

import { pickedDateAtom } from "../../context";
import useGroupManager from "../../hooks/useGroupManager";
import ThirtyMinutesTimeBox from "./ThirtyMinutesTimeBox";

interface TimeLineProps {
  isHeaderShow: boolean;
  room: Resource;
  reservations?: RoomReservation[];
}

function TimeLine({ isHeaderShow, room, reservations = [] }: TimeLineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  const currentPeriod = timeUtils.getRoundedCurrentTime();

  const pickedDate = useAtomValue(pickedDateAtom);
  const currentDay = dayjs().format("YYYY-MM-DD");
  const isToday = pickedDate === currentDay;

  const roomReservations = reservations.filter(
    (reservation) => reservation.resourceName === room.name,
  );

  const timeSlots = createTimeSlots().map((slot) => {
    const reservation = roomReservations?.find(
      (res) =>
        timeUtils.compareTimes(slot.time, res.endTime) &&
        timeUtils.compareTimes(res.startTime, slot.time, true),
    );

    const isCurrentTimePeriod = slot.time === currentPeriod;

    return {
      ...slot,
      reservation,
      resource: room,
      isCurrentTimePeriod,
    };
  });

  const hoverGroup = useGroupManager(timeSlots, "hover");
  const pickedGroup = useGroupManager(timeSlots, "picked");

  /** 현재 시간대로 이동을 위한 ref */
  const targetRef = useAtomValue(targetRefAtom);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useTabDrag(timelineRef);

  return (
    <div
      ref={timelineRef}
      className="no-scrollbar relative mb-[-1px] w-full overflow-x-auto pb-24 pl-30 pt-27 md:overflow-visible md:py-0"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ul
        className={clsx(
          `flex h-full md:h-75 ${timeSlots.length * 48}px md:${timeSlots.length * 72}px`,
        )}
      >
        {timeSlots.map((slot, index) => {
          const { isHovered, isFirstInHoverGroup, isLastInHoverGroup } =
            hoverGroup.handleGroupItem(slot, index);

          const { isPicked, isFirstInPickedGroup, isLastInPickedGroup } =
            pickedGroup.handleGroupItem(slot, index);

          return (
            <ThirtyMinutesTimeBox
              key={slot.time}
              slot={{
                ...slot,
                isHovered,
                isFirstInHoverGroup,
                isLastInHoverGroup,
                isPicked,
                isFirstInPickedGroup,
                isLastInPickedGroup,
              }}
              onHoverGroup={hoverGroup.handleGroup}
              isHeaderShow={isHeaderShow}
              room={room}
              ref={slot.isCurrentTimePeriod && isToday ? targetRef : null}
              hoveredReservationId={hoverGroup.reservationId || "0"}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default TimeLine;
