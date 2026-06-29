export const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CL';
};

export const getQuotationClientInfo = (quote: any) => {
  const clientName = quote?.lead?.name || (quote?.lead_id ? `Lead #${quote.lead_id}` : 'Unassigned Lead');
  const eventName = quote?.event_name || quote?.eventType || quote?.event_type || 'Quotation';

  return {
    name: clientName,
    initials: getInitials(clientName),
    avatarBg: 'bg-red-50',
    avatarText: 'text-red-700',
    event: eventName,
  };
};
