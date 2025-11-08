// FilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE_URL
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function FilePage() {
  const [token, setToken] = useState(""); // 可留空；需要 JWT 時填入
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [progress, setProgress] = useState(0); // ← 上傳進度 0~100

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const navigate = useNavigate();

  function handleLogout() {
    // 清除 token
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token"); // 若你有用 refresh 也一併清掉
    // 導回登入頁
    navigate("/login", { replace: true });
  }

  // 👇 新增這個：選檔時即檢查大小
  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_SIZE_BYTES) {
      setMsg(`❌ 檔案太大（${(selected.size / 1024 / 1024).toFixed(2)} MB），請小於 ${MAX_SIZE_MB} MB`);
      e.target.value = ""; // 清空 input
      setFile(null);
      return;
    }
    setMsg("");
    setFile(selected);
  };

  const fetchList = async (p = page, ps = pageSize) => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/?page=${p}&page_size=${ps}`, {
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error(`List failed ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setList(data);
        setCount(data.length);
      } else {
        setList(data.results || []);
        setCount(data.count ?? (data.results?.length || 0));
      }
    } catch (e) {
      console.error(e);
      setMsg("讀取列表失敗");
    }
  };

  // 使用 XMLHttpRequest 以支援上傳進度條
  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setMsg("");
    setProgress(0);

    const form = new FormData();
    form.append("file", file);

    try {
      await xhrUpload({
        url: `${API_BASE}/api/documents/`,
        headers: authHeader,
        body: form,
        onProgress: (percent) => setProgress(percent),
      });
      setFile(null);
      setPage(1); // 回到第 1 頁，方便看到新檔
      await fetchList(1, pageSize);
      setMsg("上傳成功");
    } catch (e) {
      console.error(e);
      setMsg(e.message || "上傳失敗");
    } finally {
      setBusy(false);
      // 讓使用者看得到 100%，再過一下歸零
      setTimeout(() => setProgress(0), 800);
    }
  };

  const download = async (id, filename) => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}/download/`, {
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error(`Download failed ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setMsg("下載失敗");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("確定要刪除？")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}/`, {
        method: "DELETE",
        headers: { ...authHeader },
      });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed ${res.status}`);
      const nextPage = list.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchList(nextPage, pageSize);
      setMsg("刪除成功");
    } catch (e) {
      console.error(e);
      setMsg("刪除失敗");
    } finally {
      setBusy(false);
    }
  };

  const gotoPage = (p) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    setPage(clamped);
  };
  const changePageSize = (ps) => {
    const n = Number(ps) || 10;
    setPageSize(n);
    setPage(1);
  };

  useEffect(() => {
    fetchList(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, pageSize]);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "ui-sans-serif" }}>
      
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* <h2>📁 Files Page</h2> */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          登出
        </button>
      </div>

      {/* <h2>Files（分頁 + 上傳進度條）</h2> */}
      <h2>Files</h2>

      {/* Token（可選） */}
      {/* <div style={card}>
        <label style={{ display: "block", marginBottom: 8 }}>JWT（可留空）</label>
        <input
          style={input}
          placeholder="Bearer Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div> */}

      {/* Upload */}
      <div style={card}>
        <label style={{ display: "block", marginBottom: 8 }}>上傳單一檔案（≤5MB）</label>
        {/* <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /> */}
        <input type="file" onChange={handleFileSelect} disabled={busy} />
        <button style={btn} onClick={upload} disabled={!file || busy}>上傳</button>
        
        {/* 進度條 */}
        {progress > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 10, background: "#eee", borderRadius: 6 }}>
              <div
                style={{ width: `${progress}%`, height: 10, borderRadius: 6, background: "#4caf50", transition: "width .1s" }}
              />
            </div>
            <small>{progress}%</small>
          </div>
        )}
      </div>

      {/* Message */}
      {msg && <div style={{ margin: "8px 0", color: "#333" }}>{msg}</div>}

      {/* List */}
      <div style={card}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h4 style={{ margin: 0 }}>檔案列表</h4>
          <div>
            <label style={{ marginRight: 8 }}>每頁</label>
            <select value={pageSize} onChange={(e) => changePageSize(e.target.value)} style={select}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <button style={btnSm} onClick={() => fetchList(page, pageSize)} disabled={busy}>刷新</button>
          </div>
        </div>

        {list.length === 0 ? (
          <div style={{ padding: "8px 0" }}>尚無檔案</div>
        ) : (
          <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={thRow}>
                <th align="left">ID</th>
                <th align="left">Filename</th>
                <th align="right">Size (bytes)</th>
                <th>動作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it) => (
                <tr key={it.id} style={trRow}>
                  <td>{it.id}</td>
                  <td>{it.filename}</td>
                  <td align="right">{it.size}</td>
                  <td>
                    <button style={btnSm} onClick={() => download(it.id, it.filename)}>下載</button>{" "}
                    <button style={btnSmDanger} onClick={() => remove(it.id)}>刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12 }}>
          <button style={btnSm} onClick={() => gotoPage(1)} disabled={page<=1}>«</button>
          <button style={btnSm} onClick={() => gotoPage(page-1)} disabled={page<=1}>上一頁</button>
          <span>第 {page} / {totalPages} 頁（共 {count} 筆）</span>
          <button style={btnSm} onClick={() => gotoPage(page+1)} disabled={page>=totalPages}>下一頁</button>
          <button style={btnSm} onClick={() => gotoPage(totalPages)} disabled={page>=totalPages}>»</button>
          <span style={{ marginLeft: 8 }}>
            跳至：
            <input
              type="number"
              min="1"
              max={totalPages}
              value={page}
              onChange={(e)=>gotoPage(Number(e.target.value))}
              style={{ width: 64, marginLeft: 6, ...input }}
            />
          </span>
        </div>
      </div>

      {/* <small style={{ color: "#666" }}>
        後端端點：GET /api/documents/?page=&page_size=，POST /api/documents/（multipart/form-data），
        GET /api/documents/:id/download/，DELETE /api/documents/:id/
      </small> */}
    </div>
  );
}

/** 使用 XMLHttpRequest 送出 multipart 並追蹤進度 */
function xhrUpload({ url, headers = {}, body, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    // 設定 header（注意：不要自己設 Content-Type，XHR 會自帶 boundary）
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const percent = Math.round((e.loaded * 100) / e.total);
      if (onProgress) onProgress(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          reject(new Error(data.detail || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(body);
  });
}

/* tiny styles */
const card = { border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16 };
const input = { padding: 6, borderRadius: 8, border: "1px solid #d1d5db" };
const select = { padding: 6, borderRadius: 8, border: "1px solid #d1d5db", marginRight: 8 };
const btn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#111827", color: "white", marginLeft: 8 };
const btnSm = { padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", background: "white" };
const btnSmDanger = { ...btnSm, borderColor: "#ef4444", color: "#ef4444" };
const thRow = { borderBottom: "1px solid #e5e7eb" };
const trRow = { borderBottom: "1px solid #f3f4f6" };
