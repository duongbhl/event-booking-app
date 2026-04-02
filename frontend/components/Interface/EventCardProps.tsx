export interface EventCardProps  {
  _id: string;
  organizer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  description?: string;
  category: string;
  date: Date | string; // Support both Date object and ISO string from API
  time: string;
  member: number;
  attendees?: number;
  location: string;
  price: number;
  images?: string;
  rating?: number;
  status: 'upcoming' | 'ongoing' | 'finished' | 'cancelled';
  approvalStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
};