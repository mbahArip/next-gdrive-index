function getLocale() {
  if (typeof window === "undefined") return "en-US";
  if (window.navigator.languages)
    return window.navigator.languages[0];
  return window.navigator.language;
}
function formatDate(date: Date, locale = getLocale()) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(date);
}

export default formatDate;
