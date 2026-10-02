import { ReactElement, useEffect, useRef, useState } from "react";
import { DayPilot as DayPilotLibrary } from "@daypilot/daypilot-lite-javascript";
import { DayPilotAgendaContainerProps } from "../typings/DayPilotAgendaProps";

import "./ui/DayPilotAgenda.css";

export function DayPilotAgenda(
    props: DayPilotAgendaContainerProps
): ReactElement {
    const calendarRef = useRef<HTMLDivElement>(null);

    // 0 = current week
    // -1 = previous week
    // 1 = next week
    const [weekOffset, setWeekOffset] = useState(0);

    useEffect(() => {
        if (!calendarRef.current) {
            return;
        }

        const calendar = new DayPilotLibrary.Calendar(calendarRef.current);

        calendar.viewType = "WorkWeek";

        calendar.locale = "nl-nl";

        // Navigate relative to the current week
        calendar.startDate = DayPilotLibrary.Date.today().addDays(weekOffset * 7);

        // Monday is the first day of the week
        calendar.weekStarts = 1;

        calendar.businessBeginsHour = 8;
        calendar.businessEndsHour = 18;

        calendar.cellDuration = 30;
        calendar.cellHeight = 20;

        // Show events using their exact start/end time and do not show duration bar
        calendar.useEventBoxes = "Never";
        calendar.durationBarVisible = false;

        // Prevent changing appointments
        calendar.eventMoveHandling = "Disabled";
        calendar.eventResizeHandling = "Disabled";

        calendar.headerDateFormat = "ddd d/M";

        const events = (props.agendaItems.items ?? [])
            .map(item => {
                const title = props.titleAttribute.get(item);
                const start = props.startAttribute.get(item);
                const end = props.endAttribute.get(item);
                const type = props.typeAttribute.get(item);

                if (start.value === undefined || end.value === undefined) {
                    return null;
                }

                const typeValue = type.value ?? "";

                let backColor = "#808080";

                if (typeValue === "Registered") {
                    backColor = "#4472C4";
                } else if (typeValue === "Open") {
                    backColor = "#70AD47";
                }

                return {
                    id: item.id.toString(),
                    text: title.value ?? "",
                    start: start.value.toISOString(),
                    end: end.value.toISOString(),
                    backColor,
                    borderColor: "#FFFFFF",
                    fontColor: "#FFFFFF",
                    cssClass: "agenda-event"
                };
            })
            .filter(
                (event): event is NonNullable<typeof event> => event !== null
            );

        calendar.events.list = events;

        calendar.init();

        return () => {
            calendar.dispose();
        };
    }, [
        props.agendaItems,
        props.titleAttribute,
        props.startAttribute,
        props.endAttribute,
        props.typeAttribute,
        weekOffset
    ]);

    return (
        <div className="daypilot-agenda">
            <div className="agenda-navigation">
                <button
                    type="button"
                    onClick={() => setWeekOffset(current => current - 1)}
                >
                    ← Vorige week
                </button>

                <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    disabled={weekOffset === 0}
                >
                    Huidige week
                </button>

                <button
                    type="button"
                    onClick={() => setWeekOffset(current => current + 1)}
                >
                    Volgende week →
                </button>
            </div>

            <div ref={calendarRef} className="daypilot-calendar" />
        </div>
    );
}