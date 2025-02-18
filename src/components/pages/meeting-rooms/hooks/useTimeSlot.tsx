import { Resource } from "@/lib/api/amplify/helper";
import * as timeUtils from "@/lib/utils/timeUtils";
import { userAtom } from "@/store/authUserAtom";
import { isOpenDrawerAtom } from "@/store/isOpenDrawerAtom";
import { todayDateAtom } from "@/store/todayDateAtom";
import dayjs from "dayjs";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

import { TimeSlot } from "../components/TimeLine/TimeLineType";
import { pickedDateAtom, pickedReservationAtom } from "../context";

export interface UseTimeSlotProps {
  slot: TimeSlot;
  room: Resource;
}

const useTimeSlot = ({ slot, room }: UseTimeSlotProps) => {
  // 1. 예약이 있을 경우
  //    - 지난 내 예약 (클릭/x, 호버/팝오버)
  //    - 내 예약 (클릭/드로어, 호버/삭제버튼)
  //    - 다른 사람 예약(클릭/x, 호버/팝오버)
  //
  // 2. 예약이 없을 경우
  //    - 예약 생성 드로어 (생성 시에만! 기존 예약이랑 겹치면 에러 표시)

  const { time, reservation } = slot;

  const currentUser = useAtomValue(userAtom);
  const pickedDate = useAtomValue(pickedDateAtom);
  const currentDate = useAtomValue(todayDateAtom).format("YYYY-MM-DD");
  const currentTime = timeUtils.getCurrentTime();
  const [pickedReservation, setPickedReservation] = useAtom(
    pickedReservationAtom,
  );

  const setIsOpenDrawer = useSetAtom(isOpenDrawerAtom);

  const isMyReservation = () => {
    if (!currentUser?.id || !reservation?.participants) return false;

    return reservation.participants.some(
      (participant) => participant.email === currentUser.email,
    );
  };

  const isMyReservationNotExpired = () => {
    if (!isMyReservation()) return false;
    if (!reservation?.endTime) return false;
    if (pickedDate !== currentDate) return true;

    const timeCurrent = timeUtils.convertTimeToMinutes(currentTime);
    const timeEnd = timeUtils.convertTimeToMinutes(reservation.endTime);
    const isExpired = timeEnd <= timeCurrent;
    return !isExpired;
  };

  const isConflictReservation = () => {
    if (!reservation || !pickedReservation) return false;
    if (reservation.resourceId !== pickedReservation.resourceId) return false;
    if (reservation.id === pickedReservation.id) return false; // 자기 자신과의 비교 방지

    // 시간 겹침 여부 확인
    const start1 = reservation.startTime;
    const end1 = reservation.endTime;
    const start2 = pickedReservation.startTime as string;
    const end2 = pickedReservation.endTime as string;

    return timeUtils.isTimeOverlap(start1, end1, start2, end2);
  };

  const isPastTime = useMemo(() => {
    if (!time || !pickedDate || pickedDate !== currentDate) return false;
    const now = dayjs();
    const endTime = timeUtils.add30Minutes(time);
    const [hours, minutes] = endTime.split(":").map(Number);

    // 선택된 날짜와 시간을 합쳐서 비교
    const slotDateTime = dayjs(pickedDate).hour(hours).minute(minutes);
    const today = dayjs().startOf("day");

    // 오늘 날짜인 경우만 현재 시간과 비교
    if (slotDateTime.isSame(today, "day")) {
      return slotDateTime.isBefore(now);
    }

    // 다른 날짜는 모두 클릭 가능
    return false;
  }, [time, pickedDate]);

  function handleClick() {
    if (isPastTime) {
      return;
    }

    if (reservation) {
      // 1. 예약이 있을 경우
      if (isMyReservationNotExpired()) {
        // 1-1. 내 예약 && 지나지 않은 예약
        setIsOpenDrawer(true);
        setPickedReservation(reservation);
      } else {
        // 1-2. 다른 사람 예약 || 지난 내 예약
        setIsOpenDrawer(false);
        setPickedReservation(null);
      }
    } else {
      // 2. 예약이 없을 경우
      const currentMember = currentUser
        ? [
            {
              id: currentUser?.id,
              name: currentUser?.username,
              email: currentUser?.email,
              teams: (currentUser?.teams || []).filter(
                (team): team is string => team !== null,
              ),
              profileImage: currentUser?.profileImage || null,
            },
          ]
        : [];

      setIsOpenDrawer(true);
      setPickedReservation((prev) => ({
        title: prev?.id ? "" : prev?.title,
        startTime: time,
        endTime: timeUtils.add30Minutes(time || ""),
        resourceSubtype: room.resourceSubtype,
        resourceName: room.name,
        resourceId: room.id,
        participants: prev?.id ? currentMember : prev?.participants,
      }));
    }
  }

  return {
    isMyReservation: isMyReservation(),
    isMyReservationNotExpired: isMyReservationNotExpired(),
    isConflictReservation: isConflictReservation(),
    handleClick,
    isPastTime,
  };
};

export default useTimeSlot;
