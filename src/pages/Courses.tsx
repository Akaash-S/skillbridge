import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useApp } from "@/context/AppContext";
import { apiService } from "@/services/api";
import {
  Search,
  Play,
  Clock,
  Eye,
  ThumbsUp,
  BookOpen,
  Star,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  Loader2,
  Youtube,
  TrendingUp,
  Award,
  CheckCircle,
  Trash2,
  RotateCcw
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: {
    name: string;
    id: string;
  };
  duration: {
    seconds: number;
    formatted: string;
  };
  statistics: {
    views: number;
    likes: number;
    comments?: number;
  };
  published_at: string;
  url: string;
  embed_url: string;
  skill_level?: string;
  skill?: string;
  reason?: string;
  priority?: string;
  saved_at?: string;
  completed?: boolean;
  progress?: number;
}

interface SearchFilters {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | '';
  duration: 'short' | 'medium' | 'long' | '';
  order: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
  maxResults: number;
}

export const Courses = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useApp();

  // State management
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [savedCoursesLoading, setSavedCoursesLoading] = useState(false);

  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    skillLevel: '',
    duration: '',
    order: 'relevance',
    maxResults: 20
  });

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Search courses
  const searchCourses = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term to find courses.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.searchCourses({
        query: searchQuery,
        skillLevel: filters.skillLevel || undefined,
        duration: filters.duration || undefined,
        maxResults: filters.maxResults,
        order: filters.order
      });

      setSearchResults(response.courses || []);
      
      if (!response.courses || response.courses.length === 0) {
        toast({
          title: "No courses found",
          description: "Try adjusting your search terms or filters.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${response.courses.length} courses for "${searchQuery}".`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      toast({
        title: "Search failed",
        description: "Failed to search for courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, toast]);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    if (!isAuthenticated) return;

    setRecommendationsLoading(true);
    try {
      const response = await apiService.getCourseRecommendations();
      setRecommendations(response.recommendations);
    } catch (error) {
      console.error('Recommendations error:', error);
      toast({
        title: "Failed to load recommendations",
        description: "Could not load personalized course recommendations.",
        variant: "destructive",
      });
    } finally {
      setRecommendationsLoading(false);
    }
  }, [isAuthenticated, toast]);

  // Load saved courses
  const loadSavedCourses = useCallback(async () => {
    if (!isAuthenticated) return;

    setSavedCoursesLoading(true);
    try {
      const response = await apiService.getSavedCourses();
      setSavedCourses(response.courses);
    } catch (error) {
      console.error('Saved courses error:', error);
      toast({
        title: "Failed to load saved courses",
        description: "Could not load your saved courses.",
        variant: "destructive",
      });
    } finally {
      setSavedCoursesLoading(false);
    }
  }, [isAuthenticated, toast]);

  // Save course
  const saveCourse = useCallback(async (course: Course) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to save courses.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.saveCourse({
        course_id: course.id,
        title: course.title,
        url: course.url,
        thumbnail: course.thumbnail,
        channel: course.channel,
        duration: course.duration,
        skill: course.skill || ''
      });

      toast({
        title: "Course saved",
        description: `"${course.title}" has been saved to your library.`,
      });

      // Refresh saved courses if we're on that tab
      if (activeTab === 'saved') {
        loadSavedCourses();
      }
    } catch (error) {
      console.error('Save course error:', error);
      toast({
        title: "Failed to save course",
        description: "Could not save the course. Please try again.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, activeTab, loadSavedCourses, toast]);

  // Update course progress
  const updateProgress = useCallback(async (courseId: string, progress: number) => {
    try {
      await apiService.updateCourseProgress(courseId, progress, progress >= 100);
      
      // Update local state
      setSavedCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, progress, completed: progress >= 100 }
          : course
      ));

      if (progress >= 100) {
        toast({
          title: "Course completed!",
          description: "Congratulations on completing the course!",
        });
      }
    } catch (error) {
      console.error('Update progress error:', error);
      toast({
        title: "Failed to update progress",
        description: "Could not update course progress.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Remove saved course
  const removeCourse = useCallback(async (courseId: string) => {
    try {
      await apiService.removeSavedCourse(courseId);
      setSavedCourses(prev => prev.filter(course => course.id !== courseId));
      
      toast({
        title: "Course removed",
        description: "Course has been removed from your library.",
      });
    } catch (error) {
      console.error('Remove course error:', error);
      toast({
        title: "Failed to remove course",
        description: "Could not remove the course. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Check if course is saved
  const isSaved = useCallback((courseId: string) => {
    return savedCourses.some(course => course.id === courseId);
  }, [savedCourses]);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadRecommendations();
      loadSavedCourses();
    }
  }, [isAuthenticated, loadRecommendations, loadSavedCourses]);

  // Handle search on Enter key
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchCourses();
    }
  };

  // Course card component
  const CourseCard = ({ course, showProgress = false, showRemove = false }: {
    course: Course;
    showProgress?: boolean;
    showRemove?: boolean;
  }) => (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {course.duration?.formatted || 'N/A'}
        </div>
        {course.priority && (
          <Badge 
            variant={course.priority === 'high' ? 'destructive' : course.priority === 'medium' ? 'default' : 'secondary'}
            className="absolute top-2 left-2"
          >
            {course.priority} priority
          </Badge>
        )}
      </div>
      
      <CardHeader className="flex-1">
        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description || course.reason}
        </CardDescription>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Youtube className="h-4 w-4" />
            {course.channel?.name}
          </div>
          {course.statistics && (
            <>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatNumber(course.statistics.views)}
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {formatNumber(course.statistics.likes)}
              </div>
            </>
          )}
        </div>

        {course.skill && (
          <Badge variant="outline" className="w-fit mt-2">
            {course.skill}
          </Badge>
        )}

        {showProgress && course.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => window.open(course.url, '_blank')}
          >
            <Play className="h-4 w-4 mr-2" />
            Watch
          </Button>
          
          {!showRemove ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveCourse(course)}
              disabled={isSaved(course.id)}
            >
              {isSaved(course.id) ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              {showProgress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newProgress = course.completed ? 0 : 100;
                    updateProgress(course.id, newProgress);
                  }}
                >
                  {course.completed ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Course</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this course from your library? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeCourse(course.id)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access courses and recommendations.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Courses</h1>
          <p className="text-muted-foreground">
            Discover and learn with curated video courses from YouTube
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Courses
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Courses
                </CardTitle>
                <CardDescription>
                  Find courses on any programming topic or technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for courses (e.g., React, Python, Machine Learning)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={searchCourses} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skill Level</label>
                    <Select value={filters.skillLevel || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, skillLevel: value === "all" ? '' : value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any level</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Select value={filters.duration || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, duration: value === "all" ? '' : value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any duration</SelectItem>
                        <SelectItem value="short">Short (&lt; 4 min)</SelectItem>
                        <SelectItem value="medium">Medium (4-20 min)</SelectItem>
                        <SelectItem value="long">Long (&gt; 20 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={filters.order} onValueChange={(value) => setFilters(prev => ({ ...prev, order: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Upload Date</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="viewCount">View Count</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Results</label>
                    <Select value={filters.maxResults.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, maxResults: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 results</SelectItem>
                        <SelectItem value="20">20 results</SelectItem>
                        <SelectItem value="30">30 results</SelectItem>
                        <SelectItem value="50">50 results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Courses recommended based on your skills and learning goals
                </CardDescription>
              </CardHeader>
            </Card>

            {recommendationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your skill assessment and select a target role to get personalized course recommendations.
                </p>
                <Button onClick={loadRecommendations}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh Recommendations
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Saved Courses Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Saved Courses
                </CardTitle>
                <CardDescription>
                  Your personal learning library with progress tracking
                </CardDescription>
              </CardHeader>
            </Card>

            {savedCoursesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : savedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    showProgress={true}
                    showRemove={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Saved Courses</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your learning library by saving courses from search results or recommendations.
                </p>
                <Button onClick={() => setActiveTab('search')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search for Courses
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};