export interface ScheduleCardProps  {
  day: string;
  month: string;
  year: string;
  event: {
    title: string;
    date: string;
    location: string;
    price: string;
    image: string;
  };
};