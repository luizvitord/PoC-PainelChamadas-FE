const API_URL = "http://localhost:1111/consultorios";

export async function addConsultorio(numero) {
     // validação básica
  if (!numero || String(numero).length !== 1) {
    return { error: "O consultório deve ter exatamente 1 dígito." };
  }

  const n = Number(numero);

  if (isNaN(n)) {
    return { error: "Insira um número válido para o consultório." };
  }

  // verificar se já existe
  const existing = await fetch(API_URL + `/${n}`);

  if (existing.ok) {
    return { error: `O consultório nº ${n} já existe.` };
  }

  // criar
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero: n }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { error: data?.message || "Erro ao cadastrar consultório" };
  }

  return { success: true };
}

export async function getConsultorios() {

  const response = await fetch(API_URL);
    if (!response.ok) {
       const data = await response.json().catch(() => null);
        return { error: data?.message || "GET Error" };
    }
    const data = await response.json();
    return data;
}