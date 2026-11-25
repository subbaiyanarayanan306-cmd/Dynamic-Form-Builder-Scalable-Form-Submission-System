import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchForm, saveForm, clearCurrent } from "../redux/slices/formSlice";
import FieldRenderer from "../components/FieldRenderer";
import Loader from "../components/Loader";

const types = ["text","email","number","phone","textarea","date","select","radio","checkbox"];
const blankField = () => ({ label: "New field", key: "new_field", type: "text", placeholder: "", defaultValue: "", required: false, options: [], minLength: undefined, maxLength: undefined, min: undefined, max: undefined });

export default function FormEditor() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, error } = useSelector(s => s.forms);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  useEffect(() => {
    if (id) dispatch(fetchForm(id)); else dispatch(clearCurrent());
  }, [id, dispatch]);
  useEffect(() => {
    if (id && current?._id === id) {
      setName(current.name || ""); setDescription(current.description || "");
      setFields((current.fields || []).map(f => ({...f, options: f.options || []})));
    }
  }, [id, current]);
  const update = (index, patch) => setFields(old => old.map((f,i) => i === index ? {...f, ...patch} : f));
  const move = (index, direction) => setFields(old => {
    const next = [...old], target = index + direction;
    if (target < 0 || target >= next.length) return old;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const save = async status => {
    setLocalError("");
    if (!name.trim()) return setLocalError("Form name is required.");
    if (!fields.length) return setLocalError("Add at least one field.");
    const payload = { name: name.trim(), description, status, fields: fields.map(f => ({
      label: f.label, key: f.key, type: f.type, placeholder: f.placeholder || "",
      defaultValue: f.defaultValue ?? "", required: Boolean(f.required),
      options: ["select","radio","checkbox"].includes(f.type) ? (f.options || []).map(x => x.trim()).filter(Boolean) : [],
      ...(f.minLength !== "" && f.minLength != null ? {minLength:Number(f.minLength)} : {}),
      ...(f.maxLength !== "" && f.maxLength != null ? {maxLength:Number(f.maxLength)} : {}),
      ...(f.min !== "" && f.min != null ? {min:Number(f.min)} : {}),
      ...(f.max !== "" && f.max != null ? {max:Number(f.max)} : {}),
    })) };
    setSaving(true);
    const result = await dispatch(saveForm({ id, form: payload }));
    setSaving(false);
    if (saveForm.fulfilled.match(result)) navigate("/");
    else setLocalError(typeof result.payload === "string" ? result.payload : "Unable to save form.");
  };
  if (id && loading && current?._id !== id) return <Loader text="Loading form..." />;
  return <main className="container editor-container">
    <div className="page-heading"><div><Link to="/" className="back-link">← Back to forms</Link><h1>{id ? "Edit form" : "Create a form"}</h1><p className="muted">Configure fields and choose whether to save as draft or publish.</p></div></div>
    {(localError || error) && <div className="alert">{localError || error}</div>}
    <section className="panel">
      <h2>Form details</h2>
      <label>Form name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Contact information" /></label>
      <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell people what this form is for." /></label>
    </section>
    <div className="section-heading"><div><h2>Form fields</h2><p className="muted small">Add fields, change their order and configure validation.</p></div><button className="btn btn-secondary" onClick={()=>setFields(old=>[...old,blankField()])}>＋ Add field</button></div>
    {fields.map((field,index)=><section className="panel field-panel" key={index}>
      <div className="field-panel-head"><strong>Field {index+1}</strong><div className="actions"><button className="text-button" onClick={()=>move(index,-1)} disabled={index===0}>↑</button><button className="text-button" onClick={()=>move(index,1)} disabled={index===fields.length-1}>↓</button><button className="text-button danger" onClick={()=>setFields(old=>old.filter((_,i)=>i!==index))}>Remove</button></div></div>
      <div className="two-col">
        <label>Label<input value={field.label} onChange={e=>update(index,{label:e.target.value})}/></label>
        <label>Key<input value={field.key} onChange={e=>update(index,{key:e.target.value})}/></label>
        <label>Field type<select value={field.type} onChange={e=>update(index,{type:e.target.value,options:["select","radio","checkbox"].includes(e.target.value)?(field.options?.length?field.options:["Option 1"]):[]})}>{types.map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}</select></label>
        <label>Placeholder<input value={field.placeholder || ""} onChange={e=>update(index,{placeholder:e.target.value})}/></label>
        <label>Default value<input value={typeof field.defaultValue === "string" || typeof field.defaultValue === "number" ? field.defaultValue : ""} onChange={e=>update(index,{defaultValue:e.target.value})}/></label>
        <label className="check-label"><input type="checkbox" checked={Boolean(field.required)} onChange={e=>update(index,{required:e.target.checked})}/> Required field</label>
      </div>
      {["select","radio","checkbox"].includes(field.type) && <label>Options (one per line)<textarea value={(field.options || []).join("\n")} onChange={e=>update(index,{options:e.target.value.split("\n")})} placeholder={"Option 1\nOption 2"}/></label>}
      {["text","email","phone","textarea"].includes(field.type) && <div className="two-col">
        <label>Minimum length<input type="number" min="0" value={field.minLength ?? ""} onChange={e=>update(index,{minLength:e.target.value})}/></label>
        <label>Maximum length<input type="number" min="0" value={field.maxLength ?? ""} onChange={e=>update(index,{maxLength:e.target.value})}/></label>
      </div>}
      {field.type==="number" && <div className="two-col">
        <label>Minimum value<input type="number" value={field.min ?? ""} onChange={e=>update(index,{min:e.target.value})}/></label>
        <label>Maximum value<input type="number" value={field.max ?? ""} onChange={e=>update(index,{max:e.target.value})}/></label>
      </div>}
    </section>)}
    <div className="editor-actions"><button className="btn btn-secondary" disabled={saving} onClick={()=>save("draft")}>Save draft</button><button className="btn btn-primary" disabled={saving} onClick={()=>save("published")}>{saving?"Saving...":"Publish form"}</button></div>
  </main>;
}
