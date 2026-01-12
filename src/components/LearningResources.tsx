import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ExternalLink, 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  FileText, 
  GraduationCap,
  Code,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'course' | 'tutorial' | 'documentation' | 'video' | 'article' | 'book';
  provider: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  price?: 'free' | 'paid' | 'freemium';
  tags?: string[];
  skillsRequired?: string[];
  isBookmarked?: boolean;
}

interface LearningResourcesProps {
  skillName?: string;
  resources?: Resource[];
  onResourceClick?: (resource: Resource) => void;
  onBookmarkToggle?: (resourceId: string, isBookmarked: boolean) => void;
  showFilters?: boolean;
  className?: string;
}

const resourceTypeIcons = {
  course: GraduationCap,
  tutorial: Code,
  documentation: FileText,
  video: Video,
  article: BookOpen,
  book: BookOpen,
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const defaultResources: Resource[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course',
    url: 'https://example.com/web-dev-bootcamp',
    type: 'course',
    provider: 'TechAcademy',
    duration: '40 hours',
    difficulty: 'beginner',
    rating: 4.8,
    price: 'paid',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    skillsRequired: [],
    isBookmarked: false
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript programming',
    url: 'https://example.com/js-fundamentals',
    type: 'tutorial',
    provider: 'CodeMaster',
    duration: '8 hours',
    difficulty: 'beginner',
    rating: 4.6,
    price: 'free',
    tags: ['JavaScript', 'Programming', 'Fundamentals'],
    skillsRequired: [],
    isBookmarked: true
  },
  {
    id: '3',
    title: 'React Advanced Patterns',
    description: 'Learn advanced React patterns and best practices',
    url: 'https://example.com/react-advanced',
    type: 'video',
    provider: 'ReactPro',
    duration: '12 hours',
    difficulty: 'advanced',
    rating: 4.9,
    price: 'freemium',
    tags: ['React', 'Advanced', 'Patterns'],
    skillsRequired: ['JavaScript', 'React Basics'],
    isBookmarked: false
  }
];

export const LearningResources: React.FC<LearningResourcesProps> = ({
  skillName,
  resources = defaultResources,
  onResourceClick,
  onBookmarkToggle,
  showFilters = true,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || resource.difficulty === difficultyFilter;
    const matchesPrice = priceFilter === 'all' || resource.price === priceFilter;

    return matchesSearch && matchesType && matchesDifficulty && matchesPrice;
  });

  const handleResourceClick = (resource: Resource) => {
    if (onResourceClick) {
      onResourceClick(resource);
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBookmarkToggle = (resourceId: string, currentBookmarkState: boolean) => {
    if (onBookmarkToggle) {
      onBookmarkToggle(resourceId, !currentBookmarkState);
    } else {
      toast.success(!currentBookmarkState ? 'Resource bookmarked!' : 'Bookmark removed!');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Learning Resources
          {skillName && <span className="text-primary">for {skillName}</span>}
        </h2>
        <p className="text-muted-foreground">
          Curated resources to help you master your skills and advance your career
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="tutorial">Tutorials</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="book">Books</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResources.length} of {resources.length} resources
        </p>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setDifficultyFilter('all');
              setPriceFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-4">
          {filteredResources.map((resource) => {
            const Icon = resourceTypeIcons[resource.type];
            
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                            {resource.title}
                          </h3>
                          {resource.description && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {resource.description}
                            </p>
                          )}
                          
                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {resource.provider}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {resource.duration}
                            </span>
                            {resource.rating && (
                              <div className="flex items-center gap-1">
                                {renderStars(resource.rating)}
                                <span className="ml-1">({resource.rating})</span>
                              </div>
                            )}
                          </div>

                          {/* Tags and Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={difficultyColors[resource.difficulty]}>
                              {resource.difficulty}
                            </Badge>
                            {resource.price === 'free' && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Free
                              </Badge>
                            )}
                            {resource.price === 'paid' && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                Paid
                              </Badge>
                            )}
                            {resource.price === 'freemium' && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                Freemium
                              </Badge>
                            )}
                            {resource.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmarkToggle(resource.id, resource.isBookmarked || false)}
                          >
                            {resource.isBookmarked ? (
                              <BookmarkCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleResourceClick(resource)}
                            className="gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Resource
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No resources match your search for "${searchTerm}"`
                : "No resources available with the current filters"
              }
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setDifficultyFilter('all');
                setPriceFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Keep Learning!</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Suggest new resources or contribute to our learning library.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => toast.info("Resource suggestion feature coming soon!")}>
              Suggest Resource
            </Button>
            <Button variant="outline" onClick={() => toast.info("Community features coming soon!")}>
              Join Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningResources;