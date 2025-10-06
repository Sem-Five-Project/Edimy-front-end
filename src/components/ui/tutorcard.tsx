// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   Star,
//   Clock,
//   Globe,
//   DollarSign,
//   Award,
//   BookOpen,
//   CheckCircle,
//   Eye,
//   Calendar,
//   MapPin
// } from 'lucide-react';

// // ==================== COMPONENT 1: COMPACT TUTOR STATS ====================
// const TutorStats = ({ tutor, compact = false }) => {
//   const renderExperience = (months) => {
//     if (months >= 12) {
//       const years = Math.floor(months / 12);
//       const remainingMonths = months % 12;
//       return `${years}y ${remainingMonths > 0 ? `${remainingMonths}m` : ''}`;
//     }
//     return `${months}m`;
//   };

//   if (compact) {
//     return (
//       <div className="flex items-center gap-4 text-xs">
//         <div className="flex items-center space-x-1">
//           <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
//           <span className="text-slate-600 dark:text-slate-400">
//             {renderExperience(tutor.experience || 0)}
//           </span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
//           <span className="text-slate-600 dark:text-slate-400">
//             {tutor.classCompletionRate?.toFixed(0) || 0}%
//           </span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-2 gap-2">
//       <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
//         <div className="flex items-center space-x-2">
//           <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
//           <div>
//             <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
//               {renderExperience(tutor.experience || 0)}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2">
//         <div className="flex items-center space-x-2">
//           <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
//           <div>
//             <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
//               {tutor.classCompletionRate?.toFixed(0) || 0}%
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ==================== COMPONENT 2: COMPACT SUBJECTS PRICING ====================
// const SubjectsPricing = ({ subjects, limit = 2, compact = false }) => {
//   const [showAll, setShowAll] = useState(false);
//   const displaySubjects = showAll ? subjects : subjects.slice(0, limit);
  
//   if (compact) {
//     return (
//       <div className="space-y-1">
//         {displaySubjects.map((subject, index) => (
//           <div key={`subject-${index}`} className="flex items-center justify-between text-xs">
//             <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
//               {subject.subjectName}
//             </span>
//             <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-2">
//               ${subject.hourlyRate}/hr
//             </span>
//           </div>
//         ))}
//         {subjects.length > limit && !showAll && (
//           <button
//             onClick={() => setShowAll(true)}
//             className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
//           >
//             +{subjects.length - limit} more
//           </button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       {displaySubjects.map((subject, index) => (
//         <div
//           key={`subject-${index}`}
//           className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
//         >
//           <div className="flex items-center space-x-2 flex-1 min-w-0">
//             <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
//             <span className="text-sm text-slate-800 dark:text-slate-200 truncate">
//               {subject.subjectName}
//             </span>
//           </div>
//           <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
//             ${subject.hourlyRate}/hr
//           </span>
//         </div>
//       ))}
//       {subjects.length > limit && (
//         <button
//           onClick={() => setShowAll(!showAll)}
//           className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
//         >
//           {showAll ? 'Show less' : `+${subjects.length - limit} more`}
//         </button>
//       )}
//     </div>
//   );
// };

// // ==================== COMPONENT 3: HORIZONTAL TUTOR CARD ====================
// const TutorCard = ({ tutor, onViewProfile, onBookClass, layout = 'horizontal' }) => {
//   const renderStars = (rating) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         className={`h-3 w-3 ${
//           i < Math.floor(rating)
//             ? 'fill-yellow-400 text-yellow-400'
//             : 'text-slate-300 dark:text-slate-600'
//         }`}
//       />
//     ));
//   };

//   // Vertical layout for mobile
//   if (layout === 'vertical') {
//     return (
//       <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-blue-200 dark:hover:ring-blue-800">
//         <CardContent className="p-4">
//           {/* Header */}
//           <div className="flex items-start space-x-3 mb-3">
//             <div className="relative">
//               <Avatar className="h-12 w-12">
//                 <AvatarImage src={tutor.profileImage} />
//                 <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
//                   {`${tutor.firstName} ${tutor.lastName}`.split(' ').map(n => n[0]).join('')}
//                 </AvatarFallback>
//               </Avatar>
//               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800">
//                 <CheckCircle className="w-2 h-2 text-white ml-0.5 mt-0.5" />
//               </div>
//             </div>
            
//             <div className="flex-1 min-w-0">
//               <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                 {tutor.firstName} {tutor.lastName}
//               </h3>
              
//               <div className="flex items-center space-x-1 mb-1">
//                 <div className="flex">
//                   {renderStars(tutor.rating)}
//                 </div>
//                 <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
//                   {tutor.rating.toFixed(1)}
//                 </span>
//               </div>

//               <TutorStats tutor={tutor} compact={true} />
//             </div>
//           </div>

//           {/* Languages */}
//           {tutor.languages && tutor.languages.length > 0 && (
//             <div className="flex flex-wrap gap-1 mb-3">
//               {tutor.languages.slice(0, 3).map((language, index) => (
//                 <Badge 
//                   key={`lang-${index}`} 
//                   variant="secondary" 
//                   className="text-xs px-2 py-0.5"
//                 >
//                   {language.languageName}
//                 </Badge>
//               ))}
//             </div>
//           )}

//           {/* Subjects */}
//           <div className="mb-3">
//             <SubjectsPricing subjects={tutor.subjects || []} limit={2} compact={true} />
//           </div>

//           {/* Bio */}
//           {tutor.bio && (
//             <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
//               {tutor.bio}
//             </p>
//           )}

//           {/* Actions */}
//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               className="flex-1 h-8 text-xs"
//               onClick={() => onViewProfile(tutor)}
//             >
//               <Eye className="w-3 h-3 mr-1" />
//               Profile
//             </Button>
//             <Button
//               size="sm"
//               className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
//               onClick={() => onBookClass(tutor)}
//             >
//               <Calendar className="w-3 h-3 mr-1" />
//               Book
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   // Horizontal layout for desktop/tablet
//   return (
//     <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-blue-200 dark:hover:ring-blue-800">
//       <CardContent className="p-0">
//         <div className="flex">
//           {/* Left section - Profile */}
//           <div className="flex-shrink-0 p-4">
//             <div className="flex flex-col items-center text-center">
//               <div className="relative mb-2">
//                 <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
//                   <AvatarImage src={tutor.profileImage} />
//                   <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
//                     {`${tutor.firstName} ${tutor.lastName}`.split(' ').map(n => n[0]).join('')}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
//                   <CheckCircle className="w-3 h-3 text-white" />
//                 </div>
//               </div>
              
//               <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm lg:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                 {tutor.firstName} {tutor.lastName}
//               </h3>
              
//               <div className="flex items-center space-x-1 mb-2">
//                 <div className="flex">
//                   {renderStars(tutor.rating)}
//                 </div>
//                 <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
//                   {tutor.rating.toFixed(1)}
//                 </span>
//               </div>

//               <TutorStats tutor={tutor} />
//             </div>
//           </div>

//           {/* Right section - Details */}
//           <div className="flex-1 p-4 border-l border-slate-100 dark:border-slate-700/50">
//             <div className="h-full flex flex-col">
//               {/* Languages */}
//               {tutor.languages && tutor.languages.length > 0 && (
//                 <div className="mb-3">
//                   <div className="flex items-center space-x-1 mb-1">
//                     <Globe className="w-3 h-3 text-slate-500 dark:text-slate-400" />
//                     <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Languages:</span>
//                   </div>
//                   <div className="flex flex-wrap gap-1">
//                     {tutor.languages.slice(0, 3).map((language, index) => (
//                       <Badge 
//                         key={`lang-${index}`} 
//                         variant="secondary" 
//                         className="text-xs px-2 py-0.5"
//                       >
//                         {language.languageName}
//                       </Badge>
//                     ))}
//                     {tutor.languages.length > 3 && (
//                       <Badge variant="secondary" className="text-xs px-2 py-0.5">
//                         +{tutor.languages.length - 3}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Subjects */}
//               <div className="flex-1 mb-3">
//                 <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
//                   Subjects & Rates
//                 </h4>
//                 <SubjectsPricing subjects={tutor.subjects || []} limit={2} />
//               </div>

//               {/* Bio */}
//               {tutor.bio && (
//                 <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
//                   {tutor.bio}
//                 </p>
//               )}

//               {/* Actions */}
//               <div className="flex space-x-2 mt-auto">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="flex-1 h-9 text-xs border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
//                   onClick={() => onViewProfile(tutor)}
//                 >
//                   <Eye className="w-3 h-3 mr-1" />
//                   View Profile
//                 </Button>
//                 <Button
//                   size="sm"
//                   className="flex-1 h-9 text-xs bg-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
//                   onClick={() => onBookClass(tutor)}
//                 >
//                   <Calendar className="w-3 h-3 mr-1" />
//                   Book Class
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // ==================== RESPONSIVE TUTOR CARD WRAPPER ====================
// const ResponsiveTutorCard = ({ tutor, onViewProfile, onBookClass }) => {
  
//   return (
//     <>
//       {/* Desktop/Tablet - Horizontal Layout */}
//       <div className="hidden sm:block">
//         <TutorCard 
//           tutor={tutor} 
//           onViewProfile={onViewProfile} 
//           onBookClass={onBookClass} 
//           layout="horizontal"
//         />
//       </div>
      
//       {/* Mobile - Vertical Layout */}
//       <div className="block sm:hidden">
//         <TutorCard 
//           tutor={tutor} 
//           onViewProfile={onViewProfile} 
//           onBookClass={onBookClass} 
//           layout="vertical"
//         />
//       </div>
//     </>
//   );
// };

// // ==================== DEMO COMPONENT ====================
// const TutorCardsDemo = () => {
//   const sampleTutors = Array.from({ length: 6 }, (_, index) => ({
//     id: index + 1,
//     firstName: ["John", "Sarah", "Mike", "Emma", "David", "Lisa"][index],
//     lastName: ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Miller"][index],
//     profileImage: null,
//     rating: 4.2 + (Math.random() * 0.8),
//     experience: Math.floor(Math.random() * 60) + 6,
//     classCompletionRate: 85 + Math.floor(Math.random() * 15),
//     languages: [
//       { languageName: "English" },
//       { languageName: "Sinhala" },
//       { languageName: "Tamil" }
//     ].slice(0, Math.floor(Math.random() * 3) + 1),
//     subjects: [
//       { subjectName: "Mathematics", hourlyRate: 500 + Math.floor(Math.random() * 500) },
//       { subjectName: "Physics", hourlyRate: 600 + Math.floor(Math.random() * 400) },
//       { subjectName: "Chemistry", hourlyRate: 550 + Math.floor(Math.random() * 450) }
//     ].slice(0, Math.floor(Math.random() * 3) + 1),
//     bio: "Experienced tutor with a passion for helping students achieve their academic goals. Specialized in exam preparation with proven track record."
//   }));

//   const handleViewProfile = (tutor) => {
//     console.log('View profile:', tutor.firstName);
//   };

//   const handleBookClass = (tutor) => {
//     console.log('Book class with:', tutor.firstName);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 lg:p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
//             Responsive Tutor Cards
//           </h1>
//           <p className="text-slate-600 dark:text-slate-400">
//             Horizontal layout for desktop, vertical for mobile
//           </p>
//         </div>

//         {/* Responsive Grid */}
//         <div className="space-y-4 sm:space-y-6">
//           {sampleTutors.map((tutor) => (
//             <ResponsiveTutorCard
//               key={tutor.id}
//               tutor={tutor}
//               onViewProfile={handleViewProfile}
//               onBookClass={handleBookClass}
//             />
//           ))}
//         </div>

//         {/* Layout Examples */}
//         <div className="mt-12 space-y-8">
//           <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
//             Layout Examples
//           </h2>
          
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
//                 Horizontal Layout (Desktop/Tablet)
//               </h3>
//               <TutorCard 
//                 tutor={sampleTutors[0]} 
//                 onViewProfile={handleViewProfile} 
//                 onBookClass={handleBookClass} 
//                 layout="horizontal"
//               />
//             </div>
            
//             <div>
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
//                 Vertical Layout (Mobile)
//               </h3>
//               <div className="max-w-sm">
//                 <TutorCard 
//                   tutor={sampleTutors[1]} 
//                   onViewProfile={handleViewProfile} 
//                   onBookClass={handleBookClass} 
//                   layout="vertical"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export { TutorCard, TutorStats, SubjectsPricing, ResponsiveTutorCard };
// export default TutorCardsDemo;
// ...existing code...
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  BookOpen,
  Globe
} from 'lucide-react';

// ---------- Normalization Helpers ----------
type RawSubject = {
  name?: string;
  subject?: string;
  subjectName?: string;
  hourly_rate?: number;
  hourlyRate?: number;
  rate?: number;
};

type RawLanguage = string | { languageName?: string; name?: string };

interface RawTutor {
  tutorId?: number;
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  rating?: number | null;
  experienceMonths?: number | null;
  experience?: number | null;
  subjects?: RawSubject[];
  languages?: RawLanguage[];
  hourlyRate?: number; // add for fallback pricing
}

// Align with core Subject/Language definitions for cross-component compatibility
interface NormalizedSubject {
  subjectId: number;
  subjectName: string;
  hourlyRate: number;
}

export interface NormalizedTutor {
  id: number;
  name: string;
  initials: string;
  profileImage?: string | null;
  bio: string;
  rating: number;
  experienceMonths: number;
  subjects: NormalizedSubject[];
  hourlyRate: number; // representative
  languages: { languageId: number; languageName: string }[]; // keep objects so booking flow can reuse IDs
  raw: RawTutor;
}

const normalizeTutor = (t: RawTutor): NormalizedTutor => {
  // local hash util for deterministic IDs from names
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  };
  const id = t.tutorId ?? t.id ?? Math.floor(Math.random() * 1_000_000);
  const nameBase = [t.firstName, t.lastName].filter(Boolean).join(' ').trim();
  const name = nameBase || `Tutor ${id}`;
  const initials = name.split(/\s+/).map(p => p[0]).join('').slice(0, 3).toUpperCase() || 'T';
  const rating = typeof t.rating === 'number' ? t.rating : 0;
  const experienceMonths =
    typeof t.experienceMonths === 'number'
      ? t.experienceMonths
      : typeof t.experience === 'number'
      ? t.experience
      : 0;

  const subjects: NormalizedSubject[] = Array.isArray(t.subjects)
    ? t.subjects.map((s, idx) => {
        if (typeof s === 'string') {
          return {
            subjectId: Math.abs(hashString(s + ':' + idx)),
            subjectName: s,
            hourlyRate: t.hourlyRate ?? 0
          };
        }
        const subjectName = (s as any).name || (s as any).subjectName || (s as any).subject || 'Subject';
        const subjectId = (s as any).subjectId ?? Math.abs(hashString(subjectName + ':' + idx));
        return {
          subjectId,
          subjectName,
          hourlyRate: (s as any).hourly_rate ?? (s as any).hourlyRate ?? (s as any).rate ?? t.hourlyRate ?? 0
        };
      })
    : [];

  const languages: { languageId: number; languageName: string }[] = Array.isArray(t.languages)
    ? t.languages.map((l: any, idx) => {
        if (typeof l === 'string') {
          return {
            languageId: Math.abs(hashString(l + ':' + idx)),
            languageName: l
          };
        }
        const ln = l.name || l.languageName || 'Unknown';
        return {
          languageId: l.languageId ?? Math.abs(hashString(ln + ':' + idx)),
            languageName: ln
        };
      })
    : [];

  return {
    id,
    name,
    initials,
    profileImage: t.profileImage || null,
    bio: t.bio || 'No description provided.',
    rating,
    experienceMonths,
    subjects,
    hourlyRate: subjects[0]?.hourlyRate ?? 0,
    languages,
    raw: t // If you keep raw, add raw?: RawTutor to NormalizedTutor or drop this line
  } as NormalizedTutor;
};


const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${
        i < Math.floor(rating)
          ? 'fill-yellow-400 text-yellow-400'
          : 'text-slate-300 dark:text-slate-600'
      }`}
    />
  ));

const formatExperience = (months: number) => {
  if (months >= 12) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    return m ? `${y}y ${m}m` : `${y}y`;
  }
  return `${months}m`;
};

const SubjectsPricing: React.FC<{ subjects: NormalizedSubject[]; limit?: number; compact?: boolean }> = ({
  subjects,
  limit = 2,
  compact = false
}) => {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? subjects : subjects.slice(0, limit);

  if (compact) {
    return (
      <div className="space-y-1">
        {display.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{s.subjectName}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-2">
              Rs.{s.hourlyRate}/hr
            </span>
          </div>
        ))}
        {subjects.length > limit && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            +{subjects.length - limit} more
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {display.map((s, i) => (
        <div
          key={i}
            className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{s.subjectName}</span>
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Rs.{s.hourlyRate}/hr
          </span>
        </div>
      ))}
      {subjects.length > limit && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {showAll ? 'Show less' : `+${subjects.length - limit} more`}
        </button>
      )}
    </div>
  );
};

const TutorStats: React.FC<{ tutor: NormalizedTutor; compact?: boolean }> = ({ tutor, compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-600 dark:text-slate-400">
            {formatExperience(tutor.experienceMonths)}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            {formatExperience(tutor.experienceMonths)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Card (Responsive Wrapper keeps API intact) ----------

interface TutorCardProps {
  tutor: RawTutor;
  onViewProfile: (t: NormalizedTutor) => void;
  onBookClass: (t: NormalizedTutor) => void;
  layout?: 'horizontal' | 'vertical';
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor: raw, onViewProfile, onBookClass, layout = 'horizontal' }) => {
  const tutor = normalizeTutor(raw);

  if (layout === 'vertical') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-blue-200 dark:hover:ring-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3 mb-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tutor.profileImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                  {tutor.initials}
                </AvatarFallback>
              </Avatar>

            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {tutor.name}
              </h3>
              <div className="flex items-center space-x-1 mb-1">
                <div className="flex">{renderStars(tutor.rating)}</div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {tutor.rating.toFixed(1)}
                </span>
              </div>
              <TutorStats tutor={tutor} compact />
            </div>
          </div>

          {tutor.languages.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tutor.languages.slice(0, 3).map((lang, i) => (
                <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                  {lang.languageName}
                </Badge>
              ))}
            </div>
          )}

            <div className="mb-3">
            <SubjectsPricing subjects={tutor.subjects} limit={2} compact />
          </div>

          {tutor.bio && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
              {tutor.bio}
            </p>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onViewProfile(tutor)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Profile
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => onBookClass(tutor)}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Book
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-blue-200 dark:hover:ring-blue-800">
      <CardContent className="p-0">
        <div className="flex">
          <div className="flex-shrink-0 p-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
                  <AvatarImage src={tutor.profileImage || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {tutor.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm lg:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {tutor.name}
              </h3>

              <div className="flex items-center space-x-1 mb-2">
                <div className="flex">{renderStars(tutor.rating)}</div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {tutor.rating.toFixed(1)}
                </span>
              </div>

              <TutorStats tutor={tutor} />
            </div>
          </div>

          <div className="flex-1 p-4 border-l border-slate-100 dark:border-slate-700/50">
            <div className="h-full flex flex-col">
              {tutor.languages.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1 mb-1">
                    <Globe className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Languages:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tutor.languages.slice(0, 3).map((lang, i) => (
                      <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                        {lang.languageName}
                      </Badge>
                    ))}
                    {tutor.languages.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        +{tutor.languages.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 mb-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Subjects & Rates
                </h4>
                <SubjectsPricing subjects={tutor.subjects} limit={2} />
              </div>

              {tutor.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                  {tutor.bio}
                </p>
              )}

              <div className="flex space-x-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => onViewProfile(tutor)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Profile
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs bg-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={() => onBookClass(tutor)}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Book Class
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Wrapper unchanged except we now pass raw tutor; normalization done inside
const ResponsiveTutorCard: React.FC<{
  tutor: RawTutor;
  onViewProfile: (t: NormalizedTutor) => void;
  onBookClass: (t: NormalizedTutor) => void;
}> = ({ tutor, onViewProfile, onBookClass }) => (
  <>
    <div className="hidden sm:block">
      <TutorCard tutor={tutor} onViewProfile={onViewProfile} onBookClass={onBookClass} layout="horizontal" />
    </div>
    <div className="block sm:hidden">
      <TutorCard tutor={tutor} onViewProfile={onViewProfile} onBookClass={onBookClass} layout="vertical" />
    </div>
  </>
);

export { TutorCard, ResponsiveTutorCard };
// ...existing code...