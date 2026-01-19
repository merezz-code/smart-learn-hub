// src/components/courses/CourseFilters.tsx
import { useState } from 'react';
import { CourseCategory, CourseLevel, CourseFilters as IFilters } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Search, 
  SlidersHorizontal, 
  X,
  DollarSign,
  Clock,
  Star,
} from 'lucide-react';

interface CourseFiltersProps {
  filters: IFilters;
  onFiltersChange: (filters: IFilters) => void;
  totalResults: number;
}

export function CourseFilters({ 
  filters, 
  onFiltersChange,
  totalResults,
}: CourseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<IFilters>(filters);

  const categories = [
    { value: CourseCategory.PROGRAMMING, label: 'Programmation' },
    { value: CourseCategory.WEB_DEVELOPMENT, label: 'Développement Web' },
    { value: CourseCategory.MOBILE_DEVELOPMENT, label: 'Mobile' },
    { value: CourseCategory.DATA_SCIENCE, label: 'Data Science' },
    { value: CourseCategory.DESIGN, label: 'Design' },
    { value: CourseCategory.MARKETING, label: 'Marketing' },
    { value: CourseCategory.BUSINESS, label: 'Business' },
    { value: CourseCategory.LANGUAGES, label: 'Langues' },
    { value: CourseCategory.CYBER, label: 'Cyber Sécurité' },
  ];

  const levels = [
    { value: CourseLevel.BEGINNER, label: 'Débutant' },
    { value: CourseLevel.INTERMEDIATE, label: 'Intermédiaire' },
    { value: CourseLevel.ADVANCED, label: 'Avancé' },
    { value: CourseLevel.EXPERT, label: 'Expert' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'popular', label: 'Populaires' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'duration', label: 'Durée' },
    { value: 'title', label: 'Titre (A-Z)' },
  ];

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: IFilters = {
      search: '',
      sortBy: 'recent',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFiltersCount = [
    localFilters.category,
    localFilters.level,
    localFilters.minRating,
    localFilters.priceRange,
    localFilters.minDuration,
    localFilters.maxDuration,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un cours..."
            value={localFilters.search || ''}
            onChange={(e) => {
              const newFilters = { ...localFilters, search: e.target.value };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
            className="pl-10 h-12"
          />
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 relative">
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Filtres</SheetTitle>
              <SheetDescription>
                {totalResults} cours trouvé{totalResults > 1 ? 's' : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <Label className="mb-3 block">Catégorie</Label>
                <Select
                  value={localFilters.category || 'all'}
                  onValueChange={(value) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      category: value === 'all' ? undefined : value as CourseCategory 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div>
                <Label className="mb-3 block">Niveau</Label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level.value}
                      variant={localFilters.level === level.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => 
                        setLocalFilters({ 
                          ...localFilters, 
                          level: localFilters.level === level.value ? undefined : level.value 
                        })
                      }
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Durée (heures)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Min</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={localFilters.minDuration ? localFilters.minDuration / 60 : ''}
                      onChange={(e) => 
                        setLocalFilters({ 
                          ...localFilters, 
                          minDuration: e.target.value ? parseInt(e.target.value) * 60 : undefined 
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Max</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="∞"
                      value={localFilters.maxDuration ? localFilters.maxDuration / 60 : ''}
                      onChange={(e) => 
                        setLocalFilters({ 
                          ...localFilters, 
                          maxDuration: e.target.value ? parseInt(e.target.value) * 60 : undefined 
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <Label className="mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Note minimum
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={localFilters.minRating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => 
                        setLocalFilters({ 
                          ...localFilters, 
                          minRating: localFilters.minRating === rating ? undefined : rating 
                        })
                      }
                    >
                      {rating}★
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Prix
                </Label>
                <div className="space-y-3">
                  <Button
                    variant={!localFilters.priceRange ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => 
                      setLocalFilters({ ...localFilters, priceRange: undefined })
                    }
                  >
                    Tous les prix
                  </Button>
                  <Button
                    variant={localFilters.priceRange?.max === 0 ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => 
                      setLocalFilters({ 
                        ...localFilters, 
                        priceRange: { min: 0, max: 0 } 
                      })
                    }
                  >
                    Gratuit uniquement
                  </Button>
                </div>
              </div>

              {/* Sort */}
              <div>
                <Label className="mb-3 block">Trier par</Label>
                <Select
                  value={localFilters.sortBy || 'recent'}
                  onValueChange={(value) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      sortBy: value as IFilters['sortBy']
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleResetFilters}
              >
                Réinitialiser
              </Button>
              <Button 
                className="flex-1"
                onClick={handleApplyFilters}
              >
                Appliquer
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {localFilters.category && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newFilters = { ...localFilters, category: undefined };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
              {categories.find(c => c.value === localFilters.category)?.label}
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          {localFilters.level && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newFilters = { ...localFilters, level: undefined };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
              {levels.find(l => l.value === localFilters.level)?.label}
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
          >
            Tout effacer
          </Button>
        </div>
      )}
    </div>
  );
}