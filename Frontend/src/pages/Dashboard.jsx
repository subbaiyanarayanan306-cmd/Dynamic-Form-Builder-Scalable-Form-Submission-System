import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchForms, removeForm, changeFormStatus } from "../redux/slices/formSlice";
import Loader from "../components/Loader";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(s => s.forms);
  useEffect(() => { dispatch(fetchForms()); }, [dispatch]);
  const deleteItem = async id => {
    if (window.confirm("Delete this form?")) dispatch(removeForm(id));
  };
  const toggleStatus = (form) => dispatch(changeFormStatus({ id: form._id, status: form.status === "published" ? "draft" : "published" }));
  return <main className="container">
    <div className="page-heading"><div><p className="eyebrow">WORKSPACE</p><h1>Your forms</h1><p className="muted">Create, publish and manage your dynamic forms.</p></div><Link className="btn btn-primary" to="/forms/new">＋ Create form</Link></div>
    {error && <div className="alert">{error}</div>}
    {loading ? <Loader text="Loading forms..." /> : items.length === 0 ? <section className="empty"><div className="empty-icon">▤</div><h2>No forms yet</h2><p className="muted">Create your first form to get started.</p><Link className="btn btn-primary" to="/forms/new">Create your first form</Link></section> :
      <div className="form-grid">{items.map(form => <article className="form-card" key={form._id}>
        <div className="card-top"><span className={`status ${form.status}`}>{form.status}</span><span className="muted small">{form.fields?.length || 0} fields</span></div>
        <h2>{form.name}</h2><p className="muted description">{form.description || "No description added."}</p>
        <div className="card-footer"><span className="small muted">{new Date(form.createdAt).toLocaleDateString()}</span><div className="actions">
          <Link className="text-link" to={`/forms/${form._id}/edit`}>Edit</Link>
          <button className="text-button" onClick={() => toggleStatus(form)}>{form.status === "published" ? "Unpublish" : "Publish"}</button>
          <button className="text-button danger" onClick={() => deleteItem(form._id)}>Delete</button>
        </div></div>
        {form.status === "published" && <Link className="public-link" to={`/public/${form._id}`} target="_blank">Open public form ↗</Link>}
      </article>)}</div>}
  </main>;
}
