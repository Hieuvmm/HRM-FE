import { useRef, useState, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.core.css";
import {
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Table,
  ImageIcon,
  Quote,
  Undo,
  Redo,
  X,
} from "lucide-react";

export const CustomQuillEditor = ({
  value,
  onChange,
  sectionId,
  openAddImageGalleryModal,
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorInput, setColorInput] = useState("#000000");

  // State để track các format đang active
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    "align-left": false,
    "align-center": false,
    "align-right": false,
    "list-bullet": false,
    "list-ordered": false,
    blockquote: false,
  });

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      // Initialize Quill without default toolbar
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: false, // We'll use custom toolbar
        },
        placeholder: "Nội dung đầu tiên",
      });

      // Set initial content
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      // Listen for text changes
      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        onChange(html);
      });

      // Listen for selection changes to update active formats
      quillRef.current.on("selection-change", (range) => {
        if (range) {
          updateActiveFormats();
        }
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  // Update active formats based on current selection - FIXED
  const updateActiveFormats = () => {
    if (!quillRef.current) return;

    const range = quillRef.current.getSelection();
    if (!range) return;

    const formats = quillRef.current.getFormat(range);

    setActiveFormats({
      bold: !!formats.bold,
      italic: !!formats.italic,
      underline: !!formats.underline,
      strike: !!formats.strike,
      "align-left": formats.align === "left" || !formats.align,
      "align-center": formats.align === "center",
      "align-right": formats.align === "right",
      "list-bullet": formats.list === "bullet",
      "list-ordered": formats.list === "ordered",
      blockquote: !!formats.blockquote,
    });
  };

  // Format functions with toggle - FIXED
  const toggleFormat = (format, value = true) => {
    if (!quillRef.current) return;

    // Ensure editor has focus
    quillRef.current.focus();

    const range = quillRef.current.getSelection();
    if (!range) return;

    const currentFormat = quillRef.current.getFormat(range);

    // Toggle logic
    if (
      format === "bold" ||
      format === "italic" ||
      format === "underline" ||
      format === "strike"
    ) {
      quillRef.current.format(format, !currentFormat[format]);
    } else if (format === "align") {
      const currentAlign = currentFormat.align;
      if (currentAlign === value) {
        quillRef.current.format("align", false); // Remove alignment
      } else {
        quillRef.current.format("align", value);
      }
    } else if (format === "list") {
      const currentList = currentFormat.list;
      if (currentList === value) {
        quillRef.current.format("list", false); // Remove list
      } else {
        quillRef.current.format("list", value);
      }
    } else if (format === "blockquote") {
      quillRef.current.format("blockquote", !currentFormat.blockquote);
    }

    // Update active formats immediately - REMOVED setTimeout
    updateActiveFormats();
  };

  const formatBlock = (format) => {
    if (!quillRef.current) return;

    quillRef.current.focus();
    const range = quillRef.current.getSelection();
    if (!range) return;

    if (format === "p") {
      quillRef.current.formatLine(range.index, range.length, "header", false);
      quillRef.current.formatLine(
        range.index,
        range.length,
        "blockquote",
        false
      );
    } else if (format.startsWith("h")) {
      const level = parseInt(format.charAt(1));
      quillRef.current.formatLine(range.index, range.length, "header", level);
    } else if (format === "code-block") {
      quillRef.current.formatLine(
        range.index,
        range.length,
        "code-block",
        true
      );
    }

    updateActiveFormats();
  };

  const insertContent = (content) => {
    if (!quillRef.current) return;

    quillRef.current.focus();
    const range = quillRef.current.getSelection();
    if (range) {
      quillRef.current.clipboard.dangerouslyPasteHTML(range.index, content);
    }
  };

  // Apply color - FIXED
  const applyColor = (color) => {
    if (!quillRef.current) return;

    quillRef.current.focus();
    const range = quillRef.current.getSelection();
    if (range) {
      quillRef.current.formatText(range.index, range.length, "color", color);
    }
  };

  // Handle table creation
  const handleCreateTable = (rows, cols) => {
    let tableHtml =
      '<table style="border-collapse: collapse; width: 100%; border: 1px solid #e5e7eb;">';

    for (let i = 0; i < rows; i++) {
      tableHtml += "<tr>";
      for (let j = 0; j < cols; j++) {
        tableHtml +=
          '<td style="border: 1px solid #e5e7eb; padding: 8px; min-height: 20px;">&nbsp;</td>';
      }
      tableHtml += "</tr>";
    }

    tableHtml += "</table><p>&nbsp;</p>";
    insertContent(tableHtml);
  };

  // Handle link insertion
  const handleInsertLink = () => {
    if (linkUrl) {
      const textToUse = linkText || linkUrl;
      const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${textToUse}</a>`;
      insertContent(linkHtml);
      setLinkUrl("");
      setLinkText("");
    }
  };

  // Prevent mousedown on buttons to avoid losing focus - FIXED
  const handleButtonMouseDown = (e) => {
    e.preventDefault();
  };

  // Custom toolbar component với toggle states - FIXED
  const CustomToolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-white">
      {/* Text Format Dropdown */}
      <div className="relative">
        <select
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
          onChange={(e) => formatBlock(e.target.value)}
          onMouseDown={handleButtonMouseDown}
        >
          <option value="p">Normal text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="code-block">Code</option>
        </select>
        <ChevronDown
          size={16}
          className="absolute right-2 top-3 pointer-events-none text-gray-500"
        />
      </div>

      {/* Text Formatting với toggle states - FIXED */}
      <button
        className={`p-2 rounded text-sm font-bold transition-colors ${
          activeFormats.bold
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("bold")}
        title="Bold"
      >
        B
      </button>

      <button
        className={`p-2 rounded text-sm italic transition-colors ${
          activeFormats.italic
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("italic")}
        title="Italic"
      >
        I
      </button>

      <button
        className={`p-2 rounded text-sm underline transition-colors ${
          activeFormats.underline
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("underline")}
        title="Underline"
      >
        U
      </button>

      <button
        className={`p-2 rounded text-sm line-through transition-colors ${
          activeFormats.strike
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("strike")}
        title="Strikethrough"
      >
        S
      </button>

      {/* Text Color */}
      <button
        className="p-2 rounded hover:bg-gray-100 text-gray-700 text-sm font-medium"
        onMouseDown={handleButtonMouseDown}
        onClick={() => setShowColorModal(true)}
        title="Text Color"
      >
        A<span className="text-red-500">A</span>
      </button>

      {/* Alignment với toggle states - FIXED */}
      <button
        className={`p-2 rounded transition-colors ${
          activeFormats["align-left"]
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("align", "left")}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>

      <button
        className={`p-2 rounded transition-colors ${
          activeFormats["align-center"]
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("align", "center")}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>

      <button
        className={`p-2 rounded transition-colors ${
          activeFormats["align-right"]
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("align", "right")}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>

      {/* Lists với toggle states - FIXED */}
      <button
        className={`p-2 rounded transition-colors ${
          activeFormats["list-bullet"]
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("list", "bullet")}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        className={`p-2 rounded transition-colors ${
          activeFormats["list-ordered"]
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("list", "ordered")}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      {/* Quote với toggle state - FIXED */}
      <button
        className={`p-2 rounded transition-colors ${
          activeFormats.blockquote
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseDown={handleButtonMouseDown}
        onClick={() => toggleFormat("blockquote")}
        title="Quote"
      >
        <Quote size={16} />
      </button>

      {/* Image Upload */}
      <button
        className="p-2 rounded hover:bg-gray-100 text-gray-700"
        onMouseDown={handleButtonMouseDown}
        onClick={() => openAddImageGalleryModal(sectionId)}
        title="Thêm hình ảnh"
      >
        <ImageIcon size={16} />
      </button>

      {/* Link */}
      <button
        className="p-2 rounded hover:bg-gray-100 text-gray-700"
        onMouseDown={handleButtonMouseDown}
        onClick={() => setShowLinkModal(true)}
        title="Insert Link"
      >
        <Link size={16} />
      </button>

      {/* Table */}
      <button
        className="p-2 rounded hover:bg-gray-100 text-gray-700"
        onMouseDown={handleButtonMouseDown}
        onClick={() => setShowTableModal(true)}
        title="Insert Table"
      >
        <Table size={16} />
      </button>

      {/* Undo/Redo */}
      <button
        className="p-2 rounded hover:bg-gray-100 text-gray-700"
        onMouseDown={handleButtonMouseDown}
        onClick={() => quillRef.current?.history.undo()}
        title="Undo"
      >
        <Undo size={16} />
      </button>

      <button
        className="p-2 rounded hover:bg-gray-100 text-gray-700"
        onMouseDown={handleButtonMouseDown}
        onClick={() => quillRef.current?.history.redo()}
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <CustomToolbar />

      {/* Quill Editor Container */}
      <div
        ref={editorRef}
        style={{
          minHeight: "300px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
          fontSize: "14px",
          lineHeight: "1.6",
          padding: "16px",
          color: "#374151",
        }}
      />

      {/* Các modal giống như trước... */}
      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTableModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Tạo bảng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số hàng:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="3"
                  className="w-full border rounded px-3 py-2"
                  id="table-rows"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số cột:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="3"
                  className="w-full border rounded px-3 py-2"
                  id="table-cols"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    const rows = document.getElementById("table-rows").value;
                    const cols = document.getElementById("table-cols").value;
                    handleCreateTable(parseInt(rows), parseInt(cols));
                    setShowTableModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded"
                >
                  Tạo bảng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLinkModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Thêm liên kết</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInsertLink();
                setShowLinkModal(false);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Văn bản hiển thị
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Văn bản liên kết"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 text-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded"
                  >
                    Thêm liên kết
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color Modal - FIXED */}
      {showColorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowColorModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chọn màu chữ</h3>
              <button
                onClick={() => setShowColorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="w-16 h-16 border-2 border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded font-mono text-sm"
                />
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Màu thường dùng:
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "#000000",
                    "#ffffff",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#ff00ff",
                    "#00ffff",
                    "#800000",
                    "#008000",
                    "#000080",
                    "#808000",
                    "#800080",
                    "#008080",
                    "#c0c0c0",
                    "#808080",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorInput(color)}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                        colorInput === color
                          ? "border-gray-800 ring-2 ring-blue-500"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem trước:
                </label>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span
                    style={{ color: colorInput }}
                    className="text-lg font-medium"
                  >
                    Văn bản mẫu với màu đã chọn
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowColorModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    applyColor(colorInput);
                    setShowColorModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
