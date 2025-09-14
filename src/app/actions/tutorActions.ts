
export async function createClass(classData: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    throw new Error('Failed to create class');
  }

  return response.json();
}