export async function netlifySubmit(formName: string, data: Record<string, any>) {
  const body = new FormData();
  body.append("form-name", formName);
  Object.entries(data).forEach(([key, value]) => {
    body.append(key, String(value ?? ""));
  });
  const res = await fetch("/", { method: "POST", body });
  if (!res.ok) {
    throw new Error(`Netlify form error ${res.status}`);
  }
  return true;
}
