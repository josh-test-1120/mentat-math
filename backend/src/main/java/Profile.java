/** This class represents a Profile entity for both students and instructors; it holds
 * details such as a student or instructor's name, email, department, etc.
 * @author Phillip Ho
 */



public abstract class Profile{


    private String name;
    private int profileID;
    private String email;

    //Profile constructor
    public Profile(String name, int profileID, String email){
        this.name = name;
        this.profileID = profileID;
        this.email = email;
    }


    //Profile getter functions
    public String getName(){return name;}
    public int getProfileID(){
        return profileID;
    }
    public String getEmail(){
        return email;
    }

    //Profile setter functions
    public void setName(String name){this.name = name;}
    public void setProfileID(int profileID){
        this.profileID = profileID;
    }
    public void setEmail(String email){
        this.email = email;
    }

    //Profile methods
    public void updateProfile(){
        //logic here
    }

    public void viewProfile(){
        //logic here
    }
}

class Student extends Profile{
    //student specific attribute
    private String course;

    //constructor
    public Student(String name, int profileID, String email, String course){
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

class Instructor extends Profile{
    //instructor specific attribute
    private String department;

    //constructor
    public Instructor(String name, int profileID, String email, String department){
        super(name, profileID, email);
        this.department = department;
    }

    //getter
    public String getDepartment() {
        return department;
    }

    //setter
    public void setDepartment(String department) {
        this.department = department;
    }
}

