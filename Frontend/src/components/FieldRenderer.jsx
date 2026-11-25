export default function FieldRenderer({ field, value, onChange, disabled = false }) {
  const common = { id: field._id || field.key, name: field.key, disabled, required: field.required };
  if (field.type === "textarea") return <textarea {...common} placeholder={field.placeholder} value={value ?? field.defaultValue ?? ""} onChange={e => onChange(e.target.value)} />;
  if (field.type === "select") return <select {...common} value={value ?? field.defaultValue ?? ""} onChange={e => onChange(e.target.value)}>
    <option value="">Choose an option</option>{(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
  if (field.type === "radio") return <div className="choice-list">{(field.options || []).map(o => <label className="choice" key={o}><input type="radio" name={field.key} value={o} checked={value === o} disabled={disabled} onChange={() => onChange(o)} />{o}</label>)}</div>;
  if (field.type === "checkbox") return <div className="choice-list">{(field.options || []).map(o => <label className="choice" key={o}><input type="checkbox" value={o} disabled={disabled} checked={Array.isArray(value) && value.includes(o)} onChange={e => {
    const current = Array.isArray(value) ? value : [];
    onChange(e.target.checked ? [...current, o] : current.filter(x => x !== o));
  }} />{o}</label>)}</div>;
  const type = field.type === "phone" ? "tel" : field.type;
  return <input {...common} type={type || "text"} placeholder={field.placeholder}
    min={field.min} max={field.max} minLength={field.minLength} maxLength={field.maxLength}
    value={value ?? field.defaultValue ?? ""} onChange={e => onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />;
}
