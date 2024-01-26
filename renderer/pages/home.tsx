import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Head from 'next/head';
import { useState } from 'react';

export async function fetchData() {
  const response = await fetch('/api/tests');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export default function HomePage() {
  const [name, setName] = useState('');
  const [getData, setData] = useState<any>();

  const handleClick = async () => {
    const data = await fetchData();
    setData(data);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Button variant="outline" onClick={handleClick}>
              Test
            </Button>

            {getData && getData.name}
          </div>
        </div>
      </div>
    </>
  );
}
