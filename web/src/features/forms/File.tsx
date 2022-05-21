// Drag and drop!!
// https://www.youtube.com/watch?v=vJG9lnO7jOM

import styles from "./file.module.scss";
import React from "react";
import classNames from "classnames";

interface fileProps {
  label?: string;
  onFileDropped?: Function;
}
function File({ label, onFileDropped }: fileProps) {
  const drop = React.useRef<HTMLDivElement>(null);
  const hiddenFileRef = React.useRef<HTMLInputElement>(null);

  const defaultMessageValue = "Drag file here or click to select";

  const [message, setMessage] = React.useState<string | (string | React.ReactElement)[]>(defaultMessageValue);
  const [dragging, setDragging] = React.useState(false);
  const [fileError, setFileError] = React.useState(false);

  React.useEffect(() => {
    drop.current?.addEventListener("dragover", handleDragOver);
    drop.current?.addEventListener("drop", handleDrop);
    drop.current?.addEventListener("dragenter", handleDragEnter);
    drop.current?.addEventListener("dragleave", handleDragLeave);
    return () => {
      drop.current?.removeEventListener("dragover", handleDragOver);
      drop.current?.removeEventListener("drop", handleDrop);
      drop.current?.removeEventListener("dragenter", handleDragEnter);
      drop.current?.removeEventListener("dragleave", handleDragLeave);
    };
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    hiddenFileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length) {
      processFiles(event.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    if (files && files.length) {
      if (files.length > 1) {
        setMessage(["Too many files", <br key="br1" />, <br key="br2" />, "Drop file or click to select"]);
        setFileError(true);
        return;
      }
      onFileDropped && onFileDropped(files);
      setMessage([
        "Current file: " + files[0].name,
        <br key="br1" />,
        <br key="br2" />,
        "To change, drop file or click to select",
      ]);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);
    setFileError(false);
    if (e.dataTransfer) {
      const files = e.dataTransfer.files;

      processFiles(files);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.target === drop.current) {
      setDragging(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "var(--form-label-margin-bottom)" }}>
        <span>{label}</span>
      </div>
      <div
        onClick={handleClick}
        ref={drop}
        className={classNames(
          styles.fileDropArea,
          { [styles.dragging]: dragging },
          { [styles.error]: !dragging && fileError }
        )}
      >
        <span style={{ textAlign: "center" }}>{message}</span>
      </div>
      <input ref={hiddenFileRef} onChange={handleFileChange} type="file" style={{ position: "fixed", top: "-100em" }} />
    </>
  );
}

export default File;
