import React from "react";
import cls from "./reservationTimes.module.scss";
import { Dayjs } from "dayjs";
import { useDateHourFormat } from "../../utils/useDateHourFormat";

type Props = {
  schedule: {
    slots: string[];
    date: Dayjs;
  };
  onSelect: (date: string) => void;
};

export default function TimeSlot({ schedule, onSelect }: Props) {
  const { getFormatedHour } = useDateHourFormat();
  return (
    <div className={cls.row}>
      <div className={cls.label}>{schedule.date.format("ddd, MMM DD")}</div>
      <div className={cls.flex}>
        {schedule.slots.map((item, idx) => (
          <button
            key={idx}
            className={cls.flexItem}
            onClick={() =>
              onSelect(`${schedule.date.format("YYYY-MM-DD")} ${item}:00`)
            }
          >
            {getFormatedHour(item)}
          </button>
        ))}
      </div>
    </div>
  );
}
