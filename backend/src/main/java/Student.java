public class Student extends Profile{
    //student specific attribute
    private String course;

    //constructor
    public Student(String name, String profileID, String email, String course){
        super(name, profileID, email);
        this.course = course;
    }

    //getter
    public String getcourse() {
        return course;
    }

    //setter
    public void setcourse(String course) {
        this.course = course;
    }
}