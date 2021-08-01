import React, { useState } from "react";

function FileInput({ value, ...rest }) {
  const [input, setInput] = useState(false);
  const [Files, setFiles] = useState([]);

  

  return (
    <div>
      <label
        className="wrapper"
        style={{
          boxShadow:
            "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            paddingTop: "20px",
            paddingBottom: "20px",
        }}
      >
        Click to here to select file for upload...
        <input
          {...rest}
          style={{ display: "none" }}
          type="file"
          onChange={(e) => {
            setFiles([...e.target.files]);
           

            setInput(true);
          }}
        />
      </label>

      {Boolean(input) && (
        <div style={{ marginTop: "40px", marginBottom: "10px" }}>
          Selected files: {Files.map((f) => f.name).join(", ")}
        </div>
      )}
    </div>
  );
}

export default FileInput;
