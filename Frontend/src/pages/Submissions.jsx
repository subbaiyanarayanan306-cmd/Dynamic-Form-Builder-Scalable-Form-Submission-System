import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubmissions } from "../redux/slices/submissionSlice";
import Loader from "../components/Loader";

export default function Submissions() {
  const dispatch=useDispatch();
  const {items,loading,error}=useSelector(s=>s.submissions);
  useEffect(()=>{dispatch(fetchSubmissions());},[dispatch]);
  return <main className="container">
    <div className="page-heading"><div><p className="eyebrow">RESPONSES</p><h1>Submissions</h1><p className="muted">All responses received across your forms.</p></div><button className="btn btn-secondary" onClick={()=>dispatch(fetchSubmissions())}>Refresh</button></div>
    {error && <div className="alert">{error}</div>}
    {loading?<Loader text="Loading submissions..."/>:items.length===0?<section className="empty"><div className="empty-icon">▤</div><h2>No submissions yet</h2><p className="muted">Responses will appear here after someone submits a published form.</p></section>:
      <div className="table-wrap"><table><thead><tr><th>Form</th><th>Answers</th><th>Submitted</th><th>Submission ID</th></tr></thead><tbody>
        {items.map(item=><tr key={item._id}><td><strong>{item.formId?.name || "Deleted form"}</strong></td><td>{item.answers?.length || 0} answers</td><td>{new Date(item.createdAt).toLocaleString()}</td><td className="mono">{item._id}</td></tr>)}
      </tbody></table></div>}
    <p className="small muted note">Your current backend exposes a list-all-submissions endpoint only. Individual view, delete and pagination controls are not included because those API routes are not implemented.</p>
  </main>;
}
