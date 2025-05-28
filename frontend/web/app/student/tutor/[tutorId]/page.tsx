"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Users,
  BookOpen,
  MessageSquare,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface Student {
  _id: string;
  name: string;
  avatar?: string;
}

interface Rating {
  _id: string;
  rating: number;
  comment?: string;
  date: string;
  student: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface Tutor {
  _id: string;
  name: string;
  avatar?: string;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  verification_status?: string;
  bio?: string;
  ratings?: Rating[];
}

interface PricingItem {
  type: string;
  price: number;
  schedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  currentEnrollment?: number;
  rating?: number;
  capacity?: number;
  image?: string;
  pricing: {
    online?: PricingItem;
    group?: PricingItem;
    oneOnOne?: PricingItem;
  };
}

export default function TutorDetailsPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";

        // Fetch current user ID
        if (token) {
          const userResponse = await fetch(
            "http://localhost:5000/api/users/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUserId(userData._id);
            console.log("Current User ID:", currentUserId);
          }
        }

        // Fetch tutor details
        const tutorResponse = await fetch(
          `http://localhost:5000/api/users/${tutorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!tutorResponse.ok) throw new Error("Failed to fetch tutor details");
        const tutorData = await tutorResponse.json();
        setTutor(tutorData);

        // Fetch tutor's courses
        const coursesResponse = await fetch(
          `http://localhost:5000/api/course/tutor/${tutorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!coursesResponse.ok)
          throw new Error("Failed to fetch tutor courses");
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId, toast]);

  const handleSubmitReview = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";

      if (!token) {
        throw new Error("You need to be logged in to submit a review");
      }

      // Check if user already submitted a review
      if (
        !editingReviewId &&
        tutor?.ratings?.some((r) => r.student._id === currentUserId)
      ) {
        throw new Error("You have already submitted a review for this tutor");
      }

      const endpoint = editingReviewId
        ? `http://localhost:5000/api/users/tutors/${tutorId}/ratings/${editingReviewId}`
        : `http://localhost:5000/api/users/tutors/${tutorId}/ratings`;

      const method = editingReviewId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
          student: currentUserId, // Include student ID in the request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      const updatedTutor = await response.json();
      setTutor(updatedTutor);
      setRating(0);
      setComment("");
      setEditingReviewId(null);

      toast.success("Your review has been updated");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const handleDeleteReview = async (ratingId: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";

      const response = await fetch(
        `http://localhost:5000/api/users/tutors/${tutorId}/ratings/${ratingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete review");

      const result = await response.json();
      if (result.message === "Rating deleted successfully") {
        // Refresh the tutor data
        const tutorResponse = await fetch(
          `http://localhost:5000/api/users/tutors/${tutorId}`
        );
        if (tutorResponse.ok) {
          const tutorData = await tutorResponse.json();
          setTutor(tutorData);
        }

        toast.success("Your review has been deleted");
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const cancelEdit = () => {
    setRating(0);
    setComment("");
    setEditingReviewId(null);
  };

  // Calculate average rating
  const avgRating =
    tutor?.ratings && tutor.ratings.length > 0
      ? tutor.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
        tutor.ratings.length
      : 0;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">Tutor Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Loading tutor information...
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!tutor) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">Tutor Profile</h1>
                <p className="text-sm text-muted-foreground">Tutor not found</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Tutor not found</h2>
                <p className="text-muted-foreground">
                  The tutor you're looking for doesn't exist or may have been
                  removed.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/student/explore">Browse Tutors</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Tutor Profile</h1>
              <p className="text-sm text-muted-foreground">
                View tutor details and courses
              </p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="grid gap-8">
              {/* Tutor Profile Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24 md:h-32 md:w-32">
                        <AvatarImage
                          src={tutor.avatar || "/placeholder.svg"}
                          alt={tutor.name}
                        />
                        <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">{tutor.name}</h2>
                          {tutor.qualification && (
                            <p className="text-muted-foreground">
                              {tutor.qualification}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-secondary/50 rounded-full px-3 py-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="ml-1 font-medium">
                              {avgRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({tutor.ratings?.length || 0} reviews)
                            </span>
                          </div>
                          {tutor.verification_status === "approved" && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {tutor.experience && (
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {tutor.experience}+ years of experience
                          </span>
                        </div>
                      )}

                      {tutor.bio && (
                        <p className="mt-4 text-muted-foreground">
                          {tutor.bio}
                        </p>
                      )}

                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">Subjects</h3>
                          <div className="flex flex-wrap gap-2">
                            {tutor.subjects.map((subject) => (
                              <Badge key={subject} variant="outline">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "courses"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "reviews"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Reviews ({tutor.ratings?.length || 0})
                  </button>
                </nav>
              </div>

              {/* Courses Tab */}
              {activeTab === "courses" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    Courses by {tutor.name}
                  </h2>
                  {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No courses found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This tutor doesn't have any courses available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {courses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      {editingReviewId ? "Edit Your Review" : "Leave a Review"}
                    </h2>
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Rating
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= rating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Comment
                          </label>
                          <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this tutor..."
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitReview}
                            disabled={rating === 0 || !comment}
                          >
                            {editingReviewId
                              ? "Update Review"
                              : "Submit Review"}
                          </Button>
                          {editingReviewId && (
                            <Button variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      Reviews ({tutor.ratings?.length || 0})
                    </h2>
                    {!tutor.ratings || tutor.ratings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No reviews yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Be the first to review this tutor.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {tutor.ratings.map((review) => (
                          <Card key={review._id}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Avatar>
                                  <AvatarImage
                                    src={review.student?.avatar || undefined}
                                    alt={review.student?.name || "Reviewer"}
                                  />
                                  <AvatarFallback>
                                    {(review.student?.name || "R")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="font-medium">
                                        {review.student?.name || "Anonymous"}
                                      </h3>
                                      <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                              star <= review.rating
                                                ? "fill-primary text-primary"
                                                : "text-muted-foreground"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm text-muted-foreground">
                                        {new Date(
                                          review.date
                                        ).toLocaleDateString()}
                                      </div>
                                      {/* Show edit/delete buttons if it's the student's own review */}
                                      {review.student?._id ===
                                        currentUserId && (
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                              setEditingReviewId(review._id);
                                              setRating(review.rating);
                                              setComment(review.comment || "");
                                            }}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            onClick={() =>
                                              handleDeleteReview(review._id)
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {review.comment && (
                                    <p className="mt-2 text-muted-foreground">
                                      {review.comment}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function CourseCard({ course }: { course: Course }) {
  // Calculate display values with fallbacks
  const displayRating = course.rating ? course.rating.toFixed(1) : "0.0";
  const currentStudents = course.currentEnrollment || 0;
  const capacity = course.capacity || 0;

  const getPricingItems = () => {
    try {
      if (!course.pricing) return [];

      return Object.entries(course.pricing)
        .map(([type, pricingItem]) => {
          if (!pricingItem || pricingItem.price == null) return null;

          const displayType =
            type === "online"
              ? "Online"
              : type === "group"
              ? "Group"
              : type === "oneOnOne"
              ? "1-on-1"
              : type;

          // Get the first schedule if available
          const firstSchedule = pricingItem.schedule?.[0];
          const scheduleText = firstSchedule
            ? `${firstSchedule.day} ${firstSchedule.startTime}-${firstSchedule.endTime}`
            : "Schedule not available";

          return {
            type: displayType,
            price: pricingItem.price.toFixed(2),
            schedule: scheduleText,
          };
        })
        .filter(Boolean) as { type: string; price: string; schedule: string }[];
    } catch (error) {
      console.error("Error processing pricing data:", error);
      return [];
    }
  };

  const pricingItems = getPricingItems();

  const categoryImageMap: Record<string, string> = {
    mathematics: "/mathematicss.jpeg",
    science: "/science.jpeg",
    language: "/language.jpeg",
    music: "/music.jpeg",
    marketing: "/marketing.png",
    business: "/business.jpeg",
    design: "/fashion.jpeg",
    programming: "/programing.jpeg",
  };

  function getImageByCategory(category: string): string {
    // Convert to lowercase for case-insensitive matching
    const lowerCategory = category.toLowerCase();
    return categoryImageMap[lowerCategory] || "/defaultt.jpeg";
  }
  // Get the image for the course

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={getImageByCategory(course.category)}
          width={550}
          height={550}
          // alt={${course.category} image}
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{course.category || "Uncategorized"}</Badge>
          <Badge variant="outline">{course.level || "All Levels"}</Badge>
        </div>
        <CardTitle className="mt-2 text-lg line-clamp-1">
          {course.title || "Untitled Course"}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {currentStudents}/{capacity} students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{displayRating}</span>
          </div>
        </div>

        {pricingItems.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {pricingItems.map((item, index) => (
              <Badge
                key={`${item.type}-${index}`}
                variant="secondary"
                className="bg-background"
              >
                {item.type}: ${item.price}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/student/explore/course-details/${course._id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
