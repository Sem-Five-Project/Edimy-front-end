import React, { useState } from "react";
import {
  FileText,
  Plus,
  Eye,
  Download,
  Trash2,
  Loader2,
  File,
  FileImage,
  FileVideo,
  FileAudio,
} from "lucide-react";
import { ClassDoc } from "@/types";

interface DocumentsSectionProps {
  classDocs: ClassDoc[];
  onAdd: () => void; // Changed back to void - just opens the modal
  classDocAPI: any;
  classId: number;
  onDocumentAdded?: (success: boolean) => void; // Optional callback for when document is actually added
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  classDocs,
  onAdd,
  classDocAPI,
  classId,
  onDocumentAdded,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (docType: string, link: string) => {
    const fileExtension =
      link?.split(".").pop()?.toLowerCase() || docType?.toLowerCase() || "";

    // PDF files
    if (
      fileExtension.includes("pdf") ||
      docType?.toLowerCase().includes("pdf")
    ) {
      return { icon: FileText, color: "text-red-600", bgColor: "bg-red-100" };
    }

    // Image files
    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
        fileExtension,
      ) ||
      docType?.toLowerCase().includes("image")
    ) {
      return {
        icon: FileImage,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    }

    // Video files
    if (
      ["mp4", "avi", "mov", "mkv", "webm", "flv"].includes(fileExtension) ||
      docType?.toLowerCase().includes("video")
    ) {
      return {
        icon: FileVideo,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      };
    }

    // Audio files
    if (
      ["mp3", "wav", "flac", "aac", "ogg"].includes(fileExtension) ||
      docType?.toLowerCase().includes("audio")
    ) {
      return {
        icon: FileAudio,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    }

    // Default for other document types
    return { icon: File, color: "text-orange-600", bgColor: "bg-orange-100" };
  };

  const handleAddDocument = () => {
    // Simply call the onAdd function to open the modal
    onAdd();
  };

  const handleDeleteDocument = async (docId: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setIsLoading(true);
      try {
        const success = await classDocAPI.deleteClassDoc(docId);
        if (success) {
          alert("Document deleted successfully!");
        } else {
          alert("Failed to delete document. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        alert(
          "An error occurred while deleting the document. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="border-t border-gray-100 pt-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Deleting...</span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-700 flex items-center">
          <FileText size={16} className="mr-2 text-blue-600" />
          Documents ({classDocs.length})
        </h4>
        <button
          onClick={handleAddDocument}
          className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus size={14} className="mr-1" />
          Add
        </button>
      </div>
      {classDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classDocs.map((doc, index) => (
            <div
              key={doc.docId || `doc-${index}`}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                {(() => {
                  const {
                    icon: IconComponent,
                    color,
                    bgColor,
                  } = getFileIcon(doc.docType, doc.link);
                  return (
                    <div
                      className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent size={14} className={color} />
                    </div>
                  );
                })()}
                <div>
                  <div className="text-gray-800 font-medium text-sm">
                    {doc.docType}
                  </div>
                  {doc.link && (
                    <div className="text-xs text-gray-500 mt-1">
                      {doc.link
                        .split("/")
                        .pop()
                        ?.split(".")
                        .pop()
                        ?.toUpperCase() || "FILE"}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => window.open(doc.link, "_blank")}
                  className="p-1 hover:bg-blue-50 rounded text-blue-600"
                  title="View document"
                >
                  <Eye size={12} />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = doc.link;
                    link.download = doc.docType || "document";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-1 hover:bg-green-50 rounded text-green-600"
                  title="Download document"
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc.docId!)}
                  disabled={isLoading}
                  className="p-1 hover:bg-red-50 rounded text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <FileText size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          <button
            onClick={handleAddDocument}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Upload your first document
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
