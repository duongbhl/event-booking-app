
//format DateTime to "Month Day, Year, Time PM/AM"
export const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleDateString("en-US", options);
};

//format Date to "YEAR-MONTH-DAY"
export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatRelativeTime = (
  date: string | Date,
  translate: (key: string) => string
) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return String(date);
  }

  const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);

  if (diffMinutes < 1) {
    return translate("time.just_now");
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1
      ? translate("time.minute_ago")
      : `${diffMinutes}${translate("time.minutes_ago")}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return diffHours === 1
      ? translate("time.hour_ago")
      : `${diffHours}${translate("time.hours_ago")}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return diffDays === 1
    ? translate("time.day_ago")
    : `${diffDays}${translate("time.days_ago")}`;
};


