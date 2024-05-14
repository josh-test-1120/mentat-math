public class Instructor extends Profile{
    //instructor specific attribute
    private String department;

    //constructor
    public Instructor(String name, String profileID, String email, String department){
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