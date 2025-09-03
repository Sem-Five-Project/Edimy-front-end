"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { classAPI, classDocAPI, tutorAvailabilityAPI, subjectAPI } from '@/lib/api';

// Dummy tutor data
const DUMMY_TUTOR = {
	id: 1,
	firstName: 'Jane',
	lastName: 'Doe',
	bio: 'Experienced Math and Science tutor with a passion for teaching and helping students succeed.',
	profileImage: '',
	rating: 4.8,
	experience: 5,
	hourlyRate: 25,
};

export default function TutorProfilePage() {
	const [subjects, setSubjects] = useState<string[]>([]);
	const [classes, setClasses] = useState<any[]>([]);
	const [availability, setAvailability] = useState<any[]>([]);
	const [classDocs, setClassDocs] = useState<any[]>([]);

	// Fetch data from APIs (using dummy tutorId = 1)
	useEffect(() => {
		subjectAPI.getSubjectsByTutorId(DUMMY_TUTOR.id).then(res => res.success && setSubjects(res.data));
		classAPI.getClassesByTutorId(DUMMY_TUTOR.id).then(res => res.success && setClasses(res.data));
		tutorAvailabilityAPI.getAvailabilityByTutorId(DUMMY_TUTOR.id).then(res => res.success && setAvailability(res.data));
		// For demo, fetch docs for first class if exists
		if (classes.length > 0) {
			classDocAPI.getClassDocsByClassId(classes[0].classId).then(res => res.success && setClassDocs(res.data));
		}
	}, [classes.length]);

	return (
		<div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
			<Card>
				<CardHeader className="flex flex-row items-center gap-6">
					<Avatar className="h-20 w-20">
						<AvatarImage src={DUMMY_TUTOR.profileImage || undefined} alt="Tutor profile" />
						<AvatarFallback>{DUMMY_TUTOR.firstName[0]}{DUMMY_TUTOR.lastName[0]}</AvatarFallback>
					</Avatar>
					<div>
						<CardTitle>{DUMMY_TUTOR.firstName} {DUMMY_TUTOR.lastName}</CardTitle>
						<CardDescription>{DUMMY_TUTOR.bio}</CardDescription>
						<div className="mt-2 flex flex-wrap gap-2">
							{subjects.length > 0 ? subjects.map(subj => (
								<span key={subj} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{subj}</span>
							)) : <span className="text-muted-foreground">No subjects</span>}
						</div>
					</div>
				</CardHeader>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Classes</CardTitle>
				</CardHeader>
				<CardContent>
					{classes.length > 0 ? (
						<ul className="space-y-2">
							{classes.map(cls => (
								<li key={cls.classId} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
									<div>
										<div className="font-semibold">{cls.className}</div>
										<div className="text-xs text-muted-foreground">{cls.date} | {cls.startTime} - {cls.endTime}</div>
									</div>
									<Button variant="outline" className="mt-2 md:mt-0">View Details</Button>
								</li>
							))}
						</ul>
					) : <div className="text-muted-foreground">No classes found.</div>}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Availability</CardTitle>
				</CardHeader>
				<CardContent>
					{availability.length > 0 ? (
						<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{availability.map(av => (
								<li key={av.availabilityId} className="border rounded p-2 flex flex-col">
									<span className="font-medium">{av.dayOfWeek || 'Day'}</span>
									<span className="text-xs">{av.startTime} - {av.endTime}</span>
									<span className="text-xs text-muted-foreground">{av.recurring ? 'Recurring' : 'One-time'}</span>
								</li>
							))}
						</ul>
					) : <div className="text-muted-foreground">No availability set.</div>}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Class Documents</CardTitle>
				</CardHeader>
				<CardContent>
					{classDocs.length > 0 ? (
						<ul className="space-y-2">
							{classDocs.map(doc => (
								<li key={doc.docId} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
									<div>
										<span className="font-medium">{doc.docType}</span>
										<span className="ml-2 text-xs text-muted-foreground">{doc.link}</span>
									</div>
									<a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-1 md:mt-0">Open</a>
								</li>
							))}
						</ul>
					) : <div className="text-muted-foreground">No documents uploaded.</div>}
				</CardContent>
			</Card>
		</div>
	);
}
