// src/components/courses/CourseCard.tsx
import { Course, CourseLevel, CourseCategory } from '@/types/course';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const levelColors: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: 'bg-success/10 text-success border-success/20',
    [CourseLevel.INTERMEDIATE]: 'bg-warning/10 text-warning border-warning/20',
    [CourseLevel.ADVANCED]: 'bg-destructive/10 text-destructive border-destructive/20',
    [CourseLevel.EXPERT]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  const levelLabels: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: 'Débutant',
    [CourseLevel.INTERMEDIATE]: 'Intermédiaire',
    [CourseLevel.ADVANCED]: 'Avancé',
    [CourseLevel.EXPERT]: 'Expert',
  };

  const categoryLabels: Record<CourseCategory, string> = {
    [CourseCategory.PROGRAMMING]: 'Programmation',
    [CourseCategory.WEB_DEVELOPMENT]: 'Développement Web',
    [CourseCategory.MOBILE_DEVELOPMENT]: 'Mobile',
    [CourseCategory.DATA_SCIENCE]: 'Data Science',
    [CourseCategory.DESIGN]: 'Design',
    [CourseCategory.MARKETING]: 'Marketing',
    [CourseCategory.BUSINESS]: 'Business',
    [CourseCategory.LANGUAGES]: 'Langues',
    [CourseCategory.CYBER]: 'Cyber  Sécurité',
    [CourseCategory.OTHER]: 'Autre',
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  // Calculer le nombre total de leçons
  const totalLessons = course.modules?.reduce((acc, module) => acc + module.lessons.length, 0) || 0;

  return (
    <Link to={`/course/${course.id}`} className="block">
      <article className="card-interactive overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            {course.price === 0 ? (
              <Badge className="bg-success text-success-foreground">Gratuit</Badge>
            ) : (
              <Badge variant="secondary" className="bg-card/90 backdrop-blur">
                {course.price.toFixed(2)} €
              </Badge>
            )}
          </div>

          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={levelColors[course.level]}>
              {levelLabels[course.level]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <p className="text-xs font-medium text-primary mb-2">
            {categoryLabels[course.category]}
          </p>
          
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.shortDescription || course.description}
          </p>

          {/* Instructor */}
          {course.instructor && (
            <p className="text-sm text-muted-foreground mb-4">
              par <span className="font-medium text-foreground">{course.instructor}</span>
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-medium text-foreground">{course.rating.toFixed(1)}</span>
              </div>
            )}
            
            {course.studentsCount && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.studentsCount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{totalLessons}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
