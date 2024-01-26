import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Head from 'next/head';
import { useState } from 'react';
import DataTable from './components/table';

async function saveRecord(recordName: string) {
  await fetch('/api/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: recordName }),
  });
}

export default function HomePage() {
  const [recordName, setRecordName] = useState('');

  const handleAddClick = async () => {
    await saveRecord(recordName).then(() => {
      setRecordName('');
    });
  };

  return (
    <>
      <Head>
        <title>Track Hub</title>
      </Head>

      <div className="container py-4 space-y-4">
        <div className="flex justify-between">
          <div className="flex space-x-2 w-1/2">
            <Input
              placeholder="Name"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
            />

            <Button variant="outline">Search</Button>
            <Button variant="default" onClick={handleAddClick}>
              Add
            </Button>
          </div>
        </div>

        <DataTable />
      </div>
    </>
  );
}
