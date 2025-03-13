import React, { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./RichTextEditor.css";

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const quillInstanceRef = useRef(null); // To store the Quill instance

  const fontSizeArr = ["12px", "14px", "16px", "20px", "24px", "32px"];

  // Register font size options
  const Size = Quill.import("attributors/style/size");
  Size.whitelist = fontSizeArr; // Limit the size options to the values in fontSizeArr
  Quill.register(Size, true);

  // Initialize Quill only once when the component is mounted
  useEffect(() => {
    if (editorRef.current && !quillInstanceRef.current) {
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }], // Headers
            [{ size: fontSizeArr }], // Font size dropdown
            ["bold", "italic", "underline"], // Bold, Italic, Underline
            [{ color: [] }], // Text color
            ["link"], // Link
          ],
        },
      });
    }

    // Cleanup on unmount or when the editor is destroyed
    return () => {
      if (quillInstanceRef.current) {
        // Remove the toolbar by targeting the previous sibling

        document.querySelector(".ql-toolbar").remove();

        // Destroy the Quill instance
        quillInstanceRef.current = null; // Clear the reference
      }
    };
  }, []); // Empty dependency array to run only once on mount/unmount

  // Set content when 'value' changes (i.e., update Quill content from parent)
  useEffect(() => {
    if (
      quillInstanceRef.current &&
      value !== quillInstanceRef.current.root.innerHTML
    ) {
      quillInstanceRef.current.root.innerHTML = value; // Set Quill content to parent's value
    }
  }, [value]);

  // Handle content change in Quill and notify parent
  const handleContentChange = () => {
    if (quillInstanceRef.current) {
      const html = quillInstanceRef.current.root.innerHTML; // Get rich text (HTML content)
      onChange(html); // Notify parent with updated content
    }
  };

  // Listen for content changes in Quill
  useEffect(() => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.on("text-change", handleContentChange);
    }
    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off("text-change", handleContentChange);
      }
    };
  }, []);

  return <div ref={editorRef} />;
};

export default RichTextEditor;
