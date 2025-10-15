export function localDateTimeToIso(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM
  // cria Date usando o fuso local e retorna ISO UTC (representação correta para o backend)
  const d = new Date(`${date}T${time}:00`);
  return d.toISOString();
}

export function addMinutesToIso(iso: string, minutes: number): string {
  const d = new Date(iso);
  return new Date(d.getTime() + minutes * 60000).toISOString();
}
