import {
  GoogleCalendarEvent,
  GoogleCalendarEventRequest,
} from "@/lib/types/google-calendar";
import axios from "axios";

import { END_POINTS, axiosInstance } from "./helper";

// 오류 처리 함수
// eslint-disable-next-line
const handleError = (error: any) => {
  const errorMessage = axios.isAxiosError(error)
    ? error.response?.data?.error || "An unexpected error occurred"
    : "An unexpected error occurred";

  // 여기서 필요한 경우 로깅이나 추가 처리 가능
  // eslint-disable-next-line
  console.error(errorMessage);
  return null; // 오류 발생 시 null 반환
};

export const getCalendarList = async (accessToken: string) => {
  try {
    const response = await axiosInstance.get(END_POINTS.calendarList, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getEvents = async (
  calendarID: string,
  accessToken: string,
  params?: Record<string, unknown>,
) => {
  try {
    const response = await axiosInstance.get(END_POINTS.events(calendarID), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createEvent = async (
  calendarID: string,
  event: GoogleCalendarEventRequest,
  accessToken: string,
) => {
  try {
    const response = await axiosInstance.post<GoogleCalendarEvent>(
      END_POINTS.events(calendarID),
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateEvent = async (
  calendarID: string,
  eventID: string,
  event: GoogleCalendarEventRequest,
  accessToken: string,
) => {
  try {
    const response = await axiosInstance.put(
      END_POINTS.event(calendarID, eventID),
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteEvent = async (
  calendarID: string,
  eventID: string,
  accessToken: string,
) => {
  try {
    await axiosInstance.delete(END_POINTS.event(calendarID, eventID), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return true; // 삭제 성공 시 true 반환
  } catch (error) {
    return handleError(error);
  }
};

export const checkGoogleCalendarId = async (
  calendarID: string,
  accessToken: string,
) => {
  try {
    await axiosInstance.get(END_POINTS.events(calendarID), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        maxResults: 1,
      },
    });
    return true;
    // eslint-disable-next-line
  } catch (error) {
    return false;
  }
};
