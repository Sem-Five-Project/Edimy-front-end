import React from "react";
import { FileText, Plus, Eye, Download, Trash2 } from "lucide-react";
import { ClassDoc } from "@/types";

interface DocumentsSectionProps {
  classDocs: ClassDoc[];
  onAdd: () => void;
  classDocAPI: any;
  classId: number;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ classDocs, onAdd, classDocAPI, classId }) => {
  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-700 flex items-center">
          <FileText size={16} className="mr-2 text-blue-600" />
          Documents ({classDocs.length})
        </h4>
        <button
          onClick={onAdd}
          className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus size={14} className="mr-1" />
          Add
        </button>
      </div>
      {classDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classDocs.map((doc) => (
            <div
              key={doc.docId}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText size={14} className="text-orange-600" />
                </div>
                <div>
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm"
                  >
                    {doc.docType}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:bg-blue-50 rounded text-blue-600">
                  <Eye size={12} />
                </button>
                <button className="p-1 hover:bg-green-50 rounded text-green-600">
                  <Download size={12} />
                </button>
                <button
                  onClick={() => classDocAPI.deleteClassDoc(doc.docId!)}
                  className="p-1 hover:bg-red-50 rounded text-red-500"
                >
                  <Trash2 size={12} />
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
            onClick={onAdd}
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
