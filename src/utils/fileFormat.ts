function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot + 1).toLowerCase();
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const offsetMinutes = -dateObj.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffset / 60)
    .toString()
    .padStart(2, "0");
  const offsetMins = (absOffset % 60).toString().padStart(2, "0");
  const timezone = `GMT${sign}${offsetHours}:${offsetMins}`;

  return `${weekday}, ${month} ${day}, ${year} ${time} ${timezone}`;
}

export { formatFileSize, getFileExtension, formatDate };
