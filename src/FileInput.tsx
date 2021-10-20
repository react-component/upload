import React, { useState } from "react";

function FileInput({ value, FileContent, ...rest }) {
  const [filePresent, setFilePresent] = useState(false);
  const [Files, setFiles] = useState([]);

  function noop(filePresent) {
    setFilePresent(true);
  }

  return (
    <div>
      <label
        className="wrapper"
        style={{
            width: "50px",
            background: "#fff",
            padding: "30px",
            
          boxShadow:
            "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"
        }}
      >
        Click to here to select file for upload...
        <input
          {...rest}
          style={{ display: "none" }}
          type="file"
          onChange={(e) => {
            setFiles([...e.target.files]);
            FileContent(e.target.files);

            setFilePresent(true);
          }}
        />
      </label>

      {Boolean(filePresent) && (
        <div style={{ marginTop: "40px", marginBottom: "10px" }}>
          Selected files: {Files.map((f) => f.name).join(", ")}
        </div>
      )}
    </div>
  );
}

export default FileInput;
