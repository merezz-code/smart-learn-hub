// src/pages/Courses.tsx
import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { Loader2 } from 'lucide-react';
import { Course, CourseFilters as IFilters } from '@/types/course';
import { courseService } from '@/lib/courseService';
import { toast } from 'sonner';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IFilters>({
    search: '',
    sortBy: 'recent',
    sortOrder: 'desc',
  });

  // Charger les cours au montage
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      toast.error('Impossible de charger les cours');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et tri des cours
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filtre de recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.shortDescription?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre catégorie
    if (filters.category) {
      result = result.filter(course => course.category === filters.category);
    }

    // Filtre niveau
    if (filters.level) {
      result = result.filter(course => course.level === filters.level);
    }

    // Filtre durée
    if (filters.minDuration) {
      result = result.filter(course => course.duration >= filters.minDuration!);
    }
    if (filters.maxDuration) {
      result = result.filter(course => course.duration <= filters.maxDuration!);
    }

    // Filtre note
    if (filters.minRating) {
      result = result.filter(course => 
        course.rating && course.rating >= filters.minRating!
      );
    }

    // Filtre prix
    if (filters.priceRange) {
      result = result.filter(course => 
        course.price >= filters.priceRange!.min &&
        course.price <= filters.priceRange!.max
      );
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'popular':
          comparison = (b.studentsCount || 0) - (a.studentsCount || 0);
          break;
        case 'recent':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [courses, filters]);

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Explorer les <span className="gradient-text">cours</span>
            </h1>
            <p className="text-muted-foreground">
              Découvrez notre catalogue de {courses.length} cours
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <CourseFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalResults={filteredCourses.length}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Course Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun cours trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
