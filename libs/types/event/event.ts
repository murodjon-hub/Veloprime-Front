export interface Event {
	_id: string;
	eventTitle: string;
	eventDesc: string;
	eventStatus: string;
	eventImage: string;
	fromLocation: string;
	toLocation: string;
	distance: string;
	eventDate: string;
	maxParticipants: number;
	currentParticipants: number;
	eventParticipants?: string[];
	rating: number;
	memberId: string;
	createdAt: string;
}

export interface EventInquiry {
	page: number;
	limit: number;
	eventStatus?: string;
}
