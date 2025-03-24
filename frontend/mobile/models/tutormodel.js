export class Tutor {
  constructor(id, name, profileImage, experience, rating) {
    this.id = id;
    this.name = name;
    this.profileImage = profileImage;
    this.experience = experience;
    this.rating = rating;
  }
}

export class TutorList {
  constructor() {
    this.tutors = [
      new Tutor(
        "1",
        "John Doe",
        require("../assets/ladyprofile.jpg"),
        "5 years",
        4.8
      ),
      new Tutor(
        "2",
        "Jane Smith",
        require("../assets/ladyprofile.jpg"),
        "3 years",
        4.5
      ),
      new Tutor(
        "3",
        "Sam Wilson",
        require("../assets/ladyprofile.jpg"),
        "4 years",
        4.7
      ),
      new Tutor(
        "4",
        "Jessica Brown",
        require("../assets/ladyprofile.jpg"),
        "2 years",
        4.2
      ),
    ];
  }

  getTutors() {
    return this.tutors;
  }
}
