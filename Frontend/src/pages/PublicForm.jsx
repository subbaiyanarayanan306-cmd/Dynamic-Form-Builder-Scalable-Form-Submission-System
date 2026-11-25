import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import FieldRenderer from "../components/FieldRenderer";
import Loader from "../components/Loader";

export default function PublicForm() {
  const { id } = useParams();
  const [form,setForm] = useState(null);
  const [values,setValues] = useState({});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  useEffect(()=>{
    // Public form is fetched from the public published-forms endpoint.
    api.get("/published").then(({data})=>{
      const found=(data.data || []).find(item=>item._id===id);
      if(!found) setError("This form is unavailable or is not published.");
      else {
        setForm(found);
        const initial={};
        found.fields.forEach(f=>{ if(f.defaultValue !== undefined && f.defaultValue !== "") initial[f._id]=f.defaultValue; });
        setValues(initial);
      }
    }).catch(e=>setError(e.response?.data?.message || "Unable to load form."))
      .finally(()=>setLoading(false));
  },[id]);
  const submit=async e=>{
    e.preventDefault(); setError(""); setSuccess("");
    const answers=(form.fields || []).map(field=>({fieldId:field._id,value:values[field._id] ?? (field.type==="checkbox"?[]:"")}));
    try {
      // Backend expects { answers: [{ fieldId, value }] }, not { data: values }.
      const {data}=await api.post(`/${id}/submit`,{answers});
      setSuccess(data.message || "Your response was submitted successfully.");
      setValues({});
    } catch(err) {
      setError(err.response?.data?.errors?.join(", ") || err.response?.data?.message || "Unable to submit form.");
    }
  };
  if(loading) return <Loader text="Loading form..." />;
  if(!form) return <main className="public-shell"><div className="panel"><div className="alert">{error}</div></div></main>;
  return <main className="public-shell"><form className="public-card" onSubmit={submit}>
    <p className="eyebrow">FORM</p><h1>{form.name}</h1>{form.description && <p className="muted">{form.description}</p>}
    {error && <div className="alert">{error}</div>}{success && <div className="success">{success}</div>}
    {form.fields.map(field=><label className="public-field" key={field._id}>{field.label}{field.required && <span className="required"> *</span>}
      <FieldRenderer field={field} value={values[field._id]} onChange={value=>setValues(old=>({...old,[field._id]:value}))}/>
    </label>)}
    <button className="btn btn-primary btn-full">Submit response</button>
  </form></main>;
}
