import Link from "next/link"
import { Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CourseCardProps {
  course: {
    id: string | number
    title: string
    description: string
    category: string
    level: string
    tutor: {
      name: string
      avatar: string
      rating: number
    }
    students: number
    maxStudents: number
    rating: number
    reviews: number
    image: string
    sessions?: {
      online: boolean
      group: boolean
      oneOnOne: boolean
    }
    pricing?: {
      online: number
      group: number
      oneOnOne: number
    }
    tags?: string[]
  }
  showEnrollButton?: boolean
}

export function CourseCard({ course, showEnrollButton = true }: CourseCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{course.category}</Badge>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <CardTitle className="line-clamp-1 mt-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.tutor.avatar || "/placeholder.svg"} alt={course.tutor.name} />
            <AvatarFallback>{course.tutor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{course.tutor.name}</span>
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium ml-1">{course.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({course.reviews})</span>
          </div>
        </div>

        {course.pricing && (
          <div className="flex flex-wrap gap-2 mt-3">
            {course.sessions?.online && (
              <Badge variant="secondary" className="bg-background">
                Online: ${course.pricing.online}
              </Badge>
            )}
            {course.sessions?.group && (
              <Badge variant="secondary" className="bg-background">
                Group: ${course.pricing.group}
              </Badge>
            )}
            {course.sessions?.oneOnOne && (
              <Badge variant="secondary" className="bg-background">
                1-on-1: ${course.pricing.oneOnOne}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center text-sm text-muted-foreground mt-3">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {course.students}/{course.maxStudents} students
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        {showEnrollButton ? (
          <Button className="w-full" asChild>
            <Link href={`/student/checkout/${course.id}`}>Enroll Now</Link>
          </Button>
        ) : (
          <Button className="w-full" asChild>
            <Link href={`/student/courses/${course.id}`}>View Course</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function Avatar({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return <img className="aspect-square h-full w-full" src={src || "/placeholder.svg"} alt={alt} />
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">{children}</div>
}
