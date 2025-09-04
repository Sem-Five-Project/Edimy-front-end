"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  tutorAvailabilityAPI,
  classAPI,
  classDocAPI,
  subjectAPI,
} from "@/lib/api";
import {
  ApiResponse,
  Class,
  ClassDoc,
  Subject,
  TutorAvailability,
} from "@/types";

export default function TutorProfilePage() {
  const { user } = useAuth();
  const tutorId = 1; // replace 1 with user.userId once backend ready

  const [availableTimeSlots, setAvailableTimeSlots] =
    useState<ApiResponse<TutorAvailability[]>>();
  const [classes, setClasses] = useState<ApiResponse<Class[]>>();
  const [classDocs, setClassDocs] = useState<Record<number, ClassDoc[]>>({});
  const [subjects, setSubjects] = useState<ApiResponse<Subject[]>>();

  useEffect(() => {
    if (!tutorId) return;

    const loadData = async () => {
      try {
        const [slotsRes, classesRes, subjectsRes] = await Promise.all([
          tutorAvailabilityAPI.getAvailabilityByTutorId(tutorId),
          classAPI.getClassesByTutorId(tutorId),
          subjectAPI.getSubjectsByTutorId(tutorId),
        ]);

        setAvailableTimeSlots(slotsRes);
        setClasses(classesRes);
        setSubjects(subjectsRes);

        // Fetch docs for each class
        if (classesRes.success) {
          const docsByClass: Record<number, ClassDoc[]> = {};
          for (const c of classesRes.data) {
            const docsRes = await classDocAPI.getClassDocsByClassId(c.classId!);
            docsByClass[c.classId!] = docsRes.data;
          }
          setClassDocs(docsByClass);
        }
      } catch (err) {
        console.error("Error loading tutor profile data:", err);
      }
    };

    loadData();
  }, [tutorId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tutor Profile</h1>

      {user ? (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>
            <strong>Welcome:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          {user.profileImage && (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full mt-2"
            />
          )}
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}

      {/* Subjects */}
      <section>
        <h2 className="text-xl font-semibold">Subjects</h2>
        <ul className="list-disc ml-6">
          {subjects?.data?.map((s, idx) => (
            <li key={idx}>{s.name ?? s}</li>
          ))}
        </ul>
      </section>

      {/* Availability */}
      <section>
        <h2 className="text-xl font-semibold">Available Time Slots</h2>
        <ul className="divide-y">
          {availableTimeSlots?.data?.map((slot) => (
            <li key={slot.availabilityId} className="py-2 flex justify-between">
              <span>
                {slot.dayOfWeek} {slot.startTime} - {slot.endTime}{" "}
                {slot.recurring ? "(Recurring)" : ""}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() =>
                    tutorAvailabilityAPI.deleteAvailability(
                      slot.availabilityId!
                    )
                  }
                  className="text-red-600"
                >
                  Delete
                </button>
                <button className="text-blue-600">Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Classes & Docs */}
      <section>
        <h2 className="text-xl font-semibold">Classes</h2>
        {classes?.data?.map((cls) => (
          <div
            key={cls.classId}
            className="border p-4 rounded-lg mb-4 bg-white shadow"
          >
            <h3 className="font-bold">{cls.className}</h3>
            <p>
              {cls.date} | {cls.startTime} - {cls.endTime}
            </p>
            <p className="italic">{cls.comment}</p>

            {/* Class Docs */}
            <div className="mt-2">
              <h4 className="font-semibold">Documents</h4>
              <ul className="list-disc ml-6">
                {classDocs[cls.classId!]?.map((doc) => (
                  <li
                    key={doc.docId}
                    className="flex justify-between items-center"
                  >
                    <a
                      href={doc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      {doc.docType}
                    </a>
                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          classDocAPI.deleteClassDoc(doc.docId!)
                        }
                        className="text-red-600"
                      >
                        Delete
                      </button>
                      <button className="text-blue-600">Edit</button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-2 text-green-600">+ Add Document</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
