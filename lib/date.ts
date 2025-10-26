const chatDateFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatChatTimestamp(isoDate: string) {
  try {
    return chatDateFormatter.format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
