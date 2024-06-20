import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import allLocales from '@fullcalendar/core/locales-all.js';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import dayjs from 'dayjs';

type Props = {
	eventList: Array<CalendarEvent>;
	onCalendarClick: (date: string) => void;
}

export const Calendar = ({ eventList, onCalendarClick }: Props) => {
	return (
		<Box sx={{ p: 1 }}>
			<FullCalendar
				// カレンダー
				plugins={[dayGridPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				headerToolbar={{
					start: 'prev', center: 'title', end: 'today next'
				}}
				height={'auto'}
				businessHours={true}
				// 日本語
				locales={allLocales}
				locale='ja'
				events={eventList}
				dayCellContent={(e) => e.dayNumberText = e.dayNumberText.replace('日', '')}
				dateClick={(e) => onCalendarClick(e.dateStr)}
				eventClick={(e) => onCalendarClick(dayjs(e.event.start).format('YYYY-MM-DD'))}
			/>
		</Box>
	)
}

export default Calendar;