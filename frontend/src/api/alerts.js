const API_URL = 'http://10.0.2.2:3000/api/alerts'; // Cambia por tu URL real

export const fetchAlerts = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) {
    const text = await res.text();
    console.error('Fetch error:', res.status, text);
    throw new Error('Error al obtener alertas');
  }
  const data = await res.json();
  return data.data;
};

export const updateAlert = async (id, updatedData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error('Error al actualizar alerta');
  const data = await res.json();
  return data.data;
};

export const fetchAlertById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener alerta');
  const data = await res.json();
  return data.data;
};

export const deleteAlert = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar alerta');
  const data = await res.json();
  return data.message;
};
