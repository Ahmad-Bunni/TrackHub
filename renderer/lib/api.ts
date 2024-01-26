import { Record } from '@prisma/client';

export async function fetchRecords(): Promise<Record[]> {
  const response = await fetch('/api/records');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function saveRecord(name: string) {
  await fetch('/api/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
}
