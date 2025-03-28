"use client"

import { useState } from "react"
import { Search, Star, Languages, Clock, DollarSign, MessageSquare, Briefcase, GraduationCap } from "lucide-react"

// Import shadcn components
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const FindTutor = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const tutors = [
    {
      initials: "JD",
      name: "Dr. John Doe",
      subject: "Mathematics Expert",
      skills: ["Calculus", "Linear Algebra", "Differential Equations"],
      description:
        "PhD in Mathematics with 10+ years of teaching experience. Specializes in advanced calculus and mathematical analysis.",
      rating: 4.9,
      reviews: 124,
      price: 40,
      languages: "English, Spanish",
    },
    {
      initials: "JS",
      name: "Prof. Jane Smith",
      subject: "Computer Science Expert",
      skills: ["Algorithms", "Data Structures", "Programming"],
      description:
        "Master's in Computer Science with focus on algorithm design and optimization. Experienced in teaching programming concepts.",
      rating: 4.8,
      reviews: 98,
      price: 35,
      languages: "English, French",
    },
  ]

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  // Function to render stars based on rating
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-yellow-400" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="h-4 w-4 text-yellow-400" />
        ))}
      </div>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Tutor</h1>
          <p className="text-muted-foreground mt-1">Connect with expert tutors to boost your academic success</p>
        </div>

        <div className="relative w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search by name, subject, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-full md:w-[350px]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {filteredTutors.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tutors found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTutors.map((tutor, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {tutor.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{tutor.name}</h3>
                        <p className="text-sm text-muted-foreground">{tutor.subject}</p>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        {renderRatingStars(tutor.rating)}
                        <span className="font-medium ml-1">{tutor.rating}</span>
                        <span className="text-muted-foreground">({tutor.reviews})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tutor.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/10">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">{tutor.description}</p>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span>{tutor.languages}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${tutor.price}/hour</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Available weekdays</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>10+ years experience</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1">
                    View Profile
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Tutor
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {filteredTutors.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" className="mx-auto">
            Load More Tutors
          </Button>
        </div>
      )}
    </section>
  )
}

export default FindTutor

