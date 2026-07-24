export function formatEventDate(value: string, style: "medium" | "full" = "medium") {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value;

  const [, year, month, day, hour, minute] = match;
  const monthIndex = Number(month) - 1;
  const hourNumber = Number(hour);
  const hour12 = hourNumber % 12 || 12;
  const period = hourNumber >= 12 ? "PM" : "AM";
  const date = `${style === "full" ? fullDays[dayOfWeek(Number(year), monthIndex, Number(day))] + ", " : ""}${months[monthIndex]} ${Number(day)}, ${year}`;

  return `${date} at ${hour12}:${minute} ${period}`;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dayOfWeek(year: number, monthIndex: number, day: number) {
  const month = monthIndex + 1;
  const adjustedMonth = month < 3 ? month + 12 : month;
  const adjustedYear = month < 3 ? year - 1 : year;
  const yearOfCentury = adjustedYear % 100;
  const zeroBasedCentury = Math.floor(adjustedYear / 100);
  const zellerDay = (day + Math.floor((13 * (adjustedMonth + 1)) / 5) + yearOfCentury + Math.floor(yearOfCentury / 4) + Math.floor(zeroBasedCentury / 4) + 5 * zeroBasedCentury) % 7;

  return (zellerDay + 6) % 7;
}
