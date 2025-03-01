import React, { useEffect, forwardRef } from "react";
import s from "./Datepicker.module.scss";
import {
  eachDayOfInterval,
  format,
  isWeekend,
  lastDayOfMonth,
  eachMonthOfInterval,
  startOfDay,
  isSameDay,
  isSameMonth,
  addMonths,
  Locale,
} from "date-fns";
import clsx from "clsx";
import { curry2 } from "ts-curry";

const PrevIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      enableBackground="new 0 0 24 24"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <rect fill="none" height="24" width="24" />
      <g>
        <polygon points="17.77,3.77 16,2 6,12 16,22 17.77,20.23 9.54,12" />
      </g>
    </svg>
  );
};

const NextIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      enableBackground="new 0 0 24 24"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <g>
        <polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12" />
      </g>
    </svg>
  );
};

export type DatepickerClasses = {
  selectedDay: string;
  rangeDays: string;
  dayItem: string;
  dayLabel: string;
  monthLabel: string;
  dateLabel: string;
  weekendItem: string;
};

export type DatepickerEvent = [Date | null, Date | null, Date[] | null];
export type DatepickerProps = {
  startDate?: Date;
  endDate?: Date;
  // eslint-disable-next-line no-unused-vars
  onChange: (d: DatepickerEvent) => void;
  startValue: Date | null;
  locale: Locale;
  disabledDates?: Date[];
  classNames?: Partial<DatepickerClasses>;
  // eslint-disable-next-line no-unused-vars
  onClick?: (date: Date) => void;
  isCompact?: boolean; // Nová vlastnost
};

const getTime = (d: Date) => startOfDay(d).getTime();

const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const isEqualDate = curry2((d1: Date, d2: Date) => getTime(d1) === getTime(d2));

const eachDay = (start: Date, end: Date) => eachDayOfInterval({ start, end });
const eachMonth = (start: Date, end: Date) =>
  eachMonthOfInterval({ start, end });

export const Datepicker = forwardRef<HTMLDivElement, DatepickerProps>(
  (
    {
      locale,
      classNames: CN,
      endDate,
      onChange,
      startDate,
      startValue,
      disabledDates,
      onClick,
      isCompact = false, // Default na false
    },
    ref,
  ) => {
    const DATES = React.useMemo(() => {
      const startMonth = startDate ? startDate : new Date();
      const endMonth = endDate ? endDate : addMonths(new Date(), 3);
      const months = eachMonth(startMonth, endMonth);

      return months.map((month, idx) => {
        const last =
          endDate && isSameMonth(month, endDate)
            ? endDate
            : lastDayOfMonth(month);
        const startDay = !idx ? (startDate ? startDate : new Date()) : month;
        const days = eachDay(startOfDay(startDay), startOfDay(last));

        return {
          month,
          days,
        };
      });
    }, [startDate, endDate]);

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (containerRef.current && startValue) {
        const dayElements = containerRef.current.querySelectorAll(
          `[data-testid="DAY_ITEM"]`
        );
        dayElements.forEach((dayEl) => {
          const dayDate = new Date(dayEl.getAttribute("data-date")!);
          if (isSameDay(dayDate, startValue)) {
            const rect = dayEl.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            const offset = 200; // Upravit dle potřeby
            containerRef.current?.scrollBy({
              left: rect.left - containerRect!.left - offset,
              behavior: "smooth",
            });
          }
        });
      }
    }, [startValue]);

    const onDateClick = (selectedDate: Date) => {
      const isSameSelectedDate =
        startValue && isSameDay(startValue, selectedDate);
      if (isSameSelectedDate) {
        onChange([null, null, null]);
      } else {
        onChange([selectedDate, null, null]);
      }
      if (onClick) {
        onClick(selectedDate);
      }
    };

    const nextScroll = () => {
      if (containerRef.current) {
        containerRef.current.scrollBy({
          left: +500,
          behavior: "smooth",
        });
      }
    };

    const prevScroll = () => {
      if (containerRef.current) {
        containerRef.current.scrollBy({
          left: -500,
          behavior: "smooth",
        });
      }
    };

    // eslint-disable-next-line no-unused-vars
    const rangeClasses = CN?.rangeDays
      ? clsx(CN.rangeDays, s.inRange)
      : s.inRange;

    const dateDayItemSelectedClasses = CN?.selectedDay
      ? clsx(CN.selectedDay, s.dateDayItemSelected)
      : s.dateDayItemSelected;

    const weekendClasses = CN?.weekendItem
      ? clsx(CN.weekendItem, s.isWeekend)
      : s.isWeekend;

    return (
      <div ref={ref} className={clsx(s.container, isCompact && s.compact)}>
        <button onClick={prevScroll} className={clsx(s.button, s.buttonPrev)}>
          <PrevIcon />
        </button>
        <div ref={containerRef} className={s.dateListScrollable}>
          {DATES.map(({ month, days }, idx) => {
            const _month = format(month, "LLLL", { locale });
            const _monthCapitalizeFirstLetter = capitalizeFirstLetter(_month);
            return (
              <div key={_month + idx} className={s.monthContainer}>
                <div className={s.monthLabel}>
                  {_monthCapitalizeFirstLetter}
                </div>
                <div className={s.daysContainer}>
                  {days.map((d, idx) => {
                    const dayLabel = format(d, "EEEEEE", { locale });
                    const dateLabel = format(d, "dd", { locale });
                    const isDisabled = disabledDates?.some(isEqualDate(d));
                    const isDaySelected =
                      startValue && isEqualDate(startValue, d);
                    return (
                      <div
                        data-testid="DAY_ITEM"
                        key={dayLabel + idx + _month}
                        data-date={d.toISOString()}
                        {...(isDisabled ? { "aria-disabled": "true" } : {})}
                        className={clsx(s.dateDayItem, CN?.dayItem, {
                          [dateDayItemSelectedClasses]: isDaySelected,
                          [weekendClasses]: isWeekend(d),
                        })}
                        onClick={() => onDateClick(d)}
                      >
                        <div
                          data-testid="DAY_LABEL"
                          className={clsx(s.dayLabel, CN?.dayLabel)}
                        >
                          {dayLabel}
                        </div>
                        <div
                          data-testid="DATE_LABEL"
                          className={clsx(s.dateLabel, CN?.dateLabel)}
                        >
                          {dateLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={nextScroll} className={clsx(s.button, s.buttonNext)}>
          <NextIcon />
        </button>
      </div>
    );
  }
);

Datepicker.displayName = "Datepicker";
